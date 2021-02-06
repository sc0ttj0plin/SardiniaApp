import React, { Component } from "react";
import { StyleSheet, Image, View, Linking, TouchableWithoutFeedback, TouchableOpacity, Modal, Text } from "react-native";
// import { useNavigation, useRoute } from '@react-navigation/native';
import LoadingDots from './LoadingDots';
import * as SplashScreen from 'expo-splash-screen';
import * as Location from 'expo-location';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-community/async-storage';
import _ from 'lodash';
import config from '../config/config';
import * as firebase from 'firebase';
import { parseUrl } from '../helpers/utils';
import actions from '../actions';
import { openRelatedEntity } from '../helpers/screenUtils';
import * as Constants from '../constants';
import { apolloQuery } from '../apollo/queries';
import Colors from '../constants/Colors';
import CustomText from './CustomText';
import Animated, { Easing, stopClock, withDelay} from 'react-native-reanimated';
import { navigationRef } from "../navigation/RootNavigation"; /* Only usable when this.props.others.navigatorReady==true, navigationRef.current */
/* NOTIFICATION SUPPORT: not yet integrated
  import * as Notifications from 'expo-notifications';
  import registerForPushNotificationsAsync from '../../helpers/registerForPushNotificationsAsync';
*/

const USE_DR = false;
const LINKING_DEFAULT_URL = "https://www.sardegnaturismo.it/it/luoghi/est/tortoli?test=1&test1=2"; /* NOTE: use with _initLinkingAsync */
const SHOW_MODALS_DELAY = 5000;
const defaultColors = [ Colors.blue, Colors.yellow, Colors.green, Colors.red ];
const { Value, Clock, eq, clockRunning, not, cond, startClock, timing, interpolate, and, set, block } = Animated;

/**
 * Splash screen
 */
class ConnectedSplashLoader extends Component {

  constructor(props) {
    super(props);

    /* Get props from navigation */
    //let { someNavProps } = props.route.params; 
    this.state = {
      render: USE_DR ? false : true,
      show: true,
      opacity: new Animated.Value(1),
      loading: true,
      /* canShowModals becomes true only when the main component has mounted + Constants.MODALS_SHOW_DELAY time */
      canShowModals: false,
      /* Update State */
      updating: false,
      /* Linking State */
      showLinking: true,
      linkingSuccess: false,
      linkingLoading: false,
      linkingError: null,
      linkingQueryStr: null,
      /* Network Checker State */
      networkIsConnected: true
    };

    // Linking variables
    this._linkingUrl = null;
    this._linkingModalBtnOpts = { 
      show: true, 
      left: { label: props.locale.messages.retry, onPress: () => this._loadLinkingEntity(this._linkingUrl) },
      right: { label: props.locale.messages.cancel, onPress: () => this.setState({ showLinking: false }) },
    };

    //Network
    this._unsubscribeNetInfo = null;
    this._networkingModalBtnOpts = { 
      show: true, 
      left: { label: props.locale.messages.retry, onPress: this._onNetworkRetryPressed },
      right: null,
    };
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    this._initWithoutFeedback();
  }

  componentDidUpdate(prevProps, prevState) {
    /******************************** SPLASH LOGIC ********************************/
    if (prevState.loading !== this.state.loading) {
      if(!this.state.loading) {
        var animation = new Value(0);
        const clock = new Clock();
        var opacity = set(
          animation,
          this._runTiming(clock)
        );
      }
      this.setState({ opacity });
      setTimeout(()=>{
        this.setState({ show: false });
        if (this.props.onFinished)
          this.props.onFinished();
      }, Constants.SPLASH_LOADING_DISAPPEAR_DURATION);
    }

    /******************************** LINKING ********************************/
    // To know exactly when the splash has finished loading + the underlying screen has mounted check if mainScreenDidMount + the splash timeout
    // Since the main screen mounts while splash is still showing
    if (prevProps.others.mainScreenDidMount !== this.props.others.mainScreenDidMount) {
      // When the component has mounted we surely have navigation object available and we can perform any action after the loading timeout
      setTimeout(() => { 
        this.props.actions.setMainScreenIsShown(true);
        this._initWithFeedback()
      }, 
        Constants.SPLASH_EXPO_DURATION + Constants.SPLASH_LOADING_DURATION + Constants.MODALS_SHOW_DELAY
      );
    }

    /******************************** FAVOURITES INITIALIZATION (requires auth) ********************************/
    if (prevProps.auth.user !== this.props.auth.user && this.props.auth.user) {
      // Initializes favourites
      this.props.actions.initFavourites();
    }
  }

