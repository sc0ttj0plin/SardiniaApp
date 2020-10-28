import React, { Component } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
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
  EntityStages,
  EntityVirtualTour,
  EntityWhyVisit,
  EntityAccomodations,
  TopMedia,
  // ImageGridItem, 
  // ConnectedLanguageList, 
  // BoxWithText,
  ConnectedFab, 
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
class EventScreen extends Component {

  constructor(props) {
    super(props);

    const { uuid } = props.route.params.item;

    this.state = {
      render: USE_DR ? false : true,
      //
      uuid,
      entity: { term: {} },
      abstract: null, 
      title: null, 
      description: null, 
      socialUrl: null, 
      sampleVideoUrl: null,
      relatedEntities: [],
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  async componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    const { uuid } = this.state;
    this._parseEntity(this.props.events.eventsById[uuid]);
    try {
      const relatedEntities = await apolloQuery(actions.getNodes({ type: Constants.NODE_TYPES.events, offset: Math.ceil(Math.random()*100), limit: 5}))
      this.setState({ relatedEntities })
    } catch(error){
      console.log(error)
    }
  }

  componentDidUpdate(prevProps) {
    /**
     * Is the former props different from the newly propagated prop (redux)? perform some action
     * if(prevProps.xxx !== this.props.xxx)
     *  doStuff();
     */
  }

  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _isSuccessData  = () => false;    /* e.g. this.props.pois.success; */
  _isLoadingData  = () => true;   /* e.g. this.props.pois.loading; */
  _isErrorData    = () => null;    /* e.g. this.props.pois.error; */


  _parseEntity = (entity) => {
    console.log(entity)
    const { locale } = this.props;
    const { lan } = locale;
    const { abstract, title, description } = getEntityInfo(entity, ["abstract", "title", "description"], [lan, 0, "value"]);
    const socialUrl = `${Constants.WEBSITE_URL}${greedyArrayFinder(entity.url_alias, "language", lan, "alias", "")}`;
    const sampleVideoUrl = getSampleVideoIndex(entity.nid);
    this.setState({ entity, abstract,  title,  description,  socialUrl, sampleVideoUrl });
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

  /********************* Render methods go down here *********************/

  _renderFab = (nid, title, shareLink) => {
    return (
      <View style={styles.fab}>
        <ConnectedFab 
          color={Colors.orange}
          nid={nid}
          title={title}
          shareLink={shareLink}
          direction="down"
        /> 
      </View>
    )
  }

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

  _renderContent = () => {
    const { uuid, entity, abstract, title, description, whyVisit, coordinates, socialUrl, sampleVideoUrl, relatedEntities } = this.state;
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
            <EntityHeader title={title} term={entity.term.name} borderColor={Colors.orange}/>
          </View>
          <View style={[styles.container]}>
            <EntityDescription title={descriptionTitle} text={description}/>
            <EntityStages />
            <View style={styles.separator}/>
            {this._renderRelatedList(canBeOfInterest, relatedEntities, Constants.ENTITY_TYPES.events)}
            <EntityAccomodations horizontal/>
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


EventScreen.navigationOptions = {
  title: 'Event',
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
    width: 50
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


function EventScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <EventScreen 
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
    events: state.eventsState,
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
})(EventScreenContainer)