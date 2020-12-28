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
import AsyncOperationStatusIndicator from './AsyncOperationStatusIndicator';
import LLVerticalItemsFlatlist from './loadingLayouts/LLVerticalItemsFlatlist';


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
      inputRange: [0, 0.5, 1],
      outputRange: [-Layout.window.height/2.5, 0, 0],
    });

    this._translateAnimY2 = interpolate(this._translateAnim, {
      inputRange: [0, 0.6, 1],
      outputRange: [-45, 10, 10],
    });

    this._translateCloseButton = interpolate(this._translateAnim, {
      inputRange: [0, 0.01, 1],
      outputRange: [1, 0, 0],
    });

    this._borderRadius = interpolate(this._translateAnim, {
      inputRange: [0, 1],
      outputRange: [1, 32], //TODO: border radius must be greater than 1 (values below 1, eg. 0.1, break view)
    });

    this._translateHeader = interpolate(this._translateAnim, {
      inputRange: [0, 0.8, 1],
      outputRange: [-50, 0, 0], //TODO: border radius must be greater than 1 (values below 1, eg. 0.1, break view)
    });

    this._snapping = false;
  }

  componentDidMount() {
    const { initialSnapIndex } = this.props;

    //set correct scrollable index when mounting view for the first 
    if(initialSnapIndex) {
      this._initScrollableIndexTimer = setInterval( () => {
        if(this._scrollable && this._scrollable.snapTo) {
          console.log("this._initScrollableIndexTimer");
          this._scrollable.snapTo(initialSnapIndex);
          clearInterval(this._initScrollableIndexTimer);
        }
      }, 300);
    }
  }

  componentWillUnmount() {

  }

  componentDidUpdate(prevProps){
    if(this.props.snapTo && prevProps.snapTo != this.props.snapTo){
      this._scrollable.snapTo(this.props.snapTo);
    }
        

    //console.log(prevSnap, currentSnap);

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

  snapTo = (index) => {
    this._scrollable.snapTo(index);
  }

  _onCloseEnd = () => {
    if(!this.props.isClosable) {
      console.log("_onCloseEnd");
      this._scrollable.snapTo(1);
    }
  }

  _onCloseStart = () => {
    if(this._scrollableInner)
      this._scrollableInner.scrollToOffset({offset: 0, animated: true});
  }

  _closePressed = () => {
    const { 
      closeSnapIndex = this.props.snapPoints.length - 1
    } = this.props;
    //this._onSettle(closeSnapIndex);
    this._scrollable.snapTo(closeSnapIndex);
    if(this._scrollableInner)
      this._scrollableInner.scrollToOffset({offset: 0, animated: true});
  }

  _renderHandle = () => {
    const {
      HeaderTextComponent
     } = this.props;
    return (
      <Animated.View onStartShouldSetResponder={this.props.onPressedHeader} style={[styles.header, { borderTopRightRadius: this._borderRadius}]}>
        <View style={[styles.panelHandle]} />
        <Animated.View style={[styles.xView, {marginTop: 15}, 
          { transform: [{ scale: this._translateCloseButton } ]}
          ]}>
            <ScrollableContainerTouchableOpacity  onPress={this._closePressed}>
              <Feather name={'x'} size={30} color={Colors.grayHandle} />
          </ScrollableContainerTouchableOpacity> 
        </Animated.View>
        <HeaderTextComponent></HeaderTextComponent>
      </Animated.View>);
  }

  _renderContent = () => {
    const {
      numColumns,
      keyExtractor,
      renderItem,
      ListHeaderComponent,
      onEndReached = ()=>{} } = this.props;

      return (<AsyncOperationStatusIndicator
        loading={true}
        success={this.state.data && this.state.data.length>0}
        error={false}
        loadingLayout={
          <LLVerticalItemsFlatlist 
            numColumns={numColumns}
            key={"shimmer-layout" + numColumns} 
            itemStyle={styles.itemFlatlist} 
            style={styles.listStyleLL} 
            bodyContainerStyle={styles.listContainer}/>}>
            <FlatList
            style={{backgroundColor: "white", height: "100%"}}
            data={this.state.data || []}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ListHeaderComponent={ListHeaderComponent || null}
            onEndReached = {({distanceFromEnd})=> onEndReached()}
            ref={(ref) => this._scrollableInner = ref}
            onEndReachedThreshold={0.5} 
            initialNumToRender={8}
            maxToRenderPerBatch={2}
            numColumns={numColumns || 1}
            contentContainerStyle={styles.contentContainerStyle}
            ItemSeparatorComponent={() => <View style={{height: 10}}></View>} />
      </AsyncOperationStatusIndicator>);
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
            <BottomSheet
              componentType="FlatList"
              key={numColumns} /* NOTE always set a key to refresh only this component and avoid unmounting */
              snapPoints={snapPoints}
              renderContent={this._renderContent}
              initialSnap={snapPoints.length-1}
              renderHeader={this._renderHandle}
              ref={(ref)=>this._scrollable = ref}
              onSettle = {(index) => this._onSettle(index) }
              enabledContentGestureInteraction = {false}
              callbackNode={this._translateAnim}
              springConfig={{toss: 0.05}}
              contentContainerStyle={[styles.contentContainerStyle, {
                flex:  data && data.length == 0 ? 1 : null
              }]}
              onCloseStart={this._onCloseStart}
              onCloseEnd={this._onCloseEnd}
              enabledBottomInitialAnimation={true}
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
    paddingHorizontal: 10,
    paddingBottom: 10
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
  },
  //loading layout
  listStyleLL: {
    backgroundColor: "white",
    paddingHorizontal: 10,
    height: "100%",
  },
  itemFlatlist: {
    marginBottom: 10,
    height: 160, 
    width: "100%", 
  },
  listContainer: {
    backgroundColor: "transparent",
    paddingBottom: 10
  },
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