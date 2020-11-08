import React, { Component } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
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
  // EntityAbstract,
  // EntityDescription,
  // EntityGallery,
  // EntityHeader,
  EntityItem,
  // EventListItem,
  // EntityMap,
  EntityRelatedList,
  // EntityVirtualTour,
  // EntityWhyVisit,
  // TopMedia,
  AccomodationItem,
  AsyncOperationStatusIndicator, 
  // AsyncOperationStatusIndicatorPlaceholder,
  // Webview, 
  // ConnectedText, 
  ConnectedHeader, 
  // GeoRefHListItem
  // ImageGridItem, 
  // ConnectedLanguageList, 
  // BoxWithText,
  // ConnectedFab, 
  // PoiItem, 
  // PoiItemsList, 
  // ExtrasListItem, 
  // MapViewItinerary
 } from "../../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { LLHorizontalItemsFlatlist } from "../../components/loadingLayouts";

/* Deferred rendering to speedup page inital load: 
   deferred rendering delays the rendering reducing the initial 
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;
class FavouritesListScreen extends Component {

  constructor(props) {
    super(props);

    /* Get props from navigation */
    let { items, title, type, isAccomodationsList } = props.route.params; 

    this.state = {
      render: USE_DR ? false : true,
      //
      items: items || [],
      title: title || "",
      type: type || "",
      isAccomodationsList: isAccomodationsList || false
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * Use this function to perform data fetching
   * e.g. this.props.actions.getPois();
   */
  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
  }

  /**
   * Use this function to update state based on external props 
   * or to post-process data once it changes
   */
  componentDidUpdate(prevProps) {
    /**
     * Is the former props different from the newly propagated prop (redux)? perform some action
     * if(prevProps.xxx !== this.props.xxx)
     *  doStuff();
     */
    //Once pois are retrieved you filter only the favourites
  }

  /**
   * Use this function to unsubscribe or clear any event hooks
   */
  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  /**
   * If the reducer embeds a single data type then e.g. only pois:
   *    Data is stored in this.props.pois.data
   *    Success state is stored in this.props.pois.success
   *    Loading state is stored in this.props.pois.loading
   *    Error state is stored in this.props.pois.error
   * If the reducer embeds multiple data types then (e.g. search + autocomplete):
   *    Data is stored in this.props.searchAutocomplete.search
   *    Success state is stored in this.props.searchAutocomplete.searchSuccess
   *    Loading state is stored in this.props.searchAutocomplete.searchLoading
   *    Error state is stored in this.props.searchAutocomplete.searchError
   */
  _isSuccessData  = () => false;    /* e.g. this.props.pois.success; */
  _isLoadingData  = () => true;   /* e.g. this.props.pois.loading; */
  _isErrorData    = () => null;    /* e.g. this.props.pois.error; */
  
  _openItem = (item, type) => {
    switch(type) {
      case Constants.ENTITY_TYPES.places:
        this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, { item, mustFetch: true});
        break;
      case Constants.ENTITY_TYPES.events:
        this.props.navigation.navigate(Constants.NAVIGATION.NavEventScreen, { item, mustFetch: true });
        break;
      case Constants.ENTITY_TYPES.itineraries:
        this.props.navigation.navigate(Constants.NAVIGATION.NavItineraryScreen, { item, mustFetch: true })
        break;
      case Constants.ENTITY_TYPES.inspirers:
        this.props.navigation.navigate(Constants.NAVIGATION.NavInspirerScreen, { item, mustFetch: true })
        break;
      case Constants.ENTITY_TYPES.accomodations:
        this.props.navigation.navigate(Constants.NAVIGATION.NavAccomodationScreen, { item, mustFetch: true })
        break;
      default:
        break;
    }
  } 
  /********************* Render methods go down here *********************/

  _renderHorizontalSeparator = () => {
    return (
      <View style={{width: 5, flex: 1}}></View>
    )
  }

  _renderList = (list, title, type) => {
    return (
      <View style={styles.listView}>
        <EntityRelatedList
          horizontal={false}
          data={list ? list : []} 
          extraData={this.props.locale}
          keyExtractor={item => item.uuid.toString()}
          contentContainerStyle={styles.listContainerHeader}
          showsHorizontalScrollIndicator={false}
          locale={this.props.locale}
          numColumns={2}
          onPressItem={this._openItem}
          listType={type}
          listTitle={title}
          listTitleStyle={styles.sectionTitle}
          style={styles.list}
          sideMargins={20}
        />
      </View>
    )
  }


  _renderAccomodationListItem = (item, index, horizontal) => {
    const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
    const termName = _.get(item, "term.name", "")
    return (
      <AccomodationItem 
        index={index}
        keyItem={item.nid}
        horizontal={horizontal}
        sizeMargins={20}
        title={title}
        term={termName}
        stars={item.stars}
        onPress={() => this._openItem(item, Constants.ENTITY_TYPES.accomodations)}
        location={item.location}
        distance={item.distanceStr}
      />
  )}

  _renderAccomodationsList = (list, title, type) => {
    return (
    <View>
      <AsyncOperationStatusIndicator
        loading={true}
        success={list && list.length > 0}
        loadingLayout={<LLHorizontalItemsFlatlist horizontal={false} style={styles.listContainerHeader} title={title} titleStyle={styles.sectionTitle}/>}
      >
        <View style={styles.listView}>  
          <Text style={styles.sectionTitle}>{title}</Text>
          <FlatList
            style={styles.list}
            horizontal={false}
            numColumns={2}
            renderItem={({item, index}) => this._renderAccomodationListItem(item, index, false)}
            data={list}
            extraData={this.props.locale}
            keyExtractor={item => item.uuid}
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
    );
  }

  _renderContent = () => {
    const { favouritesPlaces, favouritesEvents, favouriteItineraries } = this.props.locale.messages;
    const { items, title, type, isAccomodationsList } = this.state;

    return (
      <ScrollView style={[styles.fill, styles.scrollview]}>
        {!isAccomodationsList && this._renderList(items, title, type)}
        {isAccomodationsList && this._renderAccomodationsList(items, title, type)}
      </ScrollView>
    )
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        <ConnectedHeader />
        {render && this._renderContent()}
      </View>
    )
  }
  
}


FavouritesListScreen.navigationOptions = {
  title: 'Boilerplate',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column"
  },
  scrollview: {
  },
  header: {
    backgroundColor: "white"
  },
  container: {
    padding: 10,
  },
  sectionTitle: {
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
    color: "#000000E6",
    backgroundColor: "#F2F2F2",
    marginBottom: 16,
    height: 40,
    fontSize: 15,
    fontWeight: "bold"
  },
  listContainerHeader: {
  },
  list: {
    marginBottom: 10,
    width: "100%",
    paddingHorizontal: 20
  },
  listView: {
    width: "100%",
  }
});


function FavouritesListScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <FavouritesListScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    restState: state.restState,
    //mixed state
    others: state.othersState,
    //language
    locale: state.localeState,
    //favourites
    favourites: state.favouritesState,
    //graphql
    events: state.eventsState,
    inspirers: state.inspirersState,
    itineraries: state.itinerariesState,
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
})(FavouritesListScreenContainer)