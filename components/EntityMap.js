import React, {PureComponent} from 'react';
import { View, StyleSheet, Text, Platform, Linking, TouchableOpacity } from 'react-native';
import * as Constants from '../constants';
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import Layout from '../constants/Layout';
// import { TouchableOpacity } from 'react-native-gesture-handler';

export default class EntityMap extends PureComponent {  
  
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
  
  render() {
    const { coordinates } = this.props;
    return (
      <>
        { coordinates && (
          <View styles={styles.fill}>
            <View 
              style={styles.mapContainer}
              pointerEvents="none">
              <MapView
                ref={ map => this._map = map }
                initialRegion={Constants.REGION_SARDINIA}
                provider={ PROVIDER_GOOGLE }
                style={{flex: 1}}>
                <MapView.Marker
                  coordinate={coordinates}
                  tracksViewChanges={false} />
              </MapView>
            </View>
            <View style={styles.openNavigatorContainer}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.button}
                onPress={() => this._openNavigator("", coordinates)}>
                <Text style={styles.buttonText}>vai al navigatore</Text>
              </TouchableOpacity>
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
    position: "relative"
  },
  mapContainer: {
    flex: 1,
    height: Layout.window.height / 3,
    marginBottom: 40,
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
  }
});