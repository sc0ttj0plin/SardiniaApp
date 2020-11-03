import React, {PureComponent} from 'react';
import { View, Image, Text, FlatList, ScrollView, StyleSheet, Dimensions} from 'react-native';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Marker } from 'react-native-maps';

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
        trackingViewChanges: false,
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
          style={{width: width, height: width, zIndex: selected ? 10 : 1}}>
            <View
              style={[styles.marker, {borderRadius: width/2, width: width, height: width, backgroundColor: selected ? "#64a6cC" : Colors.colorPlacesScreen}]}>
              <Ionicons
                name={Platform.OS === 'ios' ? 'ios-map' : 'md-map'}
                size={19}
                color={"#ffffff"}
                style={{
                  paddingTop: Platform.OS === 'ios' ? 3 : 0
                }}
              />
            </View>
        </Marker.Animated>
    );
  }
}

const styles = StyleSheet.create({
  marker: {
    backgroundColor: "transparent",
    justifyContent: 'center',
    alignItems: 'center'
  },
  markerImage: {
    width: "100%",
    height: "100%"
  },
  markerText: {
    fontSize: 16
  },
});
