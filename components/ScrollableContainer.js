import React, { PureComponent, useRef } from 'react';
import { Dimensions, StyleSheet, Text, View, TouchableOpacity, ScrollView, NativeModules } from 'react-native';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import Animated from 'react-native-reanimated';
import MapView from 'react-native-maps';
const windowHeight = Dimensions.get('window').height;

import { call, useCode, useAnimatedStyle, useSharedValue} from 'react-native-reanimated'
import { PanGestureHandler, State } from "react-native-gesture-handler";
const { Value, event, interpolate } = Animated;
const { StatusBarManager } = NativeModules;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
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

  componentDidUpdate(prevProps){
    if(prevProps.initialSnapIndex !== this.props.initialSnapIndex){
      console.log("snap point", this.props.initialSnapIndex)
      if(this.props.initialSnapIndex == 2){
        let timeout = setTimeout( () => {
          this._scrollable.snapTo(this.props.initialSnapIndex)
          clearTimeout(timeout)
        }, 100)
      }
      else
        this._scrollable.snapTo(this.props.initialSnapIndex)

    }
  }

  _renderHandle = () =>
    <View style={styles.header}>
      <View style={styles.panelHandle} />
    </View>;

  render() {
    return (
      <View style={[styles.fill, {backgroundColor: "transparent", zIndex: -1,}]}>
        <Animated.View style={[styles.fill, { transform: [{ translateY: this._translateAnimY } ]}]}>
          {this.props.topComponent()}
        </Animated.View>
        
        <ScrollBottomSheet
          {...this.props} 
          componentType="FlatList"
          numColumns={this.props.numColumns || 1}
          snapPoints={[5, windowHeight - 390, windowHeight - 180]}
          initialSnapIndex={this.props.initialSnapIndex >=0 ? this.props.initialSnapIndex : 2}
          renderHandle={this._renderHandle}
          data={this.props.data || []}
          keyExtractor={this.props.keyExtractor}
          renderItem={this.props.renderItem}
          ref={(ref)=>this._scrollable = ref}
          ListHeaderComponent={this.props.ListHeaderComponent || null}
          animatedPosition={this._translateAnim}
          contentContainerStyle={[styles.contentContainerStyle, {
            flex:  this.props.data && this.props.data.length == 0 ? 1 : null
          }]}>
        </ScrollBottomSheet>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1
  },
  dragHandler: {
    alignSelf: 'stretch',
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc'
  },
  contentContainerStyle: {
    // flex: 1,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 32
  },
  panelHandle: {
    width: 32,
    height: 4,
    backgroundColor: "#0000001A",
    borderRadius: 2,
  },
  item: {
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
    marginVertical: 10,
  },
})