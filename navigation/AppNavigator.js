import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainDrawerNavigator from './MainDrawerNavigator';
import * as Constants from '../constants';

var RootStack = createStackNavigator();

export default function() {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        headerMode="none"
        mode="modal"
        screenOptions={{ animationEnabled: false }}>
        <RootStack.Screen name="MainDrawerNavigator" component={MainDrawerNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  )
};
