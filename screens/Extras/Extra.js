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
  // EntityAbstract,
  // EntityDescription,
  // EntityGallery,
  EntityAbstract,
  EntityDescription,
  EntityGallery,
  EntityHeader,
  EntityItem,
  EventListItem,
  EntityMap,
  EntityRelatedList,
  EntityVirtualTour,
  EntityWhyVisit,
  EntityAccomodations,
  TopMedia,
  AsyncOperationStatusIndicator, 
  // AsyncOperationStatusIndicatorPlaceholder,
  // Webview, 
  // ConnectedText, 
  ConnectedHeader, 
  // ImageGridItem, 
  // ConnectedLanguageList, 
  // BoxWithText,
  ConnectedFab, 
  // PoiItem, 
  // PoiItemsList, 
  // ExtrasListItem, 
  // MapViewItinerary
 } from "../../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { greedyArrayFinder, getEntityInfo, getCoordinates, getSampleVideoIndex, getGalleryImages } from '../../helpers/utils';
import Layout from '../../constants/Layout';
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
class ExtraScreen extends Component {

  constructor(props) {
    super(props);

    /* Get props from navigation */
    let { item } = props.route.params; 

    this.state = {
      render: USE_DR ? false : true,
      //
      entity: item,
      relatedPlaces: [], 
      relatedItineraries: [], 
      relatedEvents: []
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
    this._parseEntity(this.state.entity);
    this._fetchRelatedNodes();
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
  }

  /**
   * Use this function to unsubscribe or clear any event hooks
   */
  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _fetchRelatedNodes = async () => {
    try {
      const relatedPlaces = await apolloQuery(actions.getNodes({ type: Constants.NODE_TYPES.places, offset: Math.ceil(Math.random()*100), limit: 5}))
      const relatedItineraries = await apolloQuery(actions.getNodes({ type: Constants.NODE_TYPES.itineraries, offset: Math.ceil(Math.random()*100), limit: 5}))
      const relatedEvents = await apolloQuery(actions.getNodes({ type: Constants.NODE_TYPES.events, offset: Math.ceil(Math.random()*100), limit: 5}))
      this.setState({ relatedPlaces, relatedItineraries, relatedEvents });
    } catch(error){
      console.log(error)
    }
  }

  _parseEntity = (entity) => {
    const { locale } = this.props;
    const { lan } = locale;
    const { abstract, title, description, whyVisit } = getEntityInfo(entity, ["abstract", "title", "description", "whyVisit"], [lan, 0, "value"]);
    const socialUrl = `${Constants.WEBSITE_URL}${greedyArrayFinder(entity.url_alias, "language", lan, "alias", "")}`;
    const sampleVideoUrl = getSampleVideoIndex(entity.nid);
    const gallery = getGalleryImages(entity);
    this.setState({ entity, abstract,  title,  description,  whyVisit,  socialUrl, sampleVideoUrl, gallery });
  }

  _openRelatedEntity = (item) => {
    var type = item.type;
    switch(type) {
      case Constants.NODE_TYPES.places:
        this.props.navigation.push(Constants.NAVIGATION.NavPlaceScreen, { item });
        break;
      case Constants.NODE_TYPES.events:
        this.props.navigation.navigate(Constants.NAVIGATION.NavEventScreen, { item });
        break;
      case Constants.NODE_TYPES.itineraries:
        this.props.navigation.navigate(Constants.NAVIGATION.NavItineraryScreen, { item })
        break;
      case Constants.NODE_TYPES.inspirers:
        this.props.navigation.navigate(Constants.NAVIGATION.NavInspirerScreen, { item })
        break;
      default:
        break;
    }
  }

  _isSuccessData  = () => false;    /* e.g. this.props.pois.success; */
  _isLoadingData  = () => true;   /* e.g. this.props.pois.loading; */
  _isErrorData    = () => null;    /* e.g. this.props.pois.error; */


  /********************* Render methods go down here *********************/
  

  _renderRelatedList = (title, relatedList, listType) => {
    return (
      <EntityRelatedList
        horizontal={true}
        data={relatedList ? relatedList : []} 
        extraData={this.props.locale}
        keyExtractor={item => item.nid.toString()}
        contentContainerStyle={styles.listContainerHeader}
        showsHorizontalScrollIndicator={false}
        locale={this.props.locale}
        onPressItem={this._openRelatedEntity}
        listType={listType}
        listTitle={title}
        listTitleStyle={styles.sectionTitle}
      />
    )
  }

  _renderFab = (nid, title, coordinates, shareLink) => {
    return (
      <View style={styles.fab}>
        <ConnectedFab 
          color={Colors.black}
          nid={nid}
          title={title}
          coordinates={coordinates} 
          shareLink={shareLink}
          direction="down"
        /> 
      </View>
    )
  }

  _renderContent = () => {
    const { uuid, entity, abstract, title, description, whyVisit, coordinates, socialUrl, sampleVideoUrl, gallery } = this.state;
    const { relatedPlaces, relatedItineraries, relatedEvents } = this.state;
    const { locale, pois, favourites, } = this.props;
    const { lan } = locale;
    const { 
      whyVisit: whyVisitTitle, 
      discoverMore, 
      gallery: galleryTitle, 
      description: descriptionTitle,
      canBeOfInterest,
    } = locale.messages;
    
    const { orientation } = this.state;
    const isFavourite = favourites.places[uuid];
     return (
      <View style={styles.fill}>
        <ScrollView style={styles.fill}>
          <TopMedia urlVideo={sampleVideoUrl} urlImage={entity.image} />
          {this._renderFab(entity.nid, title, coordinates, socialUrl)}   
          <View style={[styles.headerContainer]}> 
            <EntityHeader title={title} borderColor={Colors.black}/>
          </View>
          <View style={[styles.container]}>
            <EntityAbstract abstract={abstract}/>
            <View style={styles.virtualLink}>
              <Text>3D IMAGE LINK HERE</Text>
            </View>
            <EntityGallery images={gallery} title={galleryTitle}/>
            <View style={styles.separator}/>
            {this._renderRelatedList(canBeOfInterest, relatedPlaces, Constants.ENTITY_TYPES.places)}
            {this._renderRelatedList("", relatedItineraries, Constants.ENTITY_TYPES.itineraries)}
            {this._renderRelatedList("", relatedEvents, Constants.ENTITY_TYPES.events)}
          </View>
        </ScrollView>
      </View>
     )
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        <ConnectedHeader iconTintColor="#24467C" />
        {render && this._renderContent()}
      </View>
    )
  }
  
}


ExtraScreen.navigationOptions = {
  title: 'Extra',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  header: {
    backgroundColor: "white"
  },
  fab: {
    position: "absolute",
    zIndex: 1,
    top: 25,
    right: 20,
    height: 50,
    width: 50
  },
  container: {
    padding: 10,
    marginBottom: 30
  },
  headerContainer: {
    padding: 10,
    backgroundColor: "white",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 30, 
    marginTop: -30
  },
  container: { 
    backgroundColor: "white",
    textAlign: "center"
  },
  sectionTitle: {
    flex: 1,
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
    color: "#000000E6",
    fontWeight: "bold"
  },
  listContainerHeader: {
    paddingLeft: 10,
  },
  separator: {
    width: "100%",
    height: 8,
    backgroundColor: "#F2F2F2",
    marginVertical: 32
  },
  virtualLink: {
    flex: 1, 
    height: 200, 
    marginTop: 10, 
    marginBottom: 10, 
    backgroundColor: Colors.greyTransparent, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
});


function ExtraScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <ExtraScreen 
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
})(ExtraScreenContainer)