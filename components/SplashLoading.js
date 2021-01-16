import React, { PureComponent, useRef, useState, useEffect } from "react";
import { StyleSheet, Image, View } from "react-native";
import Colors from '../constants/Colors';
import LoadingDots from './LoadingDots';
import * as Constants from '../constants';
import * as SplashScreen from 'expo-splash-screen';
import * as Location from 'expo-location';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import stateActions from '../actions';

import Animated, { Easing, stopClock, withDelay} from 'react-native-reanimated';

const defaultColors = [
  Colors.blue,
  Colors.yellow,
  Colors.green,
  Colors.red
];

const {
  Value,
  Clock,
  eq,
  clockRunning,
  not,
  cond,
  startClock,
  timing,
  interpolate,
  and,
  set,
  block
} = Animated;



function runTiming(clock, duration = Constants.SPLASH_LOADING_DISAPPEAR_DURATION) {
    const fromValue = 1;
    const toValue = 0;
  
    const state = {
      finished: new Value(0),
      position: new Value(fromValue),
      time: new Value(0),
      frameTime: new Value(0),
    };
  
    const config = {
      duration: new Value(duration),
      toValue: new Value(toValue),
      easing: Easing.inOut(Easing.ease)
    };
  
    return [
      cond(clockRunning(clock), 0, [
        // If the clock isn't running we reset all the animation params and start the clock
        startClock(clock),
      ]),
      // we run the step here that is going to update position
      timing(clock, state, config),
      // if the animation is over we stop the clock
      state.position,
    ];
  }



function SplashLoading({onLoad, onFinished, locale, actions}) {
  const [show, setShow] = useState(true);
  const [opacity, setOpacity] = useState(new Animated.Value(1));
  const [loading, setLoading] = useState(true);

  var _onSplashLoad = async () => {
    setTimeout(SplashScreen.hideAsync, Constants.SPLASH_EXPO_DURATION);
    setTimeout( () => {
      setLoading(false);
    }, Constants.SPLASH_LOADING_DURATION);
    //_tasks();
    await _initGeolocation();
  }

  var _tasks = async () => {
    //Background location
    var opts = Constants.GEOLOCATION.startLocationUpdatesAsyncOpts;
    opts.foregroundService.title = locale.messages.notificationTitle;
    opts.foregroundService.body = locale.messages.notificationBody;
    await Location.startLocationUpdatesAsync(Constants.GEOLOCATION.geolocationBackgroundTaskName, opts);
    //Geofance location
    Location.startGeofencingAsync(Constants.GEOLOCATION.geolocationFenceTaskName, [{
      identifier: 'region1',
      latitude: 39.007779,
      longitude: 9.121111,
      radius: 1000
    }]);
  }

  var _initGeolocation = async () => {
    const { status } = await Location.requestPermissionsAsync();
    if (status === 'granted') {
      //Foreground location
      //  Initial position
      let location = await Location.getCurrentPositionAsync(Constants.GEOLOCATION.getCurrentPositionAsyncOpts);
      setTimeout(() => {actions.setGeolocation(location, Constants.GEOLOCATION.sources.foregroundGetOnce)}, Constants.SPLASH_LOADING_DURATION + 500);
      //  Watch
      Location.watchPositionAsync(Constants.GEOLOCATION.watchPositionAsyncOpts, location => {
       actions.setGeolocation(location, Constants.GEOLOCATION.sources.foregroundWatch);
      });
    }
  }

    useEffect(()=>{
        if(!loading) {
            var animation = new Value(0);
            const clock = new Clock();
            var opacity = set(
                animation,
                runTiming(clock)
            );
            setOpacity(opacity);
            setTimeout(()=>{
                setShow(false);
                if(onFinished)
                    onFinished();
            }, Constants.SPLASH_LOADING_DISAPPEAR_DURATION);
        }
    }, [loading])

  
  return show && (
    <Animated.View style={[styles.loadingGif, {opacity}]} >
        <Image 
          source={require("../assets/images/splash_mare.png")}
          resizeMode="cover"
          onLoad={_onSplashLoad}
          style={[styles.backgroundGif]} />
        <View style={[styles.loadingDotsView1, {bottom: 100}]}>
          <View style={styles.loadingDotsView2}>
            <LoadingDots isLoading={true}/>
          </View>
        </View>
      </Animated.View>
  );
}

const styles = StyleSheet.create({
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

const mapStateToProps = state => {
  return {
    //language
    locale: state.localeState,
  };
};


const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...stateActions }, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(SplashLoading)