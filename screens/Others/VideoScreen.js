import React, { Component } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  // CategoryListItem, 
  // GeoRefHListItem, 
  // GridGallery, 
  // GridGalleryImage, 
  // MapViewTop, 
  // ScrollableHeader,
  // TabBarIcon, 
  // CalendarListItem, 
  // EntityAbstract,
  // EntityDescription,
  // EntityGallery,
  // EntityHeader,
  // EntityItem,
  // EventListItem,
  // EntityMap,
  // EntityRelatedList,
  // EntityVirtualTour,
  // EntityWhyVisit,
  // TopMedia,
  AsyncOperationStatusIndicator, 
  // AsyncOperationStatusIndicatorPlaceholder,
  // Webview, 
  // ConnectedText, 
  ConnectedHeader, 
  HeaderFullscreen
  // ImageGridItem, 
  // ConnectedLanguageList, 
  // BoxWithText,
  // ConnectedFab, 
  // PoiItem, 
  // PoiItemsList, 
  // ExtrasListItem, 
  // MapViewItinerary
 } from "../../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import { greedyArrayFinder, getEntityInfo, getCoordinates, getSampleVideoIndex, getGalleryImages } from '../../helpers/utils';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { LLEntitiesFlatlist } from "../../components/loadingLayouts";
import * as ScreenOrientation from 'expo-screen-orientation'
import { Video } from 'expo-av';

const { OrientationLock } = ScreenOrientation;

/* Deferred rendering to speedup page inital load: 
   deferred rendering delays the rendering reducing the initial 
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;
class VideoScreen extends Component {

  constructor(props) {
    super(props);

    /* Get props from navigation */ 
    const { source } = this.props.route.params;
    this._vPlayer = null;
    this._refs = {};
    this.state = {
      render: USE_DR ? false : true,
      //
      source: source,
      isVideoEnded: false,
      isVideoLoaded: false,
      isVideoPlaying: false,
      isVideoLandscape: false,
      orientation: null,
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * Use this function to perform data fetching
   * e.g. this.props.actions.getPois();
   */
  async componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    const { orientation } = await ScreenOrientation.getOrientationAsync();
    this.setState({ orientation });
    await ScreenOrientation.unlockAsync();
    ScreenOrientation.addOrientationChangeListener(this._onOrientationChange);
  }

  /**
   * Use this function to update state based on external props 
   * or to post-process data once it changes
   */
  componentDidUpdate(prevProps) {
    /**
     * Is the former props different from the newly propagated prop (redux)? perform some action
     * if(prevProps.xxx !== this.props.xxx)
     *  doStuff();
     */
  }

  /**
   * Use this function to unsubscribe or clear any event hooks
   */
  async componentWillUnmount() {
    // Screen orientation (lock & remove callback) for video playing
    await ScreenOrientation.lockAsync(OrientationLock.PORTRAIT);
    ScreenOrientation.removeOrientationChangeListeners();
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _isOrientationLandscape = (orientation) => 
     orientation === OrientationLock.LANDSCAPE || orientation === OrientationLock.LANDSCAPE_RIGHT || orientation === OrientationLock.LANDSCAPE_LEFT;

  _isOrientationPortrait = (orientation) => 
    orientation === OrientationLock.PORTRAIT || orientation === OrientationLock.PORTRAIT_UP || orientation === OrientationLock.PORTRAIT_DOWN;

  _onOrientationChange = async ({ orientationInfo: { orientation } }) => {
    this.setState({ orientation });

    // console.log(orientation, this._isOrientationPortrait(orientation), this._isOrientationLandscape(orientation));
    console.log("orientation", orientation)
    //Note: using player embedded fullscreen capabilities
    if (this._vPlayer && this._isOrientationLandscape(orientation)){
      await this._vPlayer.presentFullscreenPlayer();
      console.log("go to landscape");
    }
    else if(this._vPlayer && this._isOrientationPortrait(orientation)){
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

  /**
   * If the reducer embeds a single data type then e.g. only pois:
   *    Data is stored in this.props.pois.data
   *    Success state is stored in this.props.pois.success
   *    Loading state is stored in this.props.pois.loading
   *    Error state is stored in this.props.pois.error
   * If the reducer embeds multiple data types then (e.g. search + autocomplete):
   *    Data is stored in this.props.searchAutocomplete.search
   *    Success state is stored in this.props.searchAutocomplete.searchSuccess
   *    Loading state is stored in this.props.searchAutocomplete.searchLoading
   *    Error state is stored in this.props.searchAutocomplete.searchError
   */
  _isSuccessData  = () => false;    /* e.g. this.props.pois.success; */
  _isLoadingData  = () => true;   /* e.g. this.props.pois.loading; */
  _isErrorData    = () => null;    /* e.g. this.props.pois.error; */


  /********************* Render methods go down here *********************/

  _renderContent = () => {
    return (
      <View style={styles.mainView}>
        {this.state.source && 
          this._renderVideo(this.state.source)
        }
      </View>
    );
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

  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        <HeaderFullscreen goBackPressed={() => {this.props.navigation.goBack()}}/>
        {render && this._renderContent()}
      </View>
    )
  }
  
}


VideoScreen.navigationOptions = {
  title: 'Boilerplate',
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
    //language
    locale: state.localeState,
  };
};


const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...actions }, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(VideoScreenContainer)