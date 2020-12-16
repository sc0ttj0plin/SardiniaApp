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
import BottomSheet from 'reanimated-bottom-sheet';
import {FlatList} from 'react-native-gesture-handler';


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
      currentSnapIndex: 2,
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

    this._snapping = false;
  }

  componentWillUnmount() {

  }

  componentDidUpdate(prevProps){
    const prevSnap = prevProps.others.scrollableSnapIndex[this.props.entityType];
    const currentSnap = this.props.others.scrollableSnapIndex[this.props.entityType];
    //console.log(prevSnap, currentSnap);
    if (prevSnap !== currentSnap && currentSnap !== this.state.currentSnapIndex && typeof(currentSnap) === 'number') {
      this._snapping = true;
      setTimeout( () => { 
        this._scrollable.snapTo(currentSnap) 
      }, 300);
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

  _onSettle = (index) => {
    console.log("_onSettle", index);

    this.setState({currentSnapIndex: index}, () => {
      //Set global snap index for the current entityType
      this._updating = false;
      this.props.actions.setScrollableSnapIndex(this.props.entityType, index);
    }); 

    if(index == 0) {
      if(this._handleBorderRadius._value != this._handleBorderRadiusMin){
        console.log("index 1", this._handleBorderRadius._value, this._handleBorderRadiusMax)
        this._startHandleAnimation(0)
      }
    } else {
      if(this._handleBorderRadius._value != this._handleBorderRadiusMax){
        console.log("index 2", this._handleBorderRadius._value, this._handleBorderRadiusMin)
        this._startHandleAnimation(32)
      }
      if(this._scrollableInner)
        this._scrollableInner.scrollToOffset({offset: 0, animated: true});
    }

    if(this._snapping)
      this._snapping = false;
    else if(this.props.onSettle)
      this.props.onSettle();
    else if(this.props.onSettleIndex) {
      this.props.onSettleIndex(index);
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

  _closePressed = () => {
    const { 
      closeSnapIndex = 2
    } = this.props;
    this._scrollable.snapTo(closeSnapIndex);
    if(this._scrollableInner)
      this._scrollableInner.scrollToOffset({offset: 0, animated: true});
  }

  _renderHandle = () => {
    const {
      HeaderTextComponent
     } = this.props;
    return (
      <Animated.View onStartShouldSetResponder={this.props.onListHeaderPressed} style={[styles.header, { borderTopRightRadius: this._handleBorderRadius}]}>
        <View style={[styles.panelHandle]} />
        {this.state.currentSnapIndex == 0 && 
        <View style={[styles.xView, {marginTop: 15}]}>
            <ScrollableContainerTouchableOpacity  onPress={this._closePressed}>
              <Feather name={'x'} size={30} color={Colors.grayHandle} />
          </ScrollableContainerTouchableOpacity> 
        </View>}
        <HeaderTextComponent></HeaderTextComponent>
      </Animated.View>);
  }

  _onPressIn = () => {
    this.props.actions.setScrollablePressIn(this.props.entityType, !this.props.others.scrollablePressIn[this.props.entityType])
  }

  _onOpenEnd = (v) => {
    console.log("_onOpenEnd");
    if(!this._updating){
      this._onSettle(0);
      this._updating;
    }
  }

  _onCloseEnd = (v) => {
    console.log("_onCloseEnd");
    this.setState({currentSnapIndex: 2});
  }

  _onScroll = (event) => {
    this.scollY = event.nativeEvent.contentOffset.y;
    setTimeout(() => this.setState({scrollToTop: this.scollY <= 0}), 10);
  }

  _onScrollBeginDrag = () => {
    if(this.scollY > 0)
      this.setState({scrollToTop: false})
  }

  _onScrollEndDrag = () => {
    this.setState({scrollToTop: this.scollY <= 0})
    this._scrolling = false;
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
            style={[styles.contentContainerStyle]}
            data={this.state.data || []}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListHeaderComponent={ListHeaderComponent || null}
            onEndReached = {({distanceFromEnd})=> onEndReached()}
            scrollEnabled ={this.state.currentSnapIndex == 0 ? true : false}
            ref={(ref) => this._scrollableInner = ref}
            onScroll={this._onScroll}
            onMomentumScrollEnd={this._onScrollEndDrag}
            onScrollBeginDrag={this._onScrollBeginDrag}
            onEndReachedThreshold={0.5} 
            initialNumToRender={8}
            maxToRenderPerBatch={2}
            numColumns={numColumns || 1}
            
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
            <Animated.Code>
            {
              () => call([this._translateAnim], ([v]) => {
                var index = this.state.currentSnapIndex;
                if(v == 0) {
                  index = 0;
                }
                else if(v != 0 && this.state.currentSnapIndex == 0 && !this.state.scrollToTop && this._scrolling !== true) {
                  this._scrolling = true;
                  if(this._scrollableInner)
                    this._scrollableInner.scrollToOffset({offset: 0, animated: true});
                }
                else if(v > 0.8) {
                    index = 2;
                }
                else if (v > 0.1) {
                  index = 1;
                }
                if(!this._updating && this.state.currentSnapIndex != index){
                  this._updating = true;
                  this._onSettle(index);
                }
              })
            }
            </Animated.Code>
            <BottomSheet
              componentType="FlatList"
              key={numColumns} /* NOTE always set a key to refresh only this component and avoid unmounting */
              snapPoints={snapPoints}
              renderContent={this._renderContent}
              //scrollEnabled={this.state.currentSnapIndex === 0 ? true : false}
              initialSnap={initialSnapIndex}
              renderHeader={this._renderHandle}
              ref={(ref)=>this._scrollable = ref}
              onSettle = {(index) => this._onSettle(index) }
              onOpenEnd={this._onOpenEnd}
              onCloseEnd={this._onCloseEnd} 
              enabledContentGestureInteraction = {false}
              callbackNode={this._translateAnim}
              //
              //
              
              contentContainerStyle={[styles.contentContainerStyle, {
                flex:  data && data.length == 0 ? 1 : null
              }]}
              
              enabledContentGestureInteraction={this.state.currentSnapIndex == 0 ? false : true}
              />
            
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