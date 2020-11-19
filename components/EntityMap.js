import React, {PureComponent} from 'react';
import { View, StyleSheet, Text, Platform, Linking, TouchableOpacity } from 'react-native';
import * as Constants from '../constants';
import MapView from "react-native-map-clustering";
import { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import Colors from '../constants/Colors';
import { useNavigation } from '@react-navigation/native';

import Layout from '../constants/Layout';
import { has } from 'lodash';
// import { TouchableOpacity } from 'react-native-gesture-handler';

class EntityMap extends PureComponent {  
  
  constructor(props) {
    super(props);
    this.state = {
    };

    this._map = null
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
    const { coordinates } = this.props;
    this.props.navigation.push(Constants.NAVIGATION.NavItineraryStagesMapScreen, { markers: coordinates });
  }
  
  _renderPoint = (coordinates) => <Marker coordinate={coordinates} tracksViewChanges={false} />

  _renderMarkers = (markers) => {
    return markers.map( marker => {
      return this._renderMarker(marker)
    })
  }

  _renderMarker = (marker) => {
    if(marker.coords){
      return(
        <Marker.Animated
          coordinate={marker.coords}
          tracksViewChanges={false}
          isPreselected={true}
          style={styles.markerView}>
            <View style={[styles.markerContainer]}>
              <View
                style={[styles.marker]}>
                <Text style={{color: "white"}}>{marker.index}</Text>
              </View>
            </View>
        </Marker.Animated>
      )
    }
    else
      return null
  }

  _renderOpenNavigatorButton = () => {
    const { coordinates } = this.props;

    return(
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.button}
        onPress={() => this._openNavigator("", coordinates)}>
        <Text style={styles.buttonText}>vai al navigatore</Text>
      </TouchableOpacity>
    )
  }

  _renderOpenMapButton = () => {
    const { uuid } = this.props;

    return(
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.button, {
          backgroundColor: Colors.colorItinerariesScreen
        }]}
        onPress={() => this._openMap(uuid)}>
        <Text style={styles.buttonText}>apri la mappa</Text>
      </TouchableOpacity>
    )
  }
  render() {
    const { coordinates, hasMarkers, hideOpenNavigatorButton, containerStyle } = this.props;
    return (
      <>
        { coordinates && (
          <View styles={styles.fill}>
            <View 
              style={[styles.mapContainer, containerStyle]}
              pointerEvents={"none"}>
              <MapView
                ref={ map => this._map = map }
                initialRegion={Constants.REGION_SARDINIA}
                provider={ PROVIDER_GOOGLE }
                minZoom={14}
                clusteringEnabled={false}
                style={{flex: 1}}>
                {!hasMarkers && this._renderPoint(coordinates)}
                {hasMarkers && this._renderMarkers(coordinates)}
              </MapView>
            </View>
            <View style={styles.openNavigatorContainer}>
            {!hasMarkers && !hideOpenNavigatorButton && this._renderOpenNavigatorButton()}
            {hasMarkers && this._renderOpenMapButton()}
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
  mapContainer: {
    flex: 1,
    height: Layout.window.height / 3,
    marginBottom: 40,
    marginTop: 20
  },
  openNavigatorContainer: {
    justifyContent: "center",
    width: "100%",
    backgroundColor: "transparent",
    display: "flex",
    flexDirection: "row",
    position: "absolute",
    bottom: 18,
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
    fontWeight: "bold",
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
    backgroundColor: "rgba(93, 127, 32, 0.5)"
  },
  markerView: {
    width: 42, 
    height: 42, 
    zIndex: 1
  }
});


function EntityMapContainer(props) {
  const navigation = useNavigation();

  return <EntityMap 
    {...props}
    navigation={navigation}/>;
}

export default EntityMapContainer