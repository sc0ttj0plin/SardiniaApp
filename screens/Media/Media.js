import React, { PureComponent } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView, StatusBar } from "react-native";
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
  HeaderFullscreen,
  // ImageGridItem, 
  // ConnectedLanguageList, 
  // BoxWithText,
  // ConnectedFab, 
  // PoiItem, 
  // PoiItemsList, 
  // ExtrasListItem, 
  // MapViewItinerary,
  CustomText
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
import Gallery from 'react-native-gallery-swiper';
import {WebView} from 'react-native-webview';
const { OrientationLock } = ScreenOrientation;
import HTML from 'react-native-render-html';
import { useSafeArea } from 'react-native-safe-area-context';
import LoadingDots from '../../components/LoadingDots';

const injectedJavaScript = `
window.ReactNativeWebView.postMessage('pageLoaded');
true;
`;

export var MEDIA_TYPES = {
  VIRTUAL_TOUR: "virtualTour",
  GALLERY: "gallery",
  VIDEO: "video"
}

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
    this._refs = {};
    
    this.state = {
      render: USE_DR ? false : true,
      //
      source: source,
      type: type || null,
      images: images || [],
      currentPage: initialPage || 0,
      initialPage: initialPage || 0,
      orientation: null,
      loaded: false
    };

    this._imagesLoaded = [];
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * Use this function to perform data fetching
   * e.g. this.props.actions.getPois();
   */
  async componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    const orientation  = await ScreenOrientation.getOrientationAsync();
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
     orientation === OrientationLock.LANDSCAPE || orientation === OrientationLock.LANDSCAPE_RIGHT || orientation === OrientationLock.LANDSCAPE_LEFT || orientation === 4 || orientation === 3; 

  _isOrientationPortrait = (orientation) => 
    orientation === OrientationLock.PORTRAIT || orientation === OrientationLock.PORTRAIT_UP || orientation === OrientationLock.PORTRAIT_DOWN || orientation === 1 || orientation === 0;

  _onOrientationChange = async ({ orientationInfo: { orientation } }) => {
    this.setState({ orientation });

    //Note: using player embedded fullscreen capabilities
    if(this._refs["vplayer"]){
      if (this._isOrientationLandscape(orientation)){
        await this._refs["vplayer"].presentFullscreenPlayer();
      }
      else if(this._isOrientationPortrait(orientation)){
        await this._refs["vplayer"].dismissFullscreenPlayer();
      }
    }

    //Note: gallery reset
    if(this._refs["gallery"]) {
      this._refs["gallery"].flingToPage({index: 0, velocityX: 0.5});
    }
   
  }


  /****** Video Handling ********/

  _onVideoError = (e) => {
    
  }

  _onVideoLoad = () => {
    this.setState({
      loaded: true,
    }, () => this._refs["vplayer"].playAsync());
  }

  _onPlaybackStatusUpdate = (status) => {

    var isBuffering = !this.state.loaded;
    
    if(isBuffering != status.isBuffering){
      if(!this.videoTimer && (!status.isBuffering || status.isPlaying && status.positionMillis > 0)) {
        this.videoTimer = setTimeout(() => {
          this.videoTimer = null;
          this.setState({
            loaded: true
          });
        }, 350);
      }
      else if (status.isBuffering){
        clearTimeout(this.videoTimer);
        this.videoTimer = null;
        this.setState({
          loaded: false
        });
      }
    }
    
  }

  /****** Image Gallery Handling ********/

  _onPageSelected = (p) => {
    this.setState({
        currentPage: p,
        loaded: this._imagesLoaded[p] == true
    })
  }

  _onImageLoad = (i) => {
    this._imagesLoaded[i] = true;
    if(this.state.currentPage == i) {
      this.setState({
        loaded: true
      });
      console.log(this._imagesLoaded);
    }
  }

  /****** WebView Handling ********/

  _onShouldStartLoadWithRequest = (event) => {
    if(event.url == this.state.source)
      return true;
    
    return false;
  }

  _webViewMessageHandler = (event) => {
    if (event.nativeEvent.data === 'pageLoaded') {
      setTimeout(() => {
        this.setState({
          loaded: true
        })
      }, 650);
    }
  }


  /********************* Render methods go down here *********************/

  _renderContent = () => {
    const {type} = this.state;
    switch(type){
      case MEDIA_TYPES.VIDEO:
        return this._renderVideoView()
        break;
      case MEDIA_TYPES.GALLERY:
        return this._renderGalleryView()
        break;
      case MEDIA_TYPES.VIRTUAL_TOUR:
        return this._renderVirtualTourView()
      default:
        break
    }
  }

  _renderGalleryView = () => {
    const { lan } = this.props.locale;
    const { images, currentPage, initialPage, loaded } = this.state
    // console.log("images", images)
    const image = images[currentPage];
    const title = _.get(image, ['title_field', lan, 0, 'safe_value'], null);

    return (
      <View style={[styles.fill]}>
        <Gallery
            ref={(ref) => {this._refs["gallery"] = ref}}
            style={styles.gallery}
            images={images}
            initialPage={initialPage}
            useNativeDriver={true}
            onPageSelected={this._onPageSelected}
            onLoad = {this._onImageLoad}
            initialNumToRender = {images.length}>
        </Gallery>
        <HeaderFullscreen
          text={(this.state.currentPage+1) + '/' + this.state.images.length}
          goBackPressed={() => {this.props.navigation.goBack()}}
          paddingTop={this.props.insets.top}
          />
        {title && (
            <View style={[styles.footer, {paddingBottom: this.props.insets.bottom}]}>
                <HTML baseFontStyle={styles.footerText} html={title} />
            </View>
        )}
        {!loaded && 
          <View pointerEvents="none" 
            style={[styles.loadingDotsView1, {backgroundColor: "rgba(0,0,0,0.7)"}]}>
            <View style={[styles.loadingDotsView2, {paddingTop: 0}]}>
              <LoadingDots isLoading={true}/>
            </View>
          </View>
        }
      </View>
    );
  }

  _renderVideoView = () => {
    const {loaded} = this.state;
    const isPortrait = this._isOrientationPortrait(this.state.orientation);
    const paddingBottom = isPortrait ? Math.max(this.props.insets.bottom, Constants.COMPONENTS.header.height) : 0;
    const paddingTop = this.props.insets.top + Constants.COMPONENTS.header.height;
    return (
      <View style={[styles.mainView, {paddingTop: paddingTop, paddingBottom: paddingBottom}]}>
        {this.state.source && 
          this._renderVideo(this.state.source)
        }
        {!loaded && 
          <View pointerEvents="none" 
            style={[styles.loadingDotsView1, {backgroundColor: "rgba(0,0,0,0.7)", top: paddingTop}]}>
            <View style={[styles.loadingDotsView2, {paddingTop: 0}]}>
              <LoadingDots isLoading={true}/>
            </View>
          </View>
        }
        <HeaderFullscreen goBackPressed={() => {this.props.navigation.goBack()}} paddingTop={this.props.insets.top}/>

      </View>
    );
  }


  _renderVideo = (url) => {
    return (
      <Video
        source={{ uri: url }}
        ref={(ref) => { this._refs["vplayer"] = ref }}
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
    const {source, loaded} = this.state
    return (
      <View style={[styles.fill]}>
        <WebView style={[styles.fill, {opacity: loaded ? 0.99 : 0, overflow: "hidden", marginTop: this.props.insets.top}]}
            source={{uri: source }}
            scalesPageToFit={true}
            originWhitelist={['*']}
            ignoreSslError={true}
            scrollEnabled={false}
            viewportContent={'width=device-width, user-scalable=no'}
            onShouldStartLoadWithRequest={this._onShouldStartLoadWithRequest} //for iOS
            onNavigationStateChange ={this._onShouldStartLoadWithRequest} //for Android
            injectedJavaScript={injectedJavaScript}
            onMessage={this._webViewMessageHandler}
         />
         {!loaded && 
          <View pointerEvents="none" 
            style={[styles.loadingDotsView1, {marginTop: this.props.insets.top}]}>
            <View style={styles.loadingDotsView2}>
              <LoadingDots isLoading={true}/>
            </View>
          </View>
         }
        <HeaderFullscreen goBackPressed={() => {this.props.navigation.goBack()}} paddingTop={this.props.insets.top} hideBar={true}/>
      </View>
      

    );
  }

  render() {
    const { render, loaded } = this.state;
    return (
      <View style={[styles.fill]}>
        {render && this._renderContent()}
      </View>
    )
  }
  
}


MediaScreen.navigationOptions = {
  title: 'MediaScreen',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "black"
  },
  container: {
    padding: 10,
  },
  portraitVideo: {
    width: "100%",
    height: "100%",
    backgroundColor: "black",
    paddingTop: 40
  },
  mainView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  gallery: { 
    flex: 1, 
    backgroundColor: 'black' 
  },
  footer: {
      position: 'absolute',
      bottom: 0,
      width: "100%",
      textAlign: 'center',
      justifyContent: 'center',
      padding: 10,
      backgroundColor: "rgba(0,0,0,0.5)",
  },
  footerText: {
      color: 'white',
      fontSize: 14,
      textAlign: 'center',
      fontFamily: "montserrat-regular"
  },
  loadingDotsView1: {
    position: "absolute",
    width: '100%',
    height: '100%',
    alignItems: "center",
    justifyContent: "center"
  },
  loadingDotsView2: {
    paddingTop: 50,
    width: 100
  }
});


function MediaScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();
  const insets = useSafeArea();

  return <MediaScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store}
    insets={insets} />;
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