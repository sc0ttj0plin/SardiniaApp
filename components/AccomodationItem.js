import React, { PureComponent } from 'react';
import { View, Platform, StyleSheet, Text } from 'react-native';
import { TouchableOpacity } from "react-native-gesture-handler"
import ScrollableContainerTouchableOpacity from "./ScrollableContainerTouchableOpacity";
import { Image } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import * as Constants from '../constants';

export default class AccomodationItem extends PureComponent {

  constructor(props){
    super(props);

    const { listType, horizontal, sideMargins, index } = props;
    let margins = sideMargins || 20
    let itemWidth = ((Layout.window.width - (margins*2))/2) - 5;
    this.width = !horizontal ? itemWidth : 160;
    this.height = this.width;
    let space = (Layout.window.width - (margins*2) - (this.width*2))/ 2;
    this.entityIconOpts = Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[listType] || Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS.accomodations
    this.marginRight = 0;
    this.marginLeft = horizontal==false && index && index%2 != 0 ? (space*2) : 0;

    this.marginBottom = !horizontal ? 16 : 10;
  }

  _renderStars = (count) => {
    if (count > 0) {
      let stars = new Array(count).fill(0);
      return stars.map( star => <Ionicons name={"md-star"} size={25} color={Colors.stars} style={styles.star}/>);
    } else {
      return null;
    }
  }

  render() {
    const { title, term, stars, location, distance, onPress, hideBorder, extraStyle } = this.props;

    return (
        <ScrollableContainerTouchableOpacity onPress={onPress} style={[styles.item, 
          {
            marginRight: this.marginRight, 
            marginLeft: this.marginLeft, 
            marginBottom: this.marginBottom, 
            width: this.width, 
            height: this.height,
            borderColor: hideBorder ? "transparent" : Colors.lightGrey
          }, extraStyle]} activeOpacity={0.8}>
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
              <Text style={styles.termText}>{term}</Text>
              <Text style={styles.titleText}>{title}</Text>
              <View style={styles.starsView}>
                {this._renderStars(stars)}
              </View>
              <Text style={styles.locationText}>{location}</Text>
            </View>
          </View>
          <View style={styles.distanceView}>
            <Text style={styles.distanceText}>Distanza {distance}</Text>
          </View>
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
    // borderColor: Colors.lightGrey,
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
    fontWeight: "bold"
  },
  locationText: {
    fontSize: 10,
    marginTop: 5,
  },
  titleText: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: "bold",
    minHeight: 30,
    paddingRight: 5
  },
  termText: {
    fontSize: 10,
    minHeight: 20,
  }
})