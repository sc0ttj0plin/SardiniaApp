import React, { PureComponent } from "react";
import { 
  View, Text, ActivityIndicator,
  StyleSheet, Image, BackHandler, Platform, ScrollView, NativeModules, PointPropType } from "react-native";

import { Flablist } from "react-native-gesture-handler"
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  ConnectedHeader, 
  ConnectedScreenErrorBoundary
 } from "../../components";
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
import { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

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
      pois: {},
      cells: [],
      debug: false
    };

    this._region = this.state.region;
    this._selected = false;
    this._pageLayoutHeight = Layout.window.height;

  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * On mount load categories and start listening for user's location
   */
  componentDidMount() {
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    setTimeout(() => {
      var region = Constants.MAP.defaultRegionZoomed;
      this._mapRef.animateCamera({
          center: { latitude: region.latitude, longitude: region.longitude },
          zoom: region.zoom
        },
        {duration: 500}
      )
      this._regionOnCompleteEnabled = true 
      }, 500);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.others.geolocation !== this.props.others.geolocation && this.props.others.geolocation.coords) {
      // { coords: { latitude, longitude }, altitude, accuracy, altitudeAccuracy, heading, speed, timestamp (ms since epoch) }
    }
    
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
   * Open single poi screen
   * @param {*} item: item list
   */
  _openPoi = (item) => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, { item, mustFetch: true });
  }


  _generateGrid = (w,h) => {
    if(!w && !h)
      return;
    var nCol = 6, nRow = 6;
    var dY = h/nRow;
    var dX = w/nCol;
    var cells = [];

    var cell = {
      rect: {
        bl: {
          x: dX*2,
          y: dY*2
        },
        tr: {
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
    cell.rectNorm = {
      bl: {
        x: cell.rect.bl.x / w,
        y: cell.rect.bl.y / h,
      },
      tr: {
        x: cell.rect.tr.x / w,
        y: cell.rect.tr.y / h,
      },
      w: dX / w,
      h: dY / h
    },
    cell.centroid.norm = {
      x: cell.centroid.pixels.x/w,
      y: cell.centroid.pixels.y/h,
    }
    cells.push(cell);

    for(var j = 0; j < nCol; j++) {
      for(var i = 0; i < nRow; i++) {
        if(!(Math.floor(i/2) == 1 && Math.floor(j/2) == 1)){
          var cell = {
            rect: {
              bl: {
                x: dX*i,
                y: dY*j
              },
              tr: {
                x: dX*i + dX,
                y: dY*j + dY
              },
              w: dX,
              h: dY
            }
          };
          cell.rectNorm = {
            bl: {
              x: cell.rect.bl.x / w,
              y: cell.rect.bl.y / h,
            },
            tr: {
              x: cell.rect.tr.x / w,
              y: cell.rect.tr.y / h,
            },
            w: dX / w,
            h: dY / h
          },
          cell.centroid = {
            pixels: {
              x: dX*i + dX/2,
              y: dY*j + dY/2,
            },
          };
          cell.centroid.norm = {
            x: cell.centroid.pixels.x/w,
            y: cell.centroid.pixels.y/h,
          };
          cells.push(cell);
        }
      }
    }

    this.setState({cells: cells, cellW: dX, cellH: dY}, () => {

    });
    
  }

  _getPois = (region)  => {
    this._region = region;

    var cells = this.state.cells;
    var tasks = [];

    if(!cells)
      return;

    for(var i = 0; i<cells.length; i++){
      var cell = cells[i];
      var dX = region.longitudeDelta;
      var dY = region.latitudeDelta;
      var x = region.longitude - dX/2 + cell.centroid.norm.x * dX;
      var y = region.latitude + dY/2 - cell.centroid.norm.y * dY;
      tasks[i] = apolloQuery(actions.getNearestPoisLight({
        limit: 33,
        x: x,
        y: y
      }))
    }
    var pois = [];
    Promise.all(tasks).then((res)=>{
      for(var i = 0; i<res.length; i++){
        var j = 0;
        if(i > 0) {
          for(var k = 0; k < i; k++){
            while(j < res[i].length  && res[i][j].uuid == pois[k].uuid){
              //console.log(i, k, j, res[i][j].title.it[0].value, pois[k].title.it[0].value);
              j++;
              k=0;
            }
          }
        }
        //console.log("accepted", i, j, res[i][j].title.it[0].value);
        pois[i] = res[i][j];
      }
      if(this._selected) {
        pois[0]=this._selected.poi;
      }
      this._selected = null;
      this.setState({pois: {...pois}});
    });
    
  }

  _onRegionChangeComplete = (region) => {
    if(!this._regionOnCompleteEnabled)
      return;

    var pois = {};
    if(!this._selected)
      this.setState({pois: {...pois}},() => {this.forceUpdate()});
    if(this._panTimeout){
      clearTimeout(this._panTimeout);
    }
    this._panTimeout = setTimeout(() => {
      this._getPois(region);
    }, 1500);
  }

  _getPressedCell = (position) => {
    var cells = this.state.cells;
    var dX = this._region.longitudeDelta;
    var dY = this._region.latitudeDelta;
    for(var i = 0; i < cells.length; i++){
      var cell = cells[i];
      var rect = {
        bl: {
          x: this._region.longitude - dX/2 + cell.rectNorm.bl.x * dX,
          y: this._region.latitude + dY/2 - cell.rectNorm.bl.y * dY,
        },
        tr: {
          x: this._region.longitude - dX/2 + cell.rectNorm.tr.x * dX,
          y: this._region.latitude + dY/2 - cell.rectNorm.tr.y * dY,
        }
      }

      if(position.y < rect.bl.y && position.y > rect.tr.y && position.x > rect.bl.x && position.x < rect.tr.x){
        return i;
      }
    }
    return -1;
  }

  _onPress = (e) => {

    this._decreaseImagesOpacity(2000);

    var point = {
      x: e.nativeEvent.coordinate.longitude,
      y: e.nativeEvent.coordinate.latitude,
    }

    var index = this._getPressedCell(point);

    if(index >= 1) {
      //("animate", index);
      this._selectPoi(index);
    } else if (index==0){
      this._selected = null;
      if(this.state.pois[index]){
        this._openPoi(this.state.pois[index]);
      }
    } else {
      this._selected = null;
    }
    
  }

  _selectPoi = (index) => {
    var selectedPoi = this.state.pois[index];
    if(!selectedPoi) {
      return;
    }
    var latlng = {
      latitude: selectedPoi.georef.coordinates[1],
      longitude: selectedPoi.georef.coordinates[0]
    }
    this._selected = {
      poi: selectedPoi,
      index: index
    }
    var pois = {};
    pois[0] = this._selected.poi;
    this.setState({pois: {...pois}},() => {this.forceUpdate()});
    this._mapRef.animateCamera({center: latlng}, {duration: 1000});
  }
  
  _onPanDrag = () => {
    this._decreaseImagesOpacity(200);
  }

  _onDoublePress = () => {
    this._decreaseImagesOpacity(2000);
  }

  _decreaseImagesOpacity = (t) => {
    this.setState({panning: true});

    if(this.panningT){
      clearTimeout(this.panningT);
    }

    this.panningT = setTimeout(() => {
      this.setState({panning: false});
    }, t);
  }
  
  /* Render content */
  _renderContent = () => {

    const { region, panning, cells, pois } = this.state;
    
    var selectedCoordinate = null;
    var selectedPoi = null;

    if(this.state.pois[0]) {
      selectedPoi = this.state.pois[0];
      selectedCoordinate = {latitude: selectedPoi.georef.coordinates[1], longitude: selectedPoi.georef.coordinates[0]};
    }

    return (
      <ConnectedScreenErrorBoundary>
      <View style={styles.fill} onLayout={this._onPageLayout}>
        <MapView
          ref={(ref) => this._mapRef = ref}
          initialRegion={region}
          provider={ PROVIDER_GOOGLE }
          mapType='standard'
          provider={PROVIDER_GOOGLE}
          showsUserLocation={ true }
          showsIndoorLevelPicker={false}
          showsCompass={false}
          customMapStyle={[
            {
              featureType: "administrative",
              elementType: "geometry",
              stylers: [
              {
                  visibility: "true"
              }
              ]
            },
            {
              featureType: "poi",
              stylers: [
                {
                  visibility: "off"
                }
              ]
            },
            {
              featureType: "road",
              elementType: "labels.icon",
              stylers: [
                {
                  visibility: "true"
                }
              ]
            },
            {
              featureType: "transit",
              stylers: [
                {
                  visibility: "off"
                }
              ]
            }
          ]}
          renderCluster={this._renderCluster}
          clusterColor={Colors.colorEventsScreen}
          style={{flex: 1}}
          onRegionChangeComplete={this._onRegionChangeComplete}
          onPanDrag={this._onPanDrag}
          onPress={this._onPress}
          onDoublePress={this._onDoublePress}
          moveOnMarkerPress={true}
        >

          {selectedPoi && 
            (<Marker id={0} coordinate={selectedCoordinate} onPress={() => this._openPoi(selectedPoi)}></Marker>)
          }
          {this.state.debug && Object.keys(pois).length > 0 && Object.keys(pois).map((key) => {
            var poi = pois[key];
            if(poi && poi.georef) {
              var coordinate = {latitude: poi.georef.coordinates[1], longitude: poi.georef.coordinates[0]};
              return (<Marker id={key} coordinate={coordinate} onPress={() => this._selectPoi(key)}>
                {this.state.debug && <Text style={{height: 20, fontWeight: "800", width: 20, textAlign: "center", textAlignVertical: "center", backgroundColor: "white"}}>{key}</Text>}
                </Marker>)
              }
            })
          }
        </MapView>
        {!this.state.debug && Object.keys(pois).length > 0 && <View pointerEvents="none" style={[styles.gridView, {opacity: panning ? 0.3 : 1}]}>
          {Object.keys(pois).map((key) => {
            var poi = pois[key];
            var cell = this.state.cells[key];
            if(poi && poi.image350x && poi.image350x.length > 0) {
              return <Image pointerEvents="none" style={{
                position: 'absolute',
                left: cell.rect.bl.x,
                top: cell.rect.bl.y,
                width: cell.rect.w,
                height: cell.rect.h,
              }}
            source={{uri: poi.image350x}}
              />
          }})}
        </View>}
        {cells && <View pointerEvents="none" style={styles.gridView}>
          {cells.map((cell, i) => {
            return (
              <View 
              style={{
              position: 'absolute',
              left: cell.rect.bl.x,
              top: cell.rect.bl.y,
              width: cell.rect.w,
              height: cell.rect.h,
              borderColor: Colors.colorPlacesScreen,
              opacity: 0.3,
              borderWidth: 0.5,

            }}
              >
                {this.state.debug && <View style={{height: "100%", width: "100%", alignItems: "center", display: "flex", flexDirection: "column", alignContent: "center"}}> 
                  <Text style={{fontSize: 10, color: "red" }}>{i}</Text>
                  <Text style={{fontSize: 10, color: "red" }}>{cell.centroid.norm.x.toFixed(2) + " " + cell.centroid.norm.y.toFixed(2)}</Text>

                  <Text style={{fontSize: 10, color: "red" }}>{cell.centroid.pixels.x.toFixed(0) + " " + cell.centroid.pixels.y.toFixed(0)}</Text>
                  <Text style={{fontSize: 10, color: "red" }}>BL</Text>
                  <Text style={{fontSize: 10, color: "red" }}>{cell.rectNorm.bl.x.toFixed(2) + " " + cell.rectNorm.bl.y.toFixed(2)}</Text>
                  <Text style={{fontSize: 10, color: "red" }}>TR</Text>
                  <Text style={{fontSize: 10, color: "red" }}>{cell.rectNorm.tr.x.toFixed(2) + " " + cell.rectNorm.tr.y.toFixed(2)}</Text>
                </View>}
              </View>
          )})}
        </View>}
      </View>
      </ConnectedScreenErrorBoundary>
    )
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]} >
        <ConnectedHeader 
          iconTintColor={Colors.colorPlacesScreen}  
          backButtonVisible={true}
        />
        {render && this._renderContent()}
      </View>
    )
  }
  
}


GalleryMapScreen.navigationOptions = {
  tible: 'GalleryMapScreen',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  sectionTible: {
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