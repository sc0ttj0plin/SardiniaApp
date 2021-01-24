import React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RootNavigation, { navigationRef } from './RootNavigation';
import { store } from '../store';
import actions from '../actions';

var RootStack = createStackNavigator();

export default function() {
  return (
    <NavigationContainer 
      ref={navigationRef}
      onReady={() => store.dispatch(actions.setNavigatorReady(true))}
    >
      <RootStack.Navigator
        headerMode="none"
        mode="modal"
        screenOptions={{ animationEnabled: false }}>
        <RootStack.Screen name="RootNavigation" component={RootNavigation} />
      </RootStack.Navigator>
    </NavigationContainer>
  )
};
