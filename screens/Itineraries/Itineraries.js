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
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { PROVIDER_GOOGLE } from 'react-native-maps';

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
class ItinerariesScreen extends PureComponent {

  constructor(props) {
    super(props);

    this._watchID = null; /* navigation watch hook */
    this._onFocus = null;
    this._refs = {};


    this.state = {
      render: USE_DR ? false : true,
      itineraries: [],
      tid: -1,
      coords: {},
      poisLimit: Constants.PAGINATION.poisLimit,
      region: Constants.MAP.defaultRegion,
      selectedItinerary: null
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
    this.props.actions.getItineraries();
    this._initGeolocation();
    
    this._onFocus = this.props.navigation.addListener('focus', () => {
      if(this.state.coords) {
        this._onUpdateCoords(this.state.coords);
      }
    });
  }

  componentDidUpdate(prevProps) {
    if(prevProps.itineraries !== this.props.itineraries) {
      this.setState({
        itineraries: this.props.itineraries.data
      })
    }
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
   * Open single poi screen
   * @param {*} item: item list
   */
  _openItem = (item) => {
    console.log("item", item.nid)
    this.props.navigation.navigate(Constants.NAVIGATION.NavItineraryScreen, { uuid: item.uuid, nid: item.nid });
  }

  /**
   * When user stops dragging the map, change selected region
   * @param {*} region: region
   */
  _onRegionChangeComplete = (region) => {
    this.state.region = region;
  }

  _selectMarker = (itinerary) => {
    this.setState({
      selectedItinerary: itinerary
    })
  }

  // _backButtonPress = () => this.props.actions.popCurrentCategoryPlaces();

  /********************* Render methods go down here *********************/

  _renderTopComponentCategorySelector = (item) => 
    <TouchableOpacity style={styles.categorySelectorBtn} onPress={() => this._selectCategory(item)}>
      <Text style={{color: 'white'}}>{item.name}</Text>
    </TouchableOpacity>

  
  /* Renders the topmost component: a map in our use case */
  _renderTopComponent = () => {
    const { coords, region } = this.state;
    return (
      <>
      <MapView
        coords={coords}
        initialRegion={region}
        mapType='standard'
        provider={PROVIDER_GOOGLE}
        showsUserLocation={ true }
        showsIndoorLevelPicker={true}
        showsCompass={false}
        clusterColor={Colors.colorScreen4}
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
    return this.state.itineraries.map( itinerary => {
      return this._renderMarker(itinerary)
    })
  }

  _renderMarker = (itinerary) => {
    const coordinates = _.get(itinerary, ["stages", 0, "poi", "georef", "coordinates"], null)
    if(coordinates){
      const lat = _.get(coordinates, [1], null)
      const long = _.get(coordinates, [0], null)
      const selected = this.state.selectedItinerary == itinerary;
      const width = 32;

      return(
        lat && long && (
        <Marker.Animated
          coordinate={{ longitude: parseFloat(long),  latitude: parseFloat(lat) }}
          onPress={() => this._selectMarker(itinerary)}
          tracksViewChanges={true}
          style={{width: 42, height: 42, zIndex: 1}}>
            <View style={[styles.markerContainer, {
              backgroundColor: selected ? "rgba(93, 127, 32, 0.5)" : "transparent"
            }]}>
              <View
                style={[styles.marker]}>
                <Ionicons
                  name={Constants.RELATED_LIST_TYPES.itineraries.iconName}
                  size={19}
                  color={"#ffffff"}
                  style={{
                    paddingTop: Platform.OS === 'ios' ? 3 : 0
                  }}
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
        <View style={{ 
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          marginBottom: 40
        }}>
          <Text style={styles.sectionTitle}>Esplora itinerari</Text>
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
        listType={Constants.ENTITY_TYPES.itineraries}
        onPress={() => this._openItem(item)}
        title={`${title}`}
        image={`${image}`}
        place={" "}
        style={styles.itinerariesListItem}
      />
  )}

  /* Render content */
  _renderContent = () => {
    const { selectedItinerary, itineraries } = this.state;
    let data = selectedItinerary ? [selectedItinerary] : itineraries;
    // console.log("length", data.length)
    if(!data.length)
      data = []
    let snapIndex = selectedItinerary ? 1 : 2
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
          iconTintColor={Colors.colorScreen4}
        />
        {render && this._renderContent()}
      </View>
    )
  }
  
}


ItinerariesScreen.navigationOptions = {
  title: 'ItinerariesScreen',
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
    backgroundColor: Colors.colorScreen4,
    borderRadius: 21
  },
  markerContainer: {
    width: 42,
    height: 42,
    padding: 6,
    borderRadius: 21
  },
  itinerariesListItem: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#0000001A",
    borderRadius: 10
  }
});


function ItinerariesScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <ItinerariesScreen 
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
    // categories: state.categoriesState,
    itineraries: state.itinerariesState,
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
})(ItinerariesScreenContainer)