  /**
   * Use this function to unsubscribe or clear any event hooks
   */
  componentWillUnmount() {
    this._unsubscribeNetInfo && this._unsubscribeNetInfo();
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  /**
   * Initialization that is transparent to the user
   */
  _initWithoutFeedback = async () => {
    console.log("initialization without feedback");
    // Auth 
    await this._initFirebaseAppAndAttemptLogin();
    // Geolocation (asks for permissions)
    await this._initGeolocation(); 
  }

  /**
   * Initialization that may prompt a message or modal to the user (needs navigation + mount)
   */
  _initWithFeedback = async () => {
    this.setState({ canShowModals: true });
    console.log("initialization with feedback aa");
    // Updates
    !__DEV__ && await this._checkUpdates();
    // Linking: supported links: auth + entity references (shows loading linked entity modal)
    this._initLinkingAsync(); 
    //this._initLinkingAsync(LINKING_DEFAULT_URL);
    // Network checker
    this._initNetworkChecker();
    //Notifications
    this._initNotifications();
  }

  /******************************** SPLASH LOGIC ********************************/ 
  /**
   * Initializes: geolocation
   */
  _onSplashLoad = async () => {
    setTimeout(SplashScreen.hideAsync, Constants.SPLASH_EXPO_DURATION);
    setTimeout( () => this.setState({ loading: false }), Constants.SPLASH_LOADING_DURATION);
  }

  /**
   * Runs the loading dots timing on the UI thread
   * @param {*} clock 
   * @param {*} duration 
   */
  _runTiming = (clock, duration = Constants.SPLASH_LOADING_DISAPPEAR_DURATION) => {
    const fromValue = 1;
    const toValue = 0;
    const state = {
      finished: new Value(0),
      position: new Value(fromValue),
      time: new Value(0),
      frameTime: new Value(0),
    };
    const config = {
      duration: new Value(duration),
      toValue: new Value(toValue),
      easing: Easing.inOut(Easing.ease)
    };

    return [
      cond(clockRunning(clock), 0, [
        // If the clock isn't running we reset all the animation params and start the clock
        startClock(clock),
      ]),
      // we run the step here that is going to update position
      timing(clock, state, config),
      // if the animation is over we stop the clock
      state.position,
    ];
  }


  /******************************** LOGIN LOGIC ********************************/ 
  _initFirebaseAppAndAttemptLogin = async () => {
    // Initialize app is synchronous
    if (firebase.apps.length === 0)
      firebase.initializeApp(config.firebase);
    // If an email has been stored, attempt login using exiting user info
    const email = await AsyncStorage.getItem('email');
    if (email) 
      this.props.actions.passwordLessLogin();
  }

  /******************************** GEOLOCATION LOGIC ********************************/ 
  /**
   * Initializes geolocation service
   */
  _initGeolocation = async () => {
    const { status } = await Location.requestPermissionsAsync();
    if (status === 'granted') {
      //Foreground location
      //  Initial position
      let location = await Location.getCurrentPositionAsync(Constants.GEOLOCATION.getCurrentPositionAsyncOpts);
      setTimeout(() => {this.props.actions.setGeolocation(location, Constants.GEOLOCATION.sources.foregroundGetOnce)}, Constants.SPLASH_LOADING_DURATION + 500);
      //  Watch
      Location.watchPositionAsync(Constants.GEOLOCATION.watchPositionAsyncOpts, location => {
        this.props.actions.setGeolocation(location, Constants.GEOLOCATION.sources.foregroundWatch);
      });
    }
  }

  /******************************** NOTIFICATIONS LOGIC ********************************/ 
  _initNotifications = () => {
    /* NOTIFICATION SUPPORT: not yet integrated
      try {
        this._expo_token = await registerForPushNotificationsAsync();
        //While app is foregrounded only (no action)
        Notifications.addNotificationReceivedListener(this._handleNotification);
        //While app is backgrounded, foregrounded or killed
        Notifications.addNotificationResponseReceivedListener(this._handleNotificationResponse);
      } catch(e) {
        console.log(e.message);
      }
    */
  }
  /* NOTIFICATION SUPPORT: not yet integrated
    _handleNotification = notification => {
      const notificationData = _.get(notification, "request.content.data", {id: 0, published: "",read: false,text: "Error",title: "Error" });
      navigationRef.current.navigate(NAVSCREEN, { ? });
    };

    _handleNotificationResponse = response => {
      const notificationData = _.get(response, "notification.request.content.data", {id: 0, published: "",read: false,text: "Error",title: "Error" });
      navigationRef.current.navigate(NAVSCREEN, { ? });
    };
  */


  /******************************** UPDATE LOGIC ********************************/ 
  /**
   * Starts the update check
   */
  _checkUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        this.setState({ updating: true });
        await Updates.fetchUpdateAsync();
        this.setState({ updating: false }, this._reloadApp);
      }
    } catch(e) {
      console.error(e);
    }
  }

  _reloadApp = () => setTimeout(async () => await Updates.reloadAsync(), RESTART_DELAY);

  /******************************** LINKING LOGIC ********************************/ 
  
  /**
   * Initializes the linking logic: app is closed or app is opened
   * @param {*} forceUrl forces an initial url (used for testing)
   */
  _initLinkingAsync = async (forceUrl=null) => {
    //app is closed
    const closedAppUrl = forceUrl || await Linking.getInitialURL();
    console.log("closedurl", closedAppUrl);
    if (closedAppUrl) {
      console.log("Linking.getInitialURL", closedAppUrl)
      this._parseLinkingUrl(closedAppUrl);
    }
    //or app is opened 
    Linking.addEventListener('url', ({ url: openedAppUrl }) => {
      const url = forceUrl || openedAppUrl;
      console.log("Linking.addEventListener", url);
      this._parseLinkingUrl(url);
    });
  }

  /**
   * Acts based on the incoming url, only send to redux if the incoming url is legit
   * Url is set if navigation and the link needs navigation we navigate to the corresponding screen
   * @param {*} url the incoming url
   */
  _parseLinkingUrl = async (url) => {
    //login url type
    this._linkingUrl = url;
    if (url.indexOf(Constants.LINKING_AUTH_SEARCHSTR) >=0) {
      //this._linkingUrlType = Constants.LINKING_TYPES.auth;
      // this.props.actions.setUrl(url, Constants.LINKING_TYPES.auth);
      if(!this.props.auth.success)
        this.props.actions.passwordLessLinkHandler(url);
    } else if (url.indexOf(Constants.WEBSITE_DOMAIN) || url.indexOf(Constants.WEBSITE_STAGING_DOMAIN)) {
      this._loadLinkingEntity(url)
      //this._linkingUrlType = Constants.LINKING_TYPES.website;
    }
  }

  /**
   * Loads entity received by linking
   * @param {*} url a website url only (e.g. www.sardegnaturismo.it/a/b/c?query=1#hash), uses "c" as a querystring
   */
  _loadLinkingEntity = (url) => {
    let queryStr = parseUrl(url).pathname.split("/");
    queryStr = queryStr[queryStr.length-1];
    if (queryStr) {
      this.setState({ linkingSuccess: false, linkingLoading: true, linkingError: null });
      apolloQuery(actions.autocomplete({
        queryStr,
        vidsInclude: [Constants.VIDS.poisCategories, Constants.VIDS.pois, Constants.VIDS.inspirersCategories, Constants.VIDS.events],
        typesExclude: [Constants.NODE_TYPES.events],
      })).then((autocompleteResults) => {
        this.setState({ linkingSuccess: true, linkingLoading: false, linkingError: null });
        if (autocompleteResults.length > 0) {
          const item = autocompleteResults[0].node || {};
          // Delay navigation to show the user a prompt
          setTimeout(() => {
            this.setState({ showLinking: false });
            openRelatedEntity(item.type, navigationRef.current, "navigate", { item, mustFetch: true });
          }, Constants.NAVIGATE_TO_LINKED_ENTITY_DELAY);
        }
      }).catch(e => {
        this.setState({ linkingSuccess: false, linkingLoading: false, linkingError: e.message });
      }); 
    }
  }

  /******************************** NETWORKING LOGIC ********************************/ 
  _initNetworkChecker = () => {
    // Subscribe
    this._unsubscribeNetInfo = NetInfo.addEventListener(state => {
      this.setState({ networkIsConnected: state.isConnected });
      this.props.actions.setNetworkStatus(state);
    });
  }

  _onNetworkRetryPressed = () => {
    NetInfo.fetch().then(state => {
      this.setState({ networkIsConnected: state.isConnected });
      this.props.actions.setNetworkStatus(state);
    });
  }

  /********************* Render methods go down here *********************/

  _renderSplashImage = () => {
    const { opacity } = this.state;
    return (
      <Animated.View style={[styles.loadingGif, {opacity}]} >
        <Image 
          source={require("../assets/images/splash_mare.png")}
          resizeMode="cover"
          onLoad={this._onSplashLoad}
          style={[styles.backgroundGif]} />
        <View style={[styles.loadingDotsView1]}>
          <View style={styles.loadingDotsView2}>
            <LoadingDots isLoading={true}/>
          </View>
        </View>
      </Animated.View>);
  }

  _renderUpdate = () => {
    const { updateInProgressTitle, updateInProgressDescription} = this.props.locale.messages;
    return this._renderModal(true, updateInProgressTitle, updateInProgressDescription);
  }

  _renderLinking = () => {
    const { loadingLinkingContentTitle, loadingLinkingContentDescription, loadingLinkingContentTitleError, loadingLinkingContentDescriptionError} = this.props.locale.messages;
    const { linkingSuccess, linkingLoading, linkingError, showLinking } = this.state;
    // Show on success since the navigation is delayed, on error hide loading dots and show retry buttons
    if (linkingLoading || linkingSuccess)
      return this._renderModal(showLinking, loadingLinkingContentTitle, loadingLinkingContentDescription);
    else if (linkingError) {
      return this._renderModal(showLinking, loadingLinkingContentTitleError, loadingLinkingContentDescriptionError, false, this._linkingModalBtnOpts);
    }
  }

  _renderNetworkCheck = () => {
    const { disconnected, pleaseConnect } = this.props.locale.messages;
    return this._renderModal(true, disconnected, pleaseConnect, false, this._networkingModalBtnOpts);
  }
  

  /**
   * @param {*} visible make the modal visible or not
   * @param {*} modalTitle title of the modal
   * @param {*} modalDescription description text
   * @param {*} showLoadingDots show loading dots or not
   * @param {*} btnOpts action button options, object like: 
   *  {
   *    show: true, 
   *    left: { label: "leftTitle", onPress: function }, 
   *    right: { label: "rightTitle", onPress: function }
   *  }
   */
  _renderModal = (visible, modalTitle, modalDescription, showLoadingDots=true, btnOpts={}) => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => { }}>
      <View style={styles.modalView}>
        <TouchableWithoutFeedback>
          <View style={styles.modalWindow}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalDescription}>{modalDescription}</Text>
            {showLoadingDots && 
            <View style={styles.loadingDotsView1}>
              <View style={styles.loadingDotsView2}>
                <LoadingDots isLoading={true} />
              </View>
            </View>}
            {btnOpts.show && 
            <View style={styles.modalButtons}>
              {btnOpts.left && 
                <TouchableOpacity activeOpacity={0.7} style={[styles.modalBtn, styles.firstBtn, Constants.styles.shadow]} onPress={btnOpts.left.onPress}>
                  <CustomText style={[styles.modalBtnText]}>{btnOpts.left.label}</CustomText>
                </TouchableOpacity>
              }
              <View style={styles.buttonsSeparator} />
              {btnOpts.right && 
                <TouchableOpacity activeOpacity={0.7} style={[styles.modalBtn, styles.secondBtn, Constants.styles.shadow]} onPress={btnOpts.right.onPress}>
                  <CustomText style={[styles.modalBtnText, styles.skipButtonText]}>{btnOpts.right.label}</CustomText>
                </TouchableOpacity>
              }
            </View>
            }
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>);

  render() {
    const { show, updating, showLinking, networkIsConnected, canShowModals } = this.state;
    const showUpdate = updating && !__DEV__;

    return (
      <>
        {show && this._renderSplashImage()}
        {canShowModals && showUpdate && this._renderUpdate()}
        {canShowModals && showLinking && this._renderLinking()}
        {canShowModals && !networkIsConnected && this._renderNetworkCheck()}
      </>
    )
  }
  
}


