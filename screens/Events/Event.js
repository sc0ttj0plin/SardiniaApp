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
  CustomText
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
import { getCenterFromPoints, boundingRect } from '../../helpers/maps';
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
    const { mustFetch } = props.route.params;

    this.state = {
      render: USE_DR ? false : true,
      //
      mustFetch,
      uuid,
      entity: { term: {} },
      abstract: null, 
      title: null, 
      description: null, 
      socialUrl: null, 
      steps: [],
      sampleVideoUrl: null,
      relatedEntities: [],
      stepsCoordinates: [],
      stepsCoordinatesCenter: null,
      nearAccomodations: [], /* nearAccomodations is computed on all the stages */
      nearAccomodationsRegion: null,
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  async componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    const { uuid, mustFetch } = this.state;
    this._fetchNearNodes();

    if (mustFetch)
      this.props.actions.getEventsById({ uuids :[uuid] });
    else
      this._parseEntity(this.props.events.eventsById[uuid]);
  }

  componentDidUpdate(prevProps) {
    const { uuid } = this.state;
    if (prevProps.events.eventsById !== this.props.events.eventsById)
      this._parseEntity(this.props.events.eventsById[uuid]);
  }

  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _isSuccessData  = () => false;    /* e.g. this.props.pois.success; */
  _isLoadingData  = () => true;   /* e.g. this.props.pois.loading; */
  _isErrorData    = () => null;    /* e.g. this.props.pois.error; */

  _fetchNearNodes = async () => {
    try {
      const relatedEntities = await apolloQuery(actions.getNodes({ type: Constants.NODE_TYPES.events, offset: Math.ceil(Math.random()*100), limit: 5}))
      this.setState({ relatedEntities })
    } catch(error){
      console.log(error)
    }
  }

  _fetchNearAccomodations = async () => {
    const { stepsCoordinates, stepsCoordinatesCenter } = this.state;
    if (stepsCoordinates.length > 0) {
      try {
        const nearAccomodations = await apolloQuery(actions.getNearestNodesByType({ 
          type: Constants.NODE_TYPES.accomodations, 
          limit: Constants.PAGINATION.poisAccomodationsLimit,
          offset: 0,
          x: stepsCoordinatesCenter.longitude,
          y: stepsCoordinatesCenter.latitude,
        }));
        // Compute dataRegion, the smallest enclosing region of the pois (center is current poi location)
        const centerCoords = [stepsCoordinatesCenter.longitude, stepsCoordinatesCenter.latitude];
        const nearAccomodationsRegion = boundingRect(nearAccomodations, centerCoords, (p) => p.georef.coordinates);
        this.setState({ nearAccomodations, nearAccomodationsRegion });
      } catch(error) {
        console.log(error);
      }
    }
  }

  _parseEntity = (entity) => {
    console.log(entity.abstract, entity.title, entity.steps)
    const { locale } = this.props;
    const { lan } = locale;
    const { abstract, title, description } = getEntityInfo(entity, ["abstract", "title", "description"], [lan, 0, "value"], null, {"description": {s: /\. /g, d: ".<br/>"}});
    const socialUrl = `${Constants.WEBSITE_URL}${greedyArrayFinder(entity.url_alias, "language", lan, "alias", "")}`;
    const sampleVideoUrl = getSampleVideoIndex(entity.nid);
    const steps = _.get(entity, ["steps", lan], []);
    // const stepsCoordinates =  getCoordinates(entity, 'it');
    const stepsCoordinates = this._getEventStepsMarkers(entity.steps[lan]);
    console.log("steps", stepsCoordinates)
    // const stepsCoordinates = steps.reduce((acc, el, idx) => {
    //   acc.push([el.georef.lon, el.georef.lat]);
    //   return acc;
    // }, []);
    const stepsCoordinatesCenter = getCenterFromPoints(stepsCoordinates, p => p.arrayCoords);
    // console.log("steps", steps, entity.nid)
    this.setState({ entity, abstract,  title,  description,  socialUrl, sampleVideoUrl, steps, stepsCoordinates, stepsCoordinatesCenter }, () => {
      // After parsing the entity fetch near accomodations  and nodes, both depend on state
      this._fetchNearAccomodations();
    });
  }

  _getEventStepsMarkers = (steps) => {
    let stepsMarkers = [];
    steps.map( (step, index) => {
        const coordinates = _.get(step, ["georef"], null) 
        if (coordinates) {
          let marker = {
            coords: {
              latitude: coordinates.lat,
              longitude: coordinates.lon,
            },
            arrayCoords: [coordinates.lon, coordinates.lat],
            index: index + 1,
            title: step.title,
          }
          stepsMarkers.push(marker)
        }
    })
    // console.log("steps marker", stepsMarkers, steps)
    return stepsMarkers;
  }

  _openRelatedEntity = (item) => {
    var type = item.type;
    switch(type) {
      case Constants.NODE_TYPES.places:
        this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, { item, mustFetch: true });
        break;
      case Constants.NODE_TYPES.events:
        this.props.navigation.push(Constants.NAVIGATION.NavEventScreen, { item, mustFetch: true });
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
      sourceEntity: this.state.entity,
      sourceEntityCoordinates: this.state.stepsCoordinatesCenter
    });
  }

  /********************* Render methods go down here *********************/

  _renderFab = (uuid, title, coordinates, shareLink) => {
    return (
      <View style={styles.fab}>
        <ConnectedFab 
          color={Colors.colorEventsScreen}
          uuid={uuid}
          title={title}
          type={Constants.ENTITY_TYPES.events}
          shareLink={shareLink}
          direction="down"
        /> 
      </View>
    )
  }

  /* Horizontal spacing for Header items */
  _renderHorizontalSeparator = () => <View style={{ width: 5, flex: 1 }}></View>;


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
        itemStyle={styles.itemStyle}
      />
    )
  }

  _renderContent = () => {
    const { 
      uuid, 
      entity, 
      abstract, 
      title, 
      description, 
      steps, 
      coordinates, 
      socialUrl, 
      sampleVideoUrl, 
      relatedEntities, 
      stepsCoordinates,
      nearAccomodations } = this.state;
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
    
     return (
       <View style={styles.fill}>
         <ScrollView style={styles.fill}>
          <TopMedia urlVideo={sampleVideoUrl} urlImage={entity.image} />
          {this._renderFab(entity.uuid, title, coordinates, socialUrl)}   
          <View style={[styles.headerContainer]}> 
            <EntityHeader title={title} term={entity.term ? entity.term.name : ""} borderColor={Colors.orange}/>
          </View>
          <View style={[styles.container]}>
            <EntityDescription title={descriptionTitle} text={description} color={Colors.colorEventsScreen}/>
            <EntityStages stages={steps} locale={locale}/>
            <EntityMap coordinates={stepsCoordinates} hasMarkers uuid={uuid} entityType={Constants.ENTITY_TYPES.events}/> 
            <View style={styles.separator}/>
            {this._renderRelatedList(canBeOfInterest, relatedEntities, Constants.ENTITY_TYPES.events)}
            <EntityAccomodations 
              data={nearAccomodations} 
              locale={locale} 
              showMapBtnText={showMap} 
              openMap={this._openAccomodationsMap}
              horizontal/>
            <View style={{marginBottom: 30}}></View>
          </View>
         </ScrollView>
       </View>
     );
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        <ConnectedHeader iconTintColor={Colors.colorEventsScreen} />
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
    marginTop: -30,
    borderTopColor: "#f2f2f2",
    borderTopWidth: 2,
    borderRightColor: "#f2f2f2",
    borderRightWidth: 2
  },
  container: { 
    backgroundColor: "white",
    textAlign: "center"
  },
  sectionTitle: {
    flex: 1,
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 5,
    color: "#000000E6",
    fontFamily: "montserrat-bold",
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
  itemStyle: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#f2f2f2",
    borderRadius: 10
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