import React, { PureComponent } from "react";
import { 
  View, Text, ActivityIndicator, TouchableOpacity, 
  StyleSheet, Image, BackHandler, Platform, ScrollView, NativeModules, Dimensions, StatusBar } from "react-native";
import { FlatList } from "react-native-gesture-handler"
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  ConnectedHeader, 
  ConnectedMapScrollable,
  EntityItem,
  SectionTitle,
  ConnectedScreenErrorBoundary
 } from "../../components";
import { coordsInBound } from '../../helpers/maps';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import {distance, distanceToString} from '../../helpers/maps';


const USE_DR = false;
class ItinerariesScreen extends PureComponent {

  constructor(props) {
    super(props);

    this._watchID = null; /* navigation watch hook */
    this._onFocus = null;
    this._refs = {};
    this._map = null
    this._iconLoaded = 0;

    this.state = {
      render: USE_DR ? false : true,
      //
      itineraries: [],
      coords: {},
      region: Constants.MAP.defaultRegion,
      selectedEntity: null,
      snapPoints: [],
      tracksViewChanges: true,
      //loading
      isEntitiesLoading: true, /* map view top loading */
    };      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * On mount load categories and start listening for user's location
   */
  componentDidMount() {
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    this.props.actions.setMainScreenMounted(true); /* tell that the main screen has mounted (used by ConnectedSplashLoader) */
    if(this.props.others.geolocation && this.props.others.geolocation.coords) {
      this._onUpdateCoords(this.props.others.geolocation.coords);
    }
    this.props.actions.getItineraries();
  }

  componentDidUpdate(prevProps) {
    if(prevProps.itineraries !== this.props.itineraries) {
      this.setState({ itineraries: this.props.itineraries.data });
    }

    if (prevProps.others.geolocation !== this.props.others.geolocation && this.props.others.geolocation.coords) {
      // { coords: { latitude, longitude }, altitude, accuracy, altitudeAccuracy, heading, speed, timestamp (ms since epoch) }
      this._onUpdateCoords(this.props.others.geolocation.coords);
    }
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _isSuccessData  = () => true;
  _isLoadingData  = () => this.props.itineraries.loading;
  _isErrorData    = () => null;

  _onUpdateCoords(newCoords) {
    // const { coords, term } = this.state;
    const { coords } = this.state;
    if(!coords || coords.latitude !== newCoords.latitude || coords.longitude !== newCoords.longitude) {
      let isCordsInBound = coordsInBound(newCoords); 
      // Are coordinates within sardinia's area? fetch the updated pois list
      if (isCordsInBound) {
        this.setState({ isCordsInBound, coords: newCoords, isNearEntitiesLoading: true });
      }
    }
  }

  /**
   * Open single poi screen
   * @param {*} item: item list
   */
  _openItem = (item) => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavItineraryScreen, { item });
  }


  _imageLoaded = () => {
    this._iconLoaded++;
    if(this._iconLoaded == this.state.itineraries.length) {
      setTimeout(() => this.setState({tracksViewChanges: false}), 500);
    }
  }

  _getEntityCoords = (entity) => {
    const { lan } = this.props.locale;
    const coordinates = _.get(entity, ["stages", lan, 0, "poi", "georef", "coordinates"], null)
    // console.log("coordinates", coordinates)
    if(coordinates)
      return { latitude: parseFloat(coordinates[1]), longitude: parseFloat(coordinates[0]) };
    else
      return null;
  }

  /********************* Render methods go down here *********************/

  _renderHeaderText = () => {
    const { whereToGo, explore, itineraries } = this.props.locale.messages;
    const categoryTitle = `${explore} ${itineraries}`;
    return (
      <SectionTitle text={categoryTitle} numberOfLines={1} textStyle={{ fontSize: 20 }} style={{ marginBottom: 15 }}/>
    );
  }

  /* Renders a poi in Header */
  _renderListItem = (item, index) => {
    const { coords } = this.state;
    const { lan } = this.props.locale;
    const title = _.get(item.title, [lan, 0, "value"], null);
    const term = item.term.name;
    const image = item.image;
    var distanceStr = null;
    // Add distance from the first itinerary stage
    if (item.stages && item.stages[lan].length > 0) {
      const stage = item.stages[lan][0];
      const coordinates = _.get(stage, ["poi", "georef", "coordinates"], null) 
      distanceStr = distanceToString(distance(coords.latitude, coords.longitude, coordinates[1], coordinates[0]));
    }
    if (title) {
      return (
        <EntityItem
          keyItem={item.nid}
          listType={Constants.ENTITY_TYPES.itineraries}
          onPress={() => this._openItem(item)}
          title={`${title}`}
          image={`${image}`}
          subtitle={`${term}`}
          distance={this.state.isCordsInBound ? distanceStr : null}
          style={styles.itinerariesListItem}
          horizontal={false}
          extraStyle={{width: '100%', marginBottom: 10}}
          animated={true}
        />
      )
    } else {
      return null;
    }
  }

