import React, { PureComponent } from "react";
import { StyleSheet, View, Text, Image, ActivityIndicator, PixelRatio } from "react-native";
import ScrollableContainerTouchableOpacity from "../components/ScrollableContainerTouchableOpacity";
import { LinearGradient } from 'expo-linear-gradient';
import CustomText from "./CustomText";
import ShimmerWrapper from "./ShimmerWrapper"

import Animated, { Easing, stopClock } from 'react-native-reanimated';
import {AnimationConfig} from '../constants';

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

function runTiming(clock) {
  const random = Math.random();
  const duration = AnimationConfig.imageAnimationDuration;
  const toValue = random > 0.5 ? 0 : 1;

  const state = {
    finished: new Value(0),
    position: new Value(random),
    time: new Value(0),
    frameTime: new Value(0),
  };

  const config = {
    duration: new Value(random > 0.5 ? duration * random : duration * (1 - random)),
    toValue: new Value(toValue),
    easing: Easing.inOut(Easing.ease)
  };

  return [
    cond(clockRunning(clock), 0, [
      // If the clock isn't running we reset all the animation params and start the clock
      set(state.finished, 0),
      set(state.time, 0),
      set(state.position, new Value(random)),
      set(state.frameTime, 0),
      startClock(clock),
    ]),
    // we run the step here that is going to update position
    timing(clock, state, config),
    // if the animation is over we stop the clock
    cond(state.finished,
      [
        set(state.finished, 0),
        set(state.time, 0),
        set(config.duration, new Value(duration)),
        set(state.frameTime, 0),
        cond(
          eq(state.position, 1),  [
          set(config.toValue, 0),
        ]),
        cond(
          eq(state.position, 0),  [
          set(config.toValue, 1),
        ])
      ]),
    // we made the block return the updated position
    state.position,
  ];
}

/**
 * List item element that represents a category
 */
class AnimatedImage extends PureComponent { 
  constructor(props) {
    super(props);
    this.state = {
      width: 0
    };

    this.scaleAnimated = new Value(1);

    if(this.props.animated) {
        const clock = new Clock();
        this.animation = new Value(0);
        this.timing = set(
            this.animation,
            runTiming(clock)
        );
        this.scaleAnimated = interpolate(this.timing, {
            inputRange: [0, 1],
            outputRange: [1, 1.3],
        });
    }
  }


  render() { 
    var image = this.props.image;

    return (
        <Animated.Image 
            source={{ uri: image }} 
            style={[this.props.style, {
              transform: [{
                scale: this.scaleAnimated
              }]}]}
            >
          </Animated.Image>
    )}
}

const styles = StyleSheet.create({ 
    fill: {
      width: "100%",
      height: "100%",
    },
    image: {
      resizeMode: "cover",
      position: "absolute",
      backgroundColor: "transparent",
      width: "100%",
      height: "100%",
    },
});

export default AnimatedImage;