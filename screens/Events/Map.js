import React, { PureComponent } from "react";
import { 
  View, Text, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView, NativeModules } from "react-native";

import { FlatList } from "react-native-gesture-handler"
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  CategoryListItem, 
  AsyncOperationStatusIndicator, 
  ClusteredMapViewTop,
  ConnectedHeader, 
  ConnectedMapScrollable,
  ScrollableContainer,
  EntityItem,
  CustomText,
  SectionTitle
 } from "../../components";
import { coordsInBound, distance, distanceToString, regionToPoligon, regionDiagonalKm } from '../../helpers/maps';
// import MapView from "react-native-map-clustering";
import MapView from "react-native-maps";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import { apolloQuery } from '../../apollo/queries';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { LLEntitiesFlatlist } from "../../components/loadingLayouts";
import { Button } from "react-native-paper";
import { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { linkingOpenNavigator } from "../../helpers/utils"

/**
 * Map:             Clusters + pois that update with user map's interaction
 *                    can be filtered by category *same filter of Categories&Pois (redux)
 * NearToYou:       near to the user's location (all categories) rendered in the top header
 *                    called at mount + when user changes position (_fetchNearestPois)
 * Categories&Pois: List of Categories and Pois that are in the list
 *                    called when the user reaches the end of the category tree 
 *                    using current selected category + user location (_loadMorePois)
 */

const USE_DR = false;
class EventsMapScreen extends PureComponent {

  constructor(props) {
    super(props);

    this._watchID = null; /* navigation watch hook */
    this._onFocus = null;
    this._refs = {};

    const events = _.get(props.route, "params.events", []);
    const hideScrollable = _.get(props.route, "params.hideScrollable", false);
    const headerTitle = _.get(props.route, "params.headerTitle");

    // console.log("events", props.route.params.events.length, events.length)
    this.state = {
      render: USE_DR ? false : true,
      events: events,
      tid: -1,
      coords: {},
      poisLimit: Constants.PAGINATION.poisLimit,
      region: Constants.MAP.defaultRegion,
      selectedEntity: null,
      snapPoints: [],
      tracksViewChanges: false,
      hideScrollable,
      headerTitle
    };

  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * On mount load categories and start listening for user's location
   */
  componentDidMount() {
    console.log("map did mount")
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    if(this.props.others.geolocation && this.props.others.geolocation.coords) {
      this._onUpdateCoords(this.props.others.geolocation.coords);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.others.geolocation !== this.props.others.geolocation && this.props.others.geolocation.coords) {
      // { coords: { latitude, longitude }, altitude, accuracy, altitudeAccuracy, heading, speed, timestamp (ms since epoch) }
      this._onUpdateCoords(this.props.others.geolocation.coords);
    }
  }


  /********************* Non React.[Component|PureComponent] methods go down here *********************/


  _onUpdateCoords(newCoords) {
    // const { coords, term } = this.state;
    const { coords } = this.state;
    if(!coords || coords.latitude !== newCoords.latitude || coords.longitude !== newCoords.longitude) {
      let isCordsInBound = coordsInBound(newCoords); 
      // Are coordinates within sardinia's area? fetch the updated pois list
      if (isCordsInBound) {
        this.setState({ isCordsInBound, coords: newCoords, nearPoisRefreshing: true });
      }
    }
  }

  /**
   * Get more pois when the user changes position and/or 
   * we reach the end of the category tree . 
   * Pois are loaded in order of distance from the user and are "categorized"
   * to load pois in the bottom scrollable container list (not header)
   * uuids controls the category of the pois
   */
  _loadMorePois = () => {
    const { childUuids } = this._getCurrentTerm();
    var { coords } = this.state;
    if(coords && this._isPoiList() && !this.state.poisRefreshing){
      this.setState({
        poisRefreshing: true
      }, () => {
        apolloQuery(actions.getNearestPois({
          limit: this.state.poisLimit,
          offset: this.state.pois ? this.state.pois.length : 0,
          x: coords.longitude,
          y: coords.latitude,
          uuids: childUuids
        })).then((pois) => {
          this.setState({
            pois: this.state.pois ? [...this.state.pois, ...pois] : pois,
            poisRefreshing: false
          });
        })
      });
    }
  }

  /**
   * Open single poi screen
   * @param {*} item: item list
   */
  _openItem = (item) => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavEventScreen, { item });
  }

  _getEntityCoords = (entity, isEvent) => {
    if(isEvent){
      const coordinates = _.get(entity, ["itinerary", 0], null);
      // console.log("coordinates", coordinates)
      if(coordinates)
        return { latitude: parseFloat(coordinates.lat), longitude: parseFloat(coordinates.lon) };
      else
        return null;
    }
    else
      return null;
  }

  /********************* Render methods go down here *********************/

  /* Renders the Header of the scrollable container */
  _renderHeaderText = () => {
    const { exploreEvents } = this.props.locale.messages;
      return (
        //onStartShouldSetResponder={this._onListHeaderPressIn}
        <SectionTitle text={exploreEvents} numberOfLines={1} textStyle={{ fontSize: 20 }} style={{ marginBottom: 15, paddingLeft: 40, paddingRight: 40 }} />
      )
  }

  /* Renders a poi in Header */
  _renderListItem = (item, index) => {
    const { coords } = this.state;
    const { lan } = this.props.locale;
    const title = _.get(item.title, [lan, 0, "value"], null);
    const term = _.get(item, "term.name", null);
    const image = item.image;
    const coordinates = _.get(item, ["itinerary", 0], null);
    var distanceStr = null;

    if (coordinates) {
      distanceStr = distanceToString(distance(coords.latitude, coords.longitude, coordinates.lat, coordinates.lon));
    }

    return (
      <EntityItem 
        keyItem={item.nid}
        listType={Constants.ENTITY_TYPES.events}
        onPress={() => this._openItem(item)}
        title={title}
        image={image}
        subtitle={term}
        distance={this.state.isCordsInBound ? distanceStr : null}
        style={styles.eventsListItem}
        horizontal={false}
        extraStyle={styles.eventsListItem}
      />
  )}

/* Render content */
_renderContent = () => {
const { nearToYou } = this.props.locale.messages;
const { pois, snapIndex, coords, region, events  } = this.state;
const entitiesType = Constants.ENTITY_TYPES.events;

  //scrollable props
  const scrollableProps = {
    show: true,
    data: events,
    onEndReached: () => {},
    renderItem: ({ item, index }) => this._renderListItem(item, index),
    keyExtractor: item => item.uuid,
  }

  // MapViewTopProps (MVT)
  const MVTProps = {
    coords, 
    region,
    types: [Constants.NODE_TYPES.events],
    onMarkerPressEvent: "openEntity",
    getCoordsFun: (entity) => this._getEntityCoords(entity, true),
    iconProps: { 
      name: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entitiesType].iconName,
      backgroundColor: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entitiesType].backgroundColor,
      backgroundTransparent: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entitiesType].backgroundTransparent,
      color: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entitiesType].iconColor,
    }
  };

  const mapEntityWidgetProps = { 
    isAccomodationItem: false, 
    coords: this.state.coords 
  };

  const extraComponentProps = {
    data: [],
    keyExtractor: item => item.uuid,
    onPress: this._selectCategory,
    iconProps: { 
      name: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entitiesType].iconName,
      backgroundColor: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entitiesType].backgroundColor,
      color: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entitiesType].iconColor,
    }
  }
