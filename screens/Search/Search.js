import React, { Component } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { ListItem } from "react-native-elements";
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
import * as utils from '../../helpers/utils';
import { Ionicons } from '@expo/vector-icons';

/**
 * Search working mechanism
 * We can autocomplete/search both for terms (categories) and nodes
 * If the returned element is a category then it will have the "term" field and "node" field to null set with its category e.g.:
 *       "term": {
 *         "uuid": "93cb5320-a3b3-40a7-877e-f296a6e2381f",
 *         "vid": 36, => Constants.VIDS 
 *       },
 *       "node": null,
 * If the returned element is a node then it will have the "term" field to null  and "node" field 
 *       "term": null,
 *       "node": {
 *         "nid": 19883,
 *         "uuid": "fa9ddc59-df47-488d-ae14-6fc189e9f192",
 *         "type": "ispiratore", => Constants.NODE_TYPES
 */ 
const USE_DR = false;
class SearchScreen extends Component {

  constructor(props) {
    super(props);

    /* Get props from navigation */
    //let { someNavProps } = props.route.params; 
    this.state = {
      render: USE_DR ? false : true,
      //
      search: "",
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
  }

  componentDidUpdate(prevProps) {
  }

  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _getNavScreenFromType = (type) => {
    const { places, inspirers, itineraries, events, turisticLocation } = Constants.NODE_TYPES;
    const { NavItineraryScreen, NavEventScreen, NavPlaceScreen, NavInspirerScreen, } = Constants.NAVIGATION;
    switch(type) {
      case places:
        return NavPlaceScreen;
      case turisticLocation:
        return NavPlaceScreen;
      case inspirers:
        return NavInspirerScreen;
      case itineraries:
        return NavItineraryScreen;
      case events:
        return NavEventScreen;
      default:
        return NavPlaceScreen;
    }
  }
 
  _listItemOnPress = (el, elType) => {
    const { searchOrAutocomplete } = this.props.others;
    // If autocomplete and has node or is search, navigate directly, otw fill the search box
    if (searchOrAutocomplete === "autocomplete" && !el.node) {
      //set search string, switch to search instead of autocomplete
      this.props.actions.setSearchOrAutocomplete(el.keywords); //new
      this.props.actions.switchSearchOrAutocomplete("search");
      let queryStr = utils.searchParser(el.keywords);
      this.props.actions.search({ queryStr });
    } else {
      // Navigate to node screen
      const navScreen = this._getNavScreenFromType(elType);
      // console.log("NAVIGATEEEEE", elType, navScreen)
      this.props.navigation.navigate(navScreen, { item: el.node, mustFetch: true }); 
    }
  }

  _isNavigableItem = (el) => {
    const { searchOrAutocomplete } = this.props.others;
    return searchOrAutocomplete === "autocomplete" && el.node;
  }

  _isSuccessData  = () => this.props.others.searchOrAutocomplete === "search" ? this.props.searchAutocomplete.searchSuccess : this.props.searchAutocomplete.autocompleteSuccess;
  _isLoadingData  = () => this.props.searchAutocomplete.searchLoading || this.props.searchAutocomplete.autocompleteLoading;
  _isErrorData    = () => this.props.searchAutocomplete.searchError || this.props.searchAutocomplete.autocompleteError;


  /********************* Render methods go down here *********************/

  _renderItem = (el, index) => {
    const { searchOrAutocomplete } = this.props.others;
    const { lan } = this.props.locale;
    const title = searchOrAutocomplete === "autocomplete" ? el.keywords : _.get(el.node.title, [lan, 0, "value"], "?");
    const isNode = el.term === null && el.node !== null; /* is node or category? */
    const elType = isNode ? el.node.type : el.term.vid;
    let entityIconOpts = Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[elType] || {};
    return (
      <TouchableOpacity 
        key={index} 
        onPress={() => this._listItemOnPress(el, elType)} 
        style={[styles.listItem]}>
        <View style={[styles.icon, {
          backgroundColor: entityIconOpts.iconColor,
        }]}>
          <Ionicons
            name={entityIconOpts.iconName}
            size={13}
            color={"white"}
          />
        </View>
        <Text style={this._isNavigableItem(el) ? styles.normalText : styles.boldText}>{title}</Text>
      </TouchableOpacity>
    );
  }


  _renderContent = () => {
    const { searchOrAutocomplete } = this.props.others;
    const data = searchOrAutocomplete === "autocomplete" ? this.props.searchAutocomplete.autocomplete : this.props.searchAutocomplete.search;
     return (
      <AsyncOperationStatusIndicator
        loading={this._isLoadingData()}
        success={this._isSuccessData()}
        error={this._isErrorData()}
        retryFun={() => {}} 
        loadingLayout={<ActivityIndicator animating={true} size={"large"} color={"grey"} />}
        >
        <FlatList
          key={1}
          keyExtractor={(item, index) => index.toString()}
          data={data}
          renderItem={({item, index}) => this._renderItem(item, index)}
          style={styles.scrollView}
        />
      </AsyncOperationStatusIndicator>
     )
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        <ConnectedHeader />
        {render && this._renderContent()}
      </View>
    )
  }
  
}


SearchScreen.navigationOptions = {
  title: 'Search',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  header: {
    backgroundColor: "white"
  },
  container: {
    padding: 10,
  },
  listItem: {
    flex: 1, 
    alignItems: "center", 
    flexDirection: 'row',
    borderBottomColor: '#f2f2f2', 
    borderBottomWidth: 1,
    paddingVertical: 10
  },
  listItemIcon: { 
    // marginLeft: 20, 
    // marginRight: 20 
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginLeft: 15
  },
  normalText: {
    fontSize: 15,
  },
  boldText: {
    fontSize: 15,
    fontWeight: "bold"
  }
});


function SearchScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <SearchScreen 
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
})(SearchScreenContainer)