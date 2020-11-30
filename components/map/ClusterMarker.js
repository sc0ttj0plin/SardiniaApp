import React, {PureComponent} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import Colors from '../../constants/Colors';
import * as Constants from '../../constants';
import CustomText from "../CustomText";

/**
 * ClusterMarker renders a set of close markers that are grouped depending 
 * on the view size
 */
export default class ClusterMarker extends PureComponent {  

  constructor(props) {
    super(props);

    this.state = {
      cluster: this.props.cluster,
      clusterBackgroundColor: this._getBackgroundColor(props.entityType),
    }
  }

  _getBackgroundColor = (entityType) => {
    switch(entityType) {
      case Constants.ENTITY_TYPES.places:
        return Colors.colorPlacesScreen;
      case Constants.ENTITY_TYPES.accomodations:
        return Colors.colorAccomodationsScreen;
      default:
        return Colors.colorPlacesScreen;
    }
  }

  render() {
    var {cluster, clusterBackgroundColor} = this.state;

    var length = cluster.count.toString().length;
    var width = length * 20 + 10;

    return (
      <Marker.Animated
        coordinate={{ longitude: cluster.centroid.coordinates[0],  latitude: cluster.centroid.coordinates[1] }}
        onPress={this.props.onPress}
        tracksViewChanges={false}>
          <View
            style={[styles.marker, {borderRadius: width/2, width: width, height: width, backgroundColor: clusterBackgroundColor}]}>
            <CustomText style={[styles.markerText]}>{cluster.count}</CustomText>
          </View>
      </Marker.Animated>
      
    );
  }
}

const styles = StyleSheet.create({
  marker: {
    padding: 5,
    backgroundColor: "#3a23a2",
    borderColor: '#3a23a2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  markerText: {
    fontSize: 16,
    color: "#ffffff"
  }
});
