import React, { PureComponent } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import GeoRefHListItem from "../components/GeoRefHListItem";
import BottomSheetTouchable from "../components/BottomSheetTouchable";
import { Ionicons } from '@expo/vector-icons';
import * as Constants from '../constants';
import Layout from "../constants/Layout"

export default class EntityItem extends PureComponent {
  constructor(props){
    super(props)
    // console.log("props", props)
  }

  render() {
    const { onPress, keyItem, title, place, image, distance, listType, horizontal, index, sideMargins } = this.props;
    let margins = sideMargins || 20
    let itemWidth = ((Layout.window.width - (margins*2))/2) - 5;
    let width = !horizontal ? itemWidth : "100%";
    let height = width;
    let space = (Layout.window.width - (margins*2) - (width*2))/ 2;
    let entityIconOpts = Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[listType] || Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS.places
    const marginRight = 0;
    const marginLeft = !horizontal && index && index%2 != 0 ? space*2 : 0;
    const marginBottom = !horizontal ? 16 : 10
    // console.log("horizontal index", horizontal, index, marginRight, marginLeft, space)
    return (
        <BottomSheetTouchable 
            key={keyItem}  
            onPress={onPress}
            activeOpacity={0.7}
            style={[styles.fill, this.props.style, {
              marginRight,
              marginLeft,
              marginBottom,
              width,
              height
            }]}
        >
            <GeoRefHListItem
                title={`${title}`}
                place={`${place}`}
                image={`${image}`}
                distance={distance}
                style={styles.fill} />
            <View style={[styles.corner, {
              borderTopColor: entityIconOpts.backgroundTopRightCorner,
            }]}>
              <Ionicons
                  name={entityIconOpts.iconName}
                  size={13}
                  style={styles.cornerIcon}
                  color={entityIconOpts.iconColor}
              />
            </View>
      </BottomSheetTouchable>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
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