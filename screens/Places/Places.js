import React, { PureComponent } from "react";
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
import { Button } from "react-native-paper";

const { StatusBarManager } = NativeModules;

/**
 * Map:             Clusters + pois that update with user map's interaction
 *                    can be filtered by category *same filter of Categories&Pois (redux)
 * NearToYou:       near to the user's location (all categories) rendered in the top header
 *                    called at mount + when user changes position (_fetchNearestPois)
 * Categories&Pois: List of Categories and Pois that are in the list
 *                    called when the user reaches the end of the category tree 
 *                    using current selected category + user location (_loadMorePois)
 */

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;
const USE_DR = false;
class PlacesScreen extends PureComponent {

  constructor(props) {
    super(props);

    this._watchID = null; /* navigation watch hook */
    this._onFocus = null;
    this._refs = {};

    this.state = {
      render: USE_DR ? false : true,
      pois: [],
      nearPois: [],
      nearPoisRefreshing: false,
      tid: -1,
      // term: null, /* current category */
      // uuids: [], /* uuids for child categories */ 
      prevTerm: null,
      coords: {},
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
    if(prevProps.others.placesTerms !== this.props.others.placesTerms) {
      this._loadMorePois();
    }
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
   * Get current term (category) and its child uuids, 
   *   if fallbackToCategories is true fallbacks to initial categories
   */
  _getCurrentTerm = (fallbackToCategories=false) => {
    let term = this.props.others.placesTerms[this.props.others.placesTerms.length - 1];
    if (fallbackToCategories)
      term = term ? (term.terms ? term.terms : []) : this.props.categories.data[Constants.VIDS.poisCategories]
    const childUuids = term ? term.childUuids : null;
    return { term, childUuids };
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
        this._fetchNearestPois(newCoords).then(() => {
          this.setState({ nearPoisRefreshing: false });
        });
      }
      // } else {
      //   this.setState({ isCordsInBound: isCordsInBound, coords: newCoords });
      //   this._fetchClustersAndPois(newCoords);
      // }
    }
    // Update list of pois if we are at the bottom of the category tree
    if(this._isPoiList()){
      this._loadMorePois();
    } 
  }

  /**
   * Loads pois that are near "coords" and sets nearPois on state
   * uuids controls the category of the pois
   * @param {*} coords: the coordinates for which to load new pois
   */
  _fetchNearestPois(coords) {
    const { term, childUuids } = this._getCurrentTerm();
    return apolloQuery(actions.getNearestPois({
      limit: 8,
      x: coords.longitude,
      y: coords.latitude,
      uuids: childUuids, //this.state.uuids.length > 0 ? this.state.uuids : null
    })).then((pois) => {
      this.setState({ nearPois: pois });
    });
  }
  
  /**
   * Uses the user's coordinates to fetch clusters of pois
   * TODO PERFORMANCE ISSUE: may be a source of performance degradation, 
   *  coords is not used, it only uses region to update the clusters but is invoked whenever coords change!!!
   * @param {*} coords: new user coordinates (not used)
   */
  // _fetchClustersAndPois(coords) {
  //   const { term, childUuids } = this._getCurrentTerm();
  //   const { region } = this.state;

  //   const p = regionToPoligon(region);
  //   const regionString = `${p[0][0]} ${p[0][1]}, ${p[1][0]} ${p[1][1]}, ${p[2][0]} ${p[2][1]}, ${p[3][0]} ${p[3][1]}, ${p[4][0]} ${p[4][1]}`;
    
  //   let uuidString = "{";
  //   for(var i=0; i<childUuids.length; i++)
  //     uuidString += i < childUuids.length - 1 ? childUuids + "," : childUuids;
  //   uuidString += "}";

