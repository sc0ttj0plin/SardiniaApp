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
  TopMedia,
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
import { greedyArrayFinder, getEntityInfo, getCoordinates, getSampleVideoIndex, getGalleryImages } from '../../helpers/utils';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { LLEntitiesFlatlist } from "../../components/loadingLayouts";


const USE_DR = false;
class PlaceScreen extends Component {

  constructor(props) {
    super(props);

    const { uuid } = props.route.params.item;

    /* Get props from navigation */
    this.state = {
      render: USE_DR ? false : true,
      //entity initial state
      uuid,
      entity: { term: {} },
      abstract: null, 
      title: null, 
      description: null, 
      whyVisit: null, 
      coordinates: null, 
      socialUrl: null,
      sampleVideoUrl: null,
      gallery: []
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    this.props.actions.getPoi({ uuid: this.state.uuid });
    //Get related entities
    //todo: use 
    try {
      //todo: use constants
      const relatedHotels = await apolloQuery(actions.getNodes({ type: "Constants....attrattore", offset: Math.ceil(Math.random()*100), limit: 5 }));
      //Todo; init state
      this.setState({ relatedHotels });
      ...
    }
    apolloQuery(actions.getNodes({
      type: "evento",
      offset: Math.ceil(Math.random()*100),
      limit: 5
    })).then((nodes) => {
      this.setState({relatedEvents: nodes})
    })
    apolloQuery(actions.getNodes({
      type: "itinerario",
      offset: Math.ceil(Math.random()*10),
      limit: 5
    })).then((nodes) => {
      this.setState({relatedItineraries: nodes})
    })

  }

  /* NOTE: since this screen is not */
  componentDidUpdate(prevProps) {
    const { uuid } = this.state;
    
    if (prevProps.pois.data !== this.props.pois.data) {
      console.log('entity')
      const { pois, locale } = this.props;
      const entity = pois.data[uuid];
      const { lan } = locale;
      const { abstract, title, description, whyVisit } = getEntityInfo(entity, ["abstract", "title", "description", "whyVisit"], [lan, 0, "value"]);
      const coordinates = getCoordinates(entity);
      const socialUrl = `${Constants.WEBSITE_URL}${greedyArrayFinder(entity.url_alias, "language", lan, "alias", "")}`;
      const sampleVideoUrl = getSampleVideoIndex(entity.nid);
      const gallery = getGalleryImages(entity);
      this.setState({ 
        entity,
        abstract, 
        title, 
        description, 
        whyVisit, 
        coordinates, 
        socialUrl,
        sampleVideoUrl,
        gallery,
      });
    }
    
  }
  
  componentWillUnmount() {
    console.log("Unmount Place!!")
  }
  
  //TODO: move "sdsdas" into Constants.
  _openRelatedItem = (item) => {
    var type = item.type;
    switch(type) {
      case "attrattore":
        this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, { item });
        break;
      case "evento":
        this.props.navigation.navigate(Constants.NAVIGATION.NavEventScreen, { item });
        break;
      case "itinerario":
        this.props.navigation.navigate(Constants.NAVIGATION.NavItineraryScreen, { item })
        break;
      //add ispiratore?
      default:
        break;
    }
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
          onPressItem={this._openRelatedItem}
          listType={listType}
          listTitle={title}
          listTitleStyle={styles.sectionTitle}
        />
    )
  }

  _renderContent = () => {
    const { uuid, entity, abstract, title, description, whyVisit, coordinates, socialUrl, sampleVideoUrl, gallery } = this.state;
    const { locale, pois, favourites, } = this.props;
    const { lan } = locale;
    const { whyVisit: whyVisitTitle, discoverMore, gallery: galleryTitle, description: descriptionTitle } = locale.messages;
    
    const { orientation } = this.state;
    const isFavourite = favourites.places[uuid];

     return (
       <View style={styles.fill}>
         <ScrollView style={styles.fill}>
          <TopMedia urlVideo={sampleVideoUrl} urlImage={entity.image} />   
          <View style={[styles.headerContainer]}> 
            <EntityHeader title={title} term={entity.term.name}/>
          </View>
          <View style={[styles.container]}>
            <EntityAbstract abstract={abstract}/>
            <EntityWhyVisit title={whyVisitTitle} text={whyVisit}/>
            <EntityMap entity={entity}/>
            <EntityGallery images={gallery} title={galleryTitle}/>
            <EntityDescription title={descriptionTitle} text={description}/>
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
  header: {
    backgroundColor: "white"
  },
  container: {
    padding: 10,
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