  /* Render content */
  _renderContent = () => {
    const { nearToYou } = this.props.locale.messages;
    const { coords, region, itineraries  } = this.state;
    const entitiesType = Constants.ENTITY_TYPES.itineraries;
    
    //scrollable props
    const scrollableProps = {
      show: true,
      data: itineraries,
      scrollableTopComponentIsLoading: this._isLoadingData(),
      onEndReached: () => null,
      renderItem: ({ item, index }) => this._renderListItem(item, index),
      keyExtractor: item => item.uuid,
    }

    // MapViewTopProps (MVT)
    const MVTProps = {
      coords, 
      region,
      types: [Constants.NODE_TYPES.itineraries],
      onMarkerPressEvent: "openEntity",
      getCoordsFun: (entity) => this._getEntityCoords(entity),
      iconProps: { 
        name: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entitiesType].iconName,
        backgroundColor: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entitiesType].backgroundColor,
        backgroundTransparent: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entitiesType].backgroundTransparent,
        color: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entitiesType].iconColor,
      }
    };
    
    const mapEntityWidgetProps = { 
      isAccomodationItem: false, 
      coords: this.state.coords, 
    };
    
    const extraComponentProps = {
      data: [],
      keyExtractor: item => item.uuid,
      onPress: this._selectCategory,
      iconProps: { 
        name: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entitiesType].iconName,
        backgroundColor: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entitiesType].backgroundColor,
        color: Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[entitiesType].iconColor,
      }
    }
  
    const extraModalProps = {
        data: [],
        keyExtractor: item => item.uuid,
        renderItem: ({ item }) => null,
        title: nearToYou,
        onEndReached: () => null,
      }
  

    return (
      <ConnectedMapScrollable
        // entities type
        entitiesType={entitiesType}
        // Scrollable container props
        scrollableProps={scrollableProps}
        // Extra component: if scrollableRenderExtraComponent is undefined, must specify extra component props
        // scrollableRenderExtraComponent={this._renderFiltersList}
        scrollableExtraComponentProps={extraComponentProps}
        // Header text component: if scrollableHeaderTextComponent is undefined, must specify scrollableHeaderText
        scrollableHeaderTextComponent={this._renderHeaderText}
        // scrollableHeaderText={() => <Text>Header Text</Text>}
        // Top component (ClusteredMapViewTop or MapView or Custom)
        topComponentType="MapView" //or ClusteredMapViewTop or Custom (if Custom must implement topComponentRender)
        // topComponentCMVTProps={CMVTProps}
        // if topComponentType is MapView must specify topComponentMVTProps 
        topComponentMVTProps={MVTProps}
        // Map entity widget (in modal): if renderMapEntityWidget is undefined, must specify mapEntityWidgetProps and mapEntityWidgetOnPress 
        // e.g. this.state.selectedEntity can now be used in renderMapEntityWidget
        // mapEntityWidgetOnPress={(entity) => this.setState({ selectedEntity: entity })} 
        // renderMapEntityWidget={this._renderEntityWidget}
        mapEntityWidgetProps={mapEntityWidgetProps}
        // Extra modal content: if renderExtraModalComponent is undefined, must specify mapEntityWidgetProps
        // renderExtraModalComponent={this._renderNearToYou}
        extraModalProps={extraModalProps}
      />
    )
  }


  render() {
    const { render } = this.state;
    return (
      <ConnectedScreenErrorBoundary>
        <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]} onLayout={this._onPageLayout}>
          <ConnectedHeader iconTintColor={Colors.colorItinerariesScreen} />
          {render && this._renderContent()}
        </View>
      </ConnectedScreenErrorBoundary>
    )
  }
  
}


ItinerariesScreen.navigationOptions = {
  title: 'ItinerariesScreen',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  container: {
    backgroundColor: Colors.colorPlacesScreen,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    flex: 1,
  },
  sectionTitle: {
      fontSize: 16,
      color: "black",
      fontFamily: "montserrat-bold",
  },
  sectionTitleView: {
    maxHeight: 40, 
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  listHeader: { 
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 76
  },
  listContainer: {
    backgroundColor: Colors.colorPlacesScreen,
    height: "100%"
  },
  listContainerHeader: {
    paddingLeft: 10,
  },
  listStyle: {
    paddingHorizontal: 10,
    paddingBottom: 25,
  },
  listPois: {
    backgroundColor: Colors.colorPlacesScreen,
    height: "100%",
    paddingHorizontal: 10,
  },
  categorySelectorBtn: {
    height: 30, 
    padding: 5, 
    backgroundColor: Colors.blue, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: 10
  },
  filtersList: {
    position: "absolute", 
    top: 10, 
    left: 0, 
    width: "100%", 
    height: 40,
    zIndex: 2, 
    backgroundColor: "transparent"
  },
  marker: {
    // backgroundColor: "transparent",
    // justifyContent: 'center',
    // alignItems: 'center'
    width: "100%",
    height: "100%",
    backgroundColor: "blue",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.colorItinerariesScreen,
    borderRadius: 21
  },
  markerContainer: {
    width: 42,
    height: 42,
    padding: 6,
    borderRadius: 21
  },
  itinerariesListItem: {
    borderWidth: 1,
    borderColor: "#0000001A",
    borderRadius: 10
  },
  widget: {
    width: "100%",
    height: 180,
    position: "absolute",
    // backgroundColor: Colors.lightGray,
    bottom: Platform.OS == "ios" ? 65 : 85,
    left: 0,
    padding: 10,
  },
  cluster: { 
    width: 40, 
    height: 40, 
    borderRadius: 20,
    backgroundColor: Colors.colorItinerariesScreen,
    justifyContent: "center",
    alignItems: "center"
  },
  clusterText: {
    color: "white"
  }
});


function ItinerariesScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <ItinerariesScreen 
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
    // categories: state.categoriesState,
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
})(ItinerariesScreenContainer)