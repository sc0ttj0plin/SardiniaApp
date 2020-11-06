import React, { PureComponent, useRef } from 'react';
import { Dimensions, StyleSheet, Text, View, TouchableOpacity, ScrollView, NativeModules } from 'react-native';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import Animated from 'react-native-reanimated';
import MapView from 'react-native-maps';
const windowHeight = Dimensions.get('window').height;
import Layout from '../constants/Layout';

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
    this.state = {
      data: props.data
    }
    this._scrollable = {}
    //Drag 
    this._dragX = new Value(0);
    this._dragY = new Value(0);
    //Topmost component translation animations when scrolling
    this._translateAnim = new Value(0);
    this._translateAnimY = interpolate(this._translateAnim, {
      inputRange: [0, 1],
      outputRange: [0, -Layout.window.height/2],
    });

    this._translateAnimY2 = interpolate(this._translateAnim, {
      inputRange: [0, 0.5, 0.8, 1],
      outputRange: [10, 10, -10, -35],
    });
    
    this._snapPoints = [5, Layout.window.height - 390, Layout.window.height - 180]
  }

  componentDidUpdate(prevProps){
    if(prevProps.snapIndex !== this.props.snapIndex){
      console.log("snap point", this.props.snapIndex)
      let timeout = setTimeout( () => {
        this._scrollable.snapTo(this.props.snapIndex)
        clearTimeout(timeout)
      }, 300)
    }
    if(prevProps.data !== this.props.data){
      this.setState({
        data: []
      }, () => {
        this.setState({
          data: this.props.data
        })

      })
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
        { this.props.extraComponent &&
          <Animated.View style={[styles.extraComponent, { transform: [{ translateY: this._translateAnimY2 } ]}]}>
            {this.props.extraComponent()}
          </Animated.View>
        }
        
        <ScrollBottomSheet
          componentType="FlatList"
          numColumns={this.props.numColumns || 1}
          snapPoints={this.props.snapPoints || this._snapPoints}
          initialSnapIndex={this.props.initialSnapIndex >=0 ? this.props.initialSnapIndex : 0}
          renderHandle={this._renderHandle}
          data={this.state.data || []}
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
  extraComponent: {
    width: "100%",
    height: 40,
    position: "absolute", 
    top: 0, 
    left: 0, 
    // backgroundColor: "red"
  }
})