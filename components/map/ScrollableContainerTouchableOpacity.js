import React from "react";
import { Platform, TouchableOpacity } from "react-native";
import { TouchableNativeFeedback as RNGHTouchableOpacity } from "react-native-gesture-handler";
 
const ScrollableContainerTouchableOpacity = (props) => {
  if (Platform.OS === "android") {
    return (
      <RNGHTouchableOpacity {...props}  background={RNGHTouchableOpacity.Ripple('white')}>
        {props.children}
      </RNGHTouchableOpacity>
    );
  }
 
  return <TouchableOpacity {...props}>
        {props.children}
      </TouchableOpacity>
};
 
export default ScrollableContainerTouchableOpacity;