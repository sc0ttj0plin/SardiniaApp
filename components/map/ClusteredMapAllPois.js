import React, {Component, PureComponent, useRef} from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, Platform, Easing} from 'react-native';
import Layout from '../../constants/Layout';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button } from "react-native-elements";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import actions from '../../actions';
import { apolloQuery } from '../../apollo/queries';
import { boundingRect, regionToPoligon, regionDiagonalKm, coordsInBound } from '../../helpers/maps';
import EntityMarker from './EntityMarker'
import ClusterMarker from './ClusterMarker'
import * as Constants from '../../constants';
import { Ionicons } from '@expo/vector-icons';
import CustomText from "../others/CustomText";
import Colors from '../../constants/Colors';
import CustomIcon from '../others/CustomIcon';
import moment from "moment";
import {FETCH_NUM_MONTHS_BACKWARDS, FETCH_NUM_MONTHS_FORWARD} from "../../constants";

/**
 * Definitions:
 *  cluster = poi inside > 1 ? then is just a number of inner pois, else is a poi
 */
class ClusteredMapViewTop extends PureComponent {  

  constructor(props) {
    super(props);
    var { region, coords, types = [], nearPois} = props; /* cluster type is like an array of Constants.NODE_TYPES */

    this._watchID = null; /* navigation watch hook */
    this._refs = [];

    const typesForQuery = `{${types.join(",")}}`; /* needs a list like: {"attrattori","strutture_ricettive", ...} */
    let isCoordsInBound = coordsInBound(coords);
    this._mapRef = null; /* used for animation */
    this.state = {
      initRegion: region,
      clusters: [],
      itineraries: [],
      events: [],
      nearPois, /* to calculate the smallest enclosing polygon and zoom to it */
      types: typesForQuery,
      selectedCluster: null, /* currently selected cluster/poi */
      selectedEntity: null,
      tracksViewChanges: false,
      isCoordsInBound
    };

    this._region = region;
    this._coords = coords;
  }

  componentDidMount() {
    if ( this.props.others.geolocation.coords) {
      // this._onUpdateCoords(this.props.others.geolocation, this.props.others.geolocationSource);
    }
  }
  
  componentWillUnmount() {
  }

  componentDidUpdate(prevProps) {
    if ( prevProps.others.geolocation !== this.props.others.geolocation) {
      this._onUpdateCoords(this.props.others.geolocation, this.props.others.geolocationSource);
    }

    // If the term changes reload pois
    const prevTerm = this._getTerm(prevProps).term;
    const currentTerm = this._getTerm(this.props).term;
    if (prevTerm !== currentTerm) {
      this._fetchClusters();
    }

    const prevModalState = prevProps.modalState;
    const currentModalState = this.props.modalState;
    if(prevModalState != currentModalState && prevModalState == Constants.SCROLLABLE_MODAL_STATES.selectedEntity){
      this.setState({selectedCluster: null})
    }
  }

  _onUpdateCoords = (position, source) => {
    //check geolocation source
    if (source === Constants.GEOLOCATION.sources.foregroundGetOnce && this.props.animateToMyLocation){
      this._computeNearestPoisEnclosingPolygon(position);
      this._animateMapToRegion(this._coords, 10, 1000, 500);
    }
    else {
      this._computeNearestPoisEnclosingPolygon(position);
    }
    let isCoordsInBound = coordsInBound(position.coords);
    this.setState({
      isCoordsInBound
    })
  }


  _computeNearestPoisEnclosingPolygon = (position) => {
    const { nearPois } = this.props;
    this._coords = position.coords;
    if (nearPois)
      this._region = boundingRect(nearPois, [this._coords.longitude, this._coords.latitude], (p) => _.get(p, "georef.coordinates", []));
    
  }

