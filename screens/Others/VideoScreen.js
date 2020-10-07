import React, { Component } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { List, ListItem, SearchBar, Button } from "react-native-elements";
import MapView from 'react-native-maps';
import { NavigationEvents, useNavigation, useRoute } from '@react-navigation/native';
import { GeoRefHListItem, CategoryListItem, ScrollableHeader, Header, AsyncOperationStatusIndicator} from "../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../constants/Layout';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import * as localeActions from '../actions/locale';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
// import { ScreenOrientation } from 'expo';
import * as ScreenOrientation from 'expo-screen-orientation'
import { Video } from 'expo-av';
import HeaderFullscreen from '../components/HeaderFullscreen'
import { timezone } from "expo-localization";

const { OrientationLock } = ScreenOrientation;

class VideoScreen extends Component {

  constructor(props) {
    super(props);

    //let { someNavProps } = props.route.params; 
    const { source } = this.props.route.params;
    this._vPlayer = null;
    this._refs = {};
    this.state = {
      source: source,
      isVideoEnded: false,
      isVideoLoaded: false,
      isVideoPlaying: false,
      isVideoLandscape: false,
      orientation: null,
    };
      
  }


  async componentDidMount() {
    // Screen orientation (unlock & callback) for video playing
    const { orientation } = await ScreenOrientation.getOrientationAsync();
    this.setState({ orientation });
    await ScreenOrientation.unlockAsync();
    ScreenOrientation.addOrientationChangeListener(this._onOrientationChange);
  } 

  async componentWillUnmount() {
    // Screen orientation (lock & remove callback) for video playing
    await ScreenOrientation.lockAsync(OrientationLock.PORTRAIT);
    ScreenOrientation.removeOrientationChangeListeners();
  }

  _isOrientationLandscape = (orientation) => 
     orientation === OrientationLock.LANDSCAPE || orientation === OrientationLock.LANDSCAPE_RIGHT || orientation === OrientationLock.LANDSCAPE_LEFT;

  _isOrientationPortrait = (orientation) => 
    orientation === OrientationLock.PORTRAIT || orientation === OrientationLock.PORTRAIT_UP || orientation === OrientationLock.PORTRAIT_DOWN;

  _onOrientationChange = async ({ orientationInfo: { orientation } }) => {
    this.setState({ orientation });

    // console.log(orientation, this._isOrientationPortrait(orientation), this._isOrientationLandscape(orientation));

    //Note: using player embedded fullscreen capabilities
    if (this._vPlayer && this._isOrientationLandscape(orientation)){
      await this._vPlayer.presentFullscreenPlayer();
      console.log("go to landscape");
    }
    else if(this._vPlayer && this._isOrientationPortrait(orientation)){
      await this._vPlayer.dismissFullscreenPlayer();
      await this._vPlayer.dismissFullscreenPlayer();
      console.log("go to portrait");
    }
  }

  _onVideoEnd = () => {
    this.setState({
      isVideoEnded: true
    });
  }

  _onVideoError = (e) => {
    console.log(e);
  }

  _onVideoLoad = () => {
    this.setState({
      isVideoLoaded: true,
    }, () => this._playVideo());
  }

  _playVideo = () => {
    if(this.state.isVideoLoaded) 
      this._vPlayer.playAsync();
  }

  _onPlaybackStatusUpdate = (status) => {
    if(status.didJustFinish) {
      this._onVideoEnd();
    }
    if(status.isPlaying && !this.state.isVideoPlaying) {
      this.setState({
        isVideoPlaying: true
      });
    }
  }
  _renderVideo = (url) => {
    return (
      <Video
        source={{ uri: url }}
        ref={(ref) => { this._vPlayer = ref }}
        onLoad={this._onVideoLoad}
        onError={this._onVideoError}
        useNativeControls
        onPlaybackStatusUpdate={this._onPlaybackStatusUpdate}
        resizeMode="contain"
        style={styles.portraitVideo} 
      />
    );
  }

  _renderContent = () => {
    return (
      <View style={styles.mainView}>
        {this.state.source && 
          this._renderVideo(this.state.source)
        }
      </View>
    );
  }

  render() {
    return (
      <View style={styles.fill}>
        {/* <View style={[styles.header, {paddingTop: 0, height: 0 }]}>
            <Header backButtonVisible={true} searchButtonVisible={false}/>
        </View> */}
        {this._renderContent()}
        <HeaderFullscreen
          goBackPressed={() => {this.props.navigation.goBack()}}
          ></HeaderFullscreen>
      </View>
    )
  }
  
}


VideoScreen.navigationOptions = {
  title: 'Video',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: Layout.statusbarHeight
  },
  header: {
    backgroundColor: "black",
    height: 0
  },
  container: {
    padding: 10,
  },
  portraitVideo: {
    width: "100%",
    height: 230,
    marginBottom: 10,
    backgroundColor: "white"
  },
  mainView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative"
  },
  backButton: {
    position: "absolute",
    width: 50,
    height: 40,
    top: Layout.statusbarHeight,
    right: 0
  },
  buttonContainer: {
    backgroundColor: "transparent",
    position: "absolute",
    top: Layout.statusbarHeight,
    right: 0
  },
  button: {
    height: "100%",
    width: 50
  },
});


function VideoScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <VideoScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    // someState: state.graphqlState.someState,
    // someStateError: state.graphqlState.someStateError,
    // someStateLoading: state.graphqlState.someStateLoading,
    locale: state.localeState,
    // error: state.restState.error,
    // loading: state.restState.loading
  };
};


const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...graphqlActions, ...restActions, ...localeActions}, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(VideoScreenContainer)