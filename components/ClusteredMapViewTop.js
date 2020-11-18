import React, {Component, PureComponent} from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, Platform} from 'react-native';
import Layout from '../constants/Layout';
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import actions from '../actions';
import { apolloQuery } from '../apollo/queries';
import { boundingRect, regionToPoligon, regionDiagonalKm } from '../helpers/maps';
import Colors from '../constants/Colors';
import EntityMarker from './map/EntityMarker'
import ClusterMarker from './map/ClusterMarker'
import EntityWidgetInMapView from './map/EntityWidgetInMapView'
import * as Constants from '../constants';

/**
 * Definitions:
 *  cluster = poi inside > 1 ? then is just a number of inner pois, else is a poi
 */
class ClusteredMapViewTop extends PureComponent {  

  constructor(props) {
    super(props);
    var { region, coords, types = [], nearPois, } = props; /* cluster type is like an array of Constants.NODE_TYPES */

    this._watchID = null; /* navigation watch hook */

    const typesForQuery = `{${types.join(",")}}`; /* needs a list like: {"attrattori","strutture_ricettive", ...} */
    this._mapRef = null; /* used for animation */
    this.state = {
      initRegion: region,
      clusters: [],
      nearPois, /* to calculate the smallest enclosing polygon and zoom to it */
      types: typesForQuery,
      animationToPoi: false, 
      selectedCluster: null, /* currently selected cluster/poi */
    };

    this._region = region;
    this._coords = coords;
    this._geoLocationInitialized = false;
  }

  componentDidMount() {
    this._initGeolocation();
  }
  
  componentWillUnmount() {
  }

  componentDidUpdate(prevProps) {

    if (prevProps.nearPois !== this.props.nearPois && this.props.nearPois.length > 0 && !this._geoLocationInitialized) {
      // console.log("this.props.nearPois.length", this.props.nearPois)
      this._initGeolocation();
      this._geoLocationInitialized = true;
    }

    // If the term changes reload pois
    const prevTerm = this._getTerm(prevProps).term;
    const currentTerm = this._getTerm(this.props).term;
    if (prevTerm !== currentTerm) {
      this._fetchClusters();
    }
  }

  /**
   * Setup navigation: on mount get current position and watch changes
   */
  _initGeolocation = () => {
    navigator.geolocation.getCurrentPosition(
      position => this._computeNearestPoisEnclosingPolygon(position), 
      ex => { console.log(ex) },
      Constants.NAVIGATOR.getCurrentPositionOpts
    );
    //Whenever the user changes position re-fetch clusters and pois
    this._watchID = navigator.geolocation.watchPosition(
      position => { 
        if(this._region)
          this._fetchClusters(position.coords); 
          // this._animateMapToRegion();
      }, 
      ex => { console.log(ex) },
      Constants.NAVIGATOR.watchPositionOpts
    );
  }

  _computeNearestPoisEnclosingPolygon = (position) => {
    const { nearPois } = this.props;
    this._coords = position.coords; 
    this._region = boundingRect(nearPois, [this._coords.longitude, this._coords.latitude], (p) => _.get(p, "georef.coordinates", []));
    // this._animateMapToRegion();
  }

  _animateMapToRegion = () => {
    setTimeout(() => this._mapRef && this._mapRef.animateToRegion(this._region, 1000), 500); 
  }

  /**
   * Get current or previous term (category) and its child uuids, 
   */
  _getTerm = (props=this.props) => {
    let term = null;
    if (props.entityType === Constants.ENTITY_TYPES.places) {
      term = props.others.placesTerms[props.others.placesTerms.length - 1];
    } else if (props.entityType === Constants.ENTITY_TYPES.accomodations) {
      term = props.others.accomodationsTerms[props.others.accomodationsTerms.length - 1];
    } else {
      console.error("[ClusteredMapViewTop]: not a known entity");
    }
    const childUuids = term && term.childUuids ? term.childUuids : [];
    return { term, childUuids };
  }

  /**
   * Fetch current clusters + pois based on current region 
   *   clusters === pois when the cluster count is 1
   */
  _fetchClusters() {
    const { term, childUuids } = this._getTerm();
    const { types } = this.state;
    let region = this._region;
    
    let km = regionDiagonalKm(region);
    let dEps = (km / 1000) / (Layout.window.diagonal / Layout.map.markerPixels);
    
    let p = regionToPoligon(region);
    
    const regionString = `${p[0][0]} ${p[0][1]}, ${p[1][0]} ${p[1][1]}, ${p[2][0]} ${p[2][1]}, ${p[3][0]} ${p[3][1]}, ${p[4][0]} ${p[4][1]}`;
    
    let uuidString = "{";
    for(let i=0; i<childUuids.length; i++) {
      uuidString += i < childUuids.length - 1 ? childUuids + "," : childUuids;
    }
    uuidString += "}";

    apolloQuery(actions.getClusters({
      polygon: regionString,
      cats: uuidString,
      dbscan_eps: dEps,
      types,
    })).then((clusters) => {
      this.setState({ clusters });
    });
  }

