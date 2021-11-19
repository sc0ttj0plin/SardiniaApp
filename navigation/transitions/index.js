import { TransitionPresets, TransitionSpecs, HeaderStyleInterpolators } from '@react-navigation/stack';
import { Easing } from 'react-native';

export const FromTopTransition = {
    gestureDirection: 'vertical',
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration:  500,
          easing: Easing.out(Easing.poly(5)),
        },
      },
      close: {
        animation: 'timing',
        config: {
          duration: 500,
          easing: Easing.in(Easing.linear),
        },
      },
    },
    headerStyleInterpolator: HeaderStyleInterpolators.forFade,
    cardStyleInterpolator: ({ current, next, layouts }) => {
      return {
        cardStyle: {
          transform: [
            {
              translateY: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-layouts.screen.height, 0],
              })
            }
          ],
        }
      };
    },
  }
