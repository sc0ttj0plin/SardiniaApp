import React from 'react';
import { Text, StyleSheet } from "react-native";

export default function CustomText(props) {
  return (
    <Text {...props} 
      numberOfLines={props.numberOfLines || undefined}
      textBreakStrategy={"simple"}
      lineBreakMode={"tail"} 
      style={[styles.default, props.style]}>
        {props.children == null || props.children == "null" ? "" : props.children}
    </Text>
  )
}

const styles = StyleSheet.create({
    default: {
        fontFamily: "montserrat-regular"
    }
})