  /**
   * Called when user presses poi or cluster items, 
   *   set current poi if cluster.count == 1 else zooms in 
   *   to cluster region
   * @param {*} item: cluster
   * @param {*} e: press event 
   */
  _onPoiPress(item, e) {
    e.stopPropagation();
    if(item.count == 1) {
      let animationToPoi = Platform.OS === "android" ? true : false;
      this.setState({ selectedCluster: item, animationToPoi: animationToPoi });
      this.props.actions.setCurrentMapEntity(item);
    } else {
      let region = this._region;
      region.latitude = item.centroid.coordinates[1];
      region.longitude = item.centroid.coordinates[0];
      region.longitudeDelta = region.longitudeDelta/2;
      region.latitudeDelta = region.latitudeDelta/2;
      this._mapRef.animateToRegion(region);
    }

  }

  /**
   * When user moves the map clears current cluster selection
   */
  _onRegionChange = () => {
    if(!this.state.animationToPoi)
      this._clearClusterSelection();
  }

  /**
   * Set current region to view and re-fetch pois for that region
   * @param {*} region: region boundaries that describe current view
   */
  _onRegionChangeComplete = (region) => {
    this.setState({ animationToPoi: false });
    this._region = region;
    if (region)
      this._fetchClusters();
  }

  /**
   * When user presses on map clears the selected cluster
   */
  _clearClusterSelection = () => {
    if(this.state.selectedCluster)
      this.setState({ selectedCluster: null });
  }



  /**
   * Extract unique identifier for the current cluster
   * @param {*} cluster: current cluster (>1 then is cluster, else is a poi)
   */
  _clusterKeyExtractor(cluster) {
    if(cluster.count == 1) {
      return cluster.terms_objs[0].uuid;
    } else {
      const { centroid: { coordinates }, count } = cluster;
      return `${coordinates[0]}-${coordinates[0]}-${count}`;
    }
  }

  /**
   * Horizonal separator
   */
  _renderHorizontalSeparator = () => {
    return (
      <View style={{width: 5, flex: 1}}></View>
    )
  }


  /**
   * Render single poi on bottom of mapview on press (outside scrollableContainer)
   */
  _renderEntityWidget() {
    const { isAccomodationsMap } = this.props;
    return (
      <EntityWidgetInMapView 
        locale={this.props.locale} 
        isAccomodationItem={isAccomodationsMap} 
        cluster={this.state.selectedCluster} 
        coords={this._coords} 
      />
    )
  }


  /**
   * Renders single poi marker
   * @param {*} item 
   */
  _renderEntityMarker(item) {
    var {term, entityType} = this.props;
    var cluster = item;
    item.centroid = {
      coordinates: item.georef.coordinates
    }
    return (
      <EntityMarker
        cluster={cluster}
        key={item.uuid}
        entityType={entityType}
        onPress={(e) => this._onPoiPress(cluster, e)}
        term={term && term[item.term.uuid]}
        selected={false}
      />);
  }

  /**
   * Based on number of elements that a cluster comprises renders 
   * a marker with #of pois or a marker representing the poi category
   * @param {*} clusters 
   */
  _renderClustersOrPoi = (clusters) => {
    const {term, entityType} = this.props;
    if (clusters)
      return (clusters.map((cluster, idx) => 
          cluster.count > 1 ? (
            <ClusterMarker
              cluster={cluster}
              entityType={entityType}
              key={this._clusterKeyExtractor(cluster)}
              onPress={(e) => this._onPoiPress(cluster, e)}
            />
          ) :
          (
            <EntityMarker
              cluster={cluster}
              entityType={entityType}
              key={this._clusterKeyExtractor(cluster)}
              onPress={(e) => this._onPoiPress(cluster, e)}
              term={term && term[cluster.terms_objs[0].term]}
              selected={false}
            />
          )
      ));
    else 
      return null;
  }

  /**
   * Renders selected poi (changes appereance)
   * @param {*} selectedPoi 
   */
  _renderSelectedPoi = (selectedPoi) => {
    const {term, entityType} = this.props;
    if (selectedPoi)
      return (
        <EntityMarker
          cluster={selectedPoi}
          entityType={entityType}
          key={this._clusterKeyExtractor(selectedPoi)+"_selected"}
          onPress={(e) => this._onPoiPress(selectedPoi, e)}
          term={term && term[selectedPoi.terms_objs[0].term]}
          selected={true}
        />
      )
    else 
      return null;
  }

  render() {
    var {initRegion, pois, clusters, selectedCluster} = this.state;
    // console.log("Render", this._region)
    return (
      <>
        <MapView
          ref={ref => this._mapRef = ref}
          provider={ PROVIDER_GOOGLE }
          style={styles.fill}
          showsUserLocation={ true }
          initialRegion={initRegion}
          mapType='standard'
          showsIndoorLevelPicker={true}
          showsCompass={false}
          onPress={this._clearClusterSelection}
          onRegionChange={this._onRegionChange}
          onRegionChangeComplete={this._onRegionChangeComplete}
          >
          {this._renderClustersOrPoi(clusters)}
          {this._renderSelectedPoi(selectedCluster)}
        </MapView>
        {selectedCluster && this._renderEntityWidget()}
      </>

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
    bottom: 50,
    left: 0,
    padding: 10
  }
});


function ClusteredMapViewTopContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();
  return <ClusteredMapViewTop {...props} navigation={navigation} route={route} store={store} />;
}

const mapStateToProps = state => {
  return {
    //mixed state
    others: state.othersState,
    //language
    locale: state.localeState,
    //graphql
    categories: state.categoriesState,
  };
};

const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...actions}, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(ClusteredMapViewTopContainer)