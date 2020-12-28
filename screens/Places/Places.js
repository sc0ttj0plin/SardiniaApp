import React, { PureComponent } from "react";
import { 
  View, Text, ActivityIndicator, Pressable,
  StyleSheet, BackHandler, Platform, ScrollView, NativeModules, Easing, PixelRatio } from "react-native";

import { FlatList, TouchableOpacity } from "react-native-gesture-handler"
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import { 
  CategoryListItem, 
  AsyncOperationStatusIndicator, 
  ClusteredMapViewTop,
  ConnectedHeader, 
  ScrollableContainer,
  EntityItem,
  ConnectedAuthHandler,
  CustomText,
  SectionTitle,
  UpdateHandler
 } from "../../components";
import { coordsInBound, regionToPoligon, regionDiagonalKm } from '../../helpers/maps';
import MapView from "react-native-map-clustering";
import ScrollableAnimatedHandle from '../../components/ScrollableAnimatedHandle';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import { apolloQuery } from '../../apollo/queries';
import _, { set } from 'lodash';
import Layout from '../../constants/Layout';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { LLHorizontalItemsFlatlist } from "../../components/loadingLayouts";
import { Button } from "react-native-paper";
import { Ionicons } from '@expo/vector-icons';
const { Value, event, interpolate } = Animated;
import {Modalize} from 'react-native-modalize';
import BottomSheet from 'reanimated-bottom-sheet';
import EntityWidgetInModal from "../../components/EntityWidgetInModal";
import * as Location from 'expo-location';

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
const MODAL_STATES = {EXPLORE: 'EXPLORE', NEARPOIS: 'NEARPOIS', SELECTEDENTITY: 'SELECTEDENTITY'}

class PlacesScreen extends PureComponent {

  constructor(props) {
    super(props);

    this._watchID = null; /* navigation watch hook */
    this._onFocus = null;
    this._refs = {};
    this._modalState;
    this._fontScale = PixelRatio.getFontScale();

    this.state = {
      render: USE_DR ? false : true,
      pois: [],
      nearPois: [],
      nearPoisRefreshing: false,
      coords: {},
      region: Constants.MAP.defaultRegion,
      currentTerm: null,
      scrollableSnap: 1,
      //
      snapPoints: [],
    };
      
    this._pageLayoutHeight = Layout.window.height;
    this._filterList = null;
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * On mount load categories and start listening for user's location
   */
  async componentDidMount() {
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    //If it's the first mount gets pois categories ("art and archeology...")
    this.props.actions.getCategories({ vid: Constants.VIDS.poisCategories });
  }

  /**
   * Update component based on prev props
   * @param {*} prevProps
   */
  componentDidUpdate(prevProps) {
    // If currently selected categories (terms) differ from the previous ones fetch other pois for those categories
    if(prevProps.others.placesTerms !== this.props.others.placesTerms) {
      /* update also the header pois based on current cat */
      // this.setState({ nearPois: [] }, () => this._fetchNearestPois(this.state.coords)); 
      this.setState({poisRefreshing: false});
      this._loadMorePois();
    }

    if (prevProps.others.geolocation !== this.props.others.geolocation && this.props.others.geolocation.coords) {
      // { coords: { latitude, longitude }, altitude, accuracy, altitudeAccuracy, heading, speed, timestamp (ms since epoch) }
      this._onUpdateCoords(this.props.others.geolocation.coords);
    }
  }


  /********************* Non React.[Component|PureComponent] methods go down here *********************/

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
    if(this._isPoiList())
      this._loadMorePois();
  }

