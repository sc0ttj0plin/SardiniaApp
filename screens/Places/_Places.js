import React, { Component } from "react";
import { 
  View, Text, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView, NativeModules } from "react-native";

import { FlatList } from "react-native-gesture-handler"
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  CategoryListItem, 
  // GeoRefHListItem, 
  // GridGallery, 
  // GridGalleryImage, 
  MapViewTop, 
  // ScrollableHeader,
  // TabBarIcon, 
  // CalendarListItem, 
  AsyncOperationStatusIndicator, 
  // AsyncOperationStatusIndicatorPlaceholder,
  // Webview, 
  // ConnectedText, 
  ClusteredMapViewTop,
  ConnectedHeader, 
  ScrollableContainer,
  EntityItem,
  // ImageGridItem, 
  // ConnectedLanguageList, 
  // BoxWithText,
  // ConnectedFab, 
  // PoiItem, 
  // PoiItemsList, 
  // ExtrasListItem, 
  // MapViewItinerary
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
const { StatusBarManager } = NativeModules;

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
/* Deferred rendering to speedup page inital load: 
   deferred rendering delays the rendering reducing the initial 
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;
class PlacesScreen extends Component {

  constructor(props) {
    super(props);

    // const params = _.get(props.route, 'params', { region: null, term: null, coords: {} });
    // const { region, term, coords } = params; /* passed from the top component */
    // const uuids = _.get(term, 'uuids', []);
    const term = null;
    const coords = {};
    const region = null;
    const uuids = [];
    this._watchID = null; /* navigation watch identificator */
    this._onFocus = null;
    this._refs = {};

    this.state = {
      render: USE_DR ? false : true,
      pois: [],
      nearPois: [],
      nearPoisRefreshing: false,
      tid: -1,
      uuids, /* uuids for categories */
      prevTerm: null,
      term,
      coords,
      poisLimit: Constants.PAGINATION.poisLimit,
      region: Constants.MAP.defaultRegion,
    };
      
  }

  /**
   * On mount load categories and start listening for user's location
   */
  componentDidMount() {
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    //If it's the first mount gets pois categories ("art and archeology...")
    if(this.state.tid < 0){
      this.props.actions.getCategories({ vid: Constants.VIDS.poisCategories });
    }
    this._initGeolocation();
    
    this._onFocus = this.props.navigation.addListener('focus', () => {
      if(this.state.coords) {
        this._onUpdateCoords(this.state.coords);
      }
    });
  }

  componentDidUpdate(prevProps) {
    /**
     * Is the former props different from the newly propagated prop (redux)? perform some action
     * if(prevProps.xxx !== this.props.xxx)
     *  doStuff();
     */
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this._watchID);
    this._onFocus(); /* unsubscribe */
  }


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
    // console.log("ee", this.state.term, this.state.uuids) //null, []
    const { coords, term } = this.state;
    if(!coords || coords.latitude !== newCoords.latitude || coords.longitude !== newCoords.longitude) {
      let isCordsInBound = coordsInBound(newCoords); 
      // Are coordinates within sardinia's area? fetch the updated pois list
      if (isCordsInBound) {
        this.setState({ isCordsInBound, coords: newCoords, nearPoisRefreshing: true });
        this._fetchNearestPois(newCoords).then(() => {
          this.setState({ nearPoisRefreshing: false });
        });
      } else {
        this.setState({ isCordsInBound: isCordsInBound, coords: newCoords });
        this._fetchClusters(newCoords);
      }
    }
    if(term && (!term.terms || term.terms.length == 0)){
      this._loadMorePois();
    } 
  }

  /**
   * Loads pois that are near "coords" and sets nearPois on state
   * uuids controls the category of the pois
   * @param {*} coords: the coordinates for which to load new pois
   */
  _fetchNearestPois(coords) {
    return apolloQuery(actions.getNearestPois({
        limit: 8,
        x: coords.longitude,
        y: coords.latitude,
        uuids: this.state.uuids.length > 0 ? this.state.uuids : null
      })).then((pois) => {
        console.log("NEARESTPOIS!!")
        this.setState({ nearPois: pois });
      })
  }
  
  /**
   * Uses the user's coordinates to fetch clusters of pois
   * TODO PERFORMANCE ISSUE: may be a source of performance degradation, 
   *  coords is not used, it only uses region to update the clusters but is invoked whenever coords change!!!
   * @param {*} coords: new user coordinates (not used)
   */
  _fetchClusters(coords) {
    console.log("ee", this.state.term, this.state.uuids)
    const { region, uuids } = this.state;

    const p = regionToPoligon(region);
    const regionString = `${p[0][0]} ${p[0][1]}, ${p[1][0]} ${p[1][1]}, ${p[2][0]} ${p[2][1]}, ${p[3][0]} ${p[3][1]}, ${p[4][0]} ${p[4][1]}`;
    
    let uuidString = "{";
    for(var i=0; i<uuids.length; i++)
      uuidString += i < uuids.length - 1 ? uuids + "," : uuids;
    uuidString += "}";

    const km = regionDiagonalKm(region);
    const dEps = (km / 1000) / (Layout.window.diagonal / Layout.map.markerPixels);
    //run the query, set clusters and resets nearpois
    apolloQuery(actions.getClusters({
      polygon: regionString,
      cats: uuidString,
      dbscan_eps: dEps
    })).then((clusters) => {
      this.setState({
        clusters: clusters,
        nearPois: []
      });
    });
  }

  /**
   * Get more pois when the user coordinates update and we reach the end of the category tree 
   * to load pois in the bottom scrollable container list (not header)
   * uuids controls the category of the pois
   */
  _loadMorePois = () => {
    var { coords } = this.state;
    if(coords && this._isPoiList() && !this.state.poisRefreshing){
      console.log("load finally pois!")
      this.setState({
        poisRefreshing: true
      }, () => {
        apolloQuery(actions.getNearestPois({
          limit: this.state.poisLimit,
          offset: this.state.pois ? this.state.pois.length : 0,
          x: coords.longitude,
          y: coords.latitude,
          uuids: this.state.uuids.length > 0 ? this.state.uuids : null
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
   * Opens category item on click, push a new screen 
   * @param {*} item: list item clicked
   */
  _openCategory = (item) => {
    const { region, coords, term } = this.state;
    this.setState({
      prevTerm: term,
      term: item, 
      uuids: item.uuids,
      region,
      coords,
    }, this._loadMorePois)
  }

  /**
   * Opens fullscreen map on top of the screen
   */
  _openMap = () => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavMapScreen, {
      region: this.state.region,
      pois: this.state.nearPois,
      term: this.state.term,
      uuids: this.state.uuids,
      coords: this.state.coords
    })
  }

  /**
   * Open single poi screen
   * @param {*} item: item list
   */
  _openPoi = (item) => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, {
      place: item
    })
  }

  /**
   * When user stops dragging the map, change selected region
   * @param {*} region: region
   */
  _onRegionChangeComplete = (region) => {
    this.state.region = region;
  }

  /**
   * Is poi list returns true if we reached the end of the three (pois instead of categories)
   */
  _isPoiList = () => {
    return this.state.term && (!this.state.term.terms || this.state.term.terms.length == 0);
  }



  _isSuccessData  = () => false;    /* e.g. this.props.pois.success; */
  _isLoadingData  = () => true;   /* e.g. this.props.pois.loading; */
  _isErrorData    = () => null;    /* e.g. this.props.pois.error; */


  /* Renders the topmost component: a map in our use case */
  _renderTopComponent = () => {
    var { categories } = this.props;
    const { term, coords, region, nearPois, clusters, uuids } = this.state;
    console.log(uuids, "dasdad");
    return (
      <ClusteredMapViewTop
        term={term}
        coords={coords}
        initRegion={region}
        pois={nearPois}
        clusters={clusters}
        uuids={uuids}
        onRegionChangeComplete={this._onRegionChangeComplete}
        style={{flex: 1}}
        categoriesMap={this.props.categories.map}
        mapRef={ref => (this._refs["ClusteredMapViewTop"] = ref)}
      />
    )
  }

  /* Renders the Header of the scrollable container */
  _renderListHeader = () => {
    var { nearPois } = this.state;
    const { nearToYou, whereToGo } = this.props.locale.messages;
      return (
        <View style={{ marginLeft: -10, marginRight: -10 }}>
          <AsyncOperationStatusIndicator
            loading={true}
            success={nearPois && nearPois.length > 0}
            loadingLayout={<LLEntitiesFlatlist horizontal={true} style={styles.listContainerHeader} title={nearToYou} titleStyle={styles.sectionTitle}/>}
          >
            <View>  
              <Text style={styles.sectionTitle}>{nearToYou}</Text>
              <FlatList
                horizontal={true}
                renderItem={({item}) => this._renderPoiListItem(item)}
                data={nearPois}
                extraData={this.props.locale}
                keyExtractor={item => item.nid.toString()}
                ItemSeparatorComponent={this._renderHorizontalSeparator}
                contentContainerStyle={styles.listContainerHeader}
                showsHorizontalScrollIndicator={false}
                initialNumToRender={3} // Reduce initial render amount
                maxToRenderPerBatch={2}
                updateCellsBatchingPeriod={4000} // Increase time between renders
                windowSize={5} // Reduce the window size
              />
            </View>
          </AsyncOperationStatusIndicator>
          <Text style={styles.sectionTitle}>{whereToGo}</Text>
        </View>
      )
  }

  /* Horizontal spacing for Header items */
  _renderHorizontalSeparator = () => <View style={{ width: 5, flex: 1 }}></View>;

  /* Renders a poi in Header */
  _renderPoiListItem = (item) => {
    const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
    return (
      <EntityItem 
        keyItem={item.nid}
        backgroundTopLeftCorner={"white"}
        iconColor={Colors.colorScreen1}
        iconName={Platform.OS === 'ios' ? 'ios-map' : 'md-map'}
        onPress={() => this._openPoi(item)}
        title={`${title}`}
        place={`${item.term.name}`}
        image={`${item.image}`}
        distance={this.state.isCordsInBound && item.distance}
      />
  )}

  /* Renders categories list */
  _renderCategoryListItem = (item) => 
      <CategoryListItem onPress={() => this._openCategory(item)} image={item.image} title={item.name} />;


  /* Render content */
  _renderContent = () => {
    let { categories } = this.props;
    const { term, coords, region, nearPois, clusters, pois } = this.state;
    const isPoiList = this._isPoiList();
    let data = [];
    let renderItem = null;
    let numColums = 1; //One for categories, two for pois
    //if we reached the end renders pois
    if (isPoiList) {
      data = pois;
      renderItem = ({ item }) => this._renderPoiListItem(item);
      numColums = 2;
    } else {
      //initially term is null so we get categories from redux, then term is populated with nested terms (categories) 
      data = term ? (term.terms ? term.terms : []) : categories.data[Constants.VIDS.poisCategories];
      renderItem = ({ item }) => this._renderCategoryListItem(item);
    }

    // console.log("current categories", currentCategories.length) //categories.data[Constants.VIDS.poisCategories])
    return (
      <ScrollableContainer 
        topComponent={this._renderTopComponent}
        ListHeaderComponent={this._renderListHeader}
        data={data}
        numColums={numColums}
        renderItem={renderItem}
        keyExtractor={item => item.uuid}
      />
    )
  }


  render() {
    const { render, uuids } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: STATUSBAR_HEIGHT}]}>
        <ConnectedHeader 
          backOnPress={() => this.setState({ term: this.state.prevTerm })}
          iconTintColor={Colors.colorScreen1} 
          backButtonVisible={!this.state.term}
        />
        {render && this._renderContent()}
      </View>
    )
  }
  
}


PlacesScreen.navigationOptions = {
  title: 'Places',
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
      color: Colors.colorScreen1,
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
});


function PlacesScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <PlacesScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    restState: state.restState,
    //mixed state
    othersState: state.othersState,
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
  return {...bindActionCreators({ ...actions }, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(PlacesScreenContainer)