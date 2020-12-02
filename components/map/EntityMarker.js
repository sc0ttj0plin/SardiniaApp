import React, {PureComponent} from 'react';
import { View, Image, Text, FlatList, ScrollView, StyleSheet, Dimensions} from 'react-native';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Marker } from 'react-native-maps';
import * as Constants from "../../constants"
import CustomText from "../CustomText";

/**
 * EntityMarker is the component that renders typed marker
 * each marker type has a different icon
 */
export default class EntityMarker extends PureComponent {  

  constructor(props) {
    super(props);

    this.state = {
      cluster: props.cluster,
      term: props.term && props.term,
      image: props.term && props.term.marker,
      selected: props.selected,
      entityType: props.entityType,
      markerBackgroundColor: this._getBackgroundColor(props.entityType),
    }
  }

  componentDidUpdate(prevProps){
    if(prevProps.selected !== this.props.selected)
      this.setState({selected: this.props.selected})
  }

  _getBackgroundColor = (entityType) => {
    switch(entityType) {
      case Constants.ENTITY_TYPES.places:
        return [Colors.colorPlacesScreen, Colors.colorPlacesScreenTransparent];
      case Constants.ENTITY_TYPES.accomodations:
        return [Colors.colorAccomodationsScreen, Colors.colorAccomodationsScreenTransparent];
      default:
        return [Colors.colorPlacesScreen, Colors.colorPlacesScreenTransparent];
    }
  }

  render() {
    var {cluster, selected, markerBackgroundColor, entityType } = this.state;
    var width = selected ? 42 : 32;

    return (
      <Marker.Animated
          coordinate={{ longitude: cluster.centroid.coordinates[0],  latitude: cluster.centroid.coordinates[1] }}
          onPress={this.props.onPress}
          tracksViewChanges={selected}
          style={{width: 42, height: 42, zIndex: 1}}>
            <View style={[styles.markerContainer, {
              backgroundColor: selected ? Colors.colorPlacesScreenTransparent : "transparent"
            }]}>
              <View
                style={[styles.marker]}>
                <Ionicons
                  name={Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS.places.iconName}
                  size={19}
                  color={"#ffffff"}
                  style={{
                    paddingTop: Platform.OS === 'ios' ? 0 : 0
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
    backgroundColor: Colors.colorPlacesScreen,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21
  },
  markerContainer: {
    width: 42,
    height: 42,
    padding: 6,
    borderRadius: 21
  },
});
