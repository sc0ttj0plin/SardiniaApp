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
import { greedyArrayFinder, getEntityInfo, getGalleryImages } from '../../helpers/utils';
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
class ItineraryScreen extends Component {

  constructor(props) {
    super(props);

    const { uuid } = props.route.params;
    console.log("constructor", uuid)
    this.state = {
      render: USE_DR ? false : true,
      //
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
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    const { uuid } = this.state;
    this._fetchRelatedNodes();
    this._parseEntity(this.props.itineraries.dataById[uuid]);
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

  _fetchRelatedNodes = async () => {
    try {
      const relatedEntities = await apolloQuery(actions.getNodes({ type: Constants.NODE_TYPES.itineraries, offset: Math.ceil(Math.random()*100), limit: 5}))
      console.log("related list length", relatedEntities.length)
      this.setState({ relatedEntities })
    } catch(error){
      console.log(error)
    }
  }

  _parseEntity = (entity) => {
    // console.log(entity)
    if(entity){
      const { locale } = this.props;
      const { lan } = locale;
      // console.log("language", lan)
      const { abstract, title, description } = getEntityInfo(entity, ["abstract", "title", "description"], [lan, 0, "value"]);
      const socialUrl = `${Constants.WEBSITE_URL}${greedyArrayFinder(entity.url_alias, "language", lan, "alias", "")}`;
      const { stages, stagesMarkers } = this._getItineraryStages(entity.stages)
      const coordinates = _.get(entity, ["stages", 0, "poi", "georef", "coordinates"], null)
      this.setState({ entity, abstract,  title,  description, coordinates, socialUrl, stages, stagesMarkers });
    }
  }

  _getItineraryStages = (stages) => {
    let stages_result = []
    let stagesMarkers = []
    const { lan } = this.props.locale;
    stages.map( stage => {
      if(stage.language == lan){
        stages_result.push(stage)
        const coordinates = _.get(stage, ["poi", "georef", "coordinates"], null) 
        if(coordinates){
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
      }
    })
    // console.log("stages marker", stagesMarkers, stages)
    return { stages: stages_result, stagesMarkers };
  }

  _openRelatedEntity = (item) => {
    var type = item.type;
    switch(type) {
      case Constants.NODE_TYPES.places:
        this.props.navigation.push(Constants.NAVIGATION.NavPlaceScreen, { item });
        break;
      case Constants.NODE_TYPES.events:
        this.props.navigation.navigate(Constants.NAVIGATION.ItineraryScreen, { item });
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

  _renderFab = (nid, title, coordinates, shareLink) => {
    return (
      <View style={styles.fab}>
        <ConnectedFab 
          color={Colors.colorScreen4}
          nid={nid}
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
          keyExtractor={item => item.nid.toString()}
          contentContainerStyle={styles.listContainerHeader}
          ItemSeparatorComponent={this._renderHorizontalSeparator}
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
    const { uuid, entity, stages, stagesMarkers, coordinates, socialUrl, abstract, title, description, whyVisit, relatedEntities } = this.state;
    const { locale, pois, favourites, } = this.props;
    const { lan } = locale;
    const { 
      whyVisit: whyVisitTitle, 
      discoverMore, 
      gallery: galleryTitle, 
      description: descriptionTitle,
      canBeOfInterest,
    } = locale.messages;

    return (
      <View style={styles.fill}>
        <ScrollView style={styles.fill}>
          <TopMedia urlImage={entity.image} />
          {this._renderFab(entity.nid, title, coordinates, socialUrl)}   
          <View style={[styles.headerContainer]}> 
            <EntityHeader title={title} borderColor={Colors.colorScreen4}/>
          </View>
          <View style={[styles.container]}>
            <EntityAbstract abstract={abstract} />
            <EntityMap coordinates={stagesMarkers} hasMarkers uuid={uuid}/>
            <EntityDescription title={descriptionTitle} text={description} color={Colors.colorScreen4}/>
            <EntityStages type="itinerary" stages={stages}/>
            <View style={styles.separator}/>
            {this._renderRelatedList(canBeOfInterest, relatedEntities, Constants.ENTITY_TYPES.itineraries)}
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
        <ConnectedHeader iconTintColor={Colors.colorScreen4} />
        {render && this._renderContent()}
      </View>
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