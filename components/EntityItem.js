import React, { PureComponent } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import GeoRefHListItem from "./GeoRefHListItem";
import ScrollableContainerTouchableOpacity from "./ScrollableContainerTouchableOpacity";
import { Ionicons } from '@expo/vector-icons';
import * as Constants from '../constants';
import Layout from "../constants/Layout";

export default class EntityItem extends PureComponent {
  constructor(props){
    super(props)
    // console.log("props", props)
    const { listType, horizontal, index, sideMargins } = props;
    let margins = sideMargins || 20
    let itemWidth = ((Layout.window.width - (margins*2))/2) - 5;
    this.width = horizontal==false ? itemWidth : 160;
    this.height = this.width;
    let space = (Layout.window.width - (margins*2) - (this.width*2))/ 2;
    this.entityIconOpts = Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[listType] || Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS.places
    this.marginRight = 0;
    this.marginTop = !horizontal && index == 0 ? 10 : 0;
    this.marginLeft = horizontal==false && index && index%2 != 0 ? space : 0;
    this.marginBottom = horizontal==false ? 16 : 10;
    // console.log("entity item", this.width, this.height)
  }

  render() {
    const { onPress, keyItem, title, place, image, distance, horizontal, extraStyle } = this.props;

    return (
        <ScrollableContainerTouchableOpacity 
            key={keyItem}  
            onPress={onPress}
            activeOpacity={0.7}
            style={[this.props.style, {
              marginRight: this.marginRight,
              marginLeft: this.marginLeft,
              marginBottom: this.marginBottom,
              marginTop: this.marginTop,
              width: this.width,
              height: this.height,
              maxHeight: this.height,
              minHeight: this.height,
            }, extraStyle, styles.shadow]}
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
                  size={15}
                  style={styles.cornerIcon}
                  color={this.entityIconOpts.iconColor}
              />
            </View>
      </ScrollableContainerTouchableOpacity>
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
    borderLeftWidth: 40,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    borderTopWidth: 40,
    borderRightWidth: 0,
    borderTopRightRadius: 8,
  },
  cornerIcon: { 
    backgroundColor: "transparent", 
    position: "absolute",
    top: -35,
    right: 3,
    width: 15,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  }
})