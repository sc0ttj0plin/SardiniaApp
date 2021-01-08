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
import AsyncStorage from '@react-native-community/async-storage';
import { CommonActions } from '@react-navigation/native';
import { ApolloProvider } from '@apollo/react-hooks';
import actions from './actions';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { persistor, store } from './store';
import { Video } from 'expo-av';
import { ConnectedUpdateHandler, ConnectedNetworkChecker } from './components';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import config from './config/config';
import * as firebase from 'firebase';
import * as Constants from './constants';
import * as Location from 'expo-location';
import LoadingDots from './components/LoadingDots';
//import backgroundTasks from './helpers/backgroundTasks'; /* Loads background tasks even if not invoked */

enableScreens();


export default class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      introTimeout: 2000,
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
    await this._initGeolocation();
    this._initAppAsync();
  }
  
  _initAppAsync = async () => {
    await this._loadResourcesAsync();
    await this._initLinkingAsync();
    await this._initFirebaseAppAndLogin();
    this._handleFinishLoading();
  }

  _initLinkingAsync = async () => {
    //app is closed
    const url = await Linking.getInitialURL();
    if (url) {
      store.dispatch(actions.setUrl(url));
      this._parseLinkingUrl(url);
    }
    //or app is opened 
    Linking.addEventListener('url', ({ url }) => {
      store.dispatch(actions.setUrl(url));
      this._parseLinkingUrl(url);
    });
  }


  _parseLinkingUrl = async (url) => {
    //Login url type
    if (url.indexOf("apiKey") >=0) {
      store.dispatch(actions.passwordLessLinkHandler(url));
    }
  }

  _initFirebaseAppAndLogin = () => {
    //Initialize app is synchronous
    if (firebase.apps.length === 0)
      firebase.initializeApp(config.firebase);
    this._performLogin();
  }

  _performLogin = async () => {
    //Attempt login
    const email = await AsyncStorage.getItem('email');
    if (email)
      store.dispatch(actions.passwordLessLogin());
  }

  _initGeolocation = async () => {
    const { status } = await Location.requestPermissionsAsync();
    if (status === 'granted') {
      //Background location
      await Location.startLocationUpdatesAsync(Constants.GEOLOCATION.geolocationBackgroundTaskName, Constants.GEOLOCATION.startLocationUpdatesAsyncOpts);
      //Foreground location
      //  Initial position
      let location = await Location.getCurrentPositionAsync(Constants.GEOLOCATION.getCurrentPositionAsyncOpts);
      store.dispatch(actions.setGeolocation(location, Constants.GEOLOCATION.sources.foregroundGetOnce));
      //  Watch
      Location.watchPositionAsync(Constants.GEOLOCATION.watchPositionAsyncOpts, location => {
       store.dispatch(actions.setGeolocation(location, Constants.GEOLOCATION.sources.foregroundWatch));
      });
    }
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
      Font.loadAsync({
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
    }, () => {
      setTimeout(() => SplashScreen.hideAsync(), 300);
    });
  }

  _onSplashIntroError = (e) => {
    console.log("error", e);
    setTimeout( () => {
      this.setState({
        isIntroEnded: true
      })
    }, this.state.introTimeout);
  }
 
  _onSplashIntroLoad = () => {
    setTimeout( () => {
      this.setState({
        isIntroEnded: true
      })
    }, this.state.introTimeout);
  }


  //<Image 
  //source={require("./assets/videos/splash_mare.gif")}
  //onLoad={this._onSplashIntroLoad}
  //resizeMode="cover"
  //style={[styles.backgroundGif]} />

  _renderSplashIntro = () => {
    return (
      <View style={styles.loadingGif}>
        <Image 
          source={require("./assets/images/splash_mare.png")}
          resizeMode="cover"
          onLoad={this._onSplashIntroLoad}
          style={[styles.backgroundGif]} />
        <View style={[styles.loadingDotsView1, {bottom: 30}]}>
          <View style={styles.loadingDotsView2}>
            <LoadingDots isLoading={true}/>
          </View>
        </View>
      </View>
    );
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
                    <AppNavigator ref={nav => { this._navigator = nav; }} />
                    <ConnectedUpdateHandler />
                    <ConnectedNetworkChecker />
                    {
                      !this.state.isIntroEnded && this._renderSplashIntro()
                    }
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
  backgroundGif: {
    width: "100%",
    height: "100%",
    position: "absolute"
  },
  loadingGif: {
    flex: 1,
    position: "absolute",
    zIndex: 10000,
    width: "100%",
    height: "100%",
  },
  loadingDotsView1: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: '100%',
    alignItems: "center",
    justifyContent: "center"
  },
  loadingDotsView2: {
    width: 100
  }
});
