import React, { PureComponent } from "react";
import { 
  View, Text, ActivityIndicator, 
  StyleSheet, BackHandler, Platform, ScrollView, NativeModules } from "react-native";

import { FlatList, TouchableOpacity } from "react-native-gesture-handler"
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
import { LLHorizontalItemsFlatlist } from "../../components/loadingLayouts";
import { Button } from "react-native-paper";
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
      coords: {},
      region: Constants.MAP.defaultRegion,
      currentTerm: null
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * On mount load categories and start listening for user's location
   */
  componentDidMount() {
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    //If it's the first mount gets pois categories ("art and archeology...")
    this.props.actions.getCategories({ vid: Constants.VIDS.poisCategories });

    this._initGeolocation();
    
    this._onFocus = this.props.navigation.addListener('focus', () => {
      if(this.state.coords) {
        this._onUpdateCoords(this.state.coords);
      }
    });
  }

  /**
   * Update component based on prev props
   * @param {*} prevProps
   */
  componentDidUpdate(prevProps) {
    // If currently selected categories (terms) differ from the previous ones fetch other pois for those categories
    if(prevProps.others.placesTerms !== this.props.others.placesTerms) {
      this._loadMorePois();
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
  _fetchNearestPois = (coords) => {
    const { term, childUuids } = this._getCurrentTerm();
    return apolloQuery(actions.getNearestPois({
      limit: Constants.PAGINATION.poisLimit,
      x: coords.longitude,
      y: coords.latitude,
      uuids: childUuids, //this.state.uuids.length > 0 ? this.state.uuids : null
    })).then((pois) => {
      this.setState({ nearPois: pois });
    });
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
    const { poisRefreshing, pois: statePois, coords } = this.state;
    if(coords && this._isPoiList() && !poisRefreshing){
      this.setState({
        poisRefreshing: true
      }, () => {
        apolloQuery(actions.getNearestPois({
          limit: Constants.PAGINATION.poisLimit,
          offset: statePois ? statePois.length : 0,
          x: coords.longitude,
          y: coords.latitude,
          uuids: childUuids
        })).then((pois) => {
          this.setState({
            pois: statePois ? [...statePois, ...pois] : pois,
            poisRefreshing: false
          });
        }).catch(e => {
          this.setState({ poisRefreshing: false });
        });
      });
    }
  }

  /**
   * Opens category item on click, enter a subcategory pushing in the stack
   * (triggers componentDidUpdate => _loadMorePois)
   * @param {*} item: list item clicked
   */
  _selectCategory = (item) => {
    // const { region, coords, term } = this.state;
    const { region, coords } = this.state;
    this.props.actions.pushCurrentCategoryPlaces(item);
    this.setState({
      region,
      coords,
      currentTerm: item.name
    });
  }

  /**
   * Open single poi screen
   * @param {*} item: item list
   */
  _openPoi = (item) => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, { item });
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

  _backButtonPress = () => {
    this.props.actions.popCurrentCategoryPlaces();
    this.setState({currentTerm: null})
  }

  /********************* Render methods go down here *********************/

  _renderTopComponentCategorySelector = (item) => 
    <TouchableOpacity style={styles.categorySelectorBtn} onPress={() => this._selectCategory(item)} activeOpacity={0.7}>
      <View style={styles.icon}>
          <Ionicons
            name={Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS["places"].iconName}
            size={13}
            style={styles.cornerIcon}
            color={Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS["places"].iconColor}
          />
      </View>
      <Text style={styles.categorySelectorBtnText}>{item.name}</Text>
    </TouchableOpacity>

  /* Renders the topmost component: a category list + map in our case */
  _renderTopComponent = () => {
    const { term, childUuids } = this._getCurrentTerm(true);
    const { coords, region, nearPois } = this.state;
    return (
      <>
      <ClusteredMapViewTop
        term={term}
        coords={coords}
        region={region}
        pois={nearPois}
        entityType={Constants.ENTITY_TYPES.places}
        types={[Constants.NODE_TYPES.places]}
        uuids={childUuids}
        style={{flex: 1}}
        categoriesMap={term}
        mapRef={ref => (this._refs["ClusteredMapViewTop"] = ref)}
      />
      </>
    )

  }

  /* Renders the Header of the scrollable container */
  _renderListHeader = () => {
    const { nearPois } = this.state;
    const { nearToYou, whereToGo } = this.props.locale.messages;
      return (
        <View style={{ marginLeft: -10, marginRight: -10 }}>
          <AsyncOperationStatusIndicator
            loading={true}
            success={nearPois && nearPois.length > 0}
            loadingLayout={<LLHorizontalItemsFlatlist horizontal={true} style={styles.listContainerHeader} title={nearToYou} titleStyle={styles.sectionTitle}/>}
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
  _renderPoiListItem = (item, index) => {
    const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
    const termName = _.get(item, "term.name", "")
    return (
      <EntityItem 
        index={index}
        keyItem={item.nid}
        backgroundTopLeftCorner={"white"}
        iconColor={Colors.colorPlacesScreen}
        listType={Constants.ENTITY_TYPES.places}
        onPress={() => this._openPoi(item)}
        title={`${title}`}
        place={`${termName}`}
        image={`${item.image}`}
        distance={this.state.isCordsInBound ? item.distanceStr : ""}
        style={{marginBottom: 10}}
        horizontal={false}
        sideMargins={20}
      />
  )}

  /* Renders categories list */
  _renderCategoryListItem = (item) => 
      <CategoryListItem onPress={() => this._selectCategory(item)} image={item.image} title={item.name} />;

  _renderFiltersList = () => {
    const { term } = this._getCurrentTerm(true);

    return(
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
    )
  }

  /* Render content */
  _renderContent = () => {
    const { term } = this._getCurrentTerm(true);
    const { pois } = this.state;
    const isPoiList = this._isPoiList();
    // console.log("term", term ? term.length : term, isPoiList, term.name)
    let data = [];
    let renderItem = null;
    let numColumns = 1; //One for categories, two for pois
    //if no more nested categories renders pois
    if (isPoiList) {
      data = pois;
      renderItem = ({ item, index }) => this._renderPoiListItem(item, index);
      numColumns = 2;
    } else {
      //initially term is null so we get terms from redux, then term is populated with nested terms (categories) 
      data = term;
      renderItem = ({ item }) => this._renderCategoryListItem(item);
    }

    return (
      <ScrollableContainer 
        topComponent={this._renderTopComponent}
        extraComponent={this._renderFiltersList}
        ListHeaderComponent={this._renderListHeader}
        data={data}
        initialSnapIndex={1}
        key={"scrollable-" + numColumns}
        numColumns={numColumns}
        renderItem={renderItem}
        keyExtractor={item => item.uuid}
      />
    )
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        <ConnectedHeader 
          backOnPress={this._backButtonPress}
          iconTintColor={Colors.colorPlacesScreen}  
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
    backgroundColor: Colors.colorPlacesScreen,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    flex: 1,
  },
  sectionTitle: {
      fontSize: 16,
      color: Colors.colorPlacesScreen,
      fontWeight: "bold",
      margin: 10
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
  listPois: {
    backgroundColor: Colors.colorPlacesScreen,
    height: "100%",
    paddingHorizontal: 10,
  },
  categorySelectorBtn: {
    height: 32, 
    paddingVertical: 7, 
    backgroundColor: "white", 
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingRight: 15,
    paddingLeft: 5
  },
  categorySelectorBtnText: {
    color: "#000000DE",
    fontSize: 14
  },
  filtersList: {
    width: "100%", 
    height: 40,
    zIndex: 0, 
    // backgroundColor: "red"
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.colorPlacesScreen,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8
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