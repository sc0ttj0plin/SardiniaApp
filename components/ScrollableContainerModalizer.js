import React, { PureComponent, Component } from 'react';
import { Dimensions, StyleSheet, Text, View, ScrollView, NativeModules, Easing, Platform } from 'react-native';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import ScrollableContainerTouchableOpacity from "./ScrollableContainerTouchableOpacity";
import Animated from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import MapView from 'react-native-maps';
const windowHeight = Dimensions.get('window').height;
import Layout from '../constants/Layout';
import Colors from '../constants/Colors';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import actions from '../actions';
import {Modalize} from 'react-native-modalize';


const { Value, event, interpolate } = Animated;
import { call, useCode } from 'react-native-reanimated';

const { StatusBarManager } = NativeModules;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;


/**
 * ScrollableContainer 
 */
class ScrollableContainer extends PureComponent {
  constructor(props){
    super(props);
    // Scrollable refernce
    this.state = {
      data: props.data,
      currentSnapIndex: props.initialSnapIndex || this.props.snapPoints.length - 1,
      scrollToTop: true
    }
    this._scrollable = {}
    //Drag 
    this._dragX = new Value(0);
    this._dragY = new Value(0);
    this._handleBorderRadius = new Value(32)
    this._handleBorderRadiusMax = 32;
    this._handleBorderRadiusMin = 0;
    //Topmost component translation animations when scrolling
    this._translateAnim = new Value(1);
    this._translateAnimY = interpolate(this._translateAnim, {
      inputRange: [0, 1],
      outputRange: [-Layout.window.height/2, 0],
    });

    this._translateAnimY2 = interpolate(this._translateAnim, {
      inputRange: [0, 0.7, 1],
      outputRange: [-35, -35, 10],
    });
  }

  componentDidMount() {
    const { initialSnapIndex } = this.props;
    setTimeout(() => {this.setState({initialSnapPoint: this.props.snapPoints[initialSnapIndex]})}, 1000);
  }

  componentWillUnmount() {

  }

  componentDidUpdate(prevProps){
    const prevSnap = prevProps.others.scrollableSnapIndex[this.props.entityType];
    const currentSnap = this.props.others.scrollableSnapIndex[this.props.entityType];
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

  _closePressed = () => {
    console.log('_closePressed');
    setTimeout(() => this._scrollable.close('alwaysOpen'), 10);
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
    const {
      HeaderTextComponent
     } = this.props;
    return (
      <Animated.View /*onStartShouldSetResponder={this._onPressedHeader}*/ style={[styles.header, { borderTopRightRadius: this._handleBorderRadius}]}>
        {this.state.currentSnapIndex == 0 && 
        <View style={[styles.xView, {marginTop: 15}]}>
            <ScrollableContainerTouchableOpacity  onPress={this._closePressed}>
              <Feather name={'x'} size={30} color={Colors.grayHandle} />
          </ScrollableContainerTouchableOpacity> 
        </View>}
        <HeaderTextComponent></HeaderTextComponent>
      </Animated.View>);
  }

  _onPositionChange = (v) => {
    console.log("_onPositionChange", v);
    var index = 0;
    setTimeout(() => {
      if(v == 'top') {
        index = 0;
        if(this._handleBorderRadius._value != this._handleBorderRadiusMin){
          this._startHandleAnimation(0)
        }
      } else {
        index = 1;
        if(this._handleBorderRadius._value != this._handleBorderRadiusMax){
          this._startHandleAnimation(32)
        }
      }
      this.setState({currentSnapIndex: index}, () => {
        this.props.actions.setScrollableSnapIndex(this.props.entityType, index);
      });
    }, 800);
    
    
  }

  _renderContent = () => {
    const {
      numColumns,
      keyExtractor,
      renderItem,
      ListHeaderComponent,
      onEndReached = ()=>{} } = this.props;

      if(this.state.data && this.state.data.length > 0)
        return (
        <FlatList
            
            >
        </FlatList>
        );
      else return (
        <View style={styles.loadingView}>
          
        </View>
      )
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
          <View style={[styles.fill, {backgroundColor: "white", zIndex: -1,}]}>
            <Animated.View style={[styles.fill, { transform: [{ translateY: this._translateAnimY } ]}]}>
              {topComponent()}
            </Animated.View>
            { extraComponent &&
              <Animated.View style={[styles.extraComponent, { transform: [{ translateY: this._translateAnimY2 } ]}]}>
                {extraComponent()}
              </Animated.View>
            }
            <Modalize 
              withOverlay={false}
              modalStyle={{borderTopRightRadius: 16, borderTopLeftRadius: 16}}
              //closeAnimationConfig={{timing: { duration: 100, easing: Easing.ease }}}
              //panGestureAnimatedValue={this._translateAnim}
              onOpened={this._onOpenEnd}
              onClosed={this._onCloseEnd} 
              ref={(ref)=>this._scrollable = ref}
              key={numColumns}
              alwaysOpen={this.state.initialSnapPoint}
              modalHeight={snapPoints[0]}
              onPositionChange={this._onPositionChange}
              HeaderComponent={() => this._renderHandle()}
              panGestureComponentEnabled={true}
              useNativeDriver={true}
              rootStyle={{borderRadius: 0}}
              handlePosition={'inside'}
              handleStyle={styles.panelHandle}
              tapGestureEnabled={false}
              modalStyle={{overflow: "hidden", backgroundColor: "transparent", borderTopLeftRadius: 0, borderTopRightRadius: 0}}
              flatListProps={{
                style: [styles.contentContainerStyle],
                data: this.state.data || [],
                keyExtractor: keyExtractor,
                renderItem: renderItem,
                onEndReached: ({distanceFromEnd})=> onEndReached(),
                ref:(ref) => this._scrollableInner = ref,
                onEndReachedThreshold:0.5,
                initialNumToRender:8,
                maxToRenderPerBatch:2,
                numColumns:numColumns || 1,
                ItemSeparatorComponent:() => (<View style={{height: 10}}></View>),
                scrollEventThrottle: 16
              }}
            >
            </Modalize>
            
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
  loadingView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white'
  },
  dragHandler: {
    alignSelf: 'stretch',
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc'
  },
  contentContainerStyle: {
    backgroundColor: 'white',
    paddingHorizontal: 5
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
    marginTop: 8
  },
  xView: {
    position: 'absolute', 
    right: 8, 
    top: 0, 
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


function ScrollableContainerContainer(props) {
  const store = useStore();
  return <ScrollableContainer {...props} store={store} />;
}

const mapStateToProps = state => {
  return {
    //mixed state
    others: state.othersState,
  };
};

const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...actions}, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(ScrollableContainerContainer)