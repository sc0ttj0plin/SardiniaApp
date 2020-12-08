import React, { Component } from "react";
import { 
  View, Text, ActivityIndicator, 
  StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler"

import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  CategoryListItem, 
  AsyncOperationStatusIndicator, 
  ClusteredMapViewTop,
  ConnectedHeader, 
  ScrollableContainer,
  EntityItem,
  AccomodationItem,
  CustomText
 } from "../../components";
 import { coordsInBound, regionToPoligon, regionDiagonalKm } from '../../helpers/maps';
import { Ionicons } from '@expo/vector-icons';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import { greedyArrayFinder, getEntityInfo, getCoordinates, getSampleVideoIndex, getGalleryImages } from '../../helpers/utils';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { LLHorizontalItemsFlatlist } from "../../components/loadingLayouts";

const USE_DR = false;
class AccomodationsScreen extends Component {

  constructor(props) {
    super(props);

    // Region and sourceEntity are set if another screen (Place and Event) navigates to Accomodations
    const region = _.get(props, "route.params.region", null);
    const sourceEntity = _.get(props, "route.params.sourceEntity", null);
    const sourceEntityCoordinates = _.get(props, "route.params.sourceEntityCoordinates", null);

    this._watchID = null; /* navigation watch hook */
    this._onFocus = null;
    this._refs = {};

    this.state = {
      render: USE_DR ? false : true,
      pois: [],
      nearPois: [],
      nearPoisRefreshing: false,
      coords: {},
      region: region || Constants.MAP.defaultRegion,
      sourceEntity,
      sourceEntityCoordinates,
      //
      snapPoints: null,
      snapIndex: 1,
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * On mount load categories and start listening for user's location
   */
  componentDidMount() {
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    //If it's the first mount gets pois categories ("art and archeology...")
    this.props.actions.getCategories({ vid: Constants.VIDS.accomodations });

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
    if(prevProps.others.accomodationsTerms !== this.props.others.accomodationsTerms) {
      /* update also the header pois based on current cat */
      // this.setState({ nearPois: [] }, () => this._fetchNearestPois(this.state.coords)); 
      this._loadMorePois();
    }

    if (prevProps.others.currentMapEntity !== this.props.others.currentMapEntity)
      this.setState({ snapIndex: 2 });
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
    let term = this.props.others.accomodationsTerms[this.props.others.accomodationsTerms.length - 1];
    if (fallbackToCategories)
      term = term ? (term.terms ? term.terms : []) : this.props.categories.data[Constants.VIDS.accomodations]
    const childUuids = term ? term.childUuids : null;
    return { term, childUuids };
  }

  /**
   * Invoked whenever the coordinates get updated (either on initial load or when the user moves)
   *  Pois: fetches new nearest pois and clusters.
   *  accomodations: if there are no more nested categories then, instead of loading subcategories load just pois (leaf)
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
   * If sourceEntity is specified, then fetch accomodations that are near the source entity (poi or event)
   * @param {*} coords: the coordinates for which to load new pois
   */
  _fetchNearestPois = (coords) => {
    const { nearPois, sourceEntity } = this.state;
    let _coords = coords;
    if (sourceEntity)
      _coords = this.state.sourceEntityCoordinates;
    return apolloQuery(actions.getNearestAccomodations({ 
      limit: Constants.PAGINATION.accomodationsLimit,
      x: _coords.longitude,
      y: _coords.latitude,
      // uuids: childUuids, /* no need to specify the category since we get random pois */
      offset: nearPois.length,
    })).then((pois) => {
      this.setState({ nearPois: [...nearPois, ...pois] });
    });
  }


  /**
   * Get more pois when the user changes position and/or 
   * we reach the end of the category tree . 
   * Pois are loaded in order of distance from the user and are "categorized"
   * to load pois in the bottom scrollable container list (not header)
   * If sourceEntity is specified, then fetch accomodations that are near the source entity (poi or event)
   * uuids controls the category of the pois
   */
  _loadMorePois = () => {
    const { childUuids } = this._getCurrentTerm();
    const { poisRefreshing, pois: statePois, coords, sourceEntity } = this.state;
    let _coords = coords;
    if (sourceEntity)
      _coords = this.state.sourceEntityCoordinates;

    if(_coords && this._isPoiList() && !poisRefreshing){
      this.setState({
        poisRefreshing: true
      }, () => {
        apolloQuery(actions.getNearestAccomodations({
          limit: Constants.PAGINATION.accomodationsLimit,
          offset: statePois ? statePois.length : 0,
          x: _coords.longitude,
          y: _coords.latitude,
          uuids: childUuids
        })).then((pois) => {
          if (pois && pois.length > 0)
            this.setState({ pois: [...statePois, ...pois], poisRefreshing: false });
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
    this.props.actions.pushCurrentCategoryAccomodations(item);
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
    this.props.navigation.navigate(Constants.NAVIGATION.NavAccomodationScreen, { item, mustFetch: true });
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

  /**
   * On category pop we reset current pois
   */
  _backButtonPress = () => { 
    /* update also the header pois based on current cat */
    //this.setState({ pois: [], nearPois: [] });
    if (this.props.others.accomodationsTerms.length > 0) {
      this.props.actions.popCurrentCategoryAccomodations();
      this.setState({ pois: [] });
    } else {
      this.props.navigation.goBack();
    }
  }

  /**
   * Used to compute snap points
   * @param {*} event layout event
   */
  _onPageLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    //height of parent - Constants.COMPONENTS.header.height (header) - Constants.COMPONENTS.header.bottomLineHeight (color under header) - 24 (handle) - 36 (header text) - 160 (entityItem) - 10 (margin of entityItem) - 36 (whereToGo text)
    this.setState({ snapPoints: [0, height -  Layout.statusbarHeight - Constants.COMPONENTS.header.height - Constants.COMPONENTS.header.bottomLineHeight - 24 - 36 - 160 - 10 - 36 + 10, height -  Layout.statusbarHeight - Constants.COMPONENTS.header.height - Constants.COMPONENTS.header.bottomLineHeight - 34] });
  }; 

  /********************* Render methods go down here *********************/

  _renderTopComponentCategorySelector = (item, isLeaf) => 
    <TouchableOpacity style={styles.categorySelectorBtn} onPress={() => isLeaf ? null : this._selectCategory(item)} activeOpacity={0.7}>
      <View style={styles.icon}>
          <Ionicons
            name={Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[Constants.ENTITY_TYPES.accomodations].iconName}
            size={13}
            style={styles.cornerIcon}
            color={Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[Constants.ENTITY_TYPES.accomodations].iconColor}
          />
      </View>
      <CustomText style={styles.categorySelectorBtnText}>{item.name}</CustomText>
    </TouchableOpacity>

  /* Renders the topmost component: a category list + map in our case */
  _renderTopComponent = () => {
    const { term, childUuids } = this._getCurrentTerm(true);
    const { coords, region, nearPois } = this.state;
    return (
      <ClusteredMapViewTop
        term={term}
        coords={coords}
        region={region}
        nearPois={nearPois}
        entityType={Constants.ENTITY_TYPES.accomodations}
        types={[Constants.NODE_TYPES.accomodations]}
        uuids={childUuids}
        style={{flex: 1}}
        categoriesMap={term}
        isAccomodationsMap
        mapRef={ref => (this._refs["ClusteredMapViewTop"] = ref)}
      />
    )

  }

  /* Renders the Header of the scrollable container */
  _renderListHeader = () => {
    const { nearPois, coords, sourceEntity } = this.state;
    const { nearToYou, nearTo, exploreAccomodation, explore } = this.props.locale.messages;
    const { term } = this._getCurrentTerm();

    let nearToText = nearToYou;
    // If we have a source entity it becomes near to "sourceEntity" title
    if (sourceEntity)
      nearToText = `${nearTo} ${_.get(sourceEntity.title, [this.props.locale.lan, 0, "value"], null)}`;

    const categoryTitle = term ? `${explore} ${term.name}` : exploreAccomodation;
      return (
        <View style={styles.listHeaderView}>
          <AsyncOperationStatusIndicator
            loading={true}
            success={nearPois && nearPois.length > 0}
            loadingLayout={<LLHorizontalItemsFlatlist horizontal={true} style={styles.listContainerHeader} title={nearToYou} titleStyle={styles.sectionTitle}/>}
          >
            <View>  
              <View style={styles.sectionTitleView}>
                <CustomText style={[styles.sectionTitle, {
                  fontSize: 16,
                }]}>{nearToText}</CustomText>
              </View>
              <FlatList
                horizontal={true}
                renderItem={({item}) => this._renderPoiListItem(item, null, true)}
                data={nearPois}
                extraData={this.props.locale}
                keyExtractor={item => item.uuid}
                onEndReachedThreshold={0.5} 
                onEndReached={() => this._fetchNearestPois(coords)}
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
          <View style={styles.sectionTitleView}>
            <CustomText style={[styles.sectionTitle, {
              fontSize: 20,
            }]}>{categoryTitle}</CustomText>
          </View>
        </View>
      )
  }
  /* Horizontal spacing for Header items */
  _renderHorizontalSeparator = () => <View style={{ width: 5, flex: 1 }}></View>;

  /* Renders a poi in Header */
  _renderPoiListItem = (item, index, horizontal) => {
    const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
    const termName = _.get(item, "term.name", "")
    return (
      <AccomodationItem 
        index={index}
        keyItem={item.nid}
        extraStyle={ horizontal ? {
          borderColor: Colors.lightGray,
          borderWidth: 1,
          marginBottom: 0
        } : {
          width: '100%',
          borderColor: Colors.lightGray,
          borderWidth: 1,
          marginLeft: 0
        }}
        horizontal={horizontal}
        sizeMargins={20}
        title={title}
        term={termName}
        stars={item.stars}
        onPress={() => this._openPoi(item)}
        location={item.location}
        distance={item.distanceStr}
      />
  )}

  /* Renders categories list */
  _renderCategoryListItem = (item, index, length) => {
    let marginBottom = (index + 1) == length ? 20 : 0;
    let marginTop = index == 0 ? 0 : 10;
    return(
      <CategoryListItem onPress={() => this._selectCategory(item)} image={item.image} title={item.name} style={{
        marginBottom,
        marginTop
      }}/>
    )
  }

  _renderFiltersList = () => {
    const { term = [] } = this._getCurrentTerm(true);
    /* Enable show last selected category, add _renderTopComponentCategorySelector(item, isLeaf)
    const lastTerm = this.props.others.placesTerms[this.props.others.placesTerms.length - 1];
    const data = term.length === 0 && lastTerm ? [lastTerm] : term;
    const isLeaf = data.length === 1;
    */
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
    const { pois, snapIndex } = this.state;
    const isPoiList = this._isPoiList();
    let data = [];
    let renderItem = null;
    let numColumns = 1; //One for categories, two for pois
    //if no more nested categories renders pois
    if (isPoiList) {
      data = pois;
      renderItem = ({ item, index }) => this._renderPoiListItem(item, index, false);
      // numColumns = 2;
    } else {
      //initially term is null so we get terms from redux, then term is populated with nested terms (categories) 
      data = term;
      renderItem = ({ item, index }) => this._renderCategoryListItem(item, index, data.length);
    }
    return (
      <ScrollableContainer 
        topComponent={this._renderTopComponent}
        extraComponent={this._renderFiltersList}
        ListHeaderComponent={this._renderListHeader}
        data={data}
        snapPoints={this.state.snapPoints}
        snapIndex={snapIndex}
        closeSnapIndex={1}
        initialSnapIndex={1}
        onEndReached={this._loadMorePois}
        numColumns={numColumns}
        renderItem={renderItem}
        keyExtractor={item => item.uuid}
      />
    )
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]} onLayout={this._onPageLayout}>
        <ConnectedHeader 
          onBackPress={this._backButtonPress}
          iconTintColor={Colors.colorAccomodationsScreen}  
        />
        {render && this._renderContent()}
      </View>
    )
  }
  
}


AccomodationsScreen.navigationOptions = {
  title: 'Accomodations',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  container: {
    backgroundColor: Colors.colorAccomodationsScreen,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    color: "black",
    fontFamily: "montserrat-bold",
    textAlign: "center"
  },
  listContainer: {
    backgroundColor: Colors.colorAccomodationsScreen,
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
    backgroundColor: Colors.colorAccomodationsScreen,
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
    backgroundColor: Colors.colorAccomodationsScreen,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8
  },
  listHeaderView: { 
    marginLeft: -10, 
    marginRight: -10, 
    minHeight: 36 + 160 + 10 + 36, //36 (text) + 160 (entityitem) + 10 (margin entityItem) + 36 (other text)
    maxHeight: 36 + 160 + 10 + 36 
  },
  sectionTitleView: {
    maxHeight: 36, 
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
  }
});


function AccomodationsScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <AccomodationsScreen 
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
    //favourites
    favourites: state.favouritesState,
    //graphql
    categories: state.categoriesState,
    accomodations: state.accomodationsState,
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
})(AccomodationsScreenContainer)