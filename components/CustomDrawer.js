import React, { Component } from 'react';
import { connect, useStore } from 'react-redux';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItems, DrawerItem } from '@react-navigation/drawer';
import { Avatar, Icon, Overlay, Divider } from 'react-native-elements';
import { View, Text, ScrollView, StyleSheet, TouchableNativeFeedback, TouchableOpacity } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import actions from '../actions';
import Colors from '../constants/Colors';
import * as Constants from '../constants';
import CustomText from "./CustomText";
import AsyncStorage from '@react-native-community/async-storage';
import { NavigationEvents, useNavigation, useRoute } from '@react-navigation/native';
import { bindActionCreators } from 'redux';


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

class Header extends Component {
  render() {
    const { user } = this.props.auth;
    const email = user && user.email;
    const username = user && user.info && user.info.username;
    return (
      <View style={[styles.drawerContent,styles.header]}>
          {email && <CustomText numberOfLines={1} ellipsizeMode='tail' style={styles.email}>{email}</CustomText> }
          {username && <CustomText numberOfLines={1} ellipsizeMode='tail' style={styles.username}>{username}</CustomText>}
      </View>
    );
  }
}

function HeaderContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <Header 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}

const mapStateToProps = state => {
  return {
    auth: state.authState,
    //mixed state
    others: state.othersState,
    //language
    locale: state.localeState,
  };
};


const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...actions }, dispatch)};
};

CustomDrawer.Header = connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(HeaderContainer)

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
      <View style={{ marginHorizontal: 10, backgroundColor: active ? Colors.lightGray : 'white', borderRadius: 4}}>
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
    minHeight: 50,
  },
  header: {
    flexDirection: "column-reverse",
    padding: 10
  },
  username: {
    fontSize: 18, 
    fontWeight: 'bold'
  },
  email: {
    marginTop: 3, 
    fontSize: 14, 
    color: Colors.mediumGray
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