const extraModalProps = {
    data: [],
    keyExtractor: item => item.uuid,
    renderItem: ({ item }) => {},
    title: nearToYou,
    onEndReached: () => {},
  }

  /** 
   * NOTE: changing numColums on the fly isn't supported and causes the component to unmount, 
   * thus slowing down the process
   * set a key to the inner flatlist therefore 
  */
  return (
    <ConnectedMapScrollable
      // entities type
      entitiesType={entitiesType}
      // Scrollable container props
      scrollableProps={scrollableProps}

      // Extra component: if scrollableRenderExtraComponent is undefined, must specify extra component props
      // scrollableRenderExtraComponent={this._renderFiltersList}
      scrollableExtraComponentProps={extraComponentProps}
      
      // Header text component: if scrollableHeaderTextComponent is undefined, must specify scrollableHeaderText
      scrollableHeaderTextComponent={this._renderHeaderText}
      // scrollableHeaderText={() => <Text>Header Text</Text>}

      // Top component (ClusteredMapViewTop or MapView or Custom)
      topComponentType="MapView" //or ClusteredMapViewTop or Custom (if Custom must implement topComponentRender)
      // topComponentCMVTProps={CMVTProps}
      // if topComponentType is MapView must specify topComponentMVTProps 
      topComponentMVTProps={MVTProps}
      // Map entity widget (in modal): if renderMapEntityWidget is undefined, must specify mapEntityWidgetProps and mapEntityWidgetOnPress 
      // e.g. this.state.selectedEntity can now be used in renderMapEntityWidget
      // mapEntityWidgetOnPress={(entity) => this.setState({ selectedEntity: entity })} 
      // renderMapEntityWidget={this._renderEntityWidget}
      mapEntityWidgetProps={mapEntityWidgetProps}

      // Extra modal content: if renderExtraModalComponent is undefined, must specify mapEntityWidgetProps
      // renderExtraModalComponent={this._renderNearToYou}
      extraModalProps={{extraModalProps}}

      fullscreen={true}
    />
  )
}


  render() {
    const { render, hideScrollable } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]} onLayout={this._onPageLayout}>
        <ConnectedHeader 
          iconTintColor={Colors.colorEventsScreen}  
          backButtonVisible={true}
        />
        {this.state.headerTitle && 
          <View style={styles.calendarListTitleView}>
            <CustomText style={styles.calendarListTitle}>{this.state.headerTitle}</CustomText>
          </View>
        }
        
        {render && this._renderContent()}
      </View>
    )
  }
  
}


