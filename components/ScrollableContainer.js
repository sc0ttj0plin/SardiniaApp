import React, { PureComponent, Component } from 'react';
import { Dimensions, StyleSheet, Text, View, TouchableOpacity, ScrollView, NativeModules, Easing, Platform } from 'react-native';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import Animated from 'react-native-reanimated';
import MapView from 'react-native-maps';
const windowHeight = Dimensions.get('window').height;
import Layout from '../constants/Layout';
import { Ionicons, Feather } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import ScrollableContainerTouchableOpacity from "./ScrollableContainerTouchableOpacity"
import { call, useCode, useAnimatedStyle, useSharedValue} from 'react-native-reanimated'
import { PanGestureHandler, State } from "react-native-gesture-handler";
import CustomText from "./CustomText";

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
      data: props.data,
      currentSnapIndex: null
    }
    this._scrollable = {}
    //Drag 
    this._dragX = new Value(0);
    this._dragY = new Value(0);
    this._handleBorderRadius = new Value(32)
    this._handleBorderRadiusMax = 32;
    this._handleBorderRadiusMin = 0;
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

    this._snapping = false;
  }

  componentWillUnmount() {

  }

  componentDidUpdate(prevProps){
    if(prevProps.snapIndex !== this.props.snapIndex){
      this._snapping = true;
      let timeout = setTimeout( () => {
        this._scrollable.snapTo(this.props.snapIndex)
        clearTimeout(timeout)
        // this._snapping = false;
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

  _onHandlePress = () => {
    if(this.props.onSettle)
      this.props.onSettle() 
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

  _renderHandle = () => {
    const { closeSnapIndex = 1 } = this.props;
    return (
      <Animated.View style={[styles.header, { borderTopRightRadius: this._handleBorderRadius }]}>
        <View style={styles.panelHandle} />
        { Platform.OS == 'android' && 
          <TouchableOpacity style={styles.xView} onPress={() => this._scrollable.snapTo(closeSnapIndex)}>
            <Feather name={'x'} size={20} color={Colors.grayHandle} />
          </TouchableOpacity>
        }
      </Animated.View>);
  }

  render() {
    const { 
      numColumns, 
      snapPoints, 
      initialSnapIndex, 
      topComponent, 
      extraComponent, 
      keyExtractor,
      renderItem,
      ListHeaderComponent,
      data,
      onEndReached = ()=>{} } = this.props;

    if (snapPoints && snapPoints.length > 0)
      return (
          <View style={[styles.fill, {backgroundColor: "transparent", zIndex: -1,}]}>
            <Animated.View style={[styles.fill, { transform: [{ translateY: this._translateAnimY } ]}]}>
              {topComponent()}
            </Animated.View>
            { extraComponent &&
              <Animated.View style={[styles.extraComponent, { transform: [{ translateY: this._translateAnimY2 } ]}]}>
                {extraComponent()}
              </Animated.View>
            }
            <ScrollBottomSheet
              componentType="FlatList"
              key={numColumns} /* NOTE always set a key to refresh only this component and avoid unmounting */
              // numColumns={numColumns || 1}
              snapPoints={snapPoints}
              contentContainerStyle={{backgroundColor: 'red'}}
              // disableScrollViewPanResponder={true}
              scrollEnabled={this.state.currentSnapIndex === 0 ? true : false}
              initialSnapIndex={initialSnapIndex >=0 ? initialSnapIndex : 0}
              renderHandle={this._renderHandle}
              data={this.state.data || []}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              innerRef = {(ref) => this._scrollableInner = ref}
              ref={(ref)=>this._scrollable = ref}
              ListHeaderComponent={ListHeaderComponent || null}
              animatedPosition={this._translateAnim}
              initialNumToRender={8}
              maxToRenderPerBatch={2}
              //onEndReachedThreshold={0.5} 
              onSettle = {(index) => {
                this.setState({ currentSnapIndex: index });
                if(Platform.OS === 'android')
                  setTimeout(() => {this._scrollableInner.getNode().scrollToOffset({ animated: false, offset: 0 })}, 100);

                if(index == 0 && this._handleBorderRadius._value != this._handleBorderRadiusMin){
                  console.log("index 1", this._handleBorderRadius._value, this._handleBorderRadiusMax)
                  this._startHandleAnimation(0)
                }
                else if(index != 0 && this._handleBorderRadius._value != this._handleBorderRadiusMax){
                  console.log("index 2", this._handleBorderRadius._value, this._handleBorderRadiusMin)
                  this._startHandleAnimation(32)
                }

              if(this._snapping)
                this._snapping = false;
              else if(this.props.onSettle)
                this.props.onSettle()

              }}
              onEndReached = {({distanceFromEnd})=> onEndReached()}
              contentContainerStyle={[styles.contentContainerStyle, {
                flex:  data && data.length == 0 ? 1 : null
              }]}/>
            
        </View>
      )
    else 
      return null;

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
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: 20,
    paddingBottom: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 32
  },
  panelHandle: {
    width: 32,
    height: 4,
    backgroundColor: Colors.grayHandle,
    borderRadius: 2,
  },
  xView: {
    position: 'absolute', 
    right: 0, 
    top: 10, 
    height: 30, 
    width: 30
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