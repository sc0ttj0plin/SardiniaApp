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
import { greedyArrayFinder, getEntityInfo, getCoordinates, getSampleVideoIndex, getGalleryImages } from '../../helpers/utils';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { boundingRect } from '../../helpers/maps';
import { LLEntitiesFlatlist } from "../../components/loadingLayouts";


const USE_DR = false;
class PlaceScreen extends Component {

  constructor(props) {
    super(props);

    const { uuid } = props.route.params.item;
    const { mustFetch } = props.route.params; /* no effect since place fetches anyway */

    /* Get props from navigation */
    this.state = {
      render: USE_DR ? false : true,
      //entity initial state
      uuid,
      mustFetch,
      entity: { term: {} },
      abstract: null, 
      title: null, 
      description: null, 
      whyVisit: null, 
      coordinates: null, 
      socialUrl: null, 
      sampleVideoUrl: null,
      gallery: [],
      relatedEntities: [],
      nearAccomodations: []
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  async componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    this.props.actions.getPoi({ uuid: this.state.uuid });
  }

  /* NOTE: since this screen is not */
  componentDidUpdate(prevProps) {
    const { uuid } = this.state;
    if (prevProps.pois.data !== this.props.pois.data) {
      this._parseEntity(this.props.pois.data[uuid]);
    }
  }
  
  componentWillUnmount() {

  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/
  _fetchNearNodes = async () => {
    const { coordinates } = this.state;
    if (coordinates)
      try {
        const relatedEntities = await apolloQuery(actions.getNearestNodesByType({ 
          type: Constants.NODE_TYPES.places, 
          limit: Constants.PAGINATION.poisAccomodationsLimit,
          offset: 0,
          x: coordinates.longitude,
          y: coordinates.latitude,
          excludeUuids: [this.state.uuid]
        }));
        this.setState({ relatedEntities });
      } catch(error) {
        console.log(error)
      }
  }

  _fetchNearAccomodations = async () => {
    const { coordinates } = this.state;
    if (coordinates)
      try {
        const nearAccomodations = await apolloQuery(actions.getNearestNodesByType({ 
          type: Constants.NODE_TYPES.accomodations, 
          limit: Constants.PAGINATION.poisAccomodationsLimit,
          offset: 0,
          x: coordinates.longitude,
          y: coordinates.latitude,
        }));
        // Compute dataRegion, the smallest enclosing region of the pois (center is current poi location)
        const centerCoords = [coordinates.longitude, coordinates.latitude]
        const nearAccomodationsRegion = boundingRect(nearAccomodations, centerCoords, (p) => p.georef.coordinates);
        this.setState({ nearAccomodations, nearAccomodationsRegion });
      } catch(error) {
        console.log(error);
      }
  }
  
  _parseEntity = (entity) => {
    const { locale } = this.props;
    const { lan } = locale;
    const { abstract, title, description, whyVisit } = getEntityInfo(entity, ["abstract", "title", "description", "whyVisit"], [lan, 0, "value"]);
    const coordinates = getCoordinates(entity);
    const socialUrl = `${Constants.WEBSITE_URL}${greedyArrayFinder(entity.url_alias, "language", lan, "alias", "")}`;
    const sampleVideoUrl = getSampleVideoIndex(entity.nid);
    const gallery = getGalleryImages(entity);
    this.setState({ entity, abstract,  title,  description,  whyVisit,  coordinates,  socialUrl, sampleVideoUrl, gallery }, () => {
      // After parsing the entity fetch near accomodations  and nodes, both depend on state
      this._fetchNearNodes();
      this._fetchNearAccomodations();
    });
  }

  _openRelatedEntity = (item) => {
    var type = item.type;
    switch(type) {
      case Constants.NODE_TYPES.places:
        this.props.navigation.push(Constants.NAVIGATION.NavPlaceScreen, { item, mustFetch: true });
        break;
      case Constants.NODE_TYPES.events:
        this.props.navigation.navigate(Constants.NAVIGATION.NavEventScreen, { item, mustFetch: true });
        break;
      case Constants.NODE_TYPES.itineraries:
        this.props.navigation.navigate(Constants.NAVIGATION.NavItineraryScreen, { item, mustFetch: true })
        break;
      case Constants.NODE_TYPES.inspirers:
        this.props.navigation.navigate(Constants.NAVIGATION.NavInspirerScreen, { item, mustFetch: true })
        break;
      default:
        break;
    }
  }

  _openAccomodationsMap = () => {
    //Compute region of nearest pois and send to accomodations screen
    this.props.navigation.navigate(Constants.NAVIGATION.NavAccomodationsScreen, { 
      region: this.state.nearAccomodationsRegion, 
      sourceEntity: this.state.entity 
    });
  }

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

  
  _renderFab = (uuid, title, coordinates, shareLink) => {
    return (
      <View style={styles.fab}>
        <ConnectedFab 
          color={Colors.blue}
          uuid={uuid}
          title={title}
          type={Constants.ENTITY_TYPES.places}
          coordinates={coordinates} 
          shareLink={shareLink}
          direction="down"
        /> 
      </View>
    )
  }

  _renderContent = () => {
    const { 
      uuid, 
      entity, 
      abstract, 
      title, 
      description, 
      whyVisit, 
      coordinates, 
      socialUrl, 
      sampleVideoUrl, 
      gallery, 
      relatedEntities, 
      nearAccomodations, 
      nearAccomodationsRegion } = this.state;
    const { locale, pois, favourites, } = this.props;
    const { lan } = locale;
    const { 
      whyVisit: whyVisitTitle, 
      discoverMore, 
      gallery: galleryTitle, 
      description: descriptionTitle,
      canBeOfInterest,
      showMap,
    } = locale.messages;
    
    const { orientation } = this.state;
    const isFavourite = favourites.places[uuid];

     return (
       <View style={styles.fill}>
         <ScrollView style={styles.fill}>
          <TopMedia urlVideo={sampleVideoUrl} urlImage={entity.image} />
          {this._renderFab(entity.uuid, title, coordinates, socialUrl)}   
          <View style={[styles.headerContainer]}> 
            <EntityHeader title={title} term={entity.term ? entity.term.name : ""} borderColor={Colors.blue}/>
          </View>
          <View style={[styles.container]}>
            <EntityAbstract abstract={abstract}/>
            <EntityWhyVisit title={whyVisitTitle} text={whyVisit}/>
            <EntityMap coordinates={coordinates}/>
            <EntityGallery images={gallery} title={galleryTitle}/>
            <EntityDescription title={descriptionTitle} text={description} color={Colors.colorPlacesScreen}/>
            <View style={styles.separator}/>
            {this._renderRelatedList(canBeOfInterest, relatedEntities, Constants.ENTITY_TYPES.places)}
            <EntityAccomodations 
              data={nearAccomodations} 
              locale={locale} 
              showMapBtnText={showMap} 
              openMap={this._openAccomodationsMap}
              horizontal/>
          </View>
         </ScrollView>
       </View>
     );
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


PlaceScreen.navigationOptions = {
  title: 'Boilerplate',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  fab: {
    position: "absolute",
    zIndex: 1,
    top: 25,
    right: 20,
    height: 50,
    width: 55,
  },
  header: {
    backgroundColor: "white"
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
  }
});


function PlaceScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <PlaceScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    //language
    locale: state.localeState,
    //favourites
    favourites: state.favouritesState,
    //graphql
    pois: state.poisState,
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
})(PlaceScreenContainer)