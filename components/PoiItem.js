import React, { PureComponent } from 'react';
import { TouchableOpacity, View, Platform, StyleSheet } from 'react-native';
import { Image } from 'react-native-elements';
import { GeoRefHListItem} from "../components";
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

/**
 * PoiItem is similar to GeoRefHListItem (in fact it uses it) 
 * but additionally includes an icon that symbolize the item's category
 */
export default class PoiItem extends PureComponent {
  render() {
    const { onPress, icon, keyItem, type, title, place, image, distance } = this.props;
    var gui = {}

    switch(type) {
      case "attrattore":
        gui.iconName = Platform.OS === 'ios' ? 'ios-map' : 'md-map';
        gui.backgroundTopLeftCorner = Colors.colorPlacesScreen;
        break;
      case "ispiratore":
        gui.iconName = 'flag-outline';
        gui.backgroundTopLeftCorner = Colors.colorInspirersScreen;
        break;
      case "itinerario":
        gui.iconName = Platform.OS === 'ios' ? 'ios-analytics' : 'md-analytics';
        gui.backgroundTopLeftCorner = Colors.colorItinerariesScreen;
        break;
      case "evento":
        gui.iconName = Platform.OS === 'ios' ? 'ios-calendar' : "calendar-outline";
        gui.backgroundTopLeftCorner = Colors.colorEventsScreen;
        break;
      default:
        gui.iconName = Platform.OS === 'ios' ? 'ios-map' : 'md-map';
        gui.backgroundTopLeftCorner = Colors.colorPlacesScreen;
    }

    gui.backgroundTopLeftCorner = this.props.backgroundTopLeftCorner ? this.props.backgroundTopLeftCorner : gui.backgroundTopLeftCorner;

    return (
        <TouchableOpacity 
            key={keyItem}  
            onPress={onPress}
            activeOpacity={0.7}
            style={{flex: 1}}
        >
            <GeoRefHListItem
                title={`${title}`}
                place={`${place}`}
                image={`${image}`}
                distance={distance}
                style={{flex: 1}} />
            <View style={[ styles.view, {borderTopColor: gui.backgroundTopLeftCorner}]}>
                <Ionicons
                    name={this.props.iconName ? this.props.iconName : gui.iconName}
                    size={13}
                    style={{ 
                        backgroundColor: "transparent", 
                        position: "absolute",
                        top: -30,
                        right: 0,
                        width: 15,
                    }}
                    color={this.props.iconColor}
                />
            </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  view: {
    position: "absolute",
    top: 0,
    right: 0,
    borderWidth: 10,
    borderRightColor: "transparent",
    borderLeftWidth: 35,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    borderTopWidth: 35,
    borderRightWidth: 0,
    borderTopRightRadius: 10,
  }
});