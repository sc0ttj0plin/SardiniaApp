import React, { Component } from 'react';
import { connect, useStore } from 'react-redux';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItems, DrawerItem } from '@react-navigation/drawer';
import { Avatar, Icon, Overlay, Divider } from 'react-native-elements';
import { View, Text, ScrollView, StyleSheet, TouchableNativeFeedback, TouchableOpacity } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import * as Constants from '../constants';


class CustomDrawer extends Component {
  render() {
    return null;
  }
}

CustomDrawer.Line = class Line extends Component {
  render() {
    return (
      <View
        style={styles.drawerContent}
      >
        <View style={[styles.mixedBottomLine]}>
          <View style={[styles.mixedBottomLineItem, {backgroundColor: Colors.colorPlacesScreen}]}/>
          <View style={[styles.mixedBottomLineItem, {backgroundColor: Colors.colorInspirersScreen}]}/>
          <View style={[styles.mixedBottomLineItem, {backgroundColor: Colors.colorItinerariesScreen}]}/>
          <View style={[styles.mixedBottomLineItem, {backgroundColor: Colors.colorEventsScreen}]}/>
        </View>
      </View>
    );
  }
}

CustomDrawer.Header = class Header extends Component {
  render() {
    return (
      <View style={styles.drawerContent}>
        <View style={{height: 100}}>
          <Text style={styles.username}>Mario Rossi</Text>
          <Text style={styles.email}>mariorossi@gmail.com</Text>
        </View>
      </View>
    );
  }
}

CustomDrawer.Separator = class Separator extends Component {
  render() {
    return (
      <View style={styles.drawerContent}>
        <Divider style={{ backgroundColor: Colors.greyTransparent }} />
      </View>
    );
  }
}

CustomDrawer.Item = class Item extends Component {
  render() {
    const { navigation, label, iconOpts = {}, screenName, state, routeIndex } = this.props;
    const active = state.index === routeIndex;
    const { name, size, color } = iconOpts;
    return(
      <View style={{ marginHorizontal: 10, backgroundColor: active ? Colors.lightGrey : 'white', borderRadius: 4}}>
        <DrawerItem
        icon={() => (
          <FontAwesome
            name={name}
            size={size}
            color={color}
          />
        )}
        label={label}
        onPress={() => navigation.navigate(screenName) }
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  username: {
    marginLeft: 16, 
    marginTop: 40, 
    fontSize: 18, 
    fontWeight: 'bold'
  },
  email: {
    marginLeft: 16, 
    marginTop: 3, 
    fontSize: 14, 
    color: Colors.mediumGrey
  },
  mixedBottomLineItem: {
    flex: 1,
  },
  mixedBottomLine: {
    width: "100%",
    height: Constants.COMPONENTS.header.bottomLineHeight + 3,
    marginBottom: 10,
    display: "flex",
    flexDirection: "row",
  },
});

export default CustomDrawer;
