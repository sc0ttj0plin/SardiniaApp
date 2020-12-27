import React, {PureComponent} from 'react';
import { View, StyleSheet, Text, Platform, Linking, TouchableOpacity } from 'react-native';
import * as Constants from '../constants';
import MapView from "react-native-map-clustering";
import { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import Colors from '../constants/Colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCenter } from 'geolib';
import Layout from '../constants/Layout';
import { has } from 'lodash';
import {boundingRect} from '../helpers/maps';
import CustomText from "./CustomText";
import { connect, useStore } from 'react-redux';
import actions from '../actions';
//import TouchableOpacity from './ScrollableContainerTouchableOpacity';

import { bindActionCreators } from 'redux';
// import { TouchableOpacity } from 'react-native-gesture-handler';

class EntityMap extends PureComponent {  
  
  constructor(props) {
    super(props);
    const { hasMarkers, coordinates, title } = props;
    this.state = {
      region: Constants.REGION_SARDINIA,
      coordinates: coordinates
    };

    this._map = null
  }

  componentDidMount(){
    const { hasMarkers, coordinates } = this.props;
    if(hasMarkers && coordinates && coordinates.length > 0){
      this._setRegion()
    }
  }

  componentDidUpdate(prevProps){
    if(prevProps.coordinates !== this.props.coordinates){
      const { hasMarkers, coordinates } = this.props;
      if(hasMarkers && coordinates && coordinates.length > 0){
        this._setRegion()
      }
    }
  }

  

  _setRegion = () => {
    const { coordinates } = this.props;
    let region = boundingRect(coordinates, null, (p) => [p.coords.longitude, p.coords.latitude], coordinates.length == 1 ? 1000 : 5);
    this._onRegionChangeComplete(region, true)
  }
  
  _openNavigator = (title, coords) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${coords.latitude},${coords.longitude}`;
    const label = title;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    Linking.openURL(url); 
  }

  _openMap = () => {
    const { coordinates, entityType, title } = this.props;
    switch(entityType){
      case Constants.ENTITY_TYPES.events: 
        this.props.navigation.push(Constants.NAVIGATION.NavEventsMapScreen, { events: coordinates, hideScrollable: true, title: this.props.title });
        break;
      case Constants.ENTITY_TYPES.itineraries:
        this.props.navigation.push(Constants.NAVIGATION.NavItineraryStagesMapScreen, { markers: coordinates, term: this.props.term });
        break;
      default:
        this.props.navigation.push(Constants.NAVIGATION.NavItineraryStagesMapScreen, { markers: coordinates, term: this.props.term });
    }
  }

  _onRegionChangeComplete = (region, update) => {
    if(update)
      this.setState({region})
  }
  
  _renderPoint = (coordinates) => <Marker coordinate={coordinates} tracksViewChanges={false} />

  _renderMarkers = (markers) => {
    return markers.map( marker => {
      return this._renderMarker(marker)
    })
  }

  _renderMarker = (marker) => {
    const { entityType } = this.props;
    let bgColor = Colors.colorItinerariesScreen;
    let bgColorTransparent = Colors.colorItinerariesScreenTransparent;
    if(entityType){
      bgColor = Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entityType].backgroundColor || Colors.colorItinerariesScreen;
      bgColorTransparent = Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entityType].backgroundTransparent || Colors.colorItinerariesScreenTransparent;
    }
    if(marker.coords){
      return(
        <Marker.Animated
          coordinate={marker.coords}
          tracksViewChanges={false}
          isPreselected={true}
          style={styles.markerView}>
            <View style={[styles.markerContainer, { backgroundColor: bgColorTransparent }]}>
              <View
                style={[styles.marker, { backgroundColor: bgColor }]}>
                <CustomText style={{color: "white"}}>{marker.index}</CustomText>
              </View>
            </View>
        </Marker.Animated>
      )
    }
    else
      return null
  }

  _renderOpenNavigatorButton = (coordinates) => {
    const { locale, entityType } = this.props;
    const { openNavigator } = locale.messages;
    let bgColor = Colors.colorPlacesScreen;
    if(entityType)
      bgColor = Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entityType].backgroundColor || Colors.colorItinerariesScreen;
    return(
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.button, { backgroundColor: bgColor}]}
        onPress={() => this._openNavigator("", coordinates)}>
        <CustomText style={styles.buttonText}>{openNavigator}</CustomText>
      </TouchableOpacity>
    )
  }

  _renderOpenMapButton = () => {
    const { uuid, entityType } = this.props;
    const { locale } = this.props;
    const { openMap } = locale.messages;
    let bgColor = Colors.colorItinerariesScreen;
    if(entityType)
      bgColor = Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entityType].backgroundColor || Colors.colorItinerariesScreen;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.button, { backgroundColor: bgColor}]}
        onPress={() => this._openMap(uuid)}>
        <CustomText style={styles.buttonText}>{openMap}</CustomText>
      </TouchableOpacity>
    )
  }

  render() {
    const { coordinates, hasMarkers, hideOpenNavigatorButton, containerStyle } = this.props;
    return (
      <>
        { coordinates && (
          <View style={[styles.fill, styles.container, containerStyle]}>
            <View
              style={[styles.mapContainer]}
              >
              <MapView
                pointerEvents={"none"} 
                ref={ map => this._map = map }
                initialRegion={Constants.REGION_SARDINIA}
                region={this.state.region}
                provider={PROVIDER_GOOGLE}
                minZoom={14}
                clusteringEnabled={false}
                onRegionChangeComplete={this._onRegionChangeComplete}
                style={{flex: 1}}>
                {!hasMarkers && this._renderPoint(coordinates)}
                {hasMarkers && this._renderMarkers(coordinates)}
              </MapView>
              <View style={styles.openNavigatorContainer}>
              {!hasMarkers && !hideOpenNavigatorButton && this._renderOpenNavigatorButton(coordinates)}
              {hasMarkers && coordinates.length > 1 && this._renderOpenMapButton()}
              {hasMarkers  && coordinates.length == 1 && this._renderOpenNavigatorButton(coordinates[0].coords)}
              </View>
            </View>
            
          </View>
        )}
      </>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    position: "relative",
  },
  container: {
    marginTop: 40,
    marginBottom: 60,
  },
  mapContainer: {
    flex: 1,
    height: Layout.window.height / 2.8,
  },
  openNavigatorContainer: {
    justifyContent: "center",
    width: "100%",
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "row",
    position: "absolute",
    bottom: -18,
    left: 0,
    zIndex: 1
  },
  button: {
    backgroundColor: "#24467C",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5
  },
  buttonText: {
    color: "white",
    fontFamily: "montserrat-bold",
    fontSize: 16,
    textTransform: "uppercase"
  },
  marker: {
    // backgroundColor: "transparent",
    // justifyContent: 'center',
    // alignItems: 'center'
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.colorItinerariesScreen,
    borderRadius: 21
  },
  markerContainer: {
    width: 42,
    height: 42,
    padding: 6,
    borderRadius: 50,
  },
  markerView: {
    width: 42, 
    height: 42, 
    zIndex: 1
  }
});


function EntityMapContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <EntityMap 
    {...props}
    navigation={navigation}
    route={route}
    store={store}/>;
}

const mapStateToProps = state => {
  return {
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
})(EntityMapContainer)