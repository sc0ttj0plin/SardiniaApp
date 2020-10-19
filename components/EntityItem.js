import React, { PureComponent } from 'react';
import { TouchableOpacity, View, Platform } from 'react-native';
import { Image } from 'react-native-elements';
import GeoRefHListItem from "../components/GeoRefHListItem";
import BottomSheetTouchable from "../components/BottomSheetTouchable";
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

export default class EntityItem extends PureComponent {
  render() {
    const { onPress, icon, keyItem, type, title, place, image, distance } = this.props;
    var gui = {}
    //TODO: create a listview component and MOVE this check that component
    if(type == "attrattore") {
      gui.iconName = Platform.OS === 'ios' ? 'ios-map' : 'md-map';
      gui.backgroundTopLeftCorner = Colors.colorScreen1;
    } else if(type == "ispiratore") {
      gui.iconName = 'flag-outline';
      gui.backgroundTopLeftCorner = Colors.colorScreen2;
    } else if (type == "itinerario") {
      gui.iconName = Platform.OS === 'ios' ? 'ios-analytics' : 'md-analytics';
      gui.backgroundTopLeftCorner = Colors.colorScreen4;
    } else if (type == "evento") {
        gui.iconName = Platform.OS === 'ios' ? 'ios-calendar' : "calendar-outline";
        gui.backgroundTopLeftCorner = Colors.colorScreen5;
    } else {
        gui.iconName = Platform.OS === 'ios' ? 'ios-map' : 'md-map';
        gui.backgroundTopLeftCorner = Colors.colorScreen1;
    }

    gui.backgroundTopLeftCorner = this.props.backgroundTopLeftCorner ? this.props.backgroundTopLeftCorner : gui.backgroundTopLeftCorner;

    return (
        <BottomSheetTouchable 
            key={keyItem}  
            onPress={onPress}
            activeOpacity={0.7}
            style={{width: 150, height: 150, backgroundColor: "transparent"}}
        >
            <GeoRefHListItem
                title={`${title}`}
                place={`${place}`}
                image={`${image}`}
                distance={distance}
                style={{flex: 1}} />
            <View style={{
                position: "absolute",
                top: 0,
                right: 0,
                borderWidth: 10,
                borderRightColor: "transparent",
                borderLeftWidth: 35,
                borderLeftColor: "transparent",
                borderBottomColor: "transparent",
                borderTopColor: gui.backgroundTopLeftCorner,
                borderTopWidth: 35,
                borderRightWidth: 0,
                borderTopRightRadius: 10,
            }}>
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
      </BottomSheetTouchable>
    );
  }
}