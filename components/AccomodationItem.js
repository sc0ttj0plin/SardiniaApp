import React, { PureComponent } from 'react';
import { View, Platform, StyleSheet, Text } from 'react-native';
import { TouchableOpacity } from "react-native-gesture-handler"
import ScrollableContainerTouchableOpacity from "./ScrollableContainerTouchableOpacity";
import { Image } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import * as Constants from '../constants';
import CustomText from "./CustomText";

export default class AccomodationItem extends PureComponent {

  constructor(props){
    super(props);

    const { listType, horizontal, index, sideMargins } = props;
    let margins = sideMargins || 20
    let space = 10;
    let itemWidth = ((Layout.window.width - (margins*2))/2) - space / 2;
    this.width = horizontal==false ? itemWidth : 160;
    this.height = this.width;
    this.entityIconOpts = Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[listType] || Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS.places
    this.marginRight = 0;
    this.marginLeft = horizontal==false && index && index%2 != 0 ? space : 0;
  }

  _renderStars = (count) => {
    if (count > 0) {
      let stars = new Array(count).fill(0);
      return stars.map( star => <Ionicons name={"md-star"} size={25} color={Colors.stars} style={styles.star}/>);
    } else {
      return null;
    }
  }

  renderDistanceRow(distance) {
    if(distance)
      return (
        <View style={styles.distanceView}>
          <CustomText numberOfLines={1} ellipsizeMode='tail' style={styles.distanceText}>{distance}</CustomText>
        </View>);
  }

  render() {
    const { title, term, stars, location, distance, onPress, hideBorder, extraStyle } = this.props;

    return (
        <ScrollableContainerTouchableOpacity onPress={onPress} style={[styles.item, 
          {
            marginRight: this.marginRight, 
            marginLeft: this.marginLeft,
            width: this.width, 
            height: this.height,
            borderColor: hideBorder ? "transparent" : Colors.lightGray
          }, extraStyle, /*Constants.styles.shadow*/]} activeOpacity={0.8}>
          <View style={styles.content}>
            <View style={[styles.corner]}>
              <Ionicons
                  name={this.entityIconOpts.iconName}
                  size={13}
                  style={styles.cornerIcon}
                  color={this.entityIconOpts.iconColor}
              />
            </View>
            <View style={styles.innerContent}>
              <CustomText style={styles.termText}>{term}</CustomText>
              <CustomText style={styles.titleText} numberOfLines={1} ellipsizeMode='tail'>{title}</CustomText>
              <View style={styles.starsView}>
                {this._renderStars(stars)}
              </View>
              <CustomText style={styles.locationText}>{location}</CustomText>
            </View>
          </View>
          {this.renderDistanceRow(distance)}
        </ScrollableContainerTouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1
  },
  item: {
    backgroundColor: "white",
    borderRadius: 8,
    position: "relative",
    // borderColor: Colors.lightGray,
    // borderWidth: 1,
    // paddingLeft: 10,
    // backgroundColor: "red"

  },
  content:{
    paddingTop: 10,
    height: 130,
  },
  innerContent: {
    paddingLeft: 10,
    flexDirection: "column",
    flex: 1
  },
  cornerIcon: { 
    backgroundColor: "transparent", 
    position: "absolute",
    top: -30,
    right: 0,
    width: 15,
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
    borderTopColor: Colors.colorAccomodationsScreen
  },
  distanceView: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    // paddingVertical: 15,
    paddingLeft: 10,
    display: "flex",
    justifyContent: "center", 
    alignItems: "flex-start",
  },
  starsView: {
    display: "flex",
    flexDirection: "row",
    minHeight: 25
  },
  distanceText: {
    fontSize: 10,
    fontFamily: "montserrat-bold",
  },
  locationText: {
    fontSize: 10,
    marginTop: 5,
  },
  titleText: {
    marginTop: 5,
    fontSize: 11,
    fontFamily: "montserrat-bold",
    minHeight: 30,
    paddingRight: 5,
  },
  termText: {
    fontSize: 10,
    minHeight: 20,
  }
})