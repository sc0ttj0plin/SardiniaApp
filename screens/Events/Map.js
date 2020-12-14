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
  CustomText
 } from "../../components";
import { coordsInBound, regionToPoligon, regionDiagonalKm } from '../../helpers/maps';
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

    // console.log("events", props.route.params.events.length, events.length)
    this.state = {
      render: USE_DR ? false : true,
      events: events,
      tid: -1,
      coords: {},
      poisLimit: Constants.PAGINATION.poisLimit,
      region: Constants.MAP.defaultRegion,
      selectedEvent: null,
      snapPoints: [],
      tracksViewChanges: false,
    };
      
    this._pageLayoutHeight = Layout.window.height;

  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * On mount load categories and start listening for user's location
   */
  componentDidMount() {
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    //If it's the first mount gets pois categories ("art and archeology...")
    if(this.state.tid < 0){
      // this.props.actions.getCategories({ vid: Constants.VIDS.poisCategories });
    }
    this._initGeolocation();
    
    this._onFocus = this.props.navigation.addListener('focus', () => {
      if(this.state.coords) {
        this._onUpdateCoords(this.state.coords);
      }
    });
    // console.log("events", this.props.route.params)
  }

  componentDidUpdate(prevProps) {
    // if(prevProps.others.placesTerms !== this.props.others.placesTerms) {
    //   this._loadMorePois();
    // }
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this._watchID);
    this._onFocus(); /* unsubscribe */
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  /**
   * Setup navigation: on mount get current position and watch changes using _onUpdateCoords
   */
  _initGeolocation = () => {
    navigator.geolocation.getCurrentPosition(
      position => { this._onUpdateCoords(position.coords); }, 
      ex => { console.log(ex) },
      Constants.NAVIGATOR.watchPositionOpts
    );
    this._watchID = navigator.geolocation.watchPosition(
      position => { this._onUpdateCoords(position.coords); }, 
      ex => { console.log(ex) },
      Constants.NAVIGATOR.watchPositionOpts
    );
  }

  /**
   * Invoked whenever the coordinates get updated (either on initial load or when the user moves)
   *  Pois: fetches new nearest pois and clusters.
   *  PoisCategories: if there are no more nested categories then, instead of loading subcategories load just pois (leaf)
   *  TODO PERFORMANCE ISSUE: 
   *    - if we don't set a threshold on min number of meters there's the risk that this method will be invoked many times!
   *    - it is invoked too many times also when pushing a new screen
   * @param {*} newCoords: the new user's coordinates
   */
  _onUpdateCoords(newCoords) {
    // const { coords, term } = this.state;
    const { coords } = this.state;
    if(!coords || coords.latitude !== newCoords.latitude || coords.longitude !== newCoords.longitude) {
      let isCordsInBound = coordsInBound(newCoords); 
      // Are coordinates within sardinia's area? fetch the updated pois list
      if (isCordsInBound) {
        this.setState({ isCordsInBound, coords: newCoords, nearPoisRefreshing: true });
        // this._fetchNearestPois(newCoords).then(() => {
        //   this.setState({ nearPoisRefreshing: false });
        // });
      }
    }
    // Update list of pois if we are at the bottom of the category tree
    // if(this._isPoiList()){
    //   this._loadMorePois();
    // } 
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
      this.setState({ selectedEvent: null }, () => {
        this._tracksViewChanges = true;
        this.setState({ 
          selectedEvent: event,
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
        selectedEvent: null,
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
    const { coords, region, selectedEvent } = this.state;
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
        onPanDrag={() => selectedEvent && this._selectMarker(null)}
      >
        {this._renderMarkers()}
        {/* {this.state.selectedEvent && this._renderMarker(this.state.selectedEvent, true)} */}
      </MapView>
      {selectedEvent && this._renderWidget()}

      </>
    )

  }

  _renderWidget = () => {
    const { selectedEvent } = this.state;
    const { lan } = this.props.locale;
    const title = _.get(selectedEvent.title, [lan, 0, "value"], null);
    const image = selectedEvent.image;

    return(
      <View style={styles.widget}>
        <EntityItem 
          keyItem={selectedEvent.nid}
          listType={Constants.ENTITY_TYPES.events}
          onPress={() => this._openItem(selectedEvent)}
          title={`${title}`}
          image={`${image}`}
          subtitle={" "}
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
      return this._renderMarker(event, false)
    })
  }

  _renderMarker = (event, selected) => {
    const coordinates = _.get(event, ["itinerary", 0], null)
    if(coordinates){
      const lat = _.get(coordinates, "lat", null)
      const long = _.get(coordinates, "lon", null)
      const selected = this.state.selectedEvent == event;
      const width = 32;

      return(
        lat && long && (
        <Marker.Animated
          coordinate={{ longitude: parseFloat(long),  latitude: parseFloat(lat) }}
          onPress={() => this._selectMarker(event)}
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
      )
    }
    else
      return null
  }

  /* Renders the Header of the scrollable container */
  _renderHeaderText = () => {
    const { exploreEvents } = this.props.locale.messages;
      return (
        <View onStartShouldSetResponder={this._onListHeaderPressIn}>
          <View style={[styles.sectionTitleView, {marginBottom: 15}]}>
            <CustomText style={[styles.sectionTitle, {fontSize: 20}]}>{exploreEvents}</CustomText>
          </View>
        </View>
      )
  }

  /* Horizontal spacing for Header items */
  _renderHorizontalSeparator = () => <View style={{ width: 5, flex: 1 }}></View>;

  /* Renders a poi in Header */
  _renderListItem = ({item, index}) => {
    const { lan } = this.props.locale;
    const title = _.get(item.title, [lan, 0, "value"], null);
    const term = _.get(item, "term.name", null);
    const image = item.image;
    // console.log("title", item)
    return (
      <EntityItem 
        keyItem={item.nid}
        listType={Constants.ENTITY_TYPES.events}
        onPress={() => this._openItem(item)}
        title={title}
        image={image}
        subtitle={term}
        style={styles.eventsListItem}
        horizontal={false}
        extraStyle={styles.eventsListItem}
      />
  )}

  /* Render content */
  _renderContent = () => {
    const { selectedEvent, events } = this.state;
    let data = events;
    let snapIndex = selectedEvent ? 3 : 2

    return (
      <ScrollableContainer 
        entityType={Constants.ENTITY_TYPES.events}
        topComponent={this._renderTopComponent}
        ListHeaderComponent={this._renderListHeader}
        onListHeaderPressed={this._onListHeaderPressIn}
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
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]} onLayout={this._onPageLayout}>
        <ConnectedHeader 
          iconTintColor={Colors.colorEventsScreen}  
          backButtonVisible={true}
        />
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
  sectionTitle: {
      fontSize: 16,
      color: "black",
      fontFamily: "montserrat-bold",
  },
  sectionTitleView: {
    maxHeight: 40, 
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 10,
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
    bottom: Platform.OS == "ios" ? 30 : 70,
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