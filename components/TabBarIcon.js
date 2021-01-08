import React from 'react';
import { Image, StyleSheet } from "react-native"
import Colors from '../constants/Colors';
import CustomText from "./CustomText";
import { createIconSetFromIcoMoon } from '@expo/vector-icons';

const Icon = createIconSetFromIcoMoon(
  require('../assets/fonts/custom/selection.json'),
  'icomoon',
  'icomoon.ttf');

/**
 * TabBarIcon (self explanatory)
 */
export default function TabBarIcon(props) {
  const defaultColor = Colors.tabIconDefault;
  const activeColor = props.activeColor ? props.activeColor : Colors.tabIconSelected;
  let imageStyle = props.iconSourceActive && props.iconSourceDefault ? styles.defaultImage : {}
  let iconName = props.focused ? props.name + '-selected' : props.name;
  return (
    <>
    { props.iconSourceDefault ? (
      <Image source={props.focused && props.iconSourceActive? props.iconSourceActive : props.iconSourceDefault} style={[imageStyle, props.iconStyle]}>
      </Image>
    ) : (
      <Icon
        name={iconName}
        size={25}
        style={{ backgroundColor: "transparent"}}
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
