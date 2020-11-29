import React, { PureComponent } from 'react';
import { TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { Image } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';
import CustomText from "./CustomText";

ViewAnimatable = Animatable.createAnimatableComponent(View);

/**
 * Animated image with bounce-in animation used for showing images progressively in a sequence
 */
export default class GalleryImage extends PureComponent {
  render() {
    const { source, index, onPress, style } = this.props;
    return (
        <TouchableOpacity 
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
                <Image
                    source={ source }
                    PlaceholderContent={<ActivityIndicator />}
                    style={[{
                        height: 80,
                        resizeMode: 'cover',
                        width: 100
                    }, style]}
                    />
        </ViewAnimatable>
      </TouchableOpacity>
    );
  }
}