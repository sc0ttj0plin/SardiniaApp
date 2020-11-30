import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Image, StyleSheet } from "react-native"
import Colors from '../constants/Colors';
import CustomText from "./CustomText";

/**
 * TabBarIcon (self explanatory)
 */
export default function TabBarIcon(props) {
  const defaultColor = Colors.tabIconDefault;
  const activeColor = props.activeColor ? props.activeColor : Colors.tabIconSelected;
  let imageStyle = props.iconSourceActive && props.iconSourceDefault ? styles.defaultImage : {}
  return (
    <>
    { props.iconSourceDefault ? (
      <Image source={props.focused && props.iconSourceActive? props.iconSourceActive : props.iconSourceDefault} style={[imageStyle, props.iconStyle]}>
      </Image>
    ) : (
      <FontAwesome
        name={props.name}
        size={25}
        style={{ marginBottom: -3, backgroundColor: "transparent" }}
        color={props.focused ? activeColor : defaultColor}
      />

    )}

    </>
  );
}

const styles = StyleSheet.create({
  defaultImage: {
    width: 25,
    height: 25
  }
})
