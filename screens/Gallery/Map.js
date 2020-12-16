import React, { PureComponent } from "react";
import { 
  View, Text, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView, NativeModules } from "react-native";

import { FlatList } from "react-native-gesture-handler"
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  CategoryListItem, 
  AsyncOperationStatusIndicator, 
  ClusteredMapViewTop,
  ConnectedHeader, 
  ScrollableContainer,
  EntityItem,
  CustomText
 } from "../../components";
import { coordsInBound, regionToPoligon, regionDiagonalKm } from '../../helpers/maps';
import {Image} from 'react-native-elements';
// import MapView from "react-native-map-clustering";
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
import { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

/**
 * Map:             Clusters + pois that update with user map's interaction
 *                    can be filtered by category *same filter of Categories&Pois (redux)
 * NearToYou:       near to the user's location (all categories) rendered in the top header
 *                    called at mount + when user changes position (_fetchNearestPois)
 * Categories&Pois: List of Categories and Pois that are in the list
 *                    called when the user reaches the end of the category tree 
 *                    using current selected category + user location (_loadMorePois)
 */

const USE_DR = false;
class GalleryMapScreen extends PureComponent {

  constructor(props) {
    super(props);

    this._watchID = null; /* navigation watch hook */
    this._onFocus = null;
    this._refs = {};

    const events = _.get(props.route, "params.events", []);

    // console.log("events", props.route.params.events.length, events.length)
    this.state = {
      render: USE_DR ? false : true,
      tid: -1,
      coords: {},
      poisLimit: Constants.PAGINATION.poisLimit,
      region: Constants.MAP.defaultRegion,
      selectedEvent: null,
      snapPoints: [],
      tracksViewChanges: false,
    };
      
    this._pageLayoutHeight = Layout.window.height;

  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * On mount load categories and start listening for user's location
   */
  componentDidMount() {
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    //If it's the first mount gets pois categories ("art and archeology...")
    if(this.state.tid < 0){
      // this.props.actions.getCategories({ vid: Constants.VIDS.poisCategories });
    }
    this._initGeolocation();
    
    this._onFocus = this.props.navigation.addListener('focus', () => {
      if(this.state.coords) {
        this._onUpdateCoords(this.state.coords);
      }
    });
    // console.log("events", this.props.route.params)
  }

  componentDidUpdate(prevProps) {
    // if(prevProps.others.placesTerms !== this.props.others.placesTerms) {
    //   this._loadMorePois();
    // }
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this._watchID);
    this._onFocus(); /* unsubscribe */
  }

    /**
   * Used to compute snap points
   * @param {*} event layout event
   */
  _onPageLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    //height of parent - Constants.COMPONENTS.header.height (header) - Constants.COMPONENTS.header.bottomLineHeight (color under header) - 24 (handle) - 36 (header text) - 160 (entityItem) - 10 (margin of entityItem) - 36 (whereToGo text)
    this._generateGrid(width, height);
  }; 

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  /**
   * Setup navigation: on mount get current position and watch changes using _onUpdateCoords
   */
  _initGeolocation = () => {
    navigator.geolocation.getCurrentPosition(
      position => { this._onUpdateCoords(position.coords); }, 
      ex => { console.log(ex) },
      Constants.NAVIGATOR.watchPositionOpts
    );
    this._watchID = navigator.geolocation.watchPosition(
      position => { this._onUpdateCoords(position.coords); }, 
      ex => { console.log(ex) },
      Constants.NAVIGATOR.watchPositionOpts
    );
  }

  /**
   * Invoked whenever the coordinates get updated (either on initial load or when the user moves)
   *  Pois: fetches new nearest pois and clusters.
   *  PoisCategories: if there are no more nested categories then, instead of loading subcategories load just pois (leaf)
   *  TODO PERFORMANCE ISSUE: 
   *    - if we don't set a threshold on min number of meters there's the risk that this method will be invoked many times!
   *    - it is invoked too many times also when pushing a new screen
   * @param {*} newCoords: the new user's coordinates
   */
  _onUpdateCoords(newCoords) {
    // const { coords, term } = this.state;
    const { coords } = this.state;
    if(!coords || coords.latitude !== newCoords.latitude || coords.longitude !== newCoords.longitude) {
      let isCordsInBound = coordsInBound(newCoords); 
      // Are coordinates within sardinia's area? fetch the updated pois list
      if (isCordsInBound) {
        this.setState({ isCordsInBound, coords: newCoords, nearPoisRefreshing: true });
        // this._fetchNearestPois(newCoords).then(() => {
        //   this.setState({ nearPoisRefreshing: false });
        // });
      }
    }
    // Update list of pois if we are at the bottom of the category tree
    // if(this._isPoiList()){
    //   this._loadMorePois();
    // } 
  }

  /**
   * Get more pois when the user changes position and/or 
   * we reach the end of the category tree . 
   * Pois are loaded in order of distance from the user and are "categorized"
   * to load pois in the bottom scrollable container list (not header)
   * uuids controls the category of the pois
   */
  _loadMorePois = () => {
    const { childUuids } = this._getCurrentTerm();
    var { coords } = this.state;
    if(coords && this._isPoiList() && !this.state.poisRefreshing){
      this.setState({
        poisRefreshing: true
      }, () => {
        apolloQuery(actions.getNearestPois({
          limit: this.state.poisLimit,
          offset: this.state.pois ? this.state.pois.length : 0,
          x: coords.longitude,
          y: coords.latitude,
          uuids: childUuids
        })).then((pois) => {
          this.setState({
            pois: this.state.pois ? [...this.state.pois, ...pois] : pois,
            poisRefreshing: false
          });
        })
      });
    }
  }

  /**
   * Open single poi screen
   * @param {*} item: item list
   */
  _openPoi = (item) => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, { item });
  }


  _generateGrid = (w,h) => {
    if(!w && !h)
      return;
    var nCol = 6, nRow = 6;
    var dY = h/nRow;
    var dX = w/nCol;
    var cells = [];
    for(var i = 0; i < nRow; i++) {
      for(var j = 0; j < nCol; j++) {
        if(!(Math.floor(i/2) == 1 && Math.floor(j/2) == 1)){
          var cell = {
            rect: {
              tl: {
                x: dX*i,
                y: dY*j
              },
              br: {
                x: dX*i + dX,
                y: dY*j + dY
              },
              w: dX,
              h: dY
            }
          };
          cell.centroid = {
            pixels: {
              x: dX*i + dX/2,
              y: dY*j + dY/2,
            },
          };
          cell.centroid.norm = {
            x: cell.centroid.x/w,
            y: cell.centroid.y/h,
          };
        }
        cells.push(cell);
      }
    }
    var cell = {
      rect: {
        tl: {
          x: dX*2,
          y: dY*2
        },
        br: {
          x: dX*2 + dX*2,
          y: dY*2 + dY*2
        },
        w: dX*2,
        h: dY*2
      },
      centroid: {
        pixels: {
          x: w/2,
          y: h/2,
        }
      },
    }
    cell.centroid.norm = {
      x: cell.centroid.x/w,
      y: cell.centroid.y/h,
    }
    cells.push(cell);

    this.setState({cells: cells, cellW: dX, cellH: dY});
  }
  
  
  /* Render content */
  _renderContent = () => {

    const { coords, region, cells } = this.state;

    if(cells)
      console.log("Cells", cells.length);

    return (
      <View style={styles.fill} onLayout={this._onPageLayout}>
        <MapView
          coords={coords}
          initialRegion={region}
          provider={ PROVIDER_GOOGLE }
          mapType='standard'
          provider={PROVIDER_GOOGLE}
          showsUserLocation={ true }
          showsIndoorLevelPicker={false}
          showsCompass={false}
          renderCluster={this._renderCluster}
          clusteringEnabled={true}
          clusterColor={Colors.colorEventsScreen}
          style={{flex: 1}}
          onPress={() => this._selectMarker(null)}
        >
        </MapView>
        {cells && <View style={styles.gridView}>
          {cells.map(cell => {
            return <Image style={{
              position: 'absolute',
              left: cell.rect.tl.x,
              top: cell.rect.tl.y,
              width: cell.rect.w,
              height: cell.rect.h,
              borderColor: "red",
              borderWidth: 1}}/>
          })}
        </View>}
        
      </View>
    )
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]} >
        <ConnectedHeader 
          iconTintColor={Colors.colorEventsScreen}  
          backButtonVisible={true}
        />
        {render && this._renderContent()}
      </View>
    )
  }
  
}


GalleryMapScreen.navigationOptions = {
  title: 'GalleryMapScreen',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  sectionTitle: {
      fontSize: 16,
      color: "black",
      fontFamily: "montserrat-bold",
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
  gridView: {
    position: "absolute",
    flex: 1
  }
});


function GalleryMapScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <GalleryMapScreen 
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
    categories: state.categoriesState,
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
})(GalleryMapScreenContainer)