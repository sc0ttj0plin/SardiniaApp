import React, { Component } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  EntityRelatedList,
  AccomodationItem,
  AsyncOperationStatusIndicator, 
  ConnectedHeader, 
  CustomText
 } from "../../components";
import TouchableOpacity from "../../components/ScrollableContainerTouchableOpacity"
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import { greedyArrayFinder, getEntityInfo, getCoordinates, getSampleVideoIndex, getGalleryImages } from '../../helpers/utils';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { LLEntitiesFlatlist, LLHorizontalItemsFlatlist } from "../../components/loadingLayouts";

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
      favItineraries: [],
      favAccomodations: [],
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
    let accomodationsUuids = Object.keys(this.props.favourites.accomodations);

    // this._getPois(placesUuids);
    // this._getEvents(eventsUuids)
    // let eventsNids = Object.keys(this.props.favourites.events);
    // let inspirersNids = Object.keys(this.props.favourites.inspirers);
    this.props.actions.getPois({ uuids: placesUuids });
    this.props.actions.getEventsById({ uuids: eventsUuids });
    this.props.actions.getItinerariesById({ uuids: itinerariesUuids });
    this.props.actions.getInspirersById({ uuids: inspirersUuids });
    this.props.actions.getAccomodationsById({ uuids: accomodationsUuids });
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

    setTimeout(() => {
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
    
      if ((prevProps.accomodations !== this.props.accomodations) || (prevProps.favourites.accomodations !== this.props.favourites.accomodations)) {
        let favUuids = Object.keys(this.props.favourites.accomodations);
        this._getAccomodations(favUuids)
      }
    }, 1);
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
  _isSuccessData = () => {
    return ((!this.props.accomodations.loading || this.state.favAccomodations.loaded) &&
      (!this.props.events.eventsLoading || this.state.favEvents.loaded) &&
      (!this.props.pois.loading || this.state.favPlaces.loaded) &&
      (!this.props.inspirers.loading || this.state.favInspirers.loaded) && 
      (!this.props.itineraries.loading || this.state.favItineraries.loaded))
  }
  _isLoadingData  = () => true;    /* e.g. this.props.pois.loading; */
  _isErrorData    = () => null;    /* e.g. this.props.pois.error; */

  _getPois = (uuids) => {
    let pois = []
    uuids.map( uuid => {
      if(this.props.pois.data[uuid])
        pois.push(this.props.pois.data[uuid])
    })
    pois.loaded = true;
    if(pois.length != this.state.favPlaces.length)
      this.setState({ favPlaces: pois })
  }
  
  _getEvents = (uuids) => {
    let events = []
    uuids.map( uuid => {
      if(this.props.events.eventsById[uuid])
        events.push(this.props.events.eventsById[uuid])
    })
    events.loaded = true;
    if(events.length != this.state.favEvents.length)
      this.setState({ favEvents: events });
  }

  _getInspirers = (uuids) => {
    let inspirers = []
    uuids.map( uuid => {
      if(this.props.inspirers.dataById[uuid])
        inspirers.push(this.props.inspirers.dataById[uuid])
    })
    inspirers.loaded = true;
    if(inspirers.length != this.state.favInspirers.length)
      this.setState({ favInspirers: inspirers });
  }

  _getItineraries = (uuids) => {
    let itineraries = []
    uuids.map( uuid => {
      if(this.props.itineraries.dataById[uuid])
      itineraries.push(this.props.itineraries.dataById[uuid])
    })
    itineraries.loaded = true;
    if(itineraries.length != this.state.favItineraries.length)
      this.setState({ favItineraries: itineraries });
  }

  _getAccomodations = (uuids) => {
    let accomodations = []
    uuids.map( uuid => {
      if(this.props.accomodations.dataById[uuid])
        accomodations.push(this.props.accomodations.dataById[uuid])
    })
    accomodations.loaded = true;
    // console.log("places", accomodations.length)
    if(accomodations.length != this.state.favAccomodations.length)
      this.setState({ favAccomodations: accomodations })
  }

  
  
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

  _onShowListButtonPress = (list, title, type, isAccomodationsList) => {
    // console.log("ciao")
    this.props.navigation.navigate(Constants.NAVIGATION.NavFavouritesListScreen, { items: list, title, type, isAccomodationsList });
  }

  /********************* Render methods go down here *********************/

  _renderHorizontalSeparator = () => {
    return (
      <View style={{width: 5, flex: 1}}></View>
    )
  }

  _renderShowListButton = (list, title, type, isAccomodationsList) => {
    return(
      <View style={styles.showListButtonView}>
        <TouchableOpacity
          style={[styles.showListButton, {
            backgroundColor: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[type].backgroundColor,
          }]}
          activeOpacity={0.7}
          onPress={() => this._onShowListButtonPress(list, title, type, isAccomodationsList)}>
            <CustomText style={styles.showListButtonText}>Visualizza tutti</CustomText>
        </TouchableOpacity>
      </View>
    )
  }

  _renderList = (list, title, type) => {
    let renderItemFun = type == Constants.ENTITY_TYPES.accomodations ? this._renderAccomodationListItem : null;
    return (
      <View style={styles.listView}>
        <EntityRelatedList
          horizontal={false}
          data={list ? list.slice(0, Constants.FAVOURITES_MAX_ITEMS_IN_LIST) : []} 
          extraData={this.props.locale}
          keyExtractor={item => item.uuid.toString()}
          showsHorizontalScrollIndicator={false}
          locale={this.props.locale}
          numColumns={2}
          onPressItem={this._openItem}
          listType={type}
          listTitle={title}
          listTitleStyle={styles.sectionTitle}
          style={styles.list}
          sideMargins={10}
          disableSeparator
          renderListItem={renderItemFun}
        />
        {list.length > 6 && 
          this._renderShowListButton(list, title, type)
        }
      </View>
    )
  }

  _renderAccomodationListItem = (item, index, size) => {
    const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
    const termName = _.get(item, "term.name", "")
    return (
      <AccomodationItem 
        index={index}
        keyItem={item.nid}
        horizontal={false}
        sideMargins={10}
        title={title}
        term={termName}
        stars={item.stars}
        onPress={() => this._openItem(item, Constants.ENTITY_TYPES.accomodations)}
        location={item.location}
        distance={item.distanceStr}
        extraStyle={styles.accomodationListItem}
        size={size}
      />
  )}

  _renderNoFavourites = () => {
    const { noFavourites } = this.props.locale.messages;
    const { favPlaces, favInspirers, favItineraries, favEvents, favAccomodations } = this.state;
    if (favPlaces.length == 0 && favInspirers.length == 0 && favItineraries.length == 0 && favEvents.length == 0 && favAccomodations.length == 0)
      return <View style={styles.center}><CustomText style={styles.noFavouritesText}>{noFavourites}</CustomText></View>
    else 
      return null;
  }


  _renderContent = () => {
    const { favouritesPlaces, favouritesEvents, favouriteItineraries, favouritesInspirers, favouriteAccomodations } = this.props.locale.messages;
    const { favPlaces, favInspirers, favItineraries, favEvents, favAccomodations } = this.state;
    return (
      <ScrollView style={[styles.fill, styles.scrollview]}>
        {favPlaces.length > 0 && this._renderList(favPlaces, favouritesPlaces, Constants.ENTITY_TYPES.places)}
        {favInspirers.length > 0 && this._renderList(favInspirers, favouritesInspirers, Constants.ENTITY_TYPES.inspirers)}
        {favItineraries.length > 0 && this._renderList(favItineraries, favouriteItineraries, Constants.ENTITY_TYPES.itineraries)}
        {favEvents.length > 0 && this._renderList(favEvents, favouritesEvents, Constants.ENTITY_TYPES.events)}
        {favAccomodations.length > 0 && this._renderList(favAccomodations, favouriteAccomodations, Constants.ENTITY_TYPES.accomodations)}
      </ScrollView>
    )
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]} onLayout={this._onLayout}>
        <ConnectedHeader />
        <AsyncOperationStatusIndicator
          loading={this._isLoadingData()}
          success={this._isSuccessData()}
          error={this._isErrorData()}
          loadingLayout={<LLEntitiesFlatlist 
            numColumns={2}
            sideMargins={10} 
            horizontal={false} 
            style={[styles.fill, {paddingTop: 60, padding: 10}]}
            error={false}/>
            }>
            {this._renderNoFavourites()}
            {render && this._renderContent()}
        </AsyncOperationStatusIndicator>
        
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",

  },
  scrollview: {
  },
  header: {
    backgroundColor: "white"
  },
  container: {
    padding: 10,
  },
  listItemSeparator: {
    width: 10,
    height: 10
  },
  sectionTitle: {
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
    color: "#000000E6",
    backgroundColor: "#F2F2F2",
    fontSize: 15,
    fontFamily: "montserrat-bold",
    width: "100%"
  },
  listContainerHeader: {
  },
  list: {
    paddingTop: 20, 
    backgroundColor: "transparent",
    marginHorizontal: 10,
    height: "100%",
    paddingBottom: 20,
  },
  listStyle: {
    paddingTop: 10, 
    backgroundColor: "transparent",
    marginHorizontal: 10,
    height: "100%",
  },
  listView: {
    flex: 1,
  },
  showListButton: {
    width: 200,
    height: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  showListButtonText: {
    color: "white",
    fontSize: 15,
    fontFamily: "montserrat-bold",
    textTransform: "uppercase"
  },
  showListButtonView: {
    marginHorizontal: 20,
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  noFavouritesText: {
    alignSelf: 'center',
    fontSize: 20,
  },
  accomodationListItem: {
    backgroundColor: "rgb(250,250,250)"
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
    accomodations: state.accomodationsState,
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