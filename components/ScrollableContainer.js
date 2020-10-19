import React, { PureComponent } from 'react';
import { Dimensions, StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import Animated from 'react-native-reanimated';
import MapView from 'react-native-maps';
const windowHeight = Dimensions.get('window').height;

import { call, useCode, useAnimatedStyle, useSharedValue} from 'react-native-reanimated'
import { PanGestureHandler, State } from "react-native-gesture-handler";
const { Value, event, interpolate } = Animated;

/**
 * ScrollableContainer 
 */
export default class ScrollableContainer extends PureComponent {
  constructor(props){
    super(props);
    // Scrollable refernce
    this._scrollable = {}
    //Drag 
    this._dragX = new Value(0);
    this._dragY = new Value(0);
    //Topmost component translation animations when scrolling
    this._translateAnim = new Value(0);
    this._translateAnimY = interpolate(this._translateAnim, {
      inputRange: [0, 1],
      outputRange: [0, -windowHeight/2],
    });
  
  }

  _renderHandle = () =>
    <View style={styles.header}>
      <View style={styles.panelHandle} />
    </View>;

  render() {
    return (
      <View style={styles.fill}>
        <Animated.View style={[styles.fill, {transform: [{ translateY: this._translateAnimY } ]}]}>
          {this.props.topComponent}
        </Animated.View>

        <ScrollBottomSheet 
            componentType="FlatList"
            snapPoints={[30, '50%', windowHeight - 200, windowHeight - 60]}
            initialSnapIndex={2}
            renderHandle={this._renderHandle}
            data={this.props.data || []}
            keyExtractor={this.props.keyExtractor}
            renderItem={this.props.renderItem}
            ref={(ref)=>this._scrollable = ref}
            ListHeaderComponent={this.props.ListHeaderComponent || null}
            animatedPosition={this._translateAnim}
            contentContainerStyle={styles.contentContainerStyle}>
        </ScrollBottomSheet>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  dragHandler: {
    alignSelf: 'stretch',
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc'
  },
  contentContainerStyle: {
    padding: 16,
    backgroundColor: '#F3F4F9',
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  panelHandle: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4
  },
  item: {
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
    marginVertical: 10,
  },
});