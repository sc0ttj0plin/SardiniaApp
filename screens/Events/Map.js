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
 } from "../../components";
import { coordsInBound, regionToPoligon, regionDiagonalKm } from '../../helpers/maps';
import MapView from "react-native-map-clustering";
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
      selectedEvent: null
    };
      
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

  /**
   * When user stops dragging the map, change selected region
   * @param {*} region: region
   */
  _onRegionChangeComplete = (region) => {
    this.state.region = region;
  }

  _selectMarker = (event) => {
    if (event)
      this.setState({ selectedEvent: event });
  }

  // _backButtonPress = () => this.props.actions.popCurrentCategoryPlaces();

  /********************* Render methods go down here *********************/

  _renderTopComponentCategorySelector = (item) => 
    <TouchableOpacity style={styles.categorySelectorBtn} onPress={() => this._selectCategory(item)}>
      <Text style={{color: 'white'}}>{item.name}</Text>
    </TouchableOpacity>

  
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
        clusterColor={Colors.colorScreen5}
        style={{flex: 1}}
        onPress={() => this._selectMarker(null)}
        onRegionChangeComplete={this._onRegionChangeComplete}
      >
        {this._renderMarkers()}
      </MapView>
      </>
    )

  }

  _renderMarkers = () => {
    return this.state.events.map( event => {
      return this._renderMarker(event)
    })
  }

  _renderMarker = (event) => {
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
          tracksViewChanges={true}
          style={styles.markerAnimated}>
            <View style={[styles.markerContainer, { backgroundColor: selected ? "rgba(217, 83, 30, 0.5)" : "transparent"}]}>
              <View
                style={[styles.marker]}>
                <Ionicons
                  name={Constants.RELATED_LIST_TYPES.events.iconName}
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
  _renderListHeader = () => {
    const { nearToYou, whereToGo } = this.props.locale.messages;
      return (
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Esplora Eventi</Text>
        </View>
      )
  }

  /* Horizontal spacing for Header items */
  _renderHorizontalSeparator = () => <View style={{ width: 5, flex: 1 }}></View>;

  /* Renders a poi in Header */
  _renderListItem = ({item}) => {
    const { lan } = this.props.locale;
    const title = _.get(item.title, [lan, 0, "value"], null);
    const image = item.image;
    // console.log("title", item)
    return (
      <EntityItem 
        keyItem={item.nid}
        listType={Constants.ENTITY_TYPES.events}
        onPress={() => this._openItem(item)}
        title={`${title}`}
        image={`${image}`}
        place={" "}
        style={styles.eventsListItem}
      />
  )}

  /* Render content */
  _renderContent = () => {
    const { selectedEvent, events } = this.state;
    let data = selectedEvent ? [selectedEvent] : events;
    let snapIndex = selectedEvent ? 1 : 2
    return (
      <ScrollableContainer 
        topComponent={this._renderTopComponent}
        ListHeaderComponent={this._renderListHeader}
        data={data}
        initialSnapIndex={snapIndex}
        numColums={1}
        renderItem={this._renderListItem}
        keyExtractor={item => item.uuid}
      />
    )
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        <ConnectedHeader 
          iconTintColor={Colors.colorScreen5}  
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
    backgroundColor: Colors.colorScreen1,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    flex: 1,
  },
  listHeader: { 
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 40
  },
  sectionTitle: {
      fontSize: 16,
      color: "black",
      fontWeight: "bold",
      margin: 10
  },
  listContainer: {
    backgroundColor: Colors.colorScreen1,
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
    zIndex: 1
  },
  markerIcon: {
    paddingTop: Platform.OS === 'ios' ? 3 : 0
  },
  listPois: {
    backgroundColor: Colors.colorScreen1,
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
    // backgroundColor: "transparent",
    // justifyContent: 'center',
    // alignItems: 'center'
    width: "100%",
    height: "100%",
    backgroundColor: "blue",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.colorScreen5,
    borderRadius: 21
  },
  markerContainer: {
    width: 42,
    height: 42,
    padding: 6,
    borderRadius: 21
  },
  eventsListItem: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#0000001A",
    borderRadius: 10
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