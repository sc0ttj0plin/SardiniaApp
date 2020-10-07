import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from "react-native"
import Colors from '../constants/Colors';

/**
 * TabBarIcon (self explanatory)
 */
export default function TabBarIcon(props) {
  const defaultColor = props.tintColor ? props.tintColor : Colors.tabIconDefault;
  const activeColor = props.activeColor ? props.activeColor : Colors.tabIconSelected;
  return (
    <>
    { props.iconSourceDefault ? (
      <Image source={props.focused && props.iconSourceActive? props.iconSourceActive : props.iconSourceDefault} style={{...props.iconStyle}}>
      </Image>
    ) : (
      <Ionicons
        name={props.name}
        size={26}
        style={{ marginBottom: -3, backgroundColor: "transparent" }}
        color={props.focused ? activeColor : defaultColor}
      />

    )}

    </>
  );
}
