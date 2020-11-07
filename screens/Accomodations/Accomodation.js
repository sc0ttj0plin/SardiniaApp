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
  // EntityHeader,
  // EntityItem,
  // EventListItem,
  // EntityMap,
  // EntityRelatedList,
  // EntityVirtualTour,
  // EntityWhyVisit,
  // TopMedia,
  AsyncOperationStatusIndicator, 
  // AsyncOperationStatusIndicatorPlaceholder,
  // Webview, 
  // ConnectedText, 
  ConnectedHeader, 
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
import _ from 'lodash';
import Layout from '../../constants/Layout';
import { greedyArrayFinder, getEntityInfo, getCoordinates, getSampleVideoIndex, getGalleryImages } from '../../helpers/utils';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { LLEntitiesFlatlist } from "../../components/loadingLayouts";

const USE_DR = false;
class AccomodationScreen extends Component {

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
      whyVisit: null, 
      coordinates: null, 
      socialUrl: null, 
      sampleVideoUrl: null,
      gallery: [],
      relatedEntities: [],
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    if (mustFetch)
      this.props.actions.getInspirersById({ uuids: [uuid], vid: Constants.VIDS.inspirersCategories });
    else 
      this._parseEntity(this.props.inspirers.dataById[uuid]);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.inspirers.dataById !== this.props.inspirers.dataById)
      this._parseEntity(this.props.inspirers.dataById[uuid]);
  }

  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _parseEntity = (entity) => {
    const { locale } = this.props;
    const { lan } = locale;
    const { abstract, title, description, whyVisit } = getEntityInfo(entity, ["abstract", "title", "description", "whyVisit"], [lan, 0, "value"]);
    const coordinates = getCoordinates(entity);
    const socialUrl = `${Constants.WEBSITE_URL}${greedyArrayFinder(entity.url_alias, "language", lan, "alias", "")}`;
    const sampleVideoUrl = getSampleVideoIndex(entity.nid);
    const gallery = getGalleryImages(entity);
    this.setState({ entity, abstract,  title,  description,  whyVisit,  coordinates,  socialUrl, sampleVideoUrl, gallery });
  }

  _isSuccessData  = () => false;    /* e.g. this.props.pois.success; */
  _isLoadingData  = () => true;   /* e.g. this.props.pois.loading; */
  _isErrorData    = () => null;    /* e.g. this.props.pois.error; */


  /********************* Render methods go down here *********************/
  _renderFab = (uuid, title, coordinates, shareLink) => {
    return (
      <View style={styles.fab}>
        <ConnectedFab 
          color={Colors.colorInspirersScreen}
          uuid={uuid}
          type={Constants.ENTITY_TYPES.inspirers}
          title={title}
          coordinates={coordinates} 
          shareLink={shareLink}
          direction="down"
        /> 
      </View>
    )
  }
  
  _renderContent = () => {
    const { uuid, entity, abstract, title, description, whyVisit, coordinates, socialUrl, sampleVideoUrl, gallery, relatedEntities } = this.state;
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
          {this._renderFab(entity.uuid, title, coordinates, socialUrl)}   
          <View style={[styles.headerContainer]}> 
            <EntityHeader title={title} term={entity.term ? entity.term.name : ""} borderColor={Colors.colorInspirersScreen}/>
          </View>
          <View style={[styles.container]}>
            <EntityAbstract abstract={abstract}/>
            <EntityWhyVisit title={whyVisitTitle} text={whyVisit}/>
            <EntityMap coordinates={coordinates}/>
            <EntityGallery images={gallery} title={galleryTitle}/>
            <EntityDescription title={descriptionTitle} text={description} color={Colors.colorInspirersScreen}/>
            <View style={styles.separator}/>
            {this._renderRelatedList(canBeOfInterest, relatedEntities, Constants.ENTITY_TYPES.inspirers)}
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


AccomodationScreen.navigationOptions = {
  title: 'Accomodation',
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
});


function AccomodationScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <AccomodationScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    //mixed state
    others: state.othersState,
    //language
    locale: state.localeState,
    //favourites
    favourites: state.favouritesState,
    //graphql
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
})(AccomodationScreenContainer)