  /**
   * Loads pois that are near "coords" and sets nearPois on state
   * uuids controls the category of the pois
   * @param {*} coords: the coordinates for which to load new pois
   */
  _fetchNearestPois = (coords) => {
    const { nearPois } = this.state;
    return apolloQuery(actions.getNearestPois({
      limit: Constants.PAGINATION.poisLimit,
      x: coords.longitude,
      y: coords.latitude,
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
    if(this._filterList)
      this._filterList.scrollToOffset({ animated: false, offset: 0 })
    const { region, coords } = this.state;
    // console.log(item)
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
    this.setState({ pois: [] });
    this.props.actions.popCurrentCategoryPlaces();
    this.props.actions.setCurrentMapEntity(undefined);
  }

  /**
   * Used to compute snap points
   * @param {*} event layout event
   */
  _onPageLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    this._pageLayoutHeight = height;
    //height of parent - Constants.COMPONENTS.header.height (header) - Constants.COMPONENTS.header.bottomLineHeight (color under header) - 24 (handle) - 36 (header text) - 160 (entityItem) - 10 (margin of entityItem) - 36 (whereToGo text)
    this.setState({ snapPoints: [height -  Layout.statusbarHeight - Constants.COMPONENTS.header.height - Constants.COMPONENTS.header.bottomLineHeight, 72 * this._fontScale, 0] });
  }; 


  _onSettleIndex = (index) => {
    //Set global snap index for the current entityType
    this.setState({
      snapIndex: index
    })
  }

  _onMapRegionChanged = () => {

  }

  _onSelectedEntity = (entity) => {
    this.setState({selectedCluster: entity});
    if(entity) {
      this._setModalState(MODAL_STATES.SELECTEDENTITY);
    } else {
      if(this._modalState == MODAL_STATES.SELECTEDENTITY)
        this._setModalState(MODAL_STATES.EXPLORE);
    }
  }

  _setModalState = (state) => {
    this._modalState = state;

    if(state == MODAL_STATES.EXPLORE) {
      this.setState({scrollableSnap: 1});
      this._refs["nearPoisModalRef"].close(); this._refs["nearPoisModalRef"].close();
      this._refs["selectedEntityModalRef"].close(); this._refs["selectedEntityModalRef"].close();
    }
    else if(state == MODAL_STATES.NEARPOIS) {
      this.setState({scrollableSnap: 2}, () => {
        this._openModal(this._refs["selectedEntityModalRef"], false);
        this._openModal(this._refs["nearPoisModalRef"], true);
      });
    }
    else if(state == MODAL_STATES.SELECTEDENTITY) {
      this.setState({scrollableSnap: 2}, () => {
        this._openModal(this._refs["selectedEntityModalRef"], true);
        this._openModal(this._refs["nearPoisModalRef"], false);
      });
    }
  }

  _showNearPoisWidget = () => {
    this._setModalState(MODAL_STATES.NEARPOIS);
  }

  _onScrollableClosed = () => {
    if(this._modalState == MODAL_STATES.EXPLORE) {
      this.setState({scrollableSnap: 1});
    }
  }

  _openModal = (ref, state) => {
    if(state) {
      if (ref){
        ref.open();
        ref.open();
      }
    } else {
      if(ref)
          ref.close();
    }
  }



  _onNearPoisModalClosed = () => {
    if(this._modalState == MODAL_STATES.NEARPOIS) {
      this._setModalState(MODAL_STATES.EXPLORE);
    }
  }

  _onSelectedEntityModalClosed = () => {
    if(this._modalState == MODAL_STATES.SELECTEDENTITY) {
      this._setModalState(MODAL_STATES.EXPLORE);
    }
  }

  /********************* Render methods go down here *********************/

  /**
   * Render single poi on bottom of mapview on press (outside scrollableContainer)
   */
  _renderEntityWidget = () => {
    return (
      <EntityWidgetInModal
          locale={this.props.locale} 
          isAccomodationItem={false} 
          cluster={this.state.selectedCluster} 
          coords={this.state.coords}
        />
    )
  }

  _renderHeaderText = () => {
    const { whereToGo, explore } = this.props.locale.messages;
    const { term } = this._getCurrentTerm();
    const categoryTitle = term ? `${explore} ${term.name}` : whereToGo;
    return (
    <SectionTitle text={categoryTitle} textStyle={{ fontSize: 20 }} style={{ paddingBottom: 15 }}/>
    );
  }

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
        entityType={Constants.ENTITY_TYPES.places}
        types={[Constants.NODE_TYPES.places]}
        uuids={childUuids}
        style={{flex: 1}}
        mapRef={ref => (this._refs["ClusteredMapViewTop"] = ref)}
        onSelectedEntity={this._onSelectedEntity}
        goToMyLocationPressed={this._showNearPoisWidget}
        onMapRegionChanged={this._onMapRegionChanged}
        paddingBottom={this.state.snapPoints[1]}
      />
    )

  }

  /* Renders the Header of the scrollable container */
  _renderNearToYou = () => {
    const { nearPois, coords } = this.state;
    const { nearToYou, whatToSee } = this.props.locale.messages;
    const { term } = this._getCurrentTerm();
      return (
          <View style={styles.listNearPoisView}>
            <AsyncOperationStatusIndicator
              loading={true}
              success={nearPois && nearPois.length > 0}

              loadingLayout={<LLHorizontalItemsFlatlist horizontal={true} contentContainerStyle={styles.listContainerHeader} title={nearToYou} titleStyle={styles.sectionTitle}/>}
            >
              <View>  
                <SectionTitle text={nearToYou} />
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
          </View>
      )
  }