ConnectedSplashLoader.navigationOptions = {
  title: 'Boilerplate',
};


const styles = StyleSheet.create({
  backgroundGif: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1
  },
  loadingGif: {
    flex: 1,
    position: "absolute",
    zIndex: 10000,
    width: "100%",
    height: "100%",
    top: 0,
    left: 0
  },
  loadingDotsView1: {
    position: "absolute",
    bottom: 100,
    left: 0,
    zIndex: 999,
    width: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  loadingDotsView2: {
    width: 100,
  },
  // UPDATE
  modalView: {
    flex: 1, 
    width: '100%', 
    height: '100%', 
    zIndex: 1, 
    position: 'absolute',
    left: 0, 
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalWindow: { 
    padding: 28.5,
    backgroundColor: "white", 
    zIndex: 2,
    flexDirection: "column",
    borderRadius: 4,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 15,
    marginBottom: 14,
    fontFamily: "montserrat-bold",
    textTransform: "uppercase"
  },
  modalDescription: {
    fontSize: 12,
    marginBottom: 14,
    fontFamily: "montserrat-regular"
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
  },
  modalBtn: {
    minWidth: 106,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    display: "flex",
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 10, 
  },
  modalBtnText: {
    color: "white",
    fontFamily: "montserrat-bold",
    width: "100%",
    textAlign: "center",
    textTransform: "uppercase"
  },
  firstBtn: {
    alignSelf: "flex-start"
  },
  secondBtn: {
    alignSelf: "flex-end",
    backgroundColor: Colors.lightGray
  },
});


function ConnectedSplashLoaderContainer(props) {
  // const navigation = useNavigation();
  // const route = useRoute();
  const store = useStore();

  return <ConnectedSplashLoader 
    {...props}
    // navigation={navigation}
    // route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    others: state.othersState,
    //language
    locale: state.localeState,
    //auth
    auth: state.authState,
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
})(ConnectedSplashLoaderContainer)