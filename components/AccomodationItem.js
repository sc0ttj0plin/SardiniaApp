import React, { PureComponent } from 'react';
import { TouchableOpacity, View, Platform, StyleSheet, Text } from 'react-native';
import { Image } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import * as Constants from '../constants';

export default class AccomodationItem extends PureComponent {

  _renderStar = () => {
    return(
      <Ionicons
        name={"md-star"}
        size={20}
        color={"#f8e100"}
        style={styles.star}/>
    )
  }

  _renderStars = (count) => {
    let stars = new Array(count).fill(0);
    return stars.map( star => {
      return this._renderStar()
    })
  }

  render() {
    const { title, term, stars, location, distance } = this.props;

    return (
        <TouchableOpacity style={styles.item} activeOpacity={0.8}>
          <View style={styles.content}>
            <View style={[styles.corner]}/>
            <Text style={styles.termText}>{term}</Text>
            <Text style={styles.titleText}>{title}</Text>
            <View style={styles.starsView}>
              {this._renderStars(stars)}
            </View>
            <Text style={styles.locationText}>{location}</Text>
          </View>
          <View style={styles.distanceView}>
            <Text style={styles.distanceText}>Distanza {distance}</Text>
          </View>
        </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1
  },
  item: {
    width: 150,
    height: 150,
    backgroundColor: "white",
    borderRadius: 8,
    position: "relative",
    marginLeft: 10,
  },
  content:{
    width: 150,
    height: 110,
    paddingLeft: 10,
    paddingTop: 10
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
    borderTopColor: "#1FCBD9"
  },
  distanceView: {
    width: 150,
    height: 40,
    backgroundColor: "#F2F2F2",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingVertical: 15,
    paddingLeft: 10,
    display: "flex",
    justifyContent: "center", 
    alignItems: "flex-start"
  },
  starsView: {
    display: "flex",
    flexDirection: "row"
  },
  distanceText: {
    fontSize: 10,
    fontWeight: "bold"
  },
  locationText: {
    fontSize: 10,
    marginTop: 5
  },
  titleText: {
    fontSize: 17,
    fontWeight: "bold"
  },
  termText: {
    fontSize: 10
  }
})