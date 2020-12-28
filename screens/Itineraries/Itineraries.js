import React, { PureComponent } from "react";
import { 
  View, Text, ActivityIndicator, TouchableOpacity, 
  StyleSheet, Image, BackHandler, Platform, ScrollView, NativeModules, Dimensions, StatusBar } from "react-native";

import { FlatList } from "react-native-gesture-handler"
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  CategoryListItem, 
  AsyncOperationStatusIndicator, 
  ClusteredMapViewTop,
  ConnectedHeader, 
  ScrollableContainer,
  EntityItem,
  CustomText,
  SectionTitle,
  UpdateHandler
 } from "../../components";
import { coordsInBound, regionToPoligon, regionDiagonalKm } from '../../helpers/maps';
import MapView from "react-native-maps";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import { apolloQuery } from '../../apollo/queries';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { LLEntitiesFlatlist } from "../../components/loadingLayouts";
import { Button } from "react-native-paper";
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import {distance, distanceToString} from '../../helpers/maps';
import Itinerary from "./Itinerary";


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
    };

    this._pageLayoutHeight = Layout.window.height;

      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * On mount load categories and start listening for user's location
   */
  componentDidMount() {
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
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

  _onUpdateCoords(newCoords) {
    // const { coords, term } = this.state;
    console.log(newCoords);
    const { coords } = this.state;
    if(!coords || coords.latitude !== newCoords.latitude || coords.longitude !== newCoords.longitude) {
      let isCordsInBound = coordsInBound(newCoords); 
      // Are coordinates within sardinia's area? fetch the updated pois list
      if (isCordsInBound) {
        this.setState({ isCordsInBound, coords: newCoords, nearPoisRefreshing: true });
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


  _selectMarker = (itinerary) => {
    if(itinerary) {
      this.props.actions.setScrollableSnapIndex(Constants.ENTITY_TYPES.itineraries, 1);
      this.setState({ selectedEntity: null }, () => {
        this.setState({ 
          selectedEntity: itinerary,
          tracksViewChanges: true
        }, () => {
          this.setState({
            tracksViewChanges: false
          })
        });
      })
    } else {
      this.setState({ 
        selectedEntity: null,
        tracksViewChanges: true
      }, () => {
        this.setState({
          tracksViewChanges: false
        })
      });
    }
  }

  
  /**
   * Used to compute snap points
   * @param {*} event layout event
   */
  _onPageLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    this._pageLayoutHeight = height;
    let margins = 20
    let itemWidth = ((Layout.window.width - (margins*2))/2) - 5;
    //height of parent - Constants.COMPONENTS.header.height (header) - Constants.COMPONENTS.header.bottomLineHeight (color under header) - 24 (handle) - 36 (header text) - itemWidth (entityItem) - 10 (margin of entityItem)
    /* Old: 3 snap points: this.setState({ snapPoints: [0, height -  Layout.statusbarHeight - Constants.COMPONENTS.header.height - Constants.COMPONENTS.header.bottomLineHeight - 24 - 76 - itemWidth - 10, height -  Layout.statusbarHeight - Constants.COMPONENTS.header.height - Constants.COMPONENTS.header.bottomLineHeight - 24 - 76, height -  Layout.statusbarHeight - Constants.COMPONENTS.header.height - Constants.COMPONENTS.header.bottomLineHeight - 34] }); */
    this.setState({ snapPoints: [height -  Layout.statusbarHeight - Constants.COMPONENTS.header.height - Constants.COMPONENTS.header.bottomLineHeight, 65] });
  }; 

  _onSettle = () => {
    this.setState({
      selectedEntity: null
    })
  }


  _imageLoaded = () => {
    this._iconLoaded++;
    if(this._iconLoaded == this.state.itineraries.length) {
      setTimeout(() => this.setState({tracksViewChanges: false}), 500);
    }
  }

  /********************* Render methods go down here *********************/
  
  _renderCluster = (cluster) => {
    const { id, geometry, onPress, properties } = cluster;
    const points = properties.point_count;

    return (
      <Marker
        key={`cluster-${id}`}
        coordinate={{
          longitude: geometry.coordinates[0],
          latitude: geometry.coordinates[1]
        }}
        onPress={onPress}
      >
        <View style={styles.cluster}>
          <CustomText style={styles.clusterText}>{points}</CustomText>
        </View>
      </Marker>
    )
  }
  /* Renders the topmost component: a map in our use case */
  _renderTopComponent = () => {
    const { coords, region, selectedEntity } = this.state;
    return (
      <>
      <MapView
        coords={coords}
        initialRegion={region}
        mapType='standard'
        provider={PROVIDER_GOOGLE}
        showsUserLocation={ true }
        showsIndoorLevelPicker={true}
        showsCompass={false}
        renderCluster={this._renderCluster}
        ref={(ref) => this._map = ref}
        clusterColor={Colors.colorItinerariesScreen}
        style={{flex: 1}}
        onPress={() => this._selectMarker(null)}
        onPanDrag={() => selectedEntity && this._selectMarker(null)}
      >
        {this._renderMarkers()}
      </MapView>
      {selectedEntity && this._renderWidget()}
      </>
    )
  }

  _renderWidget = () => {
    
    const { selectedEntity, coords } = this.state;
    const { lan } = this.props.locale;
    const title = _.get(selectedEntity.title, [lan, 0, "value"], null);
    const term = selectedEntity.term.name;
    const image = selectedEntity.image;
    let distanceStr = null;

    // Add distance from the first itinerary stage
    if (selectedEntity.stages && selectedEntity.stages[lan].length > 0) {
      const stage = selectedEntity.stages[lan][0];
      const coordinates = _.get(stage, ["poi", "georef", "coordinates"], null) 
      distanceStr = distanceToString(distance(coords.latitude, coords.longitude, coordinates[1], coordinates[0]));
    }

    return(
      <View style={styles.widget}>
        <EntityItem 
          keyItem={selectedEntity.nid}
          listType={Constants.ENTITY_TYPES.itineraries}
          onPress={() => this._openItem(selectedEntity)}
          title={title}
          image={image}
          subtitle={term}
          style={styles.itinerariesListItem}
          horizontal={false}
          topSpace={10}
          distance={this.state.isCordsInBound ? distanceStr : null}
          extraStyle={{
            marginBottom: 10,
            width: "100%",
            height: "100%"
          }}
        />
      </View>
    )
  }

  _renderMarkers = () => {
    return this.state.itineraries.map( itinerary => {
      return this._renderMarker(itinerary)
    })
  }

  _renderMarker = (itinerary) => {
    const { lan } = this.props.locale;
    const coordinates = _.get(itinerary, ["stages", lan, 0, "poi", "georef", "coordinates"], null)
    if(coordinates){
      const lat = _.get(coordinates, [1], null)
      const long = _.get(coordinates, [0], null)
      const selected = this.state.selectedEntity == itinerary;
      const width = 32;

      return(
        lat && long && (
        <Marker.Animated
          coordinate={{ longitude: parseFloat(long),  latitude: parseFloat(lat) }}
          onPress={() => this._selectMarker(itinerary)}
          tracksViewChanges={this.state.tracksViewChanges}
          //tracksViewChanges={false}
          style={{width: 42, height: 42, zIndex: 1}}>
            <View style={[styles.markerContainer, {
              backgroundColor: selected ? Colors.greenTransparent : "transparent"
            }]}>
              <View
                style={[styles.marker]}>
                <Image
                  source={require("./../../assets/icons/itineraries_icon.png")}
                  onLoad={this._imageLoaded}
                  style={{
                    paddingTop: Platform.OS === 'ios' ? 3 : 0,
                    width: 20,
                    height: 20
                  }}
                />
              </View>
            </View>
        </Marker.Animated>
        )
      )
    }
    else
      return null
  }

  _renderHeaderText = () => {
    const { exploreItineraries } = this.props.locale.messages;
      return (
        <SectionTitle text={exploreItineraries} textStyle={{ fontSize: 20 }} onStartShouldSetResponder={this._onListHeaderPressIn}/>
      )
  }

  /* Horizontal spacing for Header items */
  _renderHorizontalSeparator = () => <View style={{ width: 5, flex: 1 }}></View>;

  /* Renders a poi in Header */
  _renderListItem = ({item, index}) => {
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
        extraStyle={{
          width: "100%"
        }}
      />
  )}

  /* Render content */
  _renderContent = () => {
    const { selectedEntity, itineraries } = this.state;
    let data = itineraries;
    if(!data.length)
      data = []
    let snapIndex = selectedEntity ? 3 : 2;
    let numColumns = 1;
    return (
      <ScrollableContainer 
        entityType={Constants.ENTITY_TYPES.itineraries}
        topComponent={this._renderTopComponent}
        data={data}
        initialSnapIndex={1}
        pageLayoutHeight={this._pageLayoutHeight}
        numColumns={numColumns}
        snapPoints={this.state.snapPoints}
        onSettle={this._onSettle}
        renderItem={this._renderListItem}
        keyExtractor={item => item.uuid}
        HeaderTextComponent={this._renderHeaderText}
        closeSnapIndex={1}
      />
    )
  }


  render() {
    const { render } = this.state;
    const { updateInProgressText, updateFinishedText } = this.props.locale.messages;
    
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]} onLayout={this._onPageLayout}>
        <ConnectedHeader iconTintColor={Colors.colorItinerariesScreen} />
        <UpdateHandler updateInProgressText={updateInProgressText} updateFinishedText={updateFinishedText} />
        {render && this._renderContent()}
      </View>
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