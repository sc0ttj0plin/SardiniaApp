import React, { PureComponent, Component } from 'react';
import { Animated } from "react-native";
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import {LinearGradient} from "expo-linear-gradient";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

/**
 * ShimmerWrapper is used to generate an animated loading effect
 * and is used in most LoadingLayouts to simulate a list's loading state
 */
const ShimmerWrapper = (props) => {

  // Handle animation
  const shimmerRef = React.createRef()

  React.useEffect(() => {
    if (shimmerRef.current) {
      const animation = Animated.stagger(400, [shimmerRef.current.getAnimated()]);
      Animated.loop(animation).start();
    }
  }, [shimmerRef.current])

  return (
    <>
        <ShimmerPlaceholder
            shimmerStyle={props.shimmerStyle}
            ref={shimmerRef}
            stopAutoRun
            duration={2000}
        />
    </>
  )
}

export default ShimmerWrapper;
