import React, { PureComponent } from "react";
import { 
  View, Text, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView, NativeModules } from "react-native";

import { FlatList } from "react-native-gesture-handler"
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomText from "./CustomText";
import SectionTitle from "./SectionTitle";
import { coordsInBound, distance, distanceToString, regionToPoligon, regionDiagonalKm } from '../helpers/maps';
import MapView from "react-native-maps";
import { Button } from "react-native-elements";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../constants/Layout';
import actions from '../actions';
import * as Constants from '../constants';
import Colors from '../constants/Colors';
import { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { linkingOpenNavigator } from "../helpers/utils"
import { FontAwesome5 } from '@expo/vector-icons'; 

/**
 * Map:             Clusters + pois that update with user map's interaction
 *                    can be filtered by category *same filter of Categories&Pois (redux)
 * NearToYou:       near to the user's location (all categories) rendered in the top header
 *                    called at mount + when user changes position (_fetchNearestPois)
 * Categories&Pois: List of Categories and Pois that are in the list
 *                    called when the user reaches the end of the category tree 
 *                    using current selected category + user location (_loadMorePois)
 */

const USE_DR = false;
class MapViewTop extends PureComponent {

  constructor(props) {
    super(props);

    this._watchID = null; /* navigation watch hook */
    this._onFocus = null;
    this._refs = {};

    const events = _.get(props.route, "params.events", []);
    const hideScrollable = _.get(props.route, "params.hideScrollable", false);
    const title = _.get(props, "title", "");
    const entities = _.get(props, "entities", []);
    // console.log("events", props.route.params.events.length, events.length)
    this.state = {
      render: USE_DR ? false : true,
      entities,
      tid: -1,
      coords: {},
      entitiesLimit: Constants.PAGINATION.entitiesLimit,
      region: Constants.MAP.defaultRegion,
      selectedEntity: null,
      tracksViewChanges: false,
      title
    };

  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * On mount load categories and start listening for user's location
   */
  componentDidMount() {
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    if(this.props.others.geolocation && this.props.others.geolocation.coords) {
      this._onUpdateCoords(this.props.others.geolocation);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.others.geolocation !== this.props.others.geolocation && this.props.others.geolocation.coords) {
      // { coords: { latitude, longitude }, altitude, accuracy, altitudeAccuracy, heading, speed, timestamp (ms since epoch) }
      this._onUpdateCoords(this.props.others.geolocation);
    }

    const prevModalState = prevProps.modalState;
    const currentModalState = this.props.modalState;
    if(prevModalState != currentModalState && prevModalState == Constants.SCROLLABLE_MODAL_STATES.selectedEntity){
      this._selectMarker(null)
    }
  }


  /********************* Non React.[Component|PureComponent] methods go down here *********************/

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
  
  _onGoToMyLocationPressed = () => {
    this._animateMapToRegion(this._coords, 12, 1500);
    if(this.props.showNearEntitiesOnPress)
      this.props.showNearEntitiesOnPress()
  }
  
  _onUpdateCoords = (position, source) => {
    //check geolocation source
    this._coords = position.coords;
  }

  _selectMarker = (entity) => {
    // console.log("enter en", entity)

    if(entity) {
      this._disableRegionChangeCallback = true;

      if(Platform.OS == "ios") {
        if(this.props.getCoordsFun) {
          const coords = this.props.getCoordsFun(entity);
          this._animateMapToRegion(coords);
        }
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

  _onRegionChangeComplete = (region) => {
    if(this.props._onMapRegionChanged)
      this.props._onMapRegionChanged();

    if(this._disableRegionChangeCallback) {
      return;
    } 

    if(this.state.selectedEntity)
      this._selectMarker(null);
  }

  /********************* Render methods go down here *********************/

  _renderCluster = (cluster) => {
    const { id, geometry, onPress, properties } = cluster;
    const points = properties.point_count;
    const { getCoordsFun } = this.props;
    let coords = null;
    if(getCoordsFun)
    return (
      <Marker
        key={`cluster-${id}`}
        coordinate={{
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1]
        }}
        onPress={onPress}
      >
        <View style={styles.cluster}>
          <CustomText style={styles.clusterText}>{points}</CustomText>
        </View>
      </Marker>
    )
  }
  
  /* Renders the topmost component: a map in our use case */
  _renderMap = () => {
    const { coords, region } = this.state;
    const {mapPaddingBottom = 65} = this.props;

    return (
      <MapView
        ref={(ref) => this._mapRef = ref}
        coords={coords}
        initialRegion={region}
        mapPadding={{
          top: 0,
          right: 0,
          bottom: mapPaddingBottom,
          left: 0
        }}
        provider={ PROVIDER_GOOGLE }
        mapType='standard'
        provider={PROVIDER_GOOGLE}
        showsUserLocation={ true }
        showsIndoorLevelPicker={true}
        showsCompass={false}
        style={{flex: 1}}
        onRegionChange={this._onRegionChangeComplete}
        onPress={this._onRegionChangeComplete}
      >
        {this._renderMarkers()}
      </MapView>
    )

  }

  _renderMarkers = () => {
    return this.props.entities.map( entity => {
      return this._renderMarker(entity)
    })
  }

  _renderMarker = (entity) => {
    const { getCoordsFun, onMarkerPressEvent, entitiesType } = this.props;
    let coords = null;
    // console.log("get coords", getCoordsFun)
    if(getCoordsFun)
      coords = getCoordsFun(entity);
    let onClick = null;
    let selected = false;
    let validCoords = false;
    if(coords){
      let lat = _.get(coords, "latitude", null)
      let long = _.get(coords, "longitude", null)
      if(lat && long){
        validCoords = true;
        if(onMarkerPressEvent == "openEntity"){
          selected = this.state.selectedEntity == entity;
          onClick = (event) => this._selectMarker(entity, event);
        }
        else if(onMarkerPressEvent == "openNavigator"){
          onClick = () => linkingOpenNavigator("", coords);
        }
      }
    }

    if(validCoords){
      const width = 32;
      const { iconProps } = this.props;
      const iconName = iconProps.name || Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS.events.iconName;
      const color = iconProps.color || Colors.white;
      const backgroundColor = iconProps.backgroundColor || Colors.colorEventsScreen;
      const backgroundTransparent = iconProps.backgroundTransparent || Colors.colorEventsScreenTransparent;

      return(
        <Marker.Animated
          coordinate={coords}
          onPress={onClick}
          tracksViewChanges={this.state.tracksViewChanges}
          style={styles.markerAnimated}>
            <View style={[styles.markerContainer, { backgroundColor: selected ? backgroundTransparent : "transparent"}]}>
              <View
                style={[styles.marker, {
                  backgroundColor
                }]}>
                <Ionicons
                  name={iconName}
                  size={19}
                  color={Colors.white}
                  style={styles.markerIcon}
                />
              </View>
            </View>
        </Marker.Animated>
      )
    }
    else
      return null;
  }

  _renderMapTitle = () => {
    const { title } = this.state;
      if(title != ""){
        return (
          //onStartShouldSetResponder={this._onListHeaderPressIn}
          <SectionTitle numberOfLines={3} text={title} textStyle={{ fontSize: 15 }} style={styles.mapTitle} />
        )
      }
      else
        return null;
  }

  render() {
    return (
      <View style={styles.fill}>
        {this._renderMap()}
        <View style={styles.topHeader}>
          {this._renderMapTitle()}
        </View>
        {this.props.others.geolocation.coords && 
          <Button
          type="clear"
          containerStyle={[styles.buttonGoToMyLocationContainer, {bottom: 15 + (this.props.paddingBottom || 0) }]}
          buttonStyle={[styles.buttonGoToMyLocation]}
          onPress={this._onGoToMyLocationPressed}
          icon={
            <FontAwesome5 name={"street-view"} size={25} color={Colors.colorPlacesScreen} />
            }
        />
          }
      </View>
    )
  }
  
}


MapViewTop.navigationOptions = {
  title: 'MapViewTop',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  container: {
    backgroundColor: Colors.colorPlacesScreen,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    flex: 1,
  },
  listHeader: { 
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 76,
  },
  listContainer: {
    backgroundColor: Colors.colorPlacesScreen,
    height: "100%"
  },
  listContainerHeader: {
    paddingLeft: 10,
  },
  listStyle: {
    paddingHorizontal: 10,
    paddingBottom: 25,
  },
  markerAnimated: {
    width: 42, 
    height: 42, 
    zIndex: 1,
  },
  markerIcon: {
  },
  listPois: {
    backgroundColor: Colors.colorPlacesScreen,
    height: "100%",
    paddingHorizontal: 10,
  },
  categorySelectorBtn: {
    height: 30, 
    padding: 5, 
    backgroundColor: Colors.blue, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 10
  },
  filtersList: {
    position: "absolute", 
    top: 10, 
    left: 0, 
    width: "100%", 
    height: 40,
    zIndex: 2, 
    backgroundColor: "transparent"
  },
  marker: {
    width: "100%",
    height: "100%",
    backgroundColor: "blue",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.colorEventsScreen,
    borderRadius: 21
  },
  markerContainer: {
    width: 42,
    height: 42,
    padding: 6,
    borderRadius: 21,
  },
  eventsListItem: {
    borderWidth: 1,
    borderColor: "#0000001A",
    borderRadius: 10,
    width: "100%",
  },
  widget: {
    width: "100%",
    height: 180,
    position: "absolute",
    // backgroundColor: Colors.lightGray,
    bottom: Platform.OS == "ios" ? 80 : 100,
    left: 0,
    padding: 10,
  },
  cluster: { 
    width: 40, 
    height: 40, 
    borderRadius: 20,
    backgroundColor: Colors.colorEventsScreen,
    justifyContent: "center",
    alignItems: "center"
  },
  clusterText: {
    color: "white"
  },
  mapTitle: {
    width: "100%",
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
    color: "#000000E6",
    backgroundColor: "#F2F2F2",
    marginBottom: 16,
    fontSize: 15,
    fontFamily: "montserrat-bold",
    marginTop: -10,
    paddingHorizontal: 5
  },
  topHeader: {
    position: "absolute",
    top: Constants.COMPONENTS.header.bottomLineHeight + 5,
    left: 0,
    width: "100%"
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
    paddingTop: 5
  }
});


function MapViewTopContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <MapViewTop 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    //mixed state
    others: state.othersState,
    //language
    locale: state.localeState,
  };
};


const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...actions }, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(MapViewTopContainer)