  //   const km = regionDiagonalKm(region);
  //   const dEps = (km / 1000) / (Layout.window.diagonal / Layout.map.markerPixels);
  //   //run the query, set clusters and resets nearpois
  //   apolloQuery(actions.getClusters({
  //     polygon: regionString,
  //     cats: uuidString,
  //     dbscan_eps: dEps
  //   })).then((clusters) => {
  //     this.setState({
  //       clusters: clusters,
  //       nearPois: []
  //     });
  //   });
  // }

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
   * Opens category item on click, push a new screen 
   * @param {*} item: list item clicked
   */
  _selectCategory = (item) => {
    // const { region, coords, term } = this.state;
    const { region, coords } = this.state;
    this.props.actions.pushCurrentCategoryPlaces(item);
    this.setState({
      region,
      coords,
    });
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
   * Is poi list returns true if we reached the end of the three (no more sub categories)
   */
  _isPoiList = () => {
    const { term } = this._getCurrentTerm();
    return term && (!term.terms || term.terms.length == 0);
  }

  _backButtonPress = () => this.props.actions.popCurrentCategoryPlaces();

  _isSuccessData  = () => false;    /* e.g. this.props.pois.success; */
  _isLoadingData  = () => true;   /* e.g. this.props.pois.loading; */
  _isErrorData    = () => null;    /* e.g. this.props.pois.error; */


  _renderTopComponentCategorySelector = (item) => 
    <TouchableOpacity style={styles.categorySelectorBtn} onPress={() => this._selectCategory(item)}>
      <Text style={{color: 'white'}}>{item.name}</Text>
    </TouchableOpacity>

  /* Renders the topmost component: a map in our use case */
  _renderTopComponent = () => {
    var { categories } = this.props;
    const { term, childUuids } = this._getCurrentTerm(true);
    const { coords, region, nearPois, clusters } = this.state;
    return (
      <>
      <FlatList
        horizontal={true}
        renderItem={({item}) => this._renderTopComponentCategorySelector(item)}
        data={term}
        extraData={this.props.locale}
        keyExtractor={item => item.uuid}
        style={styles.filtersList}
        ItemSeparatorComponent={this._renderHorizontalSeparator}
        contentContainerStyle={styles.listContainerHeader}
        showsHorizontalScrollIndicator={false}
      />
      <ClusteredMapViewTop
        term={term}
        coords={coords}
        initRegion={region}
        pois={nearPois}
        clusters={clusters}
        uuids={childUuids}
        onRegionChangeComplete={this._onRegionChangeComplete}
        style={{flex: 1}}
        categoriesMap={categories.map}
        mapRef={ref => (this._refs["ClusteredMapViewTop"] = ref)}
      />
      </>
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
                keyExtractor={item => item.uuid}
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
      <CategoryListItem onPress={() => this._selectCategory(item)} image={item.image} title={item.name} />;


  /* Render content */
  _renderContent = () => {
    let { categories } = this.props;
    const { term } = this._getCurrentTerm(true);
    // const { term, coords, region, nearPois, clusters, pois } = this.state;
    const { pois } = this.state;
    const isPoiList = this._isPoiList();
    let data = [];
    let renderItem = null;
    let numColums = 1; //One for categories, two for pois
    //if no more nested categories renders pois
    if (isPoiList) {
      data = pois;
      renderItem = ({ item }) => this._renderPoiListItem(item);
      numColums = 2;
    } else {
      //initially term is null so we get terms from redux, then term is populated with nested terms (categories) 
      data = term;
      renderItem = ({ item }) => this._renderCategoryListItem(item);
    }

    return (
      <ScrollableContainer 
        topComponent={this._renderTopComponent}
        ListHeaderComponent={this._renderListHeader}
        data={data}
        initialSnapIndex={1}
        numColums={numColums}
        renderItem={renderItem}
        keyExtractor={item => item.uuid}
      />
    )
  }


  render() {
    const { render } = this.state;
    console.log(this.props.others.placesTerms.length)
    return (
      <View style={[styles.fill, {paddingTop: STATUSBAR_HEIGHT}]}>
        <ConnectedHeader 
          backOnPress={this._backButtonPress}
          iconTintColor={Colors.colorScreen1}  
          backButtonVisible={this.props.others.placesTerms.length > 0}
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
  }
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
})(PlacesScreenContainer)