  /* Horizontal spacing for Header items */
  _renderHorizontalSeparator = () => <View style={{ width: 10, flex: 1 }}></View>;

  /* Renders a poi in Header: index */
  _renderPoiListItem = (item, index, horizontal) => {
    const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
    const termName = _.get(item, "term.name", "");
    return (
      <EntityItem 
        index={index}
        keyItem={item.nid}
        extraStyle={ horizontal ? {
          marginBottom: 0
        } : {width: '100%'}}
        backgroundTopLeftCorner={"white"}
        iconColor={Colors.colorPlacesScreen}
        listType={Constants.ENTITY_TYPES.places}
        onPress={() => this._openPoi(item)}
        title={title}
        subtitle={termName}
        image={item.image}
        distance={this.state.isCordsInBound ? item.distanceStr : ""}
        horizontal={horizontal}
        sideMargins={20}
        topSpace={10}
      />
  )}

  /* Renders categories list */
  _renderCategoryListItem = (item, index, length) => {
    return(
      <CategoryListItem onPress={() => this._selectCategory(item)} image={item.image} title={item.name}/>
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
        ref={(ref)=>this._filterList = ref}
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
    // const { scrollableSnapIndex } = this.props.others;
    // const showExtraComponent = scrollableSnapIndex[Constants.ENTITY_TYPES.places];
    const isPoiList = this._isPoiList();
    let data = [];
    let renderItem = null;
    let numColumns = 1; //One for categories, two for pois
    //if no more nested categories renders pois
    if (isPoiList) {
      data = pois;
      renderItem = ({ item, index }) => this._renderPoiListItem(item, index);
      // numColumns = 2;
    } else {
      //initially term is null so we get terms from redux, then term is populated with nested terms (categories) 
      data = term;
      renderItem = ({ item, index }) => this._renderCategoryListItem(item, index, data.length);
    }


    /** 
     * NOTE: changing numColums on the fly isn't supported and causes the component to unmount, 
     * thus slowing down the process
     * set a key to the inner flatlist therefore 
    */
    return (
      <ScrollableContainer 
        entityType={Constants.ENTITY_TYPES.places}
        topComponent={this._renderTopComponent}
        extraComponent={this._renderFiltersList}
        pageLayoutHeight={this._pageLayoutHeight}
        data={data}
        snapPoints={this.state.snapPoints}
        initialSnapIndex={1}
        closeSnapIndex={1}
        onEndReached={this._loadMorePois}
        numColumns={numColumns}
        renderItem={renderItem}
        keyExtractor={item => item.uuid}
        onSettleIndex={this._onSettleIndex}
        HeaderTextComponent={this._renderHeaderText}
        ref={(ref) => this._refs["ScrollableContainer"] = ref}
        snapTo={this.state.scrollableSnap}
        onCloseEnd={this._onScrollableClosed}
        isClosable={this.state.scrollableSnap!=1}
      />
    )
  }


  render() {
    const { render } = this.state;
    const { updateInProgressText, updateFinishedText } = this.props.locale.messages;
    
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]} onLayout={this._onPageLayout}>
        <ConnectedHeader 
          onBackPress={this._backButtonPress}
          iconTintColor={Colors.colorPlacesScreen}  
          backButtonVisible={this.props.others.placesTerms.length > 0}
        />
        <UpdateHandler updateInProgressText={updateInProgressText} updateFinishedText={updateFinishedText} />
        <ConnectedAuthHandler loginOptional={true} />
        {render && this._renderContent()}
        <Modalize 
          ref={(ref) => this._refs["selectedEntityModalRef"] = ref}
          adjustToContentHeight={true}
          withOverlay={false}
          modalStyle={styles.modal}
          closeAnimationConfig={{timing: { duration: 800, easing: Easing.ease }} }
          onClosed={this._onSelectedEntityModalClosed}
          velocity={1000}
          >
          {this._renderEntityWidget()}
        </Modalize>
          
        <Modalize 
          ref={(ref) => this._refs["nearPoisModalRef"] = ref}
          adjustToContentHeight={true}
          withOverlay={false}
          modalStyle={styles.modal}
          closeAnimationConfig={{timing: { duration: 800, easing: Easing.ease }} }
          onClosed={this._onNearPoisModalClosed}
          velocity={1000}
          >
          {this._renderNearToYou()}
        </Modalize>
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
  },
  listNearPoisView: {
    marginBottom: 10
  },
  modal: {
    borderTopRightRadius: 16, borderTopLeftRadius: 16
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