import React, { Component } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, TouchableWithoutFeedback, 
  StyleSheet, BackHandler, Platform, ScrollView, Linking, Alert, Modal } from "react-native";
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
  EntityHeader,
  // EventListItem,
  EntityMap,
  // EntityRelatedList,
  // EntityVirtualTour,
  // EntityWhyVisit,
  // TopMedia,
  AsyncOperationStatusIndicator, 
  // AsyncOperationStatusIndicatorPlaceholder,
  // Webview, 
  // ConnectedText, 
  ConnectedHeader, 
  EntityAccomodationDetail,
  // ImageGridItem, 
  // ConnectedLanguageList, 
  // BoxWithText,
  ConnectedFab, 
  // PoiItem, 
  // PoiItemsList, 
  // ExtrasListItem, 
  // MapViewItinerary
 } from "../../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Ionicons } from '@expo/vector-icons';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import { linkingOpenMail, linkingOpenNavigator, linkingCallNumber, linkingOpenUrl, getEntityInfo, getCoordinates, getSampleVideoIndex, getGalleryImages } from '../../helpers/utils';
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
      //
      modalVisible: false,
      modalTitle: "",
      modalDescription: "",
      modalBtnTitle: "",
      modalAction: null,
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    const { uuid, mustFetch } = this.state;
    if (mustFetch)
      this.props.actions.getAccomodationsById({ uuids: [uuid] });
    else 
      this._parseEntity(this.props.accomodations.dataById[uuid]);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.accomodations.dataById !== this.props.accomodations.dataById)
      this._parseEntity(this.props.accomodations.dataById[this.state.uuid]);
  }

  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _parseEntity = (entity) => {
    const { locale } = this.props;
    const { lan } = locale;
    const { abstract, title, description, whyVisit } = getEntityInfo(entity, ["abstract", "title", "description", "whyVisit"], [lan, 0, "value"]);
    const coordinates = getCoordinates(entity);
    const socialUrl = entity.website;
    const sampleVideoUrl = getSampleVideoIndex(entity.nid);
    const gallery = getGalleryImages(entity);
    const stars = entity.stars;
    this.setState({ entity, abstract,  title,  description,  whyVisit,  coordinates,  socialUrl, sampleVideoUrl, gallery, stars });
  }

  _isSuccessData  = () => this.props.accomodations.success; 
  _isLoadingData  = () => this.props.accomodations.loading;  
  _isErrorData    = () => this.props.accomodations.error;  


  /********************* Render methods go down here *********************/

  _renderOpenDetailModal = () => {
    const { modalVisible, modalTitle, modalDescription, modalBtnTitle, modalAction } = this.state;

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => { }}>
          <TouchableOpacity 
            style={styles.modalView} 
            onPress={() => this.setState({modalVisible: false})} /* on press outside children */
            activeOpacity={1}
          >
            <TouchableWithoutFeedback>
              <View style={styles.modalWindow}>
                <Text style={styles.modalTitle}>{modalTitle}</Text>
                <Text style={styles.modalDescription}>{modalDescription}</Text>
                <TouchableOpacity activeOpacity={0.8} style={styles.modalBtn} onPress={modalAction}>
                  <Text style={styles.modalBtnText}>{modalBtnTitle}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
      </Modal>
    )
}

  _renderFab = (uuid, title, coordinates, shareLink) => {
    return (
      <View style={styles.fab}>
        <ConnectedFab 
          color={Colors.colorAccomodationsScreen}
          uuid={uuid}
          type={Constants.ENTITY_TYPES.accomodations}
          title={title}
          coordinates={coordinates} 
          shareLink={shareLink}
          direction="down"
        /> 
      </View>
    )
  }


  _renderStars = (count) => {
    let stars = new Array(count).fill(0);
    return stars.map( star => <Ionicons name={"md-star"} size={25} color={Colors.stars} style={styles.star}/>);
  }

  
  _renderContent = () => {
    const { uuid, entity, title, coordinates, socialUrl, stars } = this.state;
    const { locale, pois, favourites, } = this.props;
    const { lan } = locale;

    const { 
      whyVisit: whyVisitTitle, 
      discoverMore, 
      gallery: galleryTitle, 
      description: descriptionTitle,
      canBeOfInterest,
      address, phone, website, email,
      addressOnPressAlert, phoneOnPressAlert, websiteOnPressAlert, emailOnPressAlert,
      addressOnPressBtnTitle, phoneOnPressBtnTitle, websiteOnPressBtnTitle, emailOnPressBtnTitle, 
      addressModalTitle, phoneModalTitle, websiteModalTitle, emailModalTitle,
    } = locale.messages;
    
    const { orientation } = this.state;
    const isFavourite = favourites.places[uuid];
     return (
       <View style={styles.fill}>
         <ScrollView style={styles.fill}>
          <EntityMap coordinates={coordinates} hideOpenNavigatorButton containerStyle={{marginBottom: 0, marginTop: 0}}/>
          {this._renderFab(entity.uuid, title, coordinates, socialUrl)}   
          <View style={[styles.headerContainer]}> 
            <EntityHeader title={title} term={entity.term ? entity.term.name : ""} borderColor={Colors.colorAccomodationsScreen}/>
          </View>
          <View style={styles.starsView}>
            {this._renderStars(stars)}
          </View>
          <View style={styles.container}>
            { entity.address && <EntityAccomodationDetail 
              onPress={() => this.setState({ 
                modalAction: () => linkingOpenNavigator(entity.address, coordinates), 
                modalVisible: true, 
                modalTitle: addressModalTitle, 
                modalDescription: addressOnPressAlert, 
                modalBtnTitle: addressOnPressBtnTitle  
              })}
              title={address} 
              subtitle={entity.address} 
              iconSize={30} 
              iconName={"md-locate"} />}
            { entity.phone && <EntityAccomodationDetail 
              onPress={() => this.setState({ 
                modalAction: () => linkingCallNumber(entity.phone.split('-')[0]),
                modalVisible: true, 
                modalTitle: phoneModalTitle, 
                modalDescription: phoneOnPressAlert, 
                modalBtnTitle: phoneOnPressBtnTitle  
              })}
              title={phone} 
              subtitle={entity.phone} 
              iconSize={30} 
              iconName={"md-call"} />}
            { entity.website && <EntityAccomodationDetail 
              onPress={() => this.setState({ 
                modalAction: () => linkingOpenUrl(entity.website),
                modalVisible: true, 
                modalTitle: websiteModalTitle, 
                modalDescription: websiteOnPressAlert, 
                modalBtnTitle: websiteOnPressBtnTitle 
              })}
              title={website} 
              subtitle={entity.website} 
              iconSize={30} 
              iconName={"md-wifi"} />}
            { entity.email && <EntityAccomodationDetail 
              onPress={() => this.setState({ 
                modalAction: () => linkingOpenUrl(entity.email),
                modalVisible: true, 
                modalTitle: emailModalTitle, 
                modalDescription: emailOnPressAlert, 
                modalBtnTitle: emailOnPressBtnTitle 
              })}
              title={email} 
              subtitle={entity.email} 
              iconSize={30} 
              iconName={"md-mail"} />}
          </View>
         </ScrollView>
       </View>
     );
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        <ConnectedHeader iconTintColor={Colors.colorAccomodationsScreen} />
        {this._renderOpenDetailModal()}
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
    marginTop: 20,
    marginBottom: 30,
    marginHorizontal: 20,
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
  },
  itemStyle: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#f2f2f2",
    borderRadius: 10
  },
  starsView: {
    marginTop: -5,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  modalView: {
    flex: 1, 
    width: '100%', 
    height: '100%', 
    zIndex: 1, 
    position: 'absolute', 
    top: Layout.statusbarHeight, 
    left: 0, 
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalWindow: { 
    paddingHorizontal: 30,
    paddingTop: 20,
    backgroundColor: "white", 
    zIndex: 2, 
    width: Layout.window.width - 20, 
    height: 200,
    flexDirection: "column",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 14,
  },
  modalDescription: {
    fontSize: 15,
    color: "#333333"
  },
  modalBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    paddingVertical: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnText: {
    color: "white",
    paddingHorizontal: 23,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: Colors.colorAccomodationsScreen
  }
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
    accomodations: state.accomodationsState,
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