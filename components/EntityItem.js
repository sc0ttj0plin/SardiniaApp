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
    this.entityIconOpts = Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[props.listType] || Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS.places
  }


  
  render() {
    const { onPress, keyItem, title, subtitle, image, distance, size, extraStyle, style, animated = false } = this.props;
    return (
        <ScrollableContainerTouchableOpacity 
            key={keyItem}  
            onPress={onPress}
            onLayout={this._onLayout}
            activeOpacity={0.7}
            style={[styles.item, style, size && {
              width: size.width,
              height: size.height,
              marginLeft: size.marginLeft,
              marginRight: size.marginRight,
              marginBottom: size.marginBottom
            }, extraStyle, /*styles.shadow*/]}
        >
            <GeoRefHListItem
                title={title}
                subtitle={subtitle}
                image={image}
                distance={distance}
                style={styles.fill}
                animated={animated} />
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
  item: {
    width: 160,
    height: 160,
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