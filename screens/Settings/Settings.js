import React, {Component} from "react";
import {
    View, Text, FlatList, ActivityIndicator, TouchableOpacity,
    StyleSheet, BackHandler, Platform, ScrollView,Alert
} from "react-native";
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
    };

    console.log(props.setting);
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * Use this function to perform data fetching
   * e.g. this.props.actions.getPois();
   */
  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {
      USE_DR && setTimeout(() => this.setState({ render: true }), 0);
      this.getfixLocationState();
    }
  }

  /**
   * Use this function to update state based on external props
   * or to post-process data once it changes
   */
  componentDidUpdate(prevProps) {
    console.log("didupdate");
    this.getfixLocationState();
    /**
     * Is the former props different from the newly propagated prop (redux)? perform some action
     * if(prevProps.xxx !== this.props.xxx)
     *  doStuff();
     */
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

  requestLocationPermission = async () => {
    Alert.alert(
      "alert Message",
      "Inserire messaggio per cambiare impostazioni GPS",
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
    if (status === "granted") {
      this.props.actions.toggleSettings({
        type: "gpsbackground",
        value: true,
      });
      return Location.getCurrentPositionAsync({ enableHighAccuracy: true });
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

  goToSettings = () => {
    if (Platform.OS == "ios") {
      Linking.openURL("app-settings:");
    } else {
      IntentLauncher.startActivityAsync(
        IntentLauncher.ACTION_APPLICATION_DETAILS_SETTINGS,
        { data: "package:" + pkg }
      );
    }
  };

  handleInputChange = (value, name) => {
    console.log(name + value);
    switch (name) {
      case "gpsbackground":
        this.requestLocationPermission();
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
      <AsyncOperationStatusIndicator
        loading={this._isLoadingData()}
        success={this._isSuccessData()}
        error={this._isErrorData()}
        retryFun={() => {}}
        loadingLayout={
          <LoadingLayoutEntitiesFlatlist
            horizontal={false}
            numColumns={1}
            itemStyle={styles.itemFlatlist}
            style={styles.listStyle}
            bodyContainerStyle={styles.listContainer}
          />
        }
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
      </AsyncOperationStatusIndicator>
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
