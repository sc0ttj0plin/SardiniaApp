import React, { Component } from "react";
import { 
  View, Text, ActivityIndicator, 
  StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler"

import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  CategoryListItem, 
  ConnectedHeader, 
  AccomodationItem,
  SectionTitle,
 } from "../../components";
import ConnectedMapScrollable from "../../components/ConnectedMapScrollable"
import { coordsInBound, regionToPoligon, regionDiagonalKm } from '../../helpers/maps';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';

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
      isNearEntitiesLoading: false,
      coords: {},
      region: region || Constants.MAP.defaultRegion,
      sourceEntity,
      sourceEntityCoordinates,
      //
      snapPoints: null,
      // loading
      isEntitiesLoading: false, /* entities scrollable */
      isNearEntitiesLoading: false, /* near entities in modal */
      isCMVTLoading: true, /* clustered map view top loading  */
      animateToMyLocation: sourceEntityCoordinates ? false : true
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
    if ( this.props.others.geolocation.coords) {
      this._onUpdateCoords(this.props.others.geolocation.coords);
    }
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
      this.setState({isEntitiesLoading: false});
      this._loadMorePois();
    }

    // NEW-GEO
    if (prevProps.others.geolocation !== this.props.others.geolocation && this.props.others.geolocation.coords) {
      // { coords: { latitude, longitude }, altitude, accuracy, altitudeAccuracy, heading, speed, timestamp (ms since epoch) }
      this._onUpdateCoords(this.props.others.geolocation.coords);
    }
  }

  
  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _isSuccessData  = () => this.props.categories.success;
  _isLoadingData  = () => this.props.categories.loading || this.state.isCMVTLoading || this.state.isEntitiesLoading || this.state.isNearEntitiesLoading;
  _isErrorData    = () => this.props.categories.error;  

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
        this.setState({ isCordsInBound, coords: newCoords, isNearEntitiesLoading: true });
        this._fetchNearestPois(newCoords).then(() => {
          this.setState({ isNearEntitiesLoading: false });
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
      console.log(pois.length);
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
    const { isEntitiesLoading, pois: statePois, coords, sourceEntity } = this.state;
    let _coords = coords;
    if (sourceEntity)
      _coords = this.state.sourceEntityCoordinates;

    if(_coords && this._isPoiList() && !isEntitiesLoading){
      this.setState({
        isEntitiesLoading: true
      }, () => {
        apolloQuery(actions.getNearestAccomodations({
          limit: Constants.PAGINATION.accomodationsLimit,
          offset: statePois ? statePois.length : 0,
          x: _coords.longitude,
          y: _coords.latitude,
          uuids: childUuids
        })).then((pois) => {
          if (pois && pois.length > 0)
            this.setState({ pois: [...statePois, ...pois], isEntitiesLoading: false });
          else 
            this.setState({ isEntitiesLoading: false });
        }).catch(e => {
          this.setState({ isEntitiesLoading: false });
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
  }; 

  /********************* Render methods go down here *********************/

  _renderHeaderText = () => {
    const { exploreAccomodation, explore } = this.props.locale.messages;
    const { term } = this._getCurrentTerm();

      const categoryTitle = term ? `${explore} ${term.name}` : exploreAccomodation;
      return (
        <SectionTitle text={categoryTitle} numberOfLines={1} textStyle={{ fontSize: 20 }} style={{ marginBottom: 15 }} />
      )
  }

  /* Renders an entity in Header (horizontal=true) and inside the Scrollable (horizontal=false) */
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
          marginBottom: 0,
          marginRight: 10
        } : {
          width: '100%',
          borderColor: Colors.lightGray,
          borderWidth: 1,
          marginLeft: 0,
          marginBottom: 10
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

  /* Render content */
  _renderContent = () => {
    const { term, childUuids } = this._getCurrentTerm(true);
    const { nearToYou } = this.props.locale.messages;
    const { pois, snapIndex, coords, region, nearPois  } = this.state;
    const isPoiList = this._isPoiList();
    let scrollableData = [];
    let renderScrollableListItem = null;
    //if no more nested categories renders pois
    if (isPoiList) {
      scrollableData = pois;
      renderScrollableListItem = ({ item, index }) => this._renderPoiListItem(item, index);
    } else {
      //initially term is null so we get terms from redux, then term is populated with nested terms (categories) 
      scrollableData = term;
      renderScrollableListItem = ({ item, index }) => this._renderCategoryListItem(item, index, scrollableData.length);
    }

    const entitiesType = Constants.ENTITY_TYPES.accomodations;

    const scrollableProps = {
      show: true,
      data: scrollableData,
      scrollableTopComponentIsLoading: this._isLoadingData(),
      onEndReached: this._loadMorePois,
      renderItem: renderScrollableListItem,
      keyExtractor: item => item.uuid,
    }

    // ClusteredMapViewTopProps (CMVT)
    const CMVTProps = { 
      term, 
      coords, 
      region,
      types: [Constants.NODE_TYPES.accomodations],
      childUuids,
      isLoadingCb: (isLoading) => this.setState({ isCMVTLoading: isLoading }),
      animateToMyLocation: this.state.animateToMyLocation
    };

    const extraComponentProps = {
      data: term,
      keyExtractor: item => item.uuid,
      onPress: this._selectCategory,
      iconProps: { 
        name: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entitiesType].iconName,
        backgroundColor: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entitiesType].backgroundColor,
        color: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entitiesType].iconColor,
      }
    }

    const mapEntityWidgetProps = { 
      isAccomodationItem: true, 
      coords: this.state.coords 
    };

    const extraModalProps = {
      data: nearPois,
      keyExtractor: item => item.uuid,
      renderItem: ({ item }) => this._renderPoiListItem(item, null, true),
      title: nearToYou,
      onEndReached: () => this._fetchNearestPois(coords),
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
        topComponentType="ClusteredMapViewTop" //or MapView or Custom (if Custom must implement topComponentRender)
        topComponentCMVTProps={CMVTProps}
        
        // Map entity widget (in modal): if renderMapEntityWidget is undefined, must specify mapEntityWidgetProps and mapEntityWidgetOnPress 
        // e.g. this.state.selectedEntity can now be used in renderMapEntityWidget
        // mapEntityWidgetOnPress={(entity) => this.setState({ selectedEntity: entity })} 
        // renderMapEntityWidget={this._renderEntityWidget}
        mapEntityWidgetProps={mapEntityWidgetProps}

        // Extra modal content: if renderExtraModalComponent is undefined, must specify mapEntityWidgetProps
        // renderExtraModalComponent={this._renderNearToYou}
        extraModalProps={extraModalProps}

        fullscreen={true}

        onBackPress={this._backButtonPress}
      />
    )
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]} onLayout={this._onPageLayout}>
        <ConnectedHeader onBackPress={this._backButtonPress} iconTintColor={Colors.colorAccomodationsScreen} />
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
    minHeight: 36 + 160 + 10 + 36 + 15, //36 (text) + 160 (entityitem) + 10 (margin entityItem) + 36 (other text)
    maxHeight: 36 + 160 + 10 + 36 + 15 
  },
  sectionTitleView: {
    maxHeight: 36, 
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  //Pane Handle
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: 20,
    paddingBottom: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 32
  },
  panelHandle: {
    width: 32,
    height: 4,
    backgroundColor: Colors.grayHandle,
    borderRadius: 2,
  },
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