EventsMapScreen.navigationOptions = {
  title: 'EventsMapScreen',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  container: {
    backgroundColor: Colors.colorPlacesScreen,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    flex: 1,
  },
  listHeader: { 
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 76,
  },
  listContainer: {
    backgroundColor: Colors.colorPlacesScreen,
    height: "100%"
  },
  listContainerHeader: {
    paddingLeft: 10,
  },
  listStyle: {
    paddingHorizontal: 10,
    paddingBottom: 25,
  },
  markerAnimated: {
    width: 42, 
    height: 42, 
    zIndex: 1,
  },
  markerIcon: {
  },
  listPois: {
    backgroundColor: Colors.colorPlacesScreen,
    height: "100%",
    paddingHorizontal: 10,
  },
  categorySelectorBtn: {
    height: 30, 
    padding: 5, 
    backgroundColor: Colors.blue, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 10
  },
  filtersList: {
    position: "absolute", 
    top: 10, 
    left: 0, 
    width: "100%", 
    height: 40,
    zIndex: 2, 
    backgroundColor: "transparent"
  },
  marker: {
    width: "100%",
    height: "100%",
    backgroundColor: "blue",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.colorEventsScreen,
    borderRadius: 21
  },
  markerContainer: {
    width: 42,
    height: 42,
    padding: 6,
    borderRadius: 21,
  },
  eventsListItem: {
    borderWidth: 1,
    borderColor: "#0000001A",
    borderRadius: 10,
    width: "100%",
  },
  widget: {
    width: "100%",
    height: 180,
    position: "absolute",
    // backgroundColor: Colors.lightGray,
    bottom: Platform.OS == "ios" ? 80 : 100,
    left: 0,
    padding: 10,
  },
  cluster: { 
    width: 40, 
    height: 40, 
    borderRadius: 20,
    backgroundColor: Colors.colorEventsScreen,
    justifyContent: "center",
    alignItems: "center"
  },
  clusterText: {
    color: "white"
  },
  mapTitle: {
    width: "100%",
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
    color: "#000000E6",
    backgroundColor: "#F2F2F2",
    marginBottom: 16,
    fontSize: 15,
    fontFamily: "montserrat-bold",
    marginTop: -10,
    paddingHorizontal: 5
  },
  topHeader: {
    position: "absolute",
    top: Constants.COMPONENTS.header.bottomLineHeight + 5,
    left: 0,
    width: "100%"
  },
  calendarListTitleView: {
    backgroundColor: "rgb(248,248,248)",
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: "center"
  },
  calendarListTitle: {
    fontSize: 16,
    color: "#000000E6",
    fontFamily: "montserrat-bold",
    textTransform: "capitalize"
  },
});


function EventsMapScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();
  return <EventsMapScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store}/>;
}


const mapStateToProps = state => {
  return {
    //mixed state
    others: state.othersState,
    //language
    locale: state.localeState,
    //graphql
    categories: state.categoriesState,
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
})(EventsMapScreenContainer)