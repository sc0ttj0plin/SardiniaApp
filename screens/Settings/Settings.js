import React, {Component} from "react";
import {
    View, Text, FlatList, ActivityIndicator, TouchableOpacity,
    StyleSheet, BackHandler, Platform, ScrollView,Alert
} from "react-native";
import * as TaskManager from 'expo-task-manager';

import {useNavigation, useRoute} from '@react-navigation/native';
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
    // ImageGridItem,
    // ConnectedLanguageList,
    // BoxWithText,
    // ConnectedFab,
    // PoiItem,
    // PoiItemsList,
    // ExtrasListItem,
    // MapViewItinerary
    CustomText,
    CustomSwitch
} from "../../components";
import {connect, useStore} from 'react-redux';
import {bindActionCreators} from 'redux';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import {
    greedyArrayFinder,
    getEntityInfo,
    getCoordinates,
    getSampleVideoIndex,
    getGalleryImages
} from '../../helpers/utils';
import {apolloQuery} from '../../apollo/queries';
import actions from '../../actions';
import * as AppConstants from '../../constants';
import Colors from '../../constants/Colors';
import {LoadingLayoutEntitiesFlatlist} from "../../components/layouts";
import ToggleSwitch from 'toggle-switch-react-native'
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import * as IntentLauncher from "expo-intent-launcher";
import Constants from "expo-constants";
import LocationCheck from "../../components/others/LocationCheck";


