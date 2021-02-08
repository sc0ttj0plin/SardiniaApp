import React, { Component } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  ConnectedHeader, 
  EntityDescription,
  EntityHeader,
  EntityMap,
  EntityRelatedList,
  EntityStages,
  EntityAccomodations,
  TopMedia,
  ConnectedFab, 
  ScreenErrorBoundary,
 } from "../../components";
import Toast from 'react-native-easy-toast';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { greedyArrayFinder, getEntityInfo, getSampleVideoIndex } from '../../helpers/utils';
import { openRelatedEntity, isCloseToBottom } from '../../helpers/screenUtils';
import Layout from '../../constants/Layout';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { getCenterFromPoints, boundingRect } from '../../helpers/maps';

/* Deferred rendering to speedup page inital load: 
   deferred rendering delays the rendering reducing the initial 
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;
class EventScreen extends Component {

  constructor(props) {
    super(props);

    const { uuid } = props.route.params.item;
    const { mustFetch, nestingCounter = 1 } = props.route.params;

    this.state = {
      render: USE_DR ? false : true,
      //
      mustFetch,
      nestingCounter,
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
      
    this._toast = null;
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
    this._analytics(Constants.ANALYTICS_TYPES.userCompleteEntityAccess);
  }

  componentDidUpdate(prevProps) {
    const { uuid } = this.state;
    if (prevProps.events.eventsById !== this.props.events.eventsById)
      this._parseEntity(this.props.events.eventsById[uuid]);
  }

  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

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
    if(!entity)
      return;
    const { locale } = this.props;
    const { lan } = locale;
    const { abstract, title, description } = getEntityInfo(entity, ["abstract", "title", "description"], [lan, 0, "value"], null, {"description": {s: /\. /g, d: ".<br/>"}});
    const socialUrl = `${Constants.WEBSITE_URL}${greedyArrayFinder(entity.url_alias, "language", lan, "alias", "")}`;
    const sampleVideoUrl = getSampleVideoIndex(entity.nid);
    const steps = _.get(entity, ["steps", lan], []);
    const stepsCoordinates = this._getEventStepsMarkers(entity.steps[lan]);
    const stepsCoordinatesCenter = getCenterFromPoints(stepsCoordinates, p => p.arrayCoords);
    if (title === null || description === null || steps.length === 0)
      this._toast.show(this.props.locale.messages.entityIsNotTranslated, 5000);
    this.setState({ entity, abstract,  title,  description,  socialUrl, sampleVideoUrl, steps, stepsCoordinates, stepsCoordinatesCenter }, () => {
      // After parsing the entity fetch near accomodations  and nodes, both depend on state
      this._fetchNearAccomodations();
    });
  }

  _isLanguageAvailable = (textToCheck) => {
    const { lan } = this.props.locale.lan;
    const { entityIsNotTranslated } = this.props.locale.messages;
    if (!textToCheck || !textToCheck[lan])
      this._toast.show(entityIsNotTranslated, 2000);
  }

  _getEventStepsMarkers = (steps) => {
    let stepsMarkers = [];
    steps && steps.length > 0 && steps.map( (step, index) => {
        const coordinates = _.get(step, ["georef"], null) 
        if (coordinates) {
          let marker = {
            coords: {
              latitude: parseFloat(coordinates.lat),
              longitude: parseFloat(coordinates.lon),
            },
            arrayCoords: [parseFloat(coordinates.lon), parseFloat(coordinates.lat)],
            index: index + 1,
            title: step.nome,
          }
          stepsMarkers.push(marker)
        }
    })
    // console.log("steps marker", stepsMarkers, steps)
    return stepsMarkers;
  }


  _openAccomodationsMap = () => {
    //Compute region of nearest pois and send to accomodations screen
    this.props.navigation.navigate(Constants.NAVIGATION.NavAccomodationsScreen, { 
      region: this.state.nearAccomodationsRegion, 
      sourceEntity: this.state.entity,
      sourceEntityCoordinates: this.state.stepsCoordinatesCenter
    });
  }

  _analytics = (analyticsActionType) => {
    const { uuid } = this.state;
    this.props.actions.reportUserInteraction({ analyticsActionType, uuid, entityType: 'node', entitySubType: Constants.NODE_TYPES.events });
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
        onPressItem={(item) => 
          openRelatedEntity(item.type, this.props.navigation, "push", { item, mustFetch: true, nestingCounter: this.state.nestingCounter + 1 })
        }
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
      title, 
      description, 
      steps, 
      coordinates, 
      socialUrl, 
      sampleVideoUrl, 
      relatedEntities, 
      stepsCoordinates,
      nearAccomodations } = this.state;
    const { locale, } = this.props;
    const { 
      description: descriptionTitle,
      canBeOfInterest,
      showMap,
    } = locale.messages;
    
     return (
       <View style={styles.fill}>
         <Toast ref={(toast) => this._toast = toast} positionValue={220} opacity={0.7} />
         <ScrollView style={styles.fill}>
          <TopMedia urlVideo={sampleVideoUrl} urlImage={entity.image} uuid={this.state.uuid} entityType={Constants.NODE_TYPES.events} />
          {this._renderFab(entity.uuid, title, coordinates, socialUrl)}   
          <View style={[styles.headerContainer]}> 
            <EntityHeader title={title} term={entity.term ? entity.term.name : ""} borderColor={Colors.orange}/>
          </View>
          <View style={[styles.container]}>
            <EntityDescription title={descriptionTitle} text={description} color={Colors.colorEventsScreen}/>
            <EntityStages stages={steps} locale={locale}/>
            <EntityMap containerStyle={{marginTop: 0, marginBottom: 30}} title={title} coordinates={stepsCoordinates} hasMarkers uuid={uuid} entityType={Constants.ENTITY_TYPES.events}/> 
            <View style={styles.separator}/>
            {this.state.nestingCounter < Constants.SCREENS.maxRelatedNestingNavigation 
              && this._renderRelatedList(canBeOfInterest, relatedEntities, Constants.ENTITY_TYPES.events)}
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
      <ScreenErrorBoundary>
        <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
          <ConnectedHeader iconTintColor={Colors.colorEventsScreen} />
          <ScrollView 
            onScroll={({nativeEvent}) => isCloseToBottom(nativeEvent) && this._analytics(Constants.ANALYTICS_TYPES.userReadsAllEntity)}
            scrollEventThrottle={1000}
            style={[styles.fill]}
          >
            {render && this._renderContent()}
          </ScrollView>
        </View>
      </ScreenErrorBoundary>
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
    borderTopWidth: 1,
    borderRightColor: "#f2f2f2",
    borderRightWidth: 1
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
    fontFamily: "montserrat-bold",
  },
  listContainerHeader: {
    paddingLeft: 10,
  },
  separator: {
    width: "100%",
    height: 8,
    marginVertical: 20
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