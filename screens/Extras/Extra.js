import React, { Component } from "react";
import { 
  View, StyleSheet, ScrollView, Animated } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  EntityAbstract,
  EntityGallery,
  EntityHeader,
  EntityRelatedList,
  EntityVirtualTour,
  TopMedia,
  ConnectedHeader, 
  ConnectedFab, 
  ScreenErrorBoundary,
 } from "../../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { openRelatedEntity, isCloseToBottom } from '../../helpers/screenUtils';
import { greedyArrayFinder, getEntityInfo, getCoordinates, getSampleVideoIndex, getSampleVrModelIndex, getGalleryImages } from '../../helpers/utils';
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
      uuid: null, 
      entity: item,
      relatedPlaces: [], 
      relatedItineraries: [], 
      relatedEvents: [],
      scrollY: new Animated.Value(0)
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
    this._fetchNearNodes();
    this._analytics(Constants.ANALYTICS_TYPES.userCompleteEntityAccess);
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

  _fetchNearNodes = async () => {
    try {
      const relatedPlaces = await apolloQuery(actions.getNodes({ type: Constants.NODE_TYPES.places, offset: Math.ceil(Math.random()*100), limit: 5}))
      const relatedItineraries = await apolloQuery(actions.getNodes({ type: Constants.NODE_TYPES.itineraries, offset: 0, limit: 5}))
      const relatedEvents = await apolloQuery(actions.getNodes({ type: Constants.NODE_TYPES.events, offset: Math.ceil(Math.random()*100), limit: 5}))
      this.setState({ relatedPlaces, relatedItineraries, relatedEvents });
    } catch(error){
      console.log(error)
    }
  }

  _parseEntity = (entity) => {
    const { locale } = this.props;
    const { lan } = locale;
    const { abstract, title, description, whyVisit } = getEntityInfo(entity, ["abstract", "title", "description", "whyVisit"], [lan, 0, "value"], null, {"description": {s: /\. /g, d: ".<br/>"}});
    const socialUrl = `${Constants.WEBSITE_URL}${greedyArrayFinder(entity.url_alias, "language", lan, "alias", "")}`;
    const sampleVideoUrl = getSampleVideoIndex(entity.uuid);
    const sampleVrUrl = getSampleVrModelIndex(entity.uuid);
    const gallery = getGalleryImages(entity);
    this.setState({ entity, uuid: entity.uuid, abstract,  title,  description,  whyVisit,  socialUrl, sampleVideoUrl, sampleVrUrl, gallery });
  }


  _openVRContent = () => {
    const { sampleVrUrl, uuid } = this.state;
    if(sampleVrUrl) {
      this.props.navigation.navigate(Constants.NAVIGATION.NavMediaScreen, {
        uuid,
        entityType: Constants.NODE_TYPES.inspirers,
        source: sampleVrUrl,
        type: "virtualTour"
      });
    }
  }

  _analytics = (analyticsActionType) => {
    const { uuid } = this.state;
    this.props.actions.reportUserInteraction({ analyticsActionType, uuid, entityType: 'node', entitySubType: Constants.NODE_TYPES.inspirers });
  }

  /********************* Render methods go down here *********************/
  /* Horizontal spacing for Header items */
  _renderHorizontalSeparator = () => <View style={{ width: 5, flex: 1 }}></View>;

  _renderRelatedList = (title, relatedList, listType) => {
    return (
      <EntityRelatedList
        horizontal={true}
        data={relatedList ? relatedList : []} 
        extraData={this.props.locale}
        keyExtractor={item => item && item.uuid && item.uuid.toString()}
        contentContainerStyle={styles.relatedListContent}
        showsHorizontalScrollIndicator={false}
        locale={this.props.locale}
        onPressItem={item => openRelatedEntity(item.type, this.props.navigation, "navigate", { item, mustFetch: true })}
        listType={listType}
        listTitle={title}
        listTitleStyle={styles.sectionTitle}
        itemStyle={styles.relatedListItem}
      />
    )
  }

  _renderFab = (uuid, title, coordinates, shareLink) => {
    return (
      <View style={styles.fab}>
        <ConnectedFab 
          color={Colors.black}
          uuid={uuid}
          title={title}
          type={Constants.ENTITY_TYPES.inspirers}
          coordinates={coordinates} 
          shareLink={shareLink}
          direction="down"
        /> 
      </View>
    )
  }

  _renderContent = () => {
    const { uuid, entity, abstract, title, description, whyVisit, coordinates, socialUrl, sampleVideoUrl, sampleVrUrl, gallery } = this.state;
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
    
    const iconRotation = this.state.scrollY.interpolate({
      inputRange: [0, 600],
      outputRange: ['0deg', '360deg']
    });

    return (
      <View style={styles.fill}>
        <Animated.ScrollView style={styles.fill}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],{useNativeDriver: true})}>
          <TopMedia urlVideo={sampleVideoUrl} urlImage={entity.image} uuid={this.state.uuid} entityType={Constants.NODE_TYPES.inspirers}/>
          {this._renderFab(entity.uuid, title, coordinates, socialUrl)}   
          <View style={[styles.headerContainer]}> 
            <EntityHeader title={title} borderColor={Colors.black}/>
          </View>
          <View style={[styles.container]}>
            
            <EntityAbstract abstract={abstract}/>
            <View style={styles.separator} />
            { sampleVrUrl &&
            <EntityVirtualTour rotation={iconRotation} onPress={this._openVRContent}/>
            }
            <EntityGallery images={gallery} title={galleryTitle} uuid={this.state.uuid} entityType={Constants.NODE_TYPES.inspirers} />
            <View style={styles.separator}/>
            {this._renderRelatedList("Luoghi", relatedPlaces, Constants.ENTITY_TYPES.places)}
            {this._renderRelatedList("Itinerari", relatedItineraries, Constants.ENTITY_TYPES.itineraries)}
            {this._renderRelatedList("Eventi", relatedEvents, Constants.ENTITY_TYPES.events)}
          </View>
        </Animated.ScrollView>
      </View>
     )
  }


  render() {
    const { render } = this.state;
    return (
      <ScreenErrorBoundary>
        <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
          <ConnectedHeader />
          <ScrollView 
            onScroll={({nativeEvent}) => isCloseToBottom(nativeEvent) && this._analytics(Constants.ANALYTICS_TYPES.userReadsAllEntity)}
            scrollEventThrottle={1000}
            style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}
          >
            {render && this._renderContent()}
          </ScrollView>
        </View>
      </ScreenErrorBoundary>
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
    fontFamily: "montserrat-bold",
  },
  listContainerHeader: {
    paddingLeft: 10,
  },
  relatedListContent: {
    paddingLeft: 10
  },
  separator: {
    width: "100%",
    height: 8,
    marginVertical: 10
  },
  relatedListItem: {
    // marginLeft: 0,
    marginBottom: 10,
  }
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