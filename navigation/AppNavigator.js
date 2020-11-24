// import React from 'react';

// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import MainDrawerNavigator from './MainDrawerNavigator';
// import * as Constants from '../constants';

// var RootStack = createStackNavigator();

// export default function() {
//   return (
//     <NavigationContainer>
//       <RootStack.Navigator
//         headerMode="none"
//         mode="modal"
//         screenOptions={{ animationEnabled: false }}>
//         <RootStack.Screen name="MainDrawerNavigator" component={MainDrawerNavigator} />
//       </RootStack.Navigator>
//     </NavigationContainer>
//   )
// };

import React, { PureComponent } from "react";
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import AsyncStorage from '@react-native-community/async-storage';
import actions from '../actions';
import MainDrawerNavigator from './MainDrawerNavigator';
import * as Constants from '../constants';

//Create root stack navigator
var RootStack = createStackNavigator();

class AppNavigator extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  async componentDidMount() {
    //Get received url (app is closed)
    const url = await Linking.getInitialURL();
    if (url) {
      this.props.actions.setUrl(url);
      this._parseUrl(url);
    }
    //or app is opened 
    Linking.addEventListener('url', ({ url }) => {
      this.props.actions.setUrl(url);
      this._parseUrl(url);
    });

    await this._checkEmail();
  }

  componentDidUpdate(prevProps) {
    //auth is updated by passwordLessLogin action
    if (this.props.auth !== prevProps.auth && !this.props.auth.authLoading)
      if (this.props.auth.success) {
        console.log("Auth Success!", this.props.auth.user)
      } 
  }
      
  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/
  _checkEmail = async () => {
    //Tries login first ()
    const email = await AsyncStorage.getItem('email');
    if (email)
      this.props.actions.passwordLessLogin();
  }

  _parseUrl = async (url) => {
    //Login url type contains apiKey string
    if (url.indexOf("apiKey") >=0)
      this.props.actions.passwordLessLinkHandler(url);
  }


  /********************* Render methods go down here *********************/

  render() {
    return (
      <NavigationContainer>
        <RootStack.Navigator
          headerMode="none"
          mode="modal"
          screenOptions={{ animationEnabled: false }}>
          <RootStack.Screen name={Constants.NAVIGATION.NavDrawerNavigator} component={MainDrawerNavigator} />
        </RootStack.Navigator>
      </NavigationContainer>
    )
  }
  
}


AppNavigator.navigationOptions = {
  title: 'AppNavigator',
};



function AppNavigatorContainer(props) {
  const store = useStore();

  return <AppNavigator 
    {...props}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    auth: state.authState,
    //mixed state
    others: state.othersState,
  };
};


const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...actions }, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(AppNavigatorContainer)