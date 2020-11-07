import React, { Component } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
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
import { TouchableOpacity } from "react-native-gesture-handler"
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import { greedyArrayFinder, getEntityInfo, getCoordinates, getSampleVideoIndex, getGalleryImages } from '../../helpers/utils';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { LLEntitiesFlatlist } from "../../components/loadingLayouts";

/* Deferred rendering to speedup page inital load: 
   deferred rendering delays the rendering reducing the initial 
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;
class FavouritesScreen extends Component {

  constructor(props) {
    super(props);

    /* Get props from navigation */
    //let { someNavProps } = props.route.params; 

    this.state = {
      render: USE_DR ? false : true,
      //
      favPlaces: [],
      favInspirers: [],
      favEvents: [],
      favItineraries: []
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
    let placesUuids = Object.keys(this.props.favourites.places);
    let eventsUuids = Object.keys(this.props.favourites.events);
    let itinerariesUuids = Object.keys(this.props.favourites.itineraries);
    let inspirersUuids = Object.keys(this.props.favourites.inspirers);

    // this._getPois(placesUuids);
    // this._getEvents(eventsUuids)
    // let eventsNids = Object.keys(this.props.favourites.events);
    // let inspirersNids = Object.keys(this.props.favourites.inspirers);
    this.props.actions.getPois({ uuids: placesUuids });
    this.props.actions.getEventsById({ uuids: eventsUuids });
    this.props.actions.getItinerariesById({ uuids: itinerariesUuids });
    this.props.actions.getInspirersById({ uuids: inspirersUuids });

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
    if ((prevProps.pois !== this.props.pois) || (prevProps.favourites.places !== this.props.favourites.places)) {
      let favUuids = Object.keys(this.props.favourites.places);
      this._getPois(favUuids)
    }

    if ((prevProps.itineraries !== this.props.itineraries) || (prevProps.favourites.itineraries !== this.props.favourites.itineraries)) {
      let favUuids = Object.keys(this.props.favourites.itineraries);
      this._getItineraries(favUuids)
    }

    if ((prevProps.inspirers !== this.props.inspirers) || (prevProps.favourites.inspirers !== this.props.favourites.inspirers)) {
      let favUuids = Object.keys(this.props.favourites.inspirers);
      this._getInspirers(favUuids)
    }

    if ((prevProps.events.eventsById !== this.props.events.eventsById) || (prevProps.favourites.events !== this.props.favourites.events)) {
      let favUuids = Object.keys(this.props.favourites.events);
      this._getEvents(favUuids)
    }
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

  _getPois = (uuids) => {
    let pois = []
    uuids.map( uuid => {
      if(this.props.pois.data[uuid])
        pois.push(this.props.pois.data[uuid])
    })
    // console.log("places", pois.length)
    this.setState({
      favPlaces: pois
    })
  }
  
  _getEvents = (uuids) => {
    let events = []
    uuids.map( uuid => {
      if(this.props.events.eventsById[uuid])
        events.push(this.props.events.eventsById[uuid])
    })
    // console.log("events", events.length)
    this.setState({ favEvents: events });
  }

  _getInspirers = (uuids) => {
    let inspirers = []
    uuids.map( uuid => {
      if(this.props.inspirers.dataById[uuid])
        inspirers.push(this.props.inspirers.dataById[uuid])
    })
    console.log("inspirers", inspirers.length)
    this.setState({ favInspirers: inspirers });
  }

  _getItineraries = (uuids) => {
    let itineraries = []
    uuids.map( uuid => {
      if(this.props.itineraries.dataById[uuid])
      itineraries.push(this.props.itineraries.dataById[uuid])
    })
    // console.log("itineraries", itineraries.length)
    this.setState({ favItineraries: itineraries });
  }
  
  _openItem = (item, type) => {
    switch(type) {
      case Constants.ENTITY_TYPES.places:
        this.props.navigation.push(Constants.NAVIGATION.NavPlaceScreen, { item, mustFetch: true});
        break;
      case Constants.ENTITY_TYPES.events:
        this.props.navigation.push(Constants.NAVIGATION.NavEventScreen, { item, mustFetch: true });
        break;
      case Constants.ENTITY_TYPES.places.itineraries:
        this.props.navigation.push(Constants.NAVIGATION.NavItineraryScreen, { item, mustFetch: true })
        break;
      case Constants.ENTITY_TYPES.places.inspirers:
        this.props.navigation.push(Constants.NAVIGATION.NavInspirerScreen, { item, mustFetch: true })
        break;
      default:
        break;
    }
  } 

  _onShowListButtonPress = (list, title, type) => {
    // console.log("ciao")
    this.props.navigation.navigate(Constants.NAVIGATION.NavFavouritesListScreen, { items: list, title, type });
  }

  /********************* Render methods go down here *********************/

  _renderHorizontalSeparator = () => {
    return (
      <View style={{width: 5, flex: 1}}></View>
    )
  }

  _renderShowListButton = (list, title, type) => {
    return(
      <View style={styles.showListButtonView}>
        <TouchableOpacity
          style={[styles.showListButton, {
            backgroundColor: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[type].backgroundColor,
          }]}
          activeOpacity={0.7}
          onPress={() => this._onShowListButtonPress(list, title, type)}>
            <Text style={styles.showListButtonText}>Visualizza tutti</Text>
        </TouchableOpacity>
      </View>
    )
  }

  _renderList = (list, title, extraData, type) => {
    return (
      <View style={styles.listView}>
        <EntityRelatedList
          horizontal={false}
          data={list ? list.slice(0, Constants.FAVOURITES_MAX_ITEMS_IN_LIST) : []} 
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
        {list.length > 6 && 
          this._renderShowListButton(list, title, type)
        }
      </View>
    )
  }

  _renderContent = () => {
    const { favouritesPlaces, favouritesEvents, favouriteItineraries, favouritesInspirers } = this.props.locale.messages;
    return (
      <ScrollView style={[styles.fill, styles.scrollview]}>
        {this._renderList(this.state.favPlaces, favouritesPlaces, this.props.pois, Constants.ENTITY_TYPES.places)}
        {this._renderList(this.state.favInspirers, favouritesInspirers, this.props.inspirers, Constants.ENTITY_TYPES.inspirers)}
        {this._renderList(this.state.favItineraries, favouriteItineraries, this.props.itineraries, Constants.ENTITY_TYPES.itineraries)}
        {this._renderList(this.state.favEvents, favouritesEvents, this.props.eventsById, Constants.ENTITY_TYPES.events)}
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


FavouritesScreen.navigationOptions = {
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
  },
  showListButton: {
    width: 200,
    height: 60,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  showListButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    textTransform: "uppercase"
  },
  showListButtonView: {
    marginHorizontal: 20,
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20
  }
});


function FavouritesScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <FavouritesScreen 
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
})(FavouritesScreenContainer)