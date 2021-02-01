import React, { Component } from "react";
import { 
  View, StyleSheet, Animated } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  AsyncOperationStatusIndicator, 
  ConnectedHeader, 
  EntityAbstract,
  EntityDescription,
  EntityGallery,
  EntityHeader,
  EntityMap,
  EntityRelatedList,
  EntityWhyVisit,
  EntityAccomodations,
  TopMedia,
  ConnectedFab, 
  EntityVirtualTour,
  ScreenErrorBoundary
 } from "../../components";
import Toast from 'react-native-easy-toast';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import { greedyArrayFinder, getEntityInfo, getCoordinates, getSampleVideoIndex, getSampleVrModelIndex, getGalleryImages } from '../../helpers/utils';
import { openRelatedEntity } from '../../helpers/screenUtils';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { boundingRect } from '../../helpers/maps';
import { LLEntityDetail} from "../../components/loadingLayouts";


const USE_DR = false;
class PlaceScreen extends Component {

  constructor(props) {
    super(props);

    this._entity = props.route.params.item;
    const { uuid } = props.route.params.item;
    const { mustFetch, nestingCounter = 1 } = props.route.params; /* no effect since place fetches anyway */
    /* Get props from navigation */
    this.state = {
      render: USE_DR ? false : true,
      //entity initial state
      uuid,
      mustFetch,
      nestingCounter,
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
      nearAccomodations: [],
      nearAccomodationsRegion: null,
      loaded: false,
      scrollY: new Animated.Value(0)
    };

    this._toast = null;
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  async componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    const { uuid, mustFetch } = this.state;
    if(mustFetch) {
      this.props.actions.getPoi({ uuid: uuid });
    } else {
      this._parseEntity(this._entity);
    }
  }

  /* NOTE: since this screen is not */
  componentDidUpdate(prevProps) {
    const { uuid } = this.state;
    if (prevProps.pois.data !== this.props.pois.data || (this.props.pois.data[uuid] && this.props.pois.data[uuid].loaded)) {
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
        const centerCoords = [coordinates.longitude, coordinates.latitude];
        const nearAccomodationsRegion = boundingRect(nearAccomodations, centerCoords, (p) => p.georef.coordinates);
        this.setState({ nearAccomodations, nearAccomodationsRegion });
      } catch(error) {
        console.log(error);
      }
  }
  
  _parseEntity = (entity) => {
    if(!entity || !entity.uuid)
      return;
    const { locale } = this.props;
    const { lan } = locale;
    const { abstract, title, description, whyVisit } = getEntityInfo(entity, ["abstract", "title", "description", "whyVisit"], [lan, 0, "value"], null, {"description": {s: /\. /g, d: ".<br/>"}, "whyVisit": {s: /<\/?[^>]+(>|$)/g, d: ""}});
    const coordinates = getCoordinates(entity);
    const socialUrl = `${Constants.WEBSITE_URL}${greedyArrayFinder(entity.url_alias, "language", lan, "alias", "")}`;
    const sampleVideoUrl = getSampleVideoIndex(entity.uuid);
    const sampleVrUrl = getSampleVrModelIndex(entity.uuid);
    const gallery = getGalleryImages(entity);
    if (title === null || description === null)
      this._toast.show(this.props.locale.messages.entityIsNotTranslated, 5000);
    this.setState({ entity, abstract,  title,  description,  whyVisit,  coordinates,  socialUrl, sampleVideoUrl, sampleVrUrl, gallery, loaded: true }, () => {
      this._fetchNearNodes();
      this._fetchNearAccomodations();
    });
    console.log(entity.uuid, title);
  }


  _openAccomodationsMap = () => {
    if(!this.state.entity || !this.state.entity.georef)
      return;

    //Compute region of nearest pois and send to accomodations screen
    this.props.navigation.navigate(Constants.NAVIGATION.NavAccomodationsScreen, { 
      region: this.state.nearAccomodationsRegion, 
      sourceEntity: this.state.entity,
      sourceEntityCoordinates: { 
        longitude: this.state.entity.georef.coordinates[0], 
        latitude: this.state.entity.georef.coordinates[1] 
      },
    });
  }

  _openVRContent = () => {
    const {sampleVrUrl} = this.state;
    if(sampleVrUrl) {
      this.props.navigation.push(Constants.NAVIGATION.NavMediaScreen, {
          source: sampleVrUrl,
          type: "virtualTour"
      });
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
        onPressItem={(item) => 
          openRelatedEntity(item.type, this.props.navigation, "push", { item, mustFetch: true, nestingCounter: this.state.nestingCounter + 1 })
        }
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
      loaded,
      uuid, 
      entity, 
      abstract, 
      title, 
      description, 
      whyVisit, 
      coordinates, 
      socialUrl, 
      sampleVideoUrl, 
      sampleVrUrl,
      gallery, 
      relatedEntities, 
      nearAccomodations } = this.state;
    const { locale, favourites, } = this.props;
    const { 
      whyVisit: whyVisitTitle, 
      gallery: galleryTitle, 
      description: descriptionTitle,
      canBeOfInterest,
      showMap,
    } = locale.messages;

    const iconRotation = this.state.scrollY.interpolate({
      inputRange: [0, 600],
      outputRange: ['0deg', '360deg']
    });
    

     return (
       <View style={styles.fill}>
         <Toast ref={(toast) => this._toast = toast} positionValue={220} opacity={0.7} />
         <Animated.ScrollView style={styles.fill}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],{useNativeDriver: true})}>
          <TopMedia urlVideo={sampleVideoUrl} urlImage={entity.image} />
          {this._renderFab(entity.uuid, title, coordinates, socialUrl)}   
          <View style={[styles.headerContainer]}> 
            <EntityHeader title={title} term={entity.term ? entity.term.name : ""} borderColor={Colors.blue}/>
          </View>
          <View style={[styles.container]}>
          <AsyncOperationStatusIndicator
                    loading={true}
                    success={loaded}
                    error={false}
                    loadingLayout={<LLEntityDetail />}>

              <EntityAbstract abstract={abstract}/>
              <EntityWhyVisit title={whyVisitTitle} text={whyVisit}/>
              <EntityMap coordinates={coordinates}/>
              { sampleVrUrl &&
              <EntityVirtualTour rotation={iconRotation} onPress={this._openVRContent}/>
              }
              <EntityGallery images={gallery} title={galleryTitle}/>
              <EntityDescription title={descriptionTitle} text={description} color={Colors.colorPlacesScreen}/>

            </AsyncOperationStatusIndicator>
            <View style={styles.separator}/>
            {this.state.nestingCounter < Constants.SCREENS.maxRelatedNestingNavigation 
              && this._renderRelatedList(canBeOfInterest, relatedEntities, Constants.ENTITY_TYPES.places)}
            <EntityAccomodations 
              data={nearAccomodations} 
              locale={locale} 
              showMapBtnText={showMap} 
              openMap={this._openAccomodationsMap}
              horizontal/>
          </View>
         </Animated.ScrollView>
       </View>
     );
  }


  render() {
    const { render } = this.state;
    return (
      <ScreenErrorBoundary>
        <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
          <ConnectedHeader iconTintColor="#24467C" />
          {render && this._renderContent()}
        </View>
      </ScreenErrorBoundary>
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