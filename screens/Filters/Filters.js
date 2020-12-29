import React, { Component } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView, TouchableOpacityComponent } from "react-native";
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
  CustomText
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
import { Ionicons } from '@expo/vector-icons';

/* Deferred rendering to speedup page inital load: 
   deferred rendering delays the rendering reducing the initial 
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;
class FiltersScreen extends Component {

  constructor(props) {
    super(props);

    /* Get props from navigation */
    let { filterType } = props.route.params; 

    this.state = {
      render: USE_DR ? false : true,
      filterType: filterType || Constants.ENTITY_TYPES.events,
      eventFilters: props.events.eventsTypes || [],
      selectedFilters: props.events.selectedTypes || []
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
    this._fetchFilters()
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
    if(prevProps.events.eventTypes !== this.props.events.eventTypes){
        // console.log("filters", this.props.events.eventTypes)
        this.setState({
            eventFilters: this.props.events.eventTypes
        })
    }
  }

  /**
   * Use this function to unsubscribe or clear any event hooks
   */
  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _isSuccessData  = () => false;    /* e.g. this.props.pois.success; */
  _isLoadingData  = () => true;   /* e.g. this.props.pois.loading; */
  _isErrorData    = () => null;    /* e.g. this.props.pois.error; */


  _fetchFilters = () => {
      const { filterType } = this.state;
      if(filterType == Constants.ENTITY_TYPES.events)
        this._fetchEventsFilters()
  }

  _fetchEventsFilters = () => {
    this.props.actions.getEventTypes()
  }

  _onFilterPress = (item) => {
    const { selectedFilters } = this.state;
    let newFilters = []
    let filterID = parseInt(item.id)
    if(selectedFilters.indexOf(filterID) == -1){
        // console.log("selected")
        newFilters = [...selectedFilters]
        newFilters.push(filterID)
    }
    else{
        // console.log("not selected")
        newFilters = selectedFilters.filter(filter => filter != filterID);
    }

    // console.log("new filters", newFilters)
    this.setState({
        selectedFilters: newFilters
    })
  }

  _onBackPress = () => {
    const { selectedFilters } = this.state;
    if(this.props.events.selectedTypes !== selectedFilters){
        this.props.actions.resetEvents()
        this.props.actions.setSelectedEventTypes(selectedFilters);
    }
    this.props.navigation.goBack()
  }
  /********************* Render methods go down here *********************/
  _renderEventFiltersContainer = () => {
    // console.log("events", this.state.eventFilters.length)
    return(
        <View style={styles.eventFiltersView}>
            {this._renderEventFilters()}
        </View>
    )
  }
  
  _renderEventFilters = () => {
      return this.state.eventFilters.map( filter => {
          return this._renderEventFilter(filter)
      })
  }

  _renderEventFilter = (item) => {
    const { selectedFilters } = this.state;
    
    let filterID = parseInt(item.id)
    const selected = selectedFilters.indexOf(filterID) != -1;
    let opacity = selected ? 0.5 : 1
    // console.log("selected", selected, opacity)
    return(
        <TouchableOpacity 
            style={[styles.eventFilter, Constants.styles.shadow, {
                backgroundColor: selected ? Colors.colorEventsScreen  : "white" 
            }]} 
            onPress={() => this._onFilterPress(item)} 
            activeOpacity={0.7}>
            <View style={styles.icon}>
                <Ionicons
                    name={Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS["events"].iconName}
                    size={13}
                    style={styles.cornerIcon}
                    color={Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS["events"].iconColor}
                />
            </View>
            <CustomText style={[styles.eventFilterText,{color: selected ? "white" : "#000000DE"}]}>
              {item.name}
            </CustomText>
        </TouchableOpacity>
    )
  }

  _renderFilters = () => {
    const { filterType } = this.state;
    if(filterType == Constants.ENTITY_TYPES.events){
        return this._renderEventFiltersContainer()
    }
  }

  _renderContent = () => {
    const { filterBy } = this.props.locale.messages;

     return (
      <View style={styles.fill}>
        <CustomText style={styles.title}>{filterBy}</CustomText>
        {this._renderFilters()}
      </View>
     )
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        <ConnectedHeader onBackPress={this._onBackPress} iconTintColor={Colors.colorEventsScreen}/>
        {render && this._renderContent()}
      </View>
    )
  }
  
}


FiltersScreen.navigationOptions = {
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
  title: {
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
    color: "#000000E6",
    backgroundColor: "#F2F2F2",
    height: 40,
    fontSize: 15,
    fontFamily: "montserrat-bold",
    textTransform: "uppercase"
  },
  eventFilter: {
    height: 32, 
    paddingVertical: 7, 
    backgroundColor: "white", 
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingRight: 15,
    paddingLeft: 5,
    marginRight: 10,
    marginTop: 10
  },
  eventFilterText: {
    color: "#000000DE",
    fontSize: 14
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.colorEventsScreen,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8
  },
  eventFiltersView: {
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-start",
      flexWrap: "wrap",
      paddingLeft: 15
  }
});


function FiltersScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <FiltersScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    restState: state.restState,
    //auth
    auth: state.authState,
    //mixed state
    others: state.othersState,
    //language
    locale: state.localeState,
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
})(FiltersScreenContainer)