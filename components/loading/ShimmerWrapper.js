import React, { PureComponent, Component } from 'react';
import { Animated } from "react-native";
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'

const ShimmerPlaceholder = createShimmerPlaceholder();

/**
 * ShimmerWrapper is used to generate an animated loading effect 
 * and is used in most LoadingLayouts to simulate a list's loading state
 */
const ShimmerWrapper = (props) => {

  // Handle animation
  const shimmerRef = React.createRef()

  React.useEffect(() => {
    const animation = Animated.stagger(400, [shimmerRef.current.getAnimated()]);
    Animated.loop(animation).start();
  }, [])

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