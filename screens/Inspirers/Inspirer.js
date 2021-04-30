import React, { Component } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import ExpoConstants from 'expo-constants';
import { 
  ConnectedHeader, 
  EntityAbstract,
  EntityDescription,
  EntityGallery,
  EntityHeader,
  EntityMap,
  EntityRelatedList,
  EntityWhyVisit,
  TopMedia,
  ConnectedFab, 
  ConnectedScreenErrorBoundary,
 } from "../../components";
import Toast from 'react-native-easy-toast';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import { greedyArrayFinder, getEntityInfo, getCoordinates, getSampleVideoIndex, getGalleryImages } from '../../helpers/utils';
import { openRelatedEntity, isCloseToBottom } from '../../helpers/screenUtils';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { useSafeArea } from 'react-native-safe-area-context';

const USE_DR = false;
class InspirerScreen extends Component {

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
      whyVisit: null, 
      coordinates: null, 
      socialUrl: null, 
      sampleVideoUrl: null,
      gallery: [],
      relatedEntities: [],
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
      this.props.actions.getInspirersById({ uuids: [uuid], vid: Constants.VIDS.inspirersCategories });
    else 
      this._parseEntity(this.props.inspirers.dataById[uuid]);
    this._analytics(Constants.ANALYTICS_TYPES.userCompleteEntityAccess);
  }

  componentDidUpdate(prevProps) {
    const { uuid } = this.state;
    if (prevProps.inspirers.dataById !== this.props.inspirers.dataById)
      this._parseEntity(this.props.inspirers.dataById[uuid]);
  }
  
  componentWillUnmount() {

  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/
  _fetchNearNodes = async () => {
    try {
      const relatedEntities = await apolloQuery(actions.getNodes({ type: Constants.NODE_TYPES.inspirers, offset: 0, limit: 5}))
      this.setState({ relatedEntities })
    } catch(error){
      console.log(error)
    }
  }
  
  _parseEntity = (entity) => {
    const { locale } = this.props;
    const { lan } = locale;
    const { abstract, title, description, whyVisit } = getEntityInfo(entity, ["abstract", "title", "description", "whyVisit"], [lan, 0, "value"], null, {"description": {s: /\. /g, d: ".<br/>"}});
    const coordinates = getCoordinates(entity);
    const socialUrl = `${ExpoConstants.manifest.extra.websiteUrl}${greedyArrayFinder(entity.url_alias, "language", lan, "alias", "")}`;
    const sampleVideoUrl = getSampleVideoIndex(entity.nid);
    const gallery = getGalleryImages(entity);
    if (title === null || description === null)
      this._toast.show(this.props.locale.messages.entityIsNotTranslated, 5000);
    this.setState({ entity, abstract,  title,  description,  whyVisit,  coordinates,  socialUrl, sampleVideoUrl, gallery });
  }

  _isLanguageAvailable = (textToCheck) => {
    const { lan } = this.props.locale.lan;
    const { entityIsNotTranslated } = this.props.locale.messages;
    if (!textToCheck || !textToCheck[lan])
      this._toast.show(entityIsNotTranslated, 2000);
  }

  _analytics = (analyticsActionType) => {
    const { uuid } = this.state;
    this.props.actions.reportAction({ analyticsActionType, uuid, entityType: 'node', entitySubType: Constants.NODE_TYPES.inspirers });
  }


  /********************* Render methods go down here *********************/


  _renderRelatedList = (title, relatedList, listType) => {
    return (
      <EntityRelatedList
        horizontal={true}
        data={relatedList ? relatedList : []} 
        extraData={this.props.locale}
        keyExtractor={item => item.uuid.toString()}
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
    const { locale, favourites, } = this.props;
    const { 
      whyVisit: whyVisitTitle, 
      gallery: galleryTitle, 
      description: descriptionTitle,
      canBeOfInterest,
    } = locale.messages;
    

     return (
       <View style={styles.fill}>
         <Toast ref={(toast) => this._toast = toast} positionValue={220} opacity={0.7} />
         <ScrollView 
            onScroll={({nativeEvent}) => isCloseToBottom(nativeEvent) && this._analytics(Constants.ANALYTICS_TYPES.userReadsAllEntity)}
            scrollEventThrottle={1000}
            style={[styles.fill]}
            contentContainerStyle={{paddingBottom: this.props.insets.bottom}}
          >
          <TopMedia urlVideo={sampleVideoUrl} urlImage={entity.image} uuid={this.state.uuid} entityType={Constants.NODE_TYPES.inspirers}/>
          {this._renderFab(entity.uuid, title, coordinates, socialUrl)}   
          <View style={[styles.headerContainer]}> 
            <EntityHeader title={title} term={entity.term ? entity.term.name : ""} borderColor={Colors.colorInspirersScreen}/>
          </View>
          <View style={[styles.container]}>
            <EntityAbstract abstract={abstract}/>
            <EntityWhyVisit title={whyVisitTitle} text={whyVisit}/>
            <EntityMap coordinates={coordinates}/>
            <EntityGallery images={gallery} title={galleryTitle} uuid={this.state.uuid} entityType={Constants.NODE_TYPES.inspirers}/>
            <EntityDescription title={descriptionTitle} text={description} color={Colors.colorInspirersScreen}/>
            <View style={styles.separator}/>
            {this.state.nestingCounter < Constants.SCREENS.maxRelatedNestingNavigation 
              && this._renderRelatedList(canBeOfInterest, relatedEntities, Constants.ENTITY_TYPES.inspirers)}
          </View>
         </ScrollView>
       </View>
     );
  }


  render() {
    const { render } = this.state;
    return (
      <ConnectedScreenErrorBoundary>
        <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
          <ConnectedHeader iconTintColor={Colors.colorInspirersScreen} />
          {render && this._renderContent()}
        </View>
      </ConnectedScreenErrorBoundary>
    )
  }
  
}


InspirerScreen.navigationOptions = {
  title: 'Inspirer',
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
    marginVertical: 20
  }
});


function InspirerScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();
  const insets = useSafeArea();

  return <InspirerScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store}
    insets={insets} />;
}


const mapStateToProps = state => {
  return {
    //language
    locale: state.localeState,
    //favourites
    favourites: state.favouritesState,
    //graphql
    inspirers: state.inspirersState,
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
})(InspirerScreenContainer)