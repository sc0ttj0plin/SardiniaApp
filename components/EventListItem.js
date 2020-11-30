import React, { PureComponent } from 'react';
import { View, Platform, StyleSheet, ActivityIndicator, Text, Image } from 'react-native';
import { TouchableOpacity } from "react-native-gesture-handler"
import Colors from '../constants/Colors';
import CustomText from "./CustomText";

/**
 * EventListItem
 */
export default class EventListItem extends PureComponent {

  _renderDates = () => {
    const { startDate, endDate } = this.props
    if (startDate !== endDate) 
      return <CustomText style={styles.listItemDate}>{startDate} {endDate}</CustomText>
    else 
      return <CustomText style={styles.listItemDate}>{startDate}</CustomText>
  }

  render() {
    const { title, term, image } = this.props
    
    return (
      <TouchableOpacity style={styles.listItemButton} activeOpacity={0.7} onPress={this.props.onPress}>
        <View style={styles.listItem}>
          <View style={styles.imageView}>
            <Image
              style={styles.imageView} 
              source={{uri: image}}
              PlaceholderContent={<ActivityIndicator style={styles.spinner} color={"white"}/>}/>
          </View>
          <View style={styles.itemDescView}>
              <CustomText style={styles.listItemTitle}>{title}</CustomText>
              <CustomText style={styles.listItemTerm}>{term}</CustomText>
              {this._renderDates()}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  listItemButton: {
    width: "100%",
    minHeight: 78,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingLeft: 1
  },
  listItem: {
    minHeight: 78,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 13,
    marginTop: 3,
    // borderTopLeftRadius: 5,
    // borderBottomLeftRadius: 5,
    borderRadius: 8,
    width: "99%",
    display: "flex",
    flexDirection: "row"
  },
  imageView: {
    flex: 1,
    maxWidth: 78,
    borderRightColor: "#F2F2F2",
    borderRightWidth: 1,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5
  },
  itemDescView: {
    paddingTop: 8,
    paddingLeft: 10,
    paddingRight: 10,
    flex: 1
  },
  listItemImage: {
    width: "100%", 
    height: "100%",
    zIndex: -1
  },
  listItemTitle: {
    fontSize: 13,
    fontFamily: "montserrat-bold",
  },
  listItemDate: {
    fontSize: 10,
    fontFamily: "montserrat-bold",
  },
  listItemTerm: {
    fontSize: 13,
  }
});