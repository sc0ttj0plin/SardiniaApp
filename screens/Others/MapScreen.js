import React, {Component} from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, Platform} from 'react-native';
import { Header, ConnectedHeader } from '../components';
import Layout from '../constants/Layout';
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import * as localeActions from '../actions/locale';
import {regionToCoords, distance, regionToPoligon, regionDiagonalKm} from '../helpers/maps'
import { apolloQuery } from '../apollo/middleware';
import { Button } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import EntityMarker from '../components/map/EntityMarker'
import ClusterMarker from '../components/map/ClusterMarker'
import EntityWidgetInMapView from '../components/map/EntityWidgetInMapView'
import * as Constants from '../constants';

class MapScreen extends Component {  

  constructor(props) {
    super(props);

    var {region, pois, tid, term, coords} = props.route.params;
    var tids = term ? term.tids : [];
    var uuids = term ? term.uuids : [];

    this.state = {
      initRegion: region,
      tid: tid,
      tids: tids,
      term: term,
      uuids: uuids,
      clusters: this._setupInitialClusters(pois),
      selectedCluster: null
    };

    this._region = region;
    this._coords = coords;
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this._updateCooords(position.coords)
      }, 
      ex => { console.log(ex) },
      Constants.NAVIGATOR.getCurrentPositionOpts
    );
  }
  
  componentWillUnmount() {

  }

  _setupInitialClusters(pois) {
    var clusters = [];
    pois && pois.forEach((item) => {
      var cluster = {};
      cluster.centroid = {
        coordinates: item.georef.coordinates
      }
      cluster.count = 1;
      cluster.terms_objs = [{
        nid: item.nid,
        title: item.title,
        term: item.term.uuid
      }];
      clusters.push(cluster);
    })
    return clusters;
  }

  _updateCooords(coords) {
    this._coords = coords;
  }

  _fetchPois() {
    var region = this._region;

    var km = regionDiagonalKm(region);
    var dEps = (km / 1000) / (Layout.window.diagonal / Layout.map.markerPixels);

    var p = regionToPoligon(region);
    var regionString = p[0][0] + " " + p[0][1] + ", " + p[1][0] + " " + p[1][1] + ", " + p[2][0] + " " + p[2][1] + ", " + p[3][0] + " " + p[3][1] + ", " +  p[4][0] + " " + p[4][1];
    
    var uuids = this.state.uuids;
    var uuidString = "{";
    for(var i=0; i<uuids.length; i++) {
      uuidString += i < uuids.length - 1 ? uuids + "," : uuids;
    }
    uuidString += "}";

    if(this.state) {
      /*apolloQuery(graphqlActions.getNearPois({
        polygon: {
          type: "Polygon",
          coordinates: [
            p
          ]
        },
        tids: this.state.tids && this.state.tids.length > 0 ? this.state.tids : null
      })).then((pois) => {
        this.setState({
          pois: pois
        });
      });*/
      apolloQuery(graphqlActions.getClusters({
        polygon: regionString,
        cats: uuidString,
        dbscan_eps: dEps
      })).then((clusters) => {
        this.setState({
          clusters: clusters,
          pois: []
        });
      });
    }
  }

  _onRegionChangeComplete(region) {
    this.setState({
      animationToPoi: false
    })
    this._region = region;
    this._fetchPois();
  }

  _getCategory(tid, categories) {
    if(tid && categories) {
      for(var i = 0; i < categories.length; i++){
        var term = categories[i];
        if (term.tid == tid) {
          return term;
        }
        else if(term.terms && term.terms.length > 0) {
          var found = this._getCategory(tid, term.terms);
          if(found)
            return found;
        }
      }
    }
    return null;
  }

  _goBackCategory() {
    var term = this._getCategory(this.state.term.parent, this.props.categories);
    this.setState({
      term: term,
      tids: term ? term.tids : [],
      uuids: term ? term.uuids : []
    }, () => {
      this._fetchPois();
    });
  }

  _openCategory(item) {
    this.setState({
      term: item,
      tids: item.tids,
      uuids: item.uuids
    }, () => {
      this._filterListRef.scrollToOffset({ animated: false, offset: 0 });
      this._fetchPois();
    });
  }

  _renderHorizontalSeparator = () => {
    return (
      <View style={{width: 5, flex: 1}}></View>
    )
  }

  _renderFilterItem(item) {
    //render go back button
    if(this.state.term && item.tid === this.state.term.tid) {
      return (
        <Button
          title={item.name}
          onPress={() => this._goBackCategory()}
          buttonStyle={styles.buttonFilter}
          titleStyle={[styles.buttonFilterText, {marginLeft: 5}]}
          icon={
            <Ionicons
              name={Platform.OS === 'ios' ? 'ios-arrow-back' : 'md-arrow-back'}
              color={"white"}
            />
          }>
        </Button>
      )
    }
    else {
      return (
        <Button
          title={item.name}
          onPress={() => this._openCategory(item)}
          buttonStyle={styles.buttonFilter}
          titleStyle={styles.buttonFilterText}>
        </Button>
      )
    }
  }

  _onPoiPress(item, e) {
    e.stopPropagation();
    
    if(item.count == 1) {
      var animationToPoi = Platform.OS === "android" ? true : false;
      this.setState({
        selectedCluster: item,
        animationToPoi: animationToPoi
      })
    } else {
      var region = this._region;
      region.latitude = item.centroid.coordinates[1];
      region.longitude = item.centroid.coordinates[0];
      region.longitudeDelta = region.longitudeDelta/2;
      region.latitudeDelta = region.latitudeDelta/2;
      this._mapRef.animateToRegion(region);
    }
  }

  _onPress() {
    if(this.state.selectedCluster){
      this.setState({
        selectedCluster: null
      })
    }
  }

  _onRegionChange() {
    if(!this.state.animationToPoi){
      this.setState({
        selectedCluster: null
      })
    }
  }

  _openEntity(item) {
    this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, {
      place: item.terms_objs[0]
    })
  }

  _renderEntityWidget() {
    return (
      <View style={[styles.entityWidget]}>
        <TouchableOpacity
          style={styles.fill}
          onPress={() => this._openEntity(this.state.selectedCluster)}
          activeOpacity={0.7}>
          <EntityWidgetInMapView locale={this.props.locale} cluster={this.state.selectedCluster} coords={this._coords} />
        </TouchableOpacity>
      </View>)
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

  _renderFilter() {
    var {categories} = this.props;
    var {term} = this.state;
    var currentCategories = term ? term.terms ? term.terms : [] : categories;
    if(term)
      currentCategories = [term, ...currentCategories];

    return (
      <FlatList
        ref={ref => this._filterListRef = ref}
        style={[styles.filters, {top: this.state.headerH}]}
        horizontal={true}
        renderItem={({item}) => this._renderFilterItem(item)}
        data={currentCategories}
        keyExtractor={item => item.tid.toString()}
        ItemSeparatorComponent={this._renderHorizontalSeparator}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterListContainer}
        />
    );
  }

  render() {
    var {initRegion, pois, clusters, selectedCluster} = this.state;
    var {categoriesMap} = this.props;

    return (
      <View style={ styles.fill }>

        <MapView
          ref={ref => this._mapRef = ref}
          provider={ PROVIDER_GOOGLE }
          style={ styles.fill }
          showsUserLocation={ true }
          initialRegion={initRegion}
          mapType='standard'
          showsIndoorLevelPicker={true}
          showsCompass={false}
          onPress={this._onPress.bind(this)}
          onRegionChange={this._onRegionChange.bind(this)}
          onRegionChangeComplete={this._onRegionChangeComplete.bind(this)}
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

        {selectedCluster  && (
          <EntityMarker
            cluster={selectedCluster}
            key={this._clusterKeyExtractor(selectedCluster)+"_selected"}
            onPress={(e) => this._onPoiPress(selectedCluster, e)}
            term={categoriesMap && categoriesMap[selectedCluster.terms_objs[0].term]}
            selected={true}
          />
        )}

          </MapView>

        <View
          onLayout={(event) => { this.setState({ headerH: 5 + event.nativeEvent.layout.height + Layout.header.map.top + Layout.statusbarHeight }) }}
          style={ [styles.bar, 
            {
              top: Layout.header.map.top + Layout.statusbarHeight,
              transform: [{
                scale: Layout.header.map.scale
              }]
            }
          ]}>
        <ConnectedHeader 
          containerStyle={{
            marginTop: 0,
            height: Layout.header.height
          }}
          iconTintColor={Colors.colorScreen1}
        />
        </View>
        {this._renderFilter()}
        {selectedCluster && this._renderEntityWidget()}
      </View>

    );
  }
}

const styles = StyleSheet.create({
  fill: {
    width: "100%",
    height: "100%"
  },
  bar: {
    width: "100%",
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  filters: {
    position: 'absolute',
    top: 110,
    width: "100%"
  },
  buttonFilter: {
    borderRadius: 10
  },
  buttonFilterText: {
    fontSize: 14
  },
  filterListContainer: {
    paddingLeft: 8,
    paddingRight: 8
  },
  marker: {
    padding: 5,
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: '#3a23a2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  markerText: {
    fontSize: 16
  },
  entityWidget: {
    width: "100%",
    height: 180,
    position: "absolute",
    bottom: 0,
    left: 0,
    padding: 10
  }
});


function MapScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();
  return <MapScreen {...props} navigation={navigation} route={route} store={store} />;
}

const mapStateToProps = state => {
  return {
    categories: state.graphqlState.categories,
    categoriesMap: state.graphqlState.categoriesMap,
    error: state.graphqlState.error,
    loading: state.graphqlState.loading,
    locale: state.localeState,
  };
};

const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...graphqlActions, ...restActions, ...localeActions}, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(MapScreenContainer)