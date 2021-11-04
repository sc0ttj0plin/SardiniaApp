import React, { PureComponent, useRef, useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import Colors from '../../constants/Colors';

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
  interpolateNode,
  and,
  set,
  block
} = Animated;

function runTiming(clock, delay) {
  const duration = 800;
  const fromValue = 0;
  const toValue = 1;

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
    cond(state.finished,
      [
        set(state.finished, 0),
        set(state.time, 0),
        set(state.frameTime, 0),
        set(state.position, fromValue)
      ]),
    // we made the block return the updated position
    state.position,
  ];
}


function LoadingDots({ dots = 4, colors = defaultColors, size = 20, borderRadius, isLoading = false }) {
  const [animations, setAnimations] = useState([]);
  const [show, setShow] = useState(false);
  const [showTimeout, setShowTimeout] = useState();

  useEffect(() => {
    const dotAnimations = [];
    const fromValue = 0.6, toValue = 1;

    for (var i = 0; i < dots; i++) {
      var animation = new Value(0);
      var scaleAnimation = new Value(0);
      const clock = new Clock();
      var timing = set(
          animation,
          runTiming(clock)
      );
      if(i == 0)
        scaleAnimation = interpolateNode(timing, {
          inputRange: [0, 0.125, 0.25, 1],
          outputRange: [fromValue, toValue, fromValue, fromValue],
        });
      if(i == 1)
        scaleAnimation = interpolateNode(timing, {
          inputRange: [0, 0.25, 0.375, 0.5 ,1],
          outputRange: [fromValue, fromValue, toValue, fromValue, fromValue],
        });
      if(i == 2)
        scaleAnimation = interpolateNode(timing, {
          inputRange: [0, 0.5, 0.625, 0.75, 1],
          outputRange: [fromValue, fromValue, toValue, fromValue, fromValue],
        });
      if(i == 3)
        scaleAnimation = interpolateNode(timing, {
          inputRange: [0, 0.75, 0.875, 1],
          outputRange: [fromValue, fromValue, toValue, fromValue],
        });
      dotAnimations.push({
        animation,
        scaleAnimation: scaleAnimation,
        clock
      });
    }
    setAnimations(dotAnimations);
  }, dots);

  useEffect(() => {
    clearTimeout(showTimeout);
    if(!isLoading) {
      var timeout = setTimeout(() => {setShow(false)}, 800);
      setShowTimeout(timeout);
    } else {
      setShow(true);
    }
  }, [isLoading]);


  return show && (
    <Animated.View style={[styles.loading]}>
      {animations.map((animation, index) => (
        <Animated.View
          // eslint-disable-next-line react/no-array-index-key
          key={`loading-anim-${index}`}
          style={[
            { width: size, height: size, borderRadius: borderRadius || size / 2 },
            { backgroundColor: colors[index] || "#4dabf7" },
            { transform: [{ scale: animation.scaleAnimation }] }
          ]}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loading: {
    backgroundColor: 'transparent',
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});

export default LoadingDots;
