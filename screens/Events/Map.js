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
    const title = _.get(props.route, "params.title", "");

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
      title
    };
      
    this._pageLayoutHeight = Layout.window.height;

  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * On mount load categories and start listening for user's location
   */
  componentDidMount() {
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

  _selectMarker = (event) => {
    if(event) {
      this.props.actions.setScrollableSnapIndex(Constants.ENTITY_TYPES.events, 2);
      this.setState({ selectedEntity: null }, () => {
        this._tracksViewChanges = true;
        this.setState({ 
          selectedEntity: event,
          tracksViewChanges: true
        }, () => {
          this._tracksViewChanges = false;
          // this.setState({
          //   tracksViewChanges: false
          // })
        });
      })
    } else {
      this.setState({ 
        selectedEntity: null,
        tracksViewChanges: true
      }, () => {
        this._tracksViewChanges = false;
        // this.setState({
        //   tracksViewChanges: false
        // })
      });
    }
  }

    /**
   * Used to compute snap points
   * @param {*} event layout event
   */
  _onPageLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    this._pageLayoutHeight = height;

    let margins = 20
    let itemWidth = ((Layout.window.width - (margins*2))/2) - 5;
    //height of parent - Constants.COMPONENTS.header.height (header) - Constants.COMPONENTS.header.bottomLineHeight (color under header) - 24 (handle) - 36 (header text) - itemWidth (entityItem) - 10 (margin of entityItem)
    /* OLD: 4 snap points this.setState({ snapPoints: [0, height -  Layout.statusbarHeight - Constants.COMPONENTS.header.height - Constants.COMPONENTS.header.bottomLineHeight - 24 - 76 - itemWidth - 10, height -  Layout.statusbarHeight - Constants.COMPONENTS.header.height - Constants.COMPONENTS.header.bottomLineHeight - 24 - 76, height -  Layout.statusbarHeight - Constants.COMPONENTS.header.height - Constants.COMPONENTS.header.bottomLineHeight - 34] }); */
    this.setState({ snapPoints: [height -  Layout.statusbarHeight - Constants.COMPONENTS.header.height - Constants.COMPONENTS.header.bottomLineHeight, 80] });
  }; 

  /**
   * On scrollBottomSheet touch clear selection
   * @param {*} e 
   */
  _onListHeaderPressIn = (e) => {
    this._selectMarker(null)
    return true;
  }
  /********************* Render methods go down here *********************/

  _renderCluster = (cluster) => {
    const { id, geometry, onPress, properties } = cluster;
    const points = properties.point_count;

    return (
      <Marker
        key={`cluster-${id}`}
        coordinate={{
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1]
        }}
        onPress={onPress}
      >
        <View style={styles.cluster}>
          <CustomText style={styles.clusterText}>{points}</CustomText>
        </View>
      </Marker>
    )
  }
  
  /* Renders the topmost component: a map in our use case */
  _renderTopComponent = () => {
    const { coords, region, selectedEntity } = this.state;
    return (
      <>
      <MapView
        coords={coords}
        initialRegion={region}
        provider={ PROVIDER_GOOGLE }
        mapType='standard'
        provider={PROVIDER_GOOGLE}
        showsUserLocation={ true }
        showsIndoorLevelPicker={true}
        showsCompass={false}
        renderCluster={this._renderCluster}
        clusteringEnabled={true}
        clusterColor={Colors.colorEventsScreen}
        style={{flex: 1}}
        onPress={() => this._selectMarker(null)}
        onPanDrag={() => selectedEntity && this._selectMarker(null)}
      >
        {this._renderMarkers()}
        {/* {this.state.selectedEntity && this._renderMarker(this.state.selectedEntity, true)} */}
      </MapView>
      {selectedEntity && this._renderWidget()}

      </>
    )

  }

  _renderWidget = () => {
    const { selectedEntity, coords } = this.state;
    const { lan } = this.props.locale;
    const title = _.get(selectedEntity.title, [lan, 0, "value"], null);
    const term = selectedEntity.term.name;
    const image = selectedEntity.image;
    const coordinates = _.get(selectedEntity, ["itinerary", 0], null);
    var distanceStr = null;

    if (coordinates) {
      console.log(_.get(selectedEntity, ["itinerary", 0], null));
      distanceStr = distanceToString(distance(coords.latitude, coords.longitude, coordinates.lat, coordinates.lon));
    }

    return(
      <View style={styles.widget}>
        <EntityItem 
          keyItem={selectedEntity.nid}
          listType={Constants.ENTITY_TYPES.events}
          onPress={() => this._openItem(selectedEntity)}
          title={`${title}`}
          image={`${image}`}
          subtitle={`${term}`}
          distance={this.state.isCordsInBound ? distanceStr : null}
          style={styles.itinerariesListItem}
          horizontal={false}
          topSpace={10}
          extraStyle={{
            marginBottom: 10,
            width: "100%",
            height: "100%"
          }}
        />
      </View>
    )
  }

  _renderMarkers = () => {
    return this.state.events.map( event => {
      return this._renderMarker(event)
    })
  }

  _renderMarker = (event) => {
    const coordinates1 = _.get(event, ["itinerary", 0], null)
    const coordinates2 = _.get(event, "coords", null);
    let coords = null;
    let onClick = null;
    let selected = false;
    if(coordinates1){
      const lat = _.get(coordinates1, "lat", null)
      const long = _.get(coordinates1, "lon", null)
      if(lat && long){
        coords = { longitude: parseFloat(long),  latitude: parseFloat(lat) };
        onClick = () => this._selectMarker(event);
        selected = this.state.selectedEntity == event;
      }
    }
    else if(coordinates2){
      coords = { longitude: parseFloat(coordinates2.longitude),  latitude: parseFloat(coordinates2.latitude) };
      onClick = () => linkingOpenNavigator("", coords);
    }

    if(coords){
      const width = 32;
      return(
        <Marker.Animated
          coordinate={coords}
          onPress={onClick}
          tracksViewChanges={this.state.tracksViewChanges}
          style={styles.markerAnimated}>
            <View style={[styles.markerContainer, { backgroundColor: selected ? Colors.colorEventsScreenTransparent : "transparent"}]}>
              <View
                style={[styles.marker]}>
                <Ionicons
                  name={Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS.events.iconName}
                  size={19}
                  color={"#ffffff"}
                  style={styles.markerIcon}
                />
              </View>
            </View>
        </Marker.Animated>
      )
    }
    else
      return null;
  }

  /* Renders the Header of the scrollable container */
  _renderHeaderText = () => {
    const { exploreEvents } = this.props.locale.messages;
      return (
        //onStartShouldSetResponder={this._onListHeaderPressIn}
        <SectionTitle text={exploreEvents} textStyle={{ fontSize: 20 }} style={{marginBottom: 15}} />
      )
  }

  _renderMapTitle = () => {
    const { title } = this.state;
      if(title != ""){
        return (
          //onStartShouldSetResponder={this._onListHeaderPressIn}
          <SectionTitle numberOfLines={3} text={title} textStyle={{ fontSize: 15 }} style={styles.mapTitle} />
        )
      }
      else
        return null;
  }

  /* Horizontal spacing for Header items */
  _renderHorizontalSeparator = () => <View style={{ width: 5, flex: 1 }}></View>;

  /* Renders a poi in Header */
  _renderListItem = ({item, index}) => {
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

  _renderMap = () => {
    return(
      <View style={styles.fill}>
        {this._renderTopComponent()}
        <View style={styles.topHeader}>
          {this._renderMapTitle()}
        </View>
      </View>
    )
  }

  /* Render content */
  _renderContent = () => {
    const { selectedEntity, events } = this.state;
    let data = events;
    let snapIndex = selectedEntity ? 3 : 2

    return (
      <ScrollableContainer 
        entityType={Constants.ENTITY_TYPES.events}
        topComponent={this._renderTopComponent}
        ListHeaderComponent={this._renderListHeader}
        onListHeaderPressed={this._onListHeaderPressIn}
        extraComponent={this._renderMapTitle}
        data={data}
        initialSnapIndex={1}
        pageLayoutHeight={this._pageLayoutHeight}
        snapIndex={snapIndex}
        snapPoints={this.state.snapPoints}
        numColums={1}
        renderItem={this._renderListItem}
        keyExtractor={item => item.uuid}
        HeaderTextComponent={this._renderHeaderText}
        closeSnapIndex={1}
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
        {render && !hideScrollable && this._renderContent()}
        {render && hideScrollable && this._renderMap()}
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
  }
});


function EventsMapScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <EventsMapScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
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