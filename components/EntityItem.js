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
    const { listType, horizontal, index, sideMargins } = props;
    let margins = sideMargins || 20
    let itemWidth = ((Layout.window.width - (margins*2))/2) - 5;
    this.width = !horizontal ? itemWidth : 160;
    this.height = this.width;
    let space = (Layout.window.width - (margins*2) - (this.width*2))/ 2;
    this.entityIconOpts = Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[listType] || Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS.places
    this.marginRight = 0;
    this.marginLeft = !horizontal && index && index%2 != 0 ? space : 0;
    this.marginBottom = !horizontal ? 16 : 10;
    console.log("horizontal index", horizontal, index, this.marginRight, this.marginLeft, space)

  }

  render() {
    const { onPress, keyItem, title, place, image, distance, horizontal } = this.props;

    return (
        <BottomSheetTouchable 
            key={keyItem}  
            onPress={onPress}
            activeOpacity={0.7}
            style={[this.props.style, {
              marginRight: this.marginRight,
              marginLeft: this.marginLeft,
              marginBottom: this.marginBottom,
              width: this.width,
              height: this.height
            }]}
        >
            <GeoRefHListItem
                title={`${title}`}
                place={`${place}`}
                image={`${image}`}
                distance={distance}
                style={styles.fill} />
            <View style={[styles.corner, {
              borderTopColor: this.entityIconOpts.backgroundTopRightCorner,
            }]}>
              <Ionicons
                  name={this.entityIconOpts.iconName}
                  size={13}
                  style={styles.cornerIcon}
                  color={this.entityIconOpts.iconColor}
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