  _animateMapToRegion = (coords, zoom, duration = 200, delay = 0) => {
    var camera = {center: coords}
    if(zoom) {
      camera.zoom = zoom;
    }
    if(delay && delay > 0) {
      setTimeout(() => this._mapRef && this._mapRef.animateCamera(camera, {duration: duration}), delay); 
    } else {
      this._mapRef.animateCamera(camera, {duration: duration});
    }
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
    this.props.isLoadingCb && this.props.isLoadingCb(true);
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
      if(!this._panTimeout)
        this.setState({ clusters });
      this.props.isLoadingCb && this.props.isLoadingCb(false);
    }).catch(e => {
      console.error(e);
      this.props.isLoadingCb && this.props.isLoadingCb(false);
    });

    apolloQuery(actions.getItineraries()).then(itineraries => {
      if (!this._panTimeout) {
        this.setState({ itineraries });
      }
      this.props.isLoadingCb && this.props.isLoadingCb(false);
    }).catch(e => {
      console.error(e);
      this.props.isLoadingCb && this.props.isLoadingCb(false);
    });

    const date = moment("2021-03-05").format("YYYY-MM-DD"); // TODO: remove date

    const lbUb = this._getDateIntervals(date);

    const eventsQuery = {
      start: Math.floor(lbUb.lb / 1000),
      end: Math.floor(lbUb.ub /1000),
      types: null,
    };

    apolloQuery(actions.getEvents(eventsQuery, lbUb)).then(events => {
      if (!this._panTimeout) {
        this.setState({ events });
      }
      this.props.isLoadingCb && this.props.isLoadingCb(false);
    }).catch(e => {
      console.error(e);
      this.props.isLoadingCb && this.props.isLoadingCb(false);
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
      this._disableRegionChangeCallback = true;
      if(Platform.OS == "ios")
        this._animateMapToRegion({latitude: item.centroid.coordinates[1], longitude: item.centroid.coordinates[0]});
      setTimeout(() => this._disableRegionChangeCallback = false, 1000);
      this.setState({ selectedCluster: item });
      if(this.props.onSelectedEntity)
        this.props.onSelectedEntity(item);
      //this.props.actions.setCurrentMapEntity(item);
    } else {
      let region = this._region;
      region.latitude = item.centroid.coordinates[1];
      region.longitude = item.centroid.coordinates[0];
      region.longitudeDelta = region.longitudeDelta/2.1;
      region.latitudeDelta = region.latitudeDelta/2.1;
      this._mapRef.animateToRegion(region);
      this.setState({ selectedCluster: null });
      if(this.props.onSelectedEntity)
        this.props.onSelectedEntity(null);
    }

  }

  /**
   * Set current region to view and re-fetch pois for that region
   * @param {*} region: region boundaries that describe current view
   */
  _onRegionChangeComplete = (region) => {
    if(this.props._onMapRegionChanged)
      this.props._onMapRegionChanged();

    if(this._disableRegionChangeCallback) {
      return;
    } else {
      this._clearClusterSelection();
    }
    this._region = region;
    if (region) {
      if(this._panTimeout){
        clearTimeout(this._panTimeout);
        this._panTimeout = null;
      }
      this._panTimeout = setTimeout(() => {
        this._panTimeout = null;
        this._fetchClusters();
      }, 800);
    }
      

    //if (this.props.others.mapIsDragging[this.props.entityType])
    //  this.props.actions.setMapIsDragging(this.props.entityType, false);
  }

  /**
   * When user presses on map clears the selected cluster
   */
  _clearClusterSelection = () => {
    if(this.props.onSelectedEntity)
      this.props.onSelectedEntity(null);
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


  _onGoToMyLocationPressed = () => {
    this._animateMapToRegion(this._coords, 15, 1500);
    if(this.props.showNearEntitiesOnPress)
      this.props.showNearEntitiesOnPress()
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
   * Creates the upper and lower time bounds for the query adding and removing months
   * @param {*} dateString: "2020-11-14"
   * @returns { "lb": "2019-08-31T22:00:00.000Z", "ub": "2019-10-31T22:59:59.999Z" }
   * TODO: remove .add/.subtract(1,"year")
   */
  _getDateIntervals = (dateString) => {
    //specify N months "around" today's month
    if (dateString)
      return ({
        lb: moment(dateString).startOf('month').subtract(1, "year").subtract(FETCH_NUM_MONTHS_BACKWARDS, 'month'),
        // lb: moment(dateString).startOf('month').subtract(FETCH_NUM_MONTHS_BACKWARDS, 'month'),
        ub: moment(dateString).endOf('month').subtract(1, "year").add(FETCH_NUM_MONTHS_FORWARD, 'month')
        // ub: moment(dateString).endOf('month').add(FETCH_NUM_MONTHS_FORWARD, 'month')
      });
    return ({
      // lb: moment().startOf('month').subtract(FETCH_NUM_MONTHS_BACKWARDS, 'month'),
      lb: moment().startOf('month').subtract(1, "year").subtract(FETCH_NUM_MONTHS_BACKWARDS, 'month'),
      // ub: moment().endOf('month').add(FETCH_NUM_MONTHS_FORWARD, 'month')
      ub: moment().endOf('month').subtract(1, "year").add(FETCH_NUM_MONTHS_FORWARD, 'month')
    });
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

  _getItineraryEntityCoords = (entity) => {
    const { lan } = this.props.locale;
    const coordinates = _.get(entity, ["stages", lan, 0, "poi", "georef", "coordinates"], null)
    if(coordinates)
      return { latitude: parseFloat(coordinates[1]), longitude: parseFloat(coordinates[0]) };
    else
      return null;
  }

  _getEventEntityCoords = (entity, isEvent) => {
    if(isEvent){
      const coordinates = _.get(entity, ["itinerary", 0], null);
      // console.log("coordinates", coordinates)
      if(coordinates)
        return { latitude: parseFloat(coordinates.lat), longitude: parseFloat(coordinates.lon) };
      else
        return null;
    }
    else{
      const coordinates = _.get(entity, "coords", null);
      if(coordinates)
        return { latitude: parseFloat(coordinates.latitude), longitude: parseFloat(coordinates.longitude) };
      else
        return null;
    }
  }

  _renderItineraries = (itineraries) => {
    if (!itineraries) return null;
    return itineraries.map(itinerary => {
      return (
        <Marker.Animated
          coordinate={this._getItineraryEntityCoords(itinerary)}
          tracksViewChanges={false}
          onPress={() => this._selectMarker(itinerary)}
          style={{ width: 42, height: 42, zIndex: 1 }}
        >
          <View
            style={{
              width: 42,
              height: 42,
              padding: 6,
              borderRadius: 21,
              backgroundColor: Colors.colorItinerariesScreen,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CustomIcon
              name="icon-place-map"
              size={17}
              color="#FFF"
            />
          </View>
        </Marker.Animated>
      );
    })
  }

  _renderEvents = (events) => {
    if (!events) return null;
    return events.map(event => {
      return (
          <Marker.Animated
              coordinate={this._getEventEntityCoords(event, true)}
              tracksViewChanges={false}
              onPress={() => this._selectMarker(event)}
              style={{ width: 42, height: 42, zIndex: 1 }}
          >
            <View
                style={{
                  width: 42,
                  height: 42,
                  padding: 6,
                  borderRadius: 21,
                  backgroundColor: Colors.colorEventsScreen,
                  justifyContent: "center",
                  alignItems: "center",
                }}
            >
              <CustomIcon
                  name="icon-place-map"
                  size={17}
                  color="#FFF"
              />
            </View>
          </Marker.Animated>
      );
    })
  }

  /**
   * Renders selected poi (changes appereance)
   * @param {*} selectedPoi 
   */
  _renderSelectedPoi = (selectedPoi) => {
    const { selectedCluster } = this.state;
    const {term, entityType} = this.props;
    const selected = selectedCluster == selectedPoi;
    if (selectedPoi)
      return (
        <EntityMarker
          cluster={selectedPoi}
          entityType={entityType}
          key={this._clusterKeyExtractor(selectedPoi)+"_selected"}
          onPress={(e) => this._onPoiPress(selectedPoi, e)}
          term={term && term[selectedPoi.terms_objs[0].term]}
          selected={selected}
        />
      )
    else 
      return null;
  }

  _selectMarker = (entity) => {
    // console.log("enter en", entity)
    if(entity) {
      this._disableRegionChangeCallback = true;

      if(Platform.OS == "ios") {
        const coords = this._getEventEntityCoords(entity);
        this._animateMapToRegion(coords);
      }
      setTimeout(() => this._disableRegionChangeCallback = false, 1000);

      this.setState({ selectedEntity: null }, () => {
        this.setState({
          selectedEntity: entity,
          tracksViewChanges: true
        }, () => {

          this.setState({
            tracksViewChanges: false
          })

          if(this.props.onSelectedEntity){
            this.props.onSelectedEntity(entity);
          }
        });
      })
    } else {
      this.setState({
        selectedEntity: null,
        tracksViewChanges: true
      }, () => {
        this.setState({
          tracksViewChanges: false
        })
        if(this.props.onSelectedEntity)
          this.props.onSelectedEntity(null);
      });
    }
  }

  render() {
    var {initRegion, pois, clusters, itineraries, events, selectedCluster} = this.state;
    var {paddingBottom = 65} = this.props;

    var bottom = paddingBottom - (this.props.fullscreen ? 30 : 0); 

    return (
      <>
        <MapView
          ref={ref => this._mapRef = ref}
          mapPadding={{
            top: 0,
            right: 0,
            bottom: bottom,
            left: 0
          }}
          provider={ PROVIDER_GOOGLE }
          style={[styles.fill]}
          showsUserLocation={ true }
          initialRegion={initRegion}
          mapType='standard'
          showsIndoorLevelPicker={true}
          showsCompass={false}
          onPress={this._clearClusterSelection}
          //onPanDrag={this._onPanDrag}
          onRegionChangeComplete={this._onRegionChangeComplete}
          >
          {this._renderItineraries(itineraries)}
          {this._renderEvents(events)}
          {this._renderClustersOrPoi(clusters)}
          {this._renderSelectedPoi(selectedCluster)}
        </MapView>
        {this.state.isCoordsInBound && 
          <Button
          type="clear"
          containerStyle={[styles.buttonGoToMyLocationContainer, {bottom: 15 + (paddingBottom || 0) }]}
          buttonStyle={[styles.buttonGoToMyLocation]}
          onPress={this._onGoToMyLocationPressed}
          icon={
            <Ionicons name={"md-locate"} size={25} color={Colors.colorPlacesScreen} />
            }
        />
          }
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
  buttonGoToMyLocationContainer:{
    position: "absolute",
    bottom: 95,
    right: 20,
    backgroundColor: "white",
    borderRadius: 50,
    width: 50,
    height: 50,
    padding: 0,
    overflow: "hidden",
  },
  buttonGoToMyLocation: {
    width: "100%",
    height: "100%"
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