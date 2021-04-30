import React from 'react';
import { createIconSetFromIcoMoon } from '@expo/vector-icons';

const Icon = createIconSetFromIcoMoon(require('../../assets/fonts/custom/selection.json'),'icomoon','icomoon.ttf');


export default function CustomIcon(props) {
  const color = props.color ? props.color : "white";
  const size = props.size ? props.size : 25;
  return (
    <Icon
        name={props.name}
        size={size}
        style={[{ backgroundColor: "transparent" }, props.style]}
        color={color}
      />
  );
}
