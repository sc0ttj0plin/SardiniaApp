import { AppLoading } from 'expo';
import * as SplashScreen from 'expo-splash-screen'
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import React, { Component } from 'react';
import { Platform, StatusBar, StyleSheet, View, LogBox } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Fontisto } from '@expo/vector-icons';
import { Provider } from 'react-redux'
import AppNavigator from './navigation/AppNavigator';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { ApolloProvider } from '@apollo/react-hooks';
import { persistor, store } from './store';
import { Video } from 'expo-av';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
enableScreens();

export default class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      isSplashReady: false,
      isAppReady: false,
      isLoadingComplete: false,
      isVideoEnded: false,
      isVideoLoaded: false,
      isVideoPlaying: false
    };
    this._skipVideo = false;
    //Ignores warning boxes
    LogBox.ignoreLogs(['Warning:']); //or: LogBox.ignoreAllLogs();
    SplashScreen.preventAutoHideAsync();
  }
  
  async _loadResourcesAsync() {
    await Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
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
      })
    ]);
  }


  _handleLoadingError(error) {
    console.warn(error);
  }
  
  _handleFinishLoading() {
    this.setState({
      isLoadingComplete: true
    }, () => this._playVideo());
  }

  _onVideoEnd() {
    this.setState({
      isVideoEnded: true
    });
  }

  _onVideoError(e) {
    console.log(e);
  }

  _onVideoLoad() {
    this.setState({
      isVideoLoaded: true,
    }, () => this._playVideo());
  }

  _playVideo() {
    if(this.state.isLoadingComplete && this.state.isVideoLoaded) {
      this.vPlayer.playAsync();
    }
  }

  _onPlaybackStatusUpdate(status) {
    if(status.didJustFinish) {
      this._onVideoEnd();
    }
    if(status.isPlaying && !this.state.isVideoPlaying) {
      this.setState({
        isVideoPlaying: true
      }, () => SplashScreen.hide());
    }
  }

  render() {
    if ((!this.state.isLoadingComplete && !this.props.skipLoadingScreen) || (!this._skipVideo && !this.state.isVideoEnded)) {
      return (
        <View>
          <AppLoading
            startAsync={this._loadResourcesAsync.bind(this)}
            onError={this._handleLoadingError}
            onFinish={() => this._handleFinishLoading()}
          />
          <Video
            source={{uri: "https://interactive.crs4.it/splash_mare.mp4"}}
            ref={(ref) => {
              this.vPlayer = ref
            }}
            onLoad={this._onVideoLoad.bind(this)}
            onError={this._onVideoError.bind(this)}
            onPlaybackStatusUpdate={this._onPlaybackStatusUpdate.bind(this)}
            resizeMode="cover"
            style={[styles.backgroundVideo]} />
        </View>
      );
    }
    else {
      return (
      <Provider store={store}>
        <PersistGate loading={<View style={[styles.container]} />} persistor={persistor}>
          <ApolloProvider client={client}>
            <SafeAreaProvider style={{ flex: 1, backgroundColor: 'green' }} forceInset={{ top: 'always', bottom:'always' }}>
              <View style={[styles.container]}>
                {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
                <AppNavigator />
              </View>
            </SafeAreaProvider>
          </ApolloProvider>
        </PersistGate>
      </Provider>
      );
    }
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundVideo: {
    width: "100%",
    height: "100%",
    backgroundColor: "black"
  }
});
