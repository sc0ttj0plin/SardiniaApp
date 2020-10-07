import React, {PureComponent} from 'react';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import MapView from "react-native-map-clustering";
import { StyleSheet, Dimensions} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import * as graphqlActions from '../actions/graphql';
import { boundingRect, regionToPoligon } from '../helpers/maps';
import { apolloQuery } from '../apollo/middleware';
import EntityMarker from '../components/map/EntityMarker'
import ClusterMarker from '../components/map/ClusterMarker'
let { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

/**
 * MapViewTop comprises a map that renders a set of pois or clusters of pois 
 * depending on the zooom level. Used in PlacesScreen
 */
class MapViewTop extends PureComponent {  
  constructor(props) {
    super(props);
    this.state = {
      term: this.props.term,
      uuids: this.props.term ? this.props.term.uuids : []
    };
  }

  componentDidMount() {
    this.props.unfocusFunctionsListeners.push(() => {
      this.map = null;
    })
  }

  componentDidUpdate(prevProps) {
    var {coords, pois} = this.props;
    
    if(coords && this._checkPois(pois, this.state.pois)) {
      this.setState({pois: pois});
      var region = boundingRect(pois, [coords.longitude, coords.latitude], (p) => p.georef.coordinates);
      this._region = region;
      this.props.onRegionChangeComplete(region);
      setTimeout(() => this.map && this.map.animateToRegion(region,1000), 500);
      this._fetchPois();
    }
  }

  _checkPois(newPois, pois) {
    if(!pois && newPois && newPois.length > 0)
      return true;
    if(pois && newPois && pois.length > 0 && newPois.length > 0){
      pois.forEach((poi) => {
        var found = false;
        newPois.forEach((newPoi) => {
          if(poi.nid == newPoi.nid)
            found = true;
        })
        if(!found)
          return true;
      })
    }
    return false;
  }

  _checkCoords(newCoords, coords) {
    if(newCoords && !coords)
      return true;
    if(newCoords && coords && (newCoords.latitude != coords.latitude || newCoords.longitude != coords.longitude))
      return true;
    return false;
  }

  _fetchPois() {
    var poligon = regionToPoligon(this._region);

    if(this.state && poligon.length > 0) {
      apolloQuery(graphqlActions.getNearPois({
        polygon: {
          type: "Polygon",
          coordinates: [
            poligon
          ]
        },
        uuids: this.state.uuids && this.state.uuids.length > 0 ? this.state.uuids : null
      })).then((pois) => {
        this.setState({
          pois: pois
        });
      });
    }
  }

  _clusterKeyExtractor(cluster) {
    if(cluster.count == 1)
      return cluster.terms_objs[0].nid.toString();
    else
      return cluster.centroid.coordinates[0]+"-"+cluster.centroid.coordinates[0]+"_"+cluster.count;
  }


  _renderEntityMarker(item) {
    var {categoriesMap} = this.props;
    var cluster = item;
    item.centroid = {
      coordinates: item.georef.coordinates
    }
    return (<EntityMarker
      cluster={cluster}
      key={item.nid.toString()}
      onPress={(e) => this._onPoiPress(cluster, e)}
      term={categoriesMap && categoriesMap[item.term.uuid]}
      selected={false}
    />)
  }
  
  render() {
    var {initRegion, pois} = this.state;
    var {categoriesMap, clusters} = this.props;
    return (
     <MapView
        mapRef={ref => { this.props.mapRef(ref); this.map = ref; }}
        provider={ PROVIDER_GOOGLE }
        style={ styles.fill }
        showsUserLocation={ true }
        initialRegion={ this.props.initRegion }
        mapType='standard'
        showsIndoorLevelPicker={true}
        showsCompass={false}
        clusteringEnabled={false}
        onPress={this.props.onPress}
        onPanDrag={this.props.onPanDrag}
        onDoublePress={this.props.onDoublePress}
        mapPadding={{
          top: 0,
          right: 0,
          bottom: 100,
          left: 0
      }}
        >
          {clusters && clusters.map((cluster, idx) => 
            cluster.count > 1 ? (
              <ClusterMarker
                cluster={cluster}
                key={this._clusterKeyExtractor(cluster)}
                onPress={(e) => this._onPoiPress(cluster, e)}
              />
            ) :
            (
              <EntityMarker
                cluster={cluster}
                key={this._clusterKeyExtractor(cluster)}
                onPress={(e) => this._onPoiPress(cluster, e)}
                term={categoriesMap && categoriesMap[cluster.terms_objs[0].term]}
                selected={false}
              />
            )
        )}
          {Object.keys(categoriesMap).length > 0 && pois && pois.map((item) => this._renderEntityMarker(item))}
          
        </MapView>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1
  },
});

export default (props) => {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  const focusFunctionsListeners = [];
  const unfocusFunctionsListeners = [];

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      focusFunctionsListeners.forEach(f => f())
    });
    return () => {
      unsubscribe();
      unfocusFunctionsListeners.forEach(f => f())
    };
  }, [navigation]);

  return <MapViewTop
    {...props}
    navigation={navigation}
    route={route}
    focusFunctionsListeners={focusFunctionsListeners}
    unfocusFunctionsListeners={unfocusFunctionsListeners} />;
}
