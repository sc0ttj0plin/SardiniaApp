import React, { PureComponent } from "react";
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
import Gallery from 'react-native-image-gallery';
import {WebView} from 'react-native-webview';
const { OrientationLock } = ScreenOrientation;

/* Deferred rendering to speedup page inital load: 
   deferred rendering delays the rendering reducing the initial 
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;
class MediaScreen extends PureComponent {

  constructor(props) {
    super(props);

    /* Get props from navigation */ 
    const { source, type, images, initialPage } = this.props.route.params;
    this._vPlayer = null;
    this._refs = {};
    this.state = {
      render: USE_DR ? false : true,
      //
      source: source,
      type: type || null,
      images: images || [],
      currentPage: initialPage || 0,
      initialPage: initialPage || 0,
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
    if(prevProps.route.params !== this.props.route.params)
      console.log("updated")
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

  _onPageSelected = (p) => {
    this.setState({
        currentPage: p
    })
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
    const {type} = this.state;
    switch(type){
      case "video":
        return this._renderVideoView()
        break;
      case "gallery":
        return this._renderGalleryView()
        break;
      case "virtualTour":
        return this._renderVirtualTourView()
      default:
        break
    }
  }

  _renderGalleryView = () => {
    const { lan } = this.props.locale;
    const { images, currentPage, initialPage } = this.state
    console.log("images", images)
    const image = images[currentPage];
    const title = _.get(image, ['title_field', lan, 0, 'safe_value'], null);

    return (
      <View style={styles.fill}>
        <Gallery
            style={styles.gallery}
            images={images}
            initialPage={initialPage}
            onPageSelected={this._onPageSelected}>
        </Gallery>
        <HeaderFullscreen
          text={(this.state.currentPage+1) + '/' + this.state.images.length}
          goBackPressed={() => {this.props.navigation.goBack()}}
          >
        </HeaderFullscreen>
        {title && (
            <View style={[styles.footer]}>
                <Text style={styles.footerText}>{title}</Text>
            </View>
        )}
      </View>
    );
  }

  _renderVideoView = () => {
    return (
      <View style={styles.mainView}>
        <HeaderFullscreen goBackPressed={() => {this.props.navigation.goBack()}}/>
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

  _renderVirtualTourView = () => {
    const {source} = this.state
    return (
      <View style={[styles.fill]}>
        <WebView style={[styles.fill, {opacity: 0.99, overflow: "hidden"}]}
            source={{uri: source }}
            scalesPageToFit={true}
            originWhitelist={['*']}
            ignoreSslError={true}
            scrollEnabled={false}
            viewportContent={'width=device-width, user-scalable=no'} />
        <HeaderFullscreen goBackPressed={() => {this.props.navigation.goBack()}}/>
      </View>
      

    );
  }

  render() {
    const { render, type } = this.state;
    console.log("type", type)
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        {render && this._renderContent()}
      </View>
    )
  }
  
}


MediaScreen.navigationOptions = {
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
  gallery: { 
    flex: 1, 
    backgroundColor: 'black' 
  },
  footer: {
      position: 'absolute',
      bottom: 0,
      width: "100%",
      height: 60,
      textAlign: 'center',
      justifyContent: 'center',
      paddingLeft: 10,
      paddingRight: 10,
      backgroundColor: "rgba(0,0,0,0.5)",
  },
  footerText: {
      color: 'white',
      fontSize: 14,
      textAlign: 'center',
  },
});


function MediaScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <MediaScreen 
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
})(MediaScreenContainer)