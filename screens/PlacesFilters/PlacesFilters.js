import React, {Component} from "react";
import {View, TouchableOpacity, StyleSheet, ScrollView, Switch} from "react-native";
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  ConnectedHeader,
  CustomText,
  ConnectedScreenErrorBoundary,
  CustomIcon
} from "../../components";
import {connect, useStore} from 'react-redux';
import {bindActionCreators} from 'redux';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import {ENTITY_TYPES} from "../../constants";
import {CheckBox, ListItem} from "react-native-elements";
import MapView from "react-native-maps";

/* Deferred rendering to speedup page inital load:
   deferred rendering delays the rendering reducing the initial
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;

class PlacesFiltersScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {
      render: USE_DR ? false : true,
      eventFilters: props.events.eventsTypes || [],
      itineraryFilters: props.itineraries.itinerariesTypes || [],
      placeFilters: props.places.placesTypes || [],
      mapType: MapView.MAP_TYPES.STANDARD,
      useSmartFilters: true,
      enableEventFilters: true,
      enableItineraryFilters: true,
      enablePlaceFilters: true,
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
    {
      (USE_DR && setTimeout(() => (this.setState({render: true})), 0))
    }
    ;
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
    if (prevProps.events.eventTypes !== this.props.events.eventTypes) {
      this.setState({
        eventFilters: this.props.events.eventTypes
      })
    }
    if (prevProps.itineraries.itineraryTypes !== this.props.itineraries.itineraryTypes) {
      this.setState({
        itineraryFilters: this.props.itineraries.itineraryTypes
      })
    }
    if (prevProps.places.placeTypes !== this.props.places.placeTypes) {
      this.setState({
        placeFilters: this.props.places.placeTypes
      })
    }
  }

  /**
   * Use this function to unsubscribe or clear any event hooks
   */
  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _isSuccessData = () => false;    /* e.g. this.props.pois.success; */
  _isLoadingData = () => true;   /* e.g. this.props.pois.loading; */
  _isErrorData = () => null;    /* e.g. this.props.pois.error; */


  _fetchFilters = () => {
    this.props.actions.getEventTypes()
    this.props.actions.getItineraryTypes()
    this.props.actions.getPlaceTypes()
  }

  _onFilterPress = (item) => {
    const {selectedFilters} = this.state;
    let newFilters = []
    let filterID = parseInt(item.id)
    if (selectedFilters.indexOf(filterID) == -1) {
      // console.log("selected")
      newFilters = [...selectedFilters]
      newFilters.push(filterID)
    } else {
      // console.log("not selected")
      newFilters = selectedFilters.filter(filter => filter != filterID);
    }

    // console.log("new filters", newFilters)
    this.setState({
      selectedFilters: newFilters
    })
  }

  _onBackPress = () => {
    const {selectedFilters} = this.state;
    if (this.props.events.selectedTypes !== selectedFilters) {
      this.props.actions.resetEvents()
      this.props.actions.setSelectedEventTypes(selectedFilters);
    }
    this.props.navigation.goBack()
  }
  /********************* Render methods go down here *********************/
  _renderEventFiltersContainer = () => {
    return (
      <View style={styles.eventFiltersView}>
        {this._renderEventFilters()}
      </View>
    )
  }

  _renderItineraryFiltersContainer = () => {
    return (
      <View style={styles.eventFiltersView}>
        {this._renderItineraryFilters()}
      </View>
    )
  }

  _renderPlaceFiltersContainer = () => {
    return (
      <View style={styles.eventFiltersView}>
        {this._renderPlaceFilters()}
      </View>
    )
  }

  _renderEventFilters = () => {
    return this.state.eventFilters.map(filter => {
      return this._renderEventFilter(filter)
    })
  }

  _renderEventFilter = (item) => {
    const {selectedFilters} = this.state;

    let filterID = parseInt(item.id)
    const selected = selectedFilters.indexOf(filterID) != -1;
    let opacity = selected ? 0.5 : 1
    // console.log("selected", selected, opacity)
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.eventFilter, Constants.styles.shadow, {
          backgroundColor: selected ? Colors.colorEventsScreen : "white"
        }]}
        onPress={() => this._onFilterPress(item)}
        activeOpacity={0.7}
        disabled={!this.state.enableEventFilters}
      >
        <View style={[styles.icon, {
          backgroundColor: Colors.colorEventsScreen,
          opacity: !this.state.enableEventFilters ? 0.2 : 1
        }]}>
          <CustomIcon
            name={Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[ENTITY_TYPES.events].iconName}
            size={13}
            style={styles.cornerIcon}
            color={Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[ENTITY_TYPES.events].iconColor}
          />
        </View>
        <CustomText style={[styles.eventFilterText, {
          color: selected ? "white" : "#000000DE",
          opacity: !this.state.enableEventFilters ? 0.2 : 1
        }]}>
          {item.name}
        </CustomText>
      </TouchableOpacity>
    )
  }

  _renderItineraryFilters = () => {
    return this.state.itineraryFilters.map(filter => {
      return this._renderItineraryFilter(filter)
    })
  }

  _renderItineraryFilter = (item) => {
    const {selectedFilters} = this.state;

    let filterID = parseInt(item.id)
    const selected = selectedFilters.indexOf(filterID) != -1;
    let opacity = selected ? 0.5 : 1
    // console.log("selected", selected, opacity)
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.eventFilter, Constants.styles.shadow, {
          backgroundColor: selected ? Colors.colorItinerariesScreen : "white"
        }]}
        onPress={() => this._onFilterPress(item)}
        activeOpacity={0.7}
        disabled={!this.state.enableItineraryFilters}
      >
        <View style={[styles.icon, {
          backgroundColor: Colors.colorItinerariesScreen,
          opacity: !this.state.enableItineraryFilters ? 0.2 : 1
        }]}>
          <CustomIcon
            name={Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[ENTITY_TYPES.itineraries].iconName}
            size={13}
            style={styles.cornerIcon}
            color={Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[ENTITY_TYPES.itineraries].iconColor}
          />
        </View>
        <CustomText style={[styles.eventFilterText, {
          color: selected ? "white" : "#000000DE",
          opacity: !this.state.enableItineraryFilters ? 0.2 : 1
        }]}>
          {item.name}
        </CustomText>
      </TouchableOpacity>
    )
  }

  _renderPlaceFilters = () => {
    return this.state.placeFilters.map(filter => {
      return this._renderPlaceFilter(filter)
    })
  }

  _renderPlaceFilter = (item) => {
    const {selectedFilters} = this.state;

    let filterID = parseInt(item.id)
    const selected = selectedFilters.indexOf(filterID) != -1;
    let opacity = selected ? 0.5 : 1
    // console.log("selected", selected, opacity)
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.eventFilter, Constants.styles.shadow, {
          backgroundColor: selected ? Colors.colorPlacesScreen : "white"
        }]}
        onPress={() => this._onFilterPress(item)}
        activeOpacity={0.7}
        disabled={!this.state.enablePlaceFilters}
      >
        <View style={[styles.icon, {
          backgroundColor: Colors.colorPlacesScreen,
          opacity: !this.state.enablePlaceFilters ? 0.2 : 1
        }]}>
          <CustomIcon
            name={Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[ENTITY_TYPES.places].iconName}
            size={13}
            style={styles.cornerIcon}
            color={Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[ENTITY_TYPES.places].iconColor}
          />
        </View>
        <CustomText style={[styles.eventFilterText, {
          color: selected ? "white" : "#000000DE",
          opacity: !this.state.enablePlaceFilters ? 0.2 : 1
        }]}>
          {item.name}
        </CustomText>
      </TouchableOpacity>
    )
  }

  _renderFilters = (filterType) => {
    if (filterType === Constants.ENTITY_TYPES.events) {
      return this._renderEventFiltersContainer()
    } else if (filterType === Constants.ENTITY_TYPES.itineraries) {
      return this._renderItineraryFiltersContainer()
    } else if (filterType === Constants.ENTITY_TYPES.places) {
      return this._renderPlaceFiltersContainer()
    }
  }

  _toggleSmartFilters = () => {
    this.setState(state => ({useSmartFilters: !state.useSmartFilters}))
  }

  _toggleEnableEventFilters = () => {
    const {selectedFilters, eventFilters} = this.state;

    const newSelectedFilters = selectedFilters.filter(selectedFilter => {
      return !eventFilters.find(eventFilter => eventFilter.id === selectedFilter.toString())
    })

    this.setState(state => ({enableEventFilters: !state.enableEventFilters, selectedFilters: newSelectedFilters}))
  }

  _toggleEnableItineraryFilters = () => {
    const {selectedFilters, itineraryFilters} = this.state;

    const newSelectedFilters = selectedFilters.filter(selectedFilter => {
      return !itineraryFilters.find(itineraryFilter => itineraryFilter.id === selectedFilter.toString())
    })

    this.setState(state => ({
      enableItineraryFilters: !state.enableItineraryFilters,
      selectedFilters: newSelectedFilters
    }))
  }

  _toggleEnablePlaceFilters = () => {
    const {selectedFilters, placeFilters} = this.state;

    const newSelectedFilters = selectedFilters.filter(selectedFilter => {
      return !placeFilters.find(placeFilter => placeFilter.id === selectedFilter.toString())
    })

    this.setState(state => ({enablePlaceFilters: !state.enablePlaceFilters, selectedFilters: newSelectedFilters}))
  }


  _renderFilterSections = () => {
    const {tabItineraries, tabWhereToGo, tabEvents} = this.props.locale.messages;

    return (
      <>
        {/* places */}
        <ListItem
          titleStyle={styles.listItemTitle}
          title={tabWhereToGo}
          rightElement={
            <Switch
              trackColor={{false: Colors.lightGray, true: Colors.black}}
              thumbColor={Colors.white}
              value={this.state.enablePlaceFilters}
              onValueChange={this._toggleEnablePlaceFilters}
            />
          }
        />
        {this._renderFilters(Constants.ENTITY_TYPES.places)}
        {/* itineraries */}
        <ListItem
          titleStyle={styles.listItemTitle}
          title={tabItineraries}
          rightElement={
            <Switch
              trackColor={{false: Colors.lightGray, true: Colors.black}}
              thumbColor={Colors.white}
              value={this.state.enableItineraryFilters}
              onValueChange={this._toggleEnableItineraryFilters}
            />
          }
        />
        {this._renderFilters(Constants.ENTITY_TYPES.itineraries)}
        {/* events */}
        <ListItem
          titleStyle={styles.listItemTitle}
          title={tabEvents}
          rightElement={
            <Switch
              trackColor={{false: Colors.lightGray, true: Colors.black}}
              thumbColor={Colors.white}
              value={this.state.enableEventFilters}
              onValueChange={this._toggleEnableEventFilters}
            />
          }
        />
        {this._renderFilters(Constants.ENTITY_TYPES.events)}
      </>
    )
  }

  _onMapCheckBoxPress = (value) => {
    this.setState({mapType: value})
  }

  _renderContent = () => {
    const {
      mapStyleTitle,
      standardMapCheckBoxTitle,
      satelliteMapCheckBoxTitle,
      terrainMapCheckBoxTitle,
      filterByTitle,
      smartFiltersTitle
    } = this.props.locale.messages;

    return (
      <ScrollView style={styles.fill}>
        <CustomText style={styles.title}>{mapStyleTitle}</CustomText>
        <CheckBox
          wrapperStyle={styles.checkboxWrapper}
          containerStyle={styles.checkboxContainer}
          textStyle={styles.checkboxText}
          title={standardMapCheckBoxTitle}
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
          iconRight
          checked={this.state.mapType === MapView.MAP_TYPES.STANDARD}
          checkedColor={Colors.black}
          onPress={() => {
            this._onMapCheckBoxPress(MapView.MAP_TYPES.STANDARD)
          }}
        />
        <CheckBox
          wrapperStyle={styles.checkboxWrapper}
          containerStyle={styles.checkboxContainer}
          textStyle={styles.checkboxText}
          title={satelliteMapCheckBoxTitle}
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
          iconRight
          checked={this.state.mapType === MapView.MAP_TYPES.SATELLITE}
          checkedColor={Colors.black}
          onPress={() => {
            this._onMapCheckBoxPress(MapView.MAP_TYPES.SATELLITE)
          }}
        />
        <CheckBox
          wrapperStyle={styles.checkboxWrapper}
          containerStyle={styles.checkboxContainer}
          textStyle={styles.checkboxText}
          title={terrainMapCheckBoxTitle}
          checkedIcon='dot-circle-o'
          uncheckedIcon='circle-o'
          iconRight
          checked={this.state.mapType === MapView.MAP_TYPES.TERRAIN}
          checkedColor={Colors.black}
          onPress={() => {
            this._onMapCheckBoxPress(MapView.MAP_TYPES.TERRAIN)
          }}
        />
        <CustomText style={styles.title}>{filterByTitle}</CustomText>
        <ListItem
          titleStyle={styles.listItemTitle}
          title={smartFiltersTitle}
          rightElement={
            <Switch
              trackColor={{false: Colors.lightGray, true: Colors.black}}
              thumbColor={Colors.white}
              value={this.state.useSmartFilters}
              onValueChange={this._toggleSmartFilters}
            />
          }
        />
        {!this.state.useSmartFilters && this._renderFilterSections()}
      </ScrollView>
    )
  }


  render() {
    const {render} = this.state;
    return (
      <ConnectedScreenErrorBoundary>
        <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
          <ConnectedHeader onBackPress={this._onBackPress} iconTintColor={Colors.colorEventsScreen}/>
          {render && this._renderContent()}
        </View>
      </ConnectedScreenErrorBoundary>
    )
  }

}


PlacesFiltersScreen.navigationOptions = {
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
    fontSize: 15,
    fontFamily: "montserrat-bold",
    textTransform: "uppercase"
  },
  listItemTitle: {
    fontFamily: "montserrat-bold",
    fontSize: 20
  },
  eventFilter: {
    paddingVertical: 7,
    backgroundColor: "white",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingRight: 15,
    paddingLeft: 5,
    marginRight: 10,
    marginTop: 10,
    paddingVertical: 5
  },
  eventFilterText: {
    color: "#000000DE",
    fontSize: 14
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
    paddingLeft: 15,
    paddingBottom: 16
  },
  checkboxWrapper: {
    justifyContent: 'space-between'
  },
  checkboxContainer: {
    backgroundColor: Colors.white,
    borderWidth: 0,
    paddingLeft: 0,
    paddingRight: 0
  },
  checkboxText: {
    fontFamily: "montserrat-regular",
    fontSize: 15
  }
});


function PlacesFiltersScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <PlacesFiltersScreen
    {...props}
    navigation={navigation}
    route={route}
    store={store}/>;
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
    itineraries: state.itinerariesState,
    places: state.placesState,
  };
};


const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({...actions}, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(PlacesFiltersScreenContainer)
