import React from "react";
import { Platform, TouchableOpacity } from "react-native";
import { TouchableOpacity as RNGHTouchableOpacity } from "react-native-gesture-handler";
 
const BottomSheetTouchable = (props) => {
  if (Platform.OS === "android") {
    return (
      <RNGHTouchableOpacity {...props} />
    );
  }
 
  return <TouchableOpacity {...props} />
};
 
export default BottomSheetTouchable;