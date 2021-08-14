import { AppLoading } from 'expo';
import * as SplashScreen from 'expo-splash-screen'
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React, { Component } from 'react';
import { Platform, StatusBar, StyleSheet, View, LogBox, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Fontisto } from '@expo/vector-icons';
import { Provider } from 'react-redux'
import AppNavigator from './navigation/AppNavigator';
import { CommonActions } from '@react-navigation/native';
import { ApolloProvider } from '@apollo/react-hooks';
import actions from './actions';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { persistor, store } from './store';
import { Video } from 'expo-av';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ConnectedSplashLoader, ConnectedErrorBoundary } from './components';
import { registerRootComponent } from 'expo';
import GeoInfo from '../sardinia_app/helpers/geocoding';

enableScreens();

export default class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      isSplashReady: false,
      isAppReady: false,
      isLoadingComplete: false,
      isIntroEnded: false,
      isIntroPlaying: false,
    };
    //Ignores warning boxes
    LogBox.ignoreLogs(['Warning:']); //or: LogBox.ignoreAllLogs();
    SplashScreen.preventAutoHideAsync();
  }

  async componentDidMount() {
    this._initAppAsync();
  }
  
  _initAppAsync = async () => {
    await this._loadResourcesAsync();
    this._handleFinishLoading();
  }

  _loadResourcesAsync = async () => {
    await Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
        require('./assets/videos/splash_mare.gif'), 
        require('./assets/images/splash_mare.png'), 
        require('./assets/icons/play.png'),
        require('./assets/icons/play_bg.png'),
        require('./assets/icons/ombra_video.png'),
        require('./assets/icons/whereToGo_default.png'),
        require('./assets/icons/whereToGo_active.png'),
        require('./assets/icons/whatToDo_default.png'),
        require('./assets/icons/whatToDo_active.png'),
        require('./assets/icons/itineraries_default.png'),
        require('./assets/icons/itineraries_active.png'),
        require('./assets/icons/events_default.png'),
        require('./assets/icons/events_active.png'),
        require('./assets/icons/central_icon.png'),
      ]),
      await Font.loadAsync({
        'Ionicons': require('native-base/Fonts/Ionicons.ttf'),
        ...Ionicons.font,
        ...FontAwesome.font,
        ...FontAwesome5.font,
        ...Fontisto.font,
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
        'montserrat-regular': require('./assets/fonts/Montserrat-Regular.ttf'),
        'montserrat-bold': require('./assets/fonts/Montserrat-Bold.ttf'),
        'montserrat-semiBold': require('./assets/fonts/Montserrat-SemiBold.ttf'),
        'montserrat-light': require('./assets/fonts/Montserrat-Light.ttf'),
        'montserrat-medium': require('./assets/fonts/Montserrat-Medium.ttf'),
        'icomoon': require('./assets/fonts/custom/icomoon.ttf'),
      })
    ]);
  }

  _handleLoadingError(error) {
    console.warn(error);
  }
  
  _handleFinishLoading() {
    this.setState({
      isLoadingComplete: true
    });
  }

  _onSplashFinished = () => {

  }


  render() {
    
    if(this.state.isLoadingComplete) {
      return (
        <Provider store={store}>
          <PersistGate loading={<View style={[styles.container]} />} persistor={persistor}>
            <ApolloProvider client={client}>
              <SafeAreaProvider style={{ flex: 1 }} forceInset={{ top: 'always', bottom:'always' }}>
                  <View style={[styles.container]}>
                    {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
                    <ConnectedErrorBoundary>
                      <AppNavigator/>
                    </ConnectedErrorBoundary>
                    <ConnectedSplashLoader loading={!this.state.isIntroEnded} onFinish={this._onSplashFinished}/>
                  </View>
              </SafeAreaProvider>
            </ApolloProvider>
          </PersistGate>
        </Provider>
      );
    }
    else return null;
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


registerRootComponent(App);