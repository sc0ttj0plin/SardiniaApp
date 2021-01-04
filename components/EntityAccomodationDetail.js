import React, { PureComponent } from 'react';
import { View, Platform, StyleSheet, ActivityIndicator, Text, Image } from 'react-native';
import TouchableOpacity from "./ScrollableContainerTouchableOpacity";
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import CustomText from "./CustomText";
import { over } from 'lodash';

/**
 * EntityAccomodationDetail
 */
export default class EntityAccomodationDetail extends PureComponent {
  render() {
    const { title, subtitle, iconName, iconColor, iconSize, onPress } = this.props

    return (
      <TouchableOpacity style={styles.listItemButton} onPress={onPress}>
        <View style={styles.listItem}>
          <View style={styles.itemDescView}>
              <CustomText style={styles.listItemTitle}>{title}</CustomText>
              <CustomText style={styles.listItemTerm}>{subtitle}</CustomText>
          </View>
          <View style={styles.iconView}>
            <Ionicons name={iconName} size={iconSize || 25} color={iconColor || "white"}/>
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
    paddingLeft: 1,
    borderRadius: 8,
  },
  listItem: {
    minHeight: 78,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    borderWidth: 1,
    borderColor: "#eeeeee",
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 2,
    marginBottom: 13,
    marginTop: 3,
    borderRadius: 8,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    overflow: "hidden"
  },
  iconView: {
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 78,
    flex: 1,
    // borderRadius: 5,
    backgroundColor: Colors.colorAccomodationsScreen,
    borderRightColor: Colors.lightGray,
    borderRightWidth: 1
  },
  itemDescView: {
    paddingTop: 14,
    paddingLeft: 10,
    paddingRight: 5,
    paddingBottom: 10,
    // paddingRight: 10,
    flex: 1
  },
  listItemImage: {
    width: "100%", 
    height: "100%",
    zIndex: -1
  },
  listItemTitle: {
    fontSize: 15,
    fontFamily: "montserrat-bold",
  },
  listItemDate: {
    fontSize: 10,
    fontFamily: "montserrat-bold",
  },
  listItemTerm: {
    fontSize: 13
  }
});