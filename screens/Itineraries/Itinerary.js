import React, { Component } from "react";
import { 
  View, StyleSheet, ScrollView } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';

import { 
  ConnectedHeader, 
  EntityAbstract,
  EntityDescription,
  EntityHeader,
  EntityMap,
  EntityRelatedList,
  EntityStages,
  TopMedia,
  ConnectedFab, 
  ScreenErrorBoundary,
 } from "../../components";
import Toast from 'react-native-easy-toast';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { greedyArrayFinder, getEntityInfo } from '../../helpers/utils';
import { openRelatedEntity } from '../../helpers/screenUtils';
import Layout from '../../constants/Layout';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';

/* Deferred rendering to speedup page inital load: 
   deferred rendering delays the rendering reducing the initial 
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;
class ItineraryScreen extends Component {

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
      coordinates: null,
      socialUrl: null,
      description: null, 
      stages: [],
      stagesMarkers: [],
      relatedEntities: [],
    };
      
    this._toast = null;
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    const { uuid, mustFetch } = this.state;
    this._fetchNearNodes();

    if (mustFetch)
      this.props.actions.getItinerariesById({ uuids: [uuid] });
    else 
      this._parseEntity(this.props.itineraries.dataById[uuid]);
  }

  componentDidUpdate(prevProps) {
    const { uuid } = this.state;
    if (prevProps.itineraries.dataById !== this.props.itineraries.dataById)
      this._parseEntity(this.props.itineraries.dataById[uuid]);
  }

  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _isSuccessData  = () => false;    /* e.g. this.props.pois.success; */
  _isLoadingData  = () => true;   /* e.g. this.props.pois.loading; */
  _isErrorData    = () => null;    /* e.g. this.props.pois.error; */

  _fetchNearNodes = async () => {
    try {
      const relatedEntities = await apolloQuery(actions.getNodes({ type: Constants.NODE_TYPES.itineraries, offset: 0, limit: 5}))
      this.setState({ relatedEntities })
    } catch(error){
      console.log(error)
    }
  }

  _parseEntity = (entity) => {
    if(!entity)
      return;
    const { locale } = this.props;
    const { lan } = locale;
    // console.log("language", lan)
    const { abstract, title, description } = getEntityInfo(entity, ["abstract", "title", "description"], [lan, 0, "value"], null, {"description": {s: /\.\s?/g, d: ".<br/><br/>"}});
    const socialUrl = `${Constants.WEBSITE_URL}${greedyArrayFinder(entity.url_alias, "language", lan, "alias", "")}`;
    const stagesMarkers = this._getItineraryStagesMarkers(entity.stages[lan]);
    //Get the first stage coordinates to show on map
    const coordinates = _.get(entity, ["stages", lan, 0, "poi", "georef", "coordinates"], null);
    const term = entity.term.name;
    if (title === null || description === null)
      this._toast.show(this.props.locale.messages.entityIsNotTranslated, 5000);
    this.setState({ entity, abstract, term, title,  description, coordinates, socialUrl, stages: entity.stages[lan], stagesMarkers });
  }

  _isLanguageAvailable = (textToCheck) => {
    const { lan } = this.props.locale.lan;
    const { entityIsNotTranslated } = this.props.locale.messages;
    if (!textToCheck || !textToCheck[lan])
      this._toast.show(entityIsNotTranslated, 2000);
  }

  _getItineraryStagesMarkers = (stages) => {
    let stagesMarkers = [];
    stages.map( stage => {
        const coordinates = _.get(stage, ["poi", "georef", "coordinates"], null) 
        if (coordinates) {
          let marker = {
            coords: {
              latitude: coordinates[1],
              longitude: coordinates[0],
            },
            index: stage.index,
            uuid: stage.poi.uuid,
            title: stage.title,
            image: stage.poi.image
          }
          stagesMarkers.push(marker)
        }
    })
    // console.log("stages marker", stagesMarkers, stages)
    return stagesMarkers;
  }


  /********************* Render methods go down here *********************/

  _renderFab = (uuid, title, coordinates, shareLink) => {
    return (
      <View style={styles.fab}>
        <ConnectedFab 
          color={Colors.colorItinerariesScreen}
          uuid={uuid}
          type={Constants.ENTITY_TYPES.itineraries}
          title={title}
          coordinates={coordinates}
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
          keyExtractor={item => item.uuid.toString()}
          contentContainerStyle={styles.listContainerHeader}
          ItemSeparatorComponent={this._renderHorizontalSeparator}
          showsHorizontalScrollIndicator={false}
          locale={this.props.locale}
          onPressItem={(item) => 
            openRelatedEntity(item.type, this.props.navigation, "push", { item, mustFetch: true, nestingCounter: this.state.nestingCounter + 1 })
          }
          listType={listType}
          listTitle={title}
          listTitleStyle={styles.sectionTitle}
        />
    )
  }

  _renderContent = () => {
    const { uuid, entity, stages, stagesMarkers, coordinates, socialUrl, abstract, title, description, relatedEntities } = this.state;
    const { locale, } = this.props;
    const { 
      description: descriptionTitle,
      canBeOfInterest,
    } = locale.messages;

    return (
      <View style={styles.fill}>
        <Toast ref={(toast) => this._toast = toast} positionValue={220} opacity={0.7} />
        <ScrollView style={styles.fill}>
          <TopMedia urlImage={entity.image} />
          {this._renderFab(entity.uuid, title, coordinates, socialUrl)}   
          <View style={[styles.headerContainer]}> 
            <EntityHeader title={title} term={entity.term ? entity.term.name : ""} borderColor={Colors.colorItinerariesScreen}/>
          </View>
          <View style={[styles.container]}>
            <EntityAbstract abstract={abstract} />
            <EntityMap coordinates={stagesMarkers} term={entity.term} title={title} hasMarkers uuid={uuid}/>
            <EntityDescription title={descriptionTitle} text={description} color={Colors.colorItinerariesScreen}/>
            <EntityStages type="itinerary" stages={stages} locale={locale} />
            <View style={styles.separator}/>
            {this.state.nestingCounter < Constants.SCREENS.maxRelatedNestingNavigation 
              && this._renderRelatedList(canBeOfInterest, relatedEntities, Constants.ENTITY_TYPES.itineraries)}
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
          <ConnectedHeader iconTintColor={Colors.colorItinerariesScreen} />
          {render && this._renderContent()}
        </View>
      </ScreenErrorBoundary>
    )
  }
  
}


ItineraryScreen.navigationOptions = {
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
    fontFamily: "montserrat-bold",
  },
  listContainerHeader: {
    paddingLeft: 10,
  },
  separator: {
    width: "100%",
    height: 8,
    marginVertical: 20
  }
});


function ItineraryScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <ItineraryScreen 
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
    itineraries: state.itinerariesState,
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
})(ItineraryScreenContainer)