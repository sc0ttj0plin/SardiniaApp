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
  EntityVirtualTour,
  EntityWhyVisit,
  TopMedia,
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
import { greedyArrayFinder, getEntityInfo } from '../../helpers/utils';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { LLEntitiesFlatlist } from "../../components/loadingLayouts";


const USE_DR = false;
class PlaceScreen extends Component {

  constructor(props) {
    super(props);

    const uuid = props.route.params.item.uuid;

    /* Get props from navigation */
    this.state = {
      uuid,
      render: USE_DR ? false : true,
      //entity initial state
      abstract: null, 
      title: null, 
      description: null, 
      whyVisit: null, 
      coordinates: null, 
      socialUrl: null
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    this.props.actions.getPoi({ uuid: this.state.uuid });
  }

  /* NOTE: since this screen is not */
  componentDidUpdate(prevProps) {
    const { uuid } = this.state;
    // const uuid = this.props.route.params.item.uuid;
    //If a new screen is 
    // if (prevProps.route.params.item !== this.props.route.params.item)
    //   this.props.actions.getPoi({ uuid });
    
    if (prevProps.pois.data[uuid] !== this.props.pois.data[uuid]) {
      const { lan } = locale;
      const { pois, favourites, locale } = this.props;
      const { abstract, title, description, whyVisit } = 
      getEntityInfo(entity, {"abstract": 1, "title": 1, "description": 1, "whyVisit": 1}, [lan, 0, "value"]);
      const coordinates = getCoordinates(entity);
      const socialUrl = `${Constants.WEBSITE_URL}${greedyArrayFinder(entity.url_alias, "language", lan, "alias", "")}`;
      this.setState({ abstract, title, description, whyVisit, coordinates, socialUrl });
    }
    
  }
  
  componentWillUnmount() {
    console.log("Unmount Place!!")
  }
  
  
  /********************* Render methods go down here *********************/
  _renderContent = () => {
    const { lan } = locale;
    const { whyVisit: whyVisitTitle, discoverMore } = locale.messages;
    
    const { orientation } = this.state;
    const entity = pois[uuid];
    const isFavourite = favourites.places[uuid];


     return (
       <View style={styles.fill}>
         <ScrollView style={styles.fill}>
          <TopMedia urlVideo={} urlImage={} />   
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


PlaceScreen.navigationOptions = {
  title: 'Boilerplate',
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