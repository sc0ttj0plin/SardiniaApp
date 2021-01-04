import React, { PureComponent } from 'react';
import { ActivityIndicator, View, Image} from 'react-native';
import * as Animatable from 'react-native-animatable';
import CustomText from "./CustomText";
import ShimmerWrapper from './ShimmerWrapper';
import ScrollableContainerTouchableOpacity from './ScrollableContainerTouchableOpacity';

ViewAnimatable = Animatable.createAnimatableComponent(View);

/**
 * Animated image with bounce-in animation used for showing images progressively in a sequence
 */
export default class GalleryImage extends PureComponent {
  render() {
    const { source, index, onPress, style } = this.props;
    console.log(source);
    return (
        <ScrollableContainerTouchableOpacity 
            onPress={() => onPress(index)}
            activeOpacity={0.7}
            style={[{
                backgroundColor: 'transparent',
                borderRadius: 0,
                height: 80,
                width: 100
              }, style]}
                >
            <ViewAnimatable 
                animation={'bounceIn'}
                delay={300 * index}
                duration={500}
                style={[{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: 80
                    }, style
                ]}>
                <ShimmerWrapper shimmerStyle={[{ position: "absolute", height: 80, width: 100}, style]} />
                <Image
                    source={ source }
                    style={[{
                        height: 80,
                        resizeMode: 'cover',
                        width: 100,
                        backgroundColor: "transparent"
                    }, style]}
                    />
        </ViewAnimatable>
      </ScrollableContainerTouchableOpacity>
    );
  }
}