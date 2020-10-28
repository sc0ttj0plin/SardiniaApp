import React, { PureComponent } from 'react';
import { View, StyleSheet } from 'react-native';
import GeoRefHListItem from "../components/GeoRefHListItem";
import BottomSheetTouchable from "../components/BottomSheetTouchable";
import { Ionicons } from '@expo/vector-icons';
import * as Constants from '../constants';

export default class EntityItem extends PureComponent {
  render() {
    const { onPress, keyItem, title, place, image, distance, listType, horizontal } = this.props;

    let entityOptions = Constants.RELATED_LIST_TYPES[listType] || Constants.RELATED_LIST_TYPES.places
    let marginRight = horizontal ? 0 : 0
    return (
        <BottomSheetTouchable 
            key={keyItem}  
            onPress={onPress}
            activeOpacity={0.7}
            style={[styles.fill, this.props.style]}
        >
            <GeoRefHListItem
                title={`${title}`}
                place={`${place}`}
                image={`${image}`}
                distance={distance}
                style={styles.fill} />
            <View style={[styles.corner, {
              borderTopColor: entityOptions.backgroundTopRightCorner,
            }]}>
              <Ionicons
                  name={entityOptions.iconName}
                  size={13}
                  style={styles.cornerIcon}
                  color={entityOptions.iconColor}
              />
            </View>
      </BottomSheetTouchable>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1
  },
  corner: {
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
  },
  cornerIcon: { 
    backgroundColor: "transparent", 
    position: "absolute",
    top: -30,
    right: 0,
    width: 15,
  }
})