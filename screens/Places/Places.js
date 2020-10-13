import React, { Component } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  // CategoryListItem, 
  // GeoRefHListItem, 
  // GridGallery, 
  // GridGalleryImage, 
  // MapViewTop, 
  // ScrollableHeader,
  // TabBarIcon, 
  // CalendarListItem, 
  AsyncOperationStatusIndicator, 
  // AsyncOperationStatusIndicatorPlaceholder,
  // Webview, 
  // ConnectedText, 
  ConnectedHeader, 
  ScrollableContainer,
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
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import { apolloQuery } from '../apollo/middleware';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { LLEntitiesFlatlist } from "../../components/loadingLayouts";

/* Deferred rendering to speedup page inital load: 
   deferred rendering delays the rendering reducing the initial 
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;
class BoilerPlateScreen extends Component {

  constructor(props) {
    super(props);

    const { region=null, term={}, coords={} } = props.route.params;
    const { uuids=[] } = term.uuids;
    this._watchID = null; /* navigation watch identificator */
    this._onFocus = null;

    this.state = {
      render: USE_DR ? false : true,
      nearPois: [],
      nearPoisRefreshing: false,
      tid: term.tid || -1,
      uuids, /* uuids for categories */
      term,
      coords,
      poisLimit: Constants.PAGINATION.poisLimit,
      region: region || Constants.MAP.defaultRegion,
    };
      
  }

  componentDidMount() {
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    //If it's the first mount gets pois categories ("art and archeology...")
    if(this.state.tid < 0){
      this.props.actions.getCategories({ vid: Constants.VIDS.poisCategories });
    }
    this._setupNavigation();
    
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
  _setupNavigation = () => {
    navigator.geolocation.getCurrentPosition(
      position => { this._onUpdateCoords(position.coords); }, 
      ex => { console.log(ex) },
      Constants.NAVIGATOR_OPTS
    );
    this._watchID = navigator.geolocation.watchPosition(
      position => { this._onUpdateCoords(position.coords); }, 
      ex => { console.log(ex) },
      Constants.NAVIGATOR_OPTS
    );
  }

  /**
   * Invoked whenever the coordinates get updated (either on initial load or when the user moves)
   *  Pois: fetches new nearest pois and clusters.
   *  PoisCategories: if there are no more nested categories then, instead of loading subcategories load just pois (leaf)
   *  TODO PERFORMANCE ISSUE: 
   *    - if we don't set a threshold on min number of meters there's the risk that this method will be invoked many times
   *    - is invoked too many times also when pushing a new screen
   * @param {*} newCoords: the new user's coordinates
   */
  _onUpdateCoords(newCoords) {
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
   * @param {*} coords: the coordinates for which to load new pois
   */
  _fetchNearestPois(coords) {
    return apolloQuery(actions.getNearestPois({
        limit: 8,
        x: coords.longitude,
        y: coords.latitude,
        uuids: this.state.uuids.length > 0 ? this.state.uuids : null
      })).then((pois) => {
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

 
  _loadMorePois = () => {
    var { coords } = this.state;
    if(coords && this._isPoiList() && !this.state.poisRefreshing){
      console.log("_loadMorePois");
      this.setState({
        poisRefreshing: true
      }, () => {
        apolloQuery(graphqlActions.getNearestPois({
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


  _openCategory = (item) => {
    this.props.navigation.push(Constants.NAVIGATION.NavPlacesScreen, {
        term: item,
        region: this.state.region,
        coords: this.state.coords
      },
    );
  }

  _openMap = () => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavMapScreen, {
      region: this.state.region,
      pois: this.state.nearPois,
      term: this.state.term,
      uuids: this.state.uuids,
      coords: this.state.coords
    })
  }

  _openPoi = (item) => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, {
      place: item
    })
  }

  _onRegionChangeComplete = (region) => {
    this.state.region = region;
  }

  _isPoiList = () => {
    return this.state.term && (!this.state.term.terms || this.state.term.terms.length == 0);
  }



  _isSuccessData  = () => false;    /* e.g. this.props.pois.success; */
  _isLoadingData  = () => true;   /* e.g. this.props.pois.loading; */
  _isErrorData    = () => null;    /* e.g. this.props.pois.error; */




  /* renders the topmost component: a map in our use case */
  _renderTopComponent = () => {
    return (
      <MapViewTop
        term={this.state.term}
        coords={this.state.coords}
        initRegion={this.state.region}
        pois={this.state.nearPois}
        clusters={this.state.clusters}
        uuids={this.state.uuids}
        onRegionChangeComplete={this._onRegionChangeComplete}
        style={{
            flex: 1,
        }}
        categoriesMap={this.props.categoriesMap}
        mapRef={ref => (this._refs["MapViewTop"] = ref)}
      />
    )
  }


  /* Renders the header of the scrollable container */
  _renderListHeader = () => {
    var {nearPois} = this.state;
    const { nearToYou, whereToGo } = this.props.locale.messages;
      return (
        <View style={{marginLeft: -10, marginRight: -10}}>
          <AsyncOperationStatusIndicator
            loading={true}
            success={nearPois && nearPois.length > 0}
            loadingLayout={<LLEntitiesFlatlist horizontal={true} style={styles.listContainerHeader} title={nearToYou}/>}>
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


  _renderContent = () => {
     return (
      <ScrollableContainer 
        topComponent={this._renderTopComponent()}
        data={currentCategories}
        ListHeaderComponent={this._renderListHeader()}
        renderItem={({item}) => this._renderCategoryListItem(item)}
        keyExtractor={item => item.tid.toString()}
      />
     )
  }


  render() {
    const { render } = this.state;
    return (
      <View style={styles.fill}>
        <ConnectedHeader 
          iconTintColor={Colors.colorScreen1} 
          backButtonVisible={typeof this.state.term !== "undefined"}
        />
        {render && this._renderContent()}
      </View>
    )
  }
  
}


BoilerPlateScreen.navigationOptions = {
  title: 'Boilerplate',
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.colorScreen1,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    flex: 1,
  },
  sectionTitle: {
      fontSize: 16,
      color: 'white',
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


function BoilerPlateScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <BoilerPlateScreen 
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
})(BoilerPlateScreenContainer)