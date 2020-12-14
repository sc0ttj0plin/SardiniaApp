import React, { PureComponent, Component } from 'react';
import {View, StyleSheet } from "react-native";
import Animated from 'react-native-reanimated';
import Colors from '../constants/Colors';
const { Value, event, interpolate } = Animated;

class ScrollableAnimatedHandle extends PureComponent {

    constructor(props){
        super(props);
        
        this._handleBorderRadius = new Value(0)
        this._handleBorderRadiusMax = 32;
        this._handleBorderRadiusMin = 0;
    }

    _onSettle = (index) => {
        if(index == 0) {
            _startHandleAnimation(0);
        }  else {
            _startHandleAnimation(32);
        }
    }

    _startHandleAnimation = (value) => {
        Animated.timing(
          this._handleBorderRadius,
          {
              toValue: value,
              duration: 100,
              easing: Easing.linear
          }
        ).start()
        this._handleBorderRadius._value = value;
      }

    render() {
    return (
      <Animated.View style={[styles.header, { borderTopRightRadius: this._handleBorderRadius }]}>
        <View style={styles.panelHandle} />
        {/* { Platform.OS == 'android' && 
          <TouchableOpacity style={styles.xView} onPress={() => this._scrollable.snapTo(closeSnapIndex)}>
            <Feather name={'x'} size={20} color={Colors.grayHandle} />
          </TouchableOpacity>
        } */}
      </Animated.View>);
    }
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        backgroundColor: 'white',
        paddingTop: 20,
        paddingBottom: 10,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 32,
        margin: 0
      },
      panelHandle: {
        width: 32,
        height: 4,
        backgroundColor: Colors.grayHandle,
        borderRadius: 2,
        marginBottom: 5
      },
})

export default ScrollableAnimatedHandle;