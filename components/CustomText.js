import React from 'react';
import { Text, StyleSheet } from "react-native";

export default function CustomText(props) {
  return (
    <Text {...props} 
      numberOfLines={props.numberOfLines || undefined} 
      style={[styles.default, props.style]}>
        {props.children}
    </Text>
  )
}

const styles = StyleSheet.create({
    default: {
        fontFamily: "montserrat-regular"
    }
})