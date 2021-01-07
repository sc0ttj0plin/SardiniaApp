import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Animated, Easing } from "react-native";
import Colors from '../constants/Colors';

const defaultColors = [
  Colors.blue,
  Colors.yellow,
  Colors.green,
  Colors.red
];

function LoadingDots({ dots = 4, colors = defaultColors, size = 20, borderRadius }) {
  const [animations, setAnimations] = useState([]);
  const [reverse, setReverse] = useState(false);

  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dotAnimations = [];
    for (let i = 0; i < dots; i++) {
      dotAnimations.push(new Animated.Value(0));
    }
    setAnimations(dotAnimations);
  }, []);

  useEffect(() => {
    if (animations.length === 0) return;
    loadingAnimation(animations, reverse);
    appearAnimation();
  }, [animations]);

  function appearAnimation() {
    Animated.timing(opacity, {
      toValue: 1,
      easing: Easing.ease,
      useNativeDriver: true
    }).start();
  }

  function floatAnimation(node, reverseY, delay, index) {
    const floatSequence = Animated.sequence([
      Animated.timing(node, {
        toValue: reverseY ? 0.7 : 1,
        easing: Easing.inOut(Easing.linear),
        duration: 70,
        delay: index * delay,
        useNativeDriver: true
      }),
    ]);
    return floatSequence;
  }

  function loadingAnimation(nodes, reverseY) {
    Animated.parallel(
      nodes.map((node, index) => floatAnimation(node, reverseY, 100, index))
    ).start(() => {
      setReverse(!reverse);
    });
  }

  useEffect(() => {
    if (animations.length === 0) return;
    loadingAnimation(animations, reverse);
  }, [reverse, animations]);

  return (
    <Animated.View style={[styles.loading, { opacity }]}>
      {animations.map((animation, index) => (
        <Animated.View
          // eslint-disable-next-line react/no-array-index-key
          key={`loading-anim-${index}`}
          style={[
            { width: size, height: size, borderRadius: borderRadius || size / 2 },
            { backgroundColor: colors[index] || "#4dabf7" },
            { transform: [{ scale: animation }] }
          ]}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loading: {
    backgroundColor: 'transparent',
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});

export default LoadingDots;