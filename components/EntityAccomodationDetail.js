import React, { PureComponent } from 'react';
import { View, Platform, StyleSheet, ActivityIndicator, Text, Image } from 'react-native';
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import CustomText from "./CustomText";

/**
 * EntityAccomodationDetail
 */
export default class EntityAccomodationDetail extends PureComponent {
  render() {
    const { title, subtitle, iconName, iconColor, iconSize, onPress } = this.props

    return (
      <TouchableOpacity style={styles.listItemButton} activeOpacity={0.7} onPress={onPress}>
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
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 13,
    marginTop: 3,
    borderRadius: 8,
    width: "100%",
    display: "flex",
    flexDirection: "row"
  },
  iconView: {
    justifyContent: "center",
    alignItems: "center",
    width: 78,
    height: 78,
    // borderRadius: 5,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: Colors.colorAccomodationsScreen,
    borderRightColor: Colors.lightGrey,
    borderRightWidth: 1
  },
  itemDescView: {
    paddingTop: 14,
    paddingLeft: 10,
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
    fontSize: 13,
  }
});