/* Deferred rendering to speedup page inital load:
   deferred rendering delays the rendering reducing the initial
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;

const pkg = Constants.manifest.releaseChannel
  ? Constants.manifest.android.package
  : "host.exp.exponent";

class SettingsScreen extends Component {
  constructor(props) {
    super(props);

    /* Get props from navigation */
    //let { someNavProps } = props.route.params;

    this.state = {
      render: USE_DR ? false : true,
      gps_background:'',
      gps_foreground:''
    };
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * Use this function to perform data fetching
   * e.g. this.props.actions.getPois();
   */
  async componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {
      USE_DR && setTimeout(() => this.setState({ render: true }), 0);
      const { status } = await Permissions.askAsync(Permissions.LOCATION);
      this.setState({gps_background:status})
      console.log(status+'component did mount')

    }
  }

  /**
   * Use this function to update state based on external props
   * or to post-process data once it changes
   */
  async componentDidUpdate(prevProps) {
    /**
     * Is the former props different from the newly propagated prop (redux)? perform some action
     * if(prevProps.xxx !== this.props.xxx)
     *  doStuff();
     */
    console.log('didupdate')
    console.log(this.props.setting)
    console.log('didupdate')

     if (this.props.setting.gpsbackground !== prevProps.setting.gpsbackground){
        console.log('cambiate')
        console.log()
        const { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status==='granted' && this.props.setting.gpsbackground===true){
        this.props.actions.toggleSettings({
          type: "gpsbackground",
          value: true,
        });}
        else{
          this.props.actions.toggleSettings({
            type: "gpsbackground",
            value: false,
          });
        }


     }
     
  }

  /**
   * Use this function to unsubscribe or clear any event hooks
   */
  componentWillUnmount() {}

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

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
  _isSuccessData = () => true; /* e.g. this.props.pois.success; */
  _isLoadingData = () => true; /* e.g. this.props.pois.loading; */
  _isErrorData = () => null; /* e.g. this.props.pois.error; */



  _getLocationAsync = async () => {
    //let settingres = await this.requestLocationPermission();
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      alert('The request was denied');
      this.requestLocationPermission()
    }else{
      try{
        let location = await Location.getCurrentPositionAsync({});
        console.log('test')
        this.requestLocationPermission()
        // do something with location
      }catch(e){
        alert('We could not find your position. Please make sure your location service provider is on');
        console.log('Error while trying to get location: ', e);
      }
    }
  }


  requestLocationPermission = async () => {
    Alert.alert(
      "alert Message",
      "Inserire messaggio di  per cambiare impostazioni GPS",
      [
        {
          text: "Apri Impostazioni",
          onPress: () => this.goToSettings(),
          style: "cancel",
        },
        { text: "Annulla", onPress: () => navigation.goback() },
      ]
    );
  };

  getfixLocationState = async () => {
    // permissions returns only for location permissions on iOS and under certain conditions, see Permissions.LOCATION
    const { status, permissions } = await Permissions.askAsync(
      Permissions.LOCATION
    );
    console.log(status);
    if (status === "granted" && this.props.setting.gps_background===true) {
      return
      
    } else {
      if (this.props.setting.gpsbackground === true) {
        this.props.actions.toggleSettings({
          type: "gpsbackground",
          value: false,
        });
      }
      if (this.props.setting.gpsopenapp === true) {
        this.props.actions.toggleSettings({
          type: "gpsopenapp",
          value: false,
        });
      }
    }
  };

  goToSettings = async () => {
    if (Platform.OS == "ios") {
      Linking.openURL("app-settings:");
      navigation.goback();
    } else {
      let setting = await IntentLauncher.startActivityAsync(
        IntentLauncher.ACTION_APPLICATION_DETAILS_SETTINGS,
        { data: "package:" + pkg }
      );
      console.log(setting)
      navigation.goback();
    }
  };

  handleInputChange = (value, name) => {
    switch (name) {
      case "gpsbackground":
        if (value === true) {
          Location.startLocationUpdatesAsync(AppConstants.GEOLOCATION.geolocationBackgroundTaskName, {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: AppConstants.GEOLOCATION.startLocationUpdatesAsyncOpts.distanceInterval, 
            timeInterval: AppConstants.GEOLOCATION.startLocationUpdatesAsyncOpts.timeInterval,
            foregroundService: {
              notificationTitle: AppConstants.GEOLOCATION.startLocationUpdatesAsyncOpts.foregroundService.notificationTitle,
              notificationBody: AppConstants.GEOLOCATION.startLocationUpdatesAsyncOpts.foregroundService.notificationBody,
            },
          });
        }else{
          Location.hasStartedLocationUpdatesAsync(AppConstants.GEOLOCATION.geolocationBackgroundTaskName).then((value) => {
            if (value) {
              Location.stopLocationUpdatesAsync(AppConstants.GEOLOCATION.geolocationBackgroundTaskName);
            }
          });
        }

        break;
      case "gpsopenapp":
        if (value === false) {
          this.goToSettings();
        }

        this.checkPermissionRender().then((data) => {
          value = data;
          console.log(value);
        });

        break;
      default:
        break;
    }
    console.log(value);
    this.props.actions.toggleSettings({
      type: name,
      value: value,
    });
    //this.setState({ [name]: value });
  };

  checkPermissionRender = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    // console.log(status + 'test')
    if (status === "granted") {
      return Promise.resolve("true");
    } else {
      this.goToSettings();
      return Promise.resolve("false");
    }
  };

  /********************* Render methods go down here *********************/
  _renderContent = () => {
    const { notificationsetting, gpsauth } = this.props.locale.messages;
    //const { nearpoi } = this.state;

    return (
      <><AsyncOperationStatusIndicator
        loading={this._isLoadingData()}
        success={this._isSuccessData()}
        error={this._isErrorData()}
        retryFun={() => { } }
        loadingLayout={<LoadingLayoutEntitiesFlatlist
          horizontal={false}
          numColumns={1}
          itemStyle={styles.itemFlatlist}
          style={styles.listStyle}
          bodyContainerStyle={styles.listContainer} />}
      >
        <CustomText style={styles.title}>{notificationsetting}</CustomText>
        <CustomSwitch
          parentstate={this.props.setting.nearpoi}
          parentkey={"nearpoi"}
          handleInputChange={this.handleInputChange}
          text={"nearpoitext"}
        ></CustomSwitch>
        <CustomSwitch
          text={"newelementadded"}
          parentstate={this.props.setting.newcontent}
          parentkey={"newcontent"}
          handleInputChange={this.handleInputChange}
        ></CustomSwitch>
        <CustomSwitch
          text={"eventreminder"}
          parentkey={"eventreminder"}
          handleInputChange={this.handleInputChange}
          parentstate={this.props.setting.eventreminder}
        ></CustomSwitch>
        <CustomSwitch
          text={"neweventweek"}
          parentstate={this.props.setting.eventnextweek}
          parentkey={"eventnextweek"}
          handleInputChange={this.handleInputChange}
        ></CustomSwitch>
        <CustomSwitch
          text={"alertemergency"}
          parentstate={this.props.setting.emergencyalert}
          parentkey={"emergencyalert"}
          handleInputChange={this.handleInputChange}
        ></CustomSwitch>
        <CustomSwitch
          text={"newsfeed"}
          parentstate={this.props.setting.newsfeed}
          parentkey={"newsfeed"}
          handleInputChange={this.handleInputChange}
        ></CustomSwitch>
        <CustomText style={styles.title}>{gpsauth}</CustomText>
        <CustomSwitch
          text={"gpsapp"}
          parentkey={"gpsopenapp"}
          handleInputChange={this.handleInputChange}
          parentstate={this.props.setting.gpsopenapp}
        ></CustomSwitch>
        <CustomSwitch
          text={"gpsbackground"}
          parentstate={this.props.setting.gpsbackground}
          parentkey={"gpsbackground"}
          handleInputChange={this.handleInputChange}
        ></CustomSwitch>
        <CustomSwitch
          text={"virtualenclosure"}
          parentstate={this.props.setting.virtualenclosure}
          parentkey={"virtualenclosure"}
          handleInputChange={this.handleInputChange}
        ></CustomSwitch>
      </AsyncOperationStatusIndicator></>
    );
  };

  render() {
    const { render } = this.state;
    //this.checkPermissionRender();
    //const { nearpoi } = this.state;

    return (
      <View style={[styles.fill, { paddingTop: Layout.statusbarHeight }]}>
        <ConnectedHeader onBackPress={this._onBackPress} />
        {render && this._renderContent()}
      </View>
    );
  }
}


SettingsScreen.navigationOptions = {
    title: 'Settings',
};


const styles = StyleSheet.create({
    fill: {
        flex: 1,
        backgroundColor: "white"
    },
    header: {
        backgroundColor: "white"
    },
    container: {
        padding: 10,
    },
    title: {
        textAlign: "center",
        paddingTop: 10,
        paddingBottom: 10,
        color: "#000000E6",
        backgroundColor: "#F2F2F2",
        fontSize: 15,
        fontFamily: "montserrat-bold",
        textTransform: "uppercase"
    },
});


function SettingsScreenContainer(props) {
    const navigation = useNavigation();
    const route = useRoute();
    const store = useStore();

    return <SettingsScreen
        {...props}
        navigation={navigation}
        route={route}
        store={store}/>;
}


const mapStateToProps = state => {
    return {
        setting: state.settingsState,
        restState: state.restState,
        //auth
        auth: state.authState,
        //mixed state
        others: state.othersState,
        //language
        locale: state.localeState,
        //favourites
        favourites: state.favouritesState,
        //graphql
        categories: state.categoriesState,
        events: state.eventsState,
        inspirers: state.inspirersState,
        itineraries: state.itinerariesState,
        nodes: state.nodesState,
        pois: state.poisState,
        searchAutocomplete: state.searchAutocompleteState,
        
    };
};


const mapDispatchToProps = dispatch => {
    return {...bindActionCreators({...actions}, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
    return {
        ...stateProps,
        actions: dispatchProps,
        ...props
    }
})(SettingsScreenContainer)
