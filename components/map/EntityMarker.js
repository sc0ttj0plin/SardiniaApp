import React, {PureComponent} from 'react';
import { View, Image, Text, FlatList, ScrollView, StyleSheet, Dimensions} from 'react-native';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Marker } from 'react-native-maps';
import * as Constants from "../../constants"
/**
 * EntityMarker is the component that renders typed marker
 * each marker type has a different icon
 */
export default class EntityMarker extends PureComponent {  

  constructor(props) {
    super(props);

    this.state = {
        cluster: this.props.cluster,
        term: this.props.term && this.props.term,
        image: this.props.term && this.props.term.marker,
        trackingViewChanges: this.props.selected,
        selected: this.props.selected
    }
  }

  _stopTrackingViewChanges(){
    this.setState({
      trackingViewChanges: false
    })
  }

  render() {
    var {cluster, selected} = this.state;
    var width = selected ? 42 : 32;

    return (
      <Marker.Animated
          coordinate={{ longitude: cluster.centroid.coordinates[0],  latitude: cluster.centroid.coordinates[1] }}
          onPress={this.props.onPress}
          tracksViewChanges={this.state.trackingViewChanges}
          style={{width: 42, height: 42, zIndex: 1}}>
            <View style={[styles.markerContainer, {
              backgroundColor: selected ? "rgba(23, 74, 124, 0.5)" : "transparent"
            }]}>
              <View
                style={[styles.marker]}>
                <Ionicons
                  name={Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS.places.iconName}
                  size={19}
                  color={"#ffffff"}
                  style={{
                    paddingTop: Platform.OS === 'ios' ? 3 : 0
                  }}
                />
              </View>
          </View>
        </Marker.Animated>
    );
  }
}

const styles = StyleSheet.create({
  marker: {
    width: "100%",
    height: "100%",
    backgroundColor: "blue",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.colorPlacesScreen,
    borderRadius: 21
  },
  markerContainer: {
    width: 42,
    height: 42,
    padding: 6,
    borderRadius: 21
  },
});
