import React, { Component } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { List, ListItem, SearchBar } from "react-native-elements";
import { GeoRefHListItem, CategoryListItem, ScrollableHeader, Header, PoiItem} from "../components";
import { FlatGrid } from 'react-native-super-grid';
import MapView from 'react-native-maps';
import { NavigationEvents, useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import * as localeActions from '../actions/locale';
import { coordsInBound, regionToCoords, distance, regionToPoligon, regionDiagonalKm } from '../helpers/maps';
import MapViewTop from '../components/MapViewTop';
import { apolloQuery } from '../apollo/middleware';
import Layout from '../constants/Layout';
import _, { VERSION } from 'lodash';
import * as Constants from '../constants';
import ConnectedHeader from "../components/ConnectedHeader";
import Colors from '../constants/Colors';
import { Button } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import {
  ScrollableComponent,
  AsyncOperationStatusIndicator
} from "../components"

import PlacesScreenHeaderFlatlist from "../components/loadingLayouts/PlacesScreenHeaderFlatlist"
class PlacesScreen extends Component {

  constructor(props) {
    super(props);

    this._refs = {};

    var region = props.route.params && props.route.params.region;
    var term = props.route.params && props.route.params.term;
    var coords = props.route.params && props.route.params.coords;
    var uuids = term ? term.uuids : [];

    this.state = {
      loading: false,
      error: null,
      nearPoisRefreshing: false,
      tid: term ? term.tid : -1,
      uuids: uuids,
      term: term,
      poisLimit: 12,
      poisRefreshing: false,
      pois: []
    };

    this.state.region = region ? region :
      {
        longitude: 9.053451,
        latitude: 40.0711,
        latitudeDelta: 3,
        longitudeDelta: 3
      }
      
  }

  componentDidMount() {

    if(this.state.tid < 0){
      this.props.actions.getCategories({
        vid: 36
      });
    }
    
    navigator.geolocation.getCurrentPosition(
      position => { this.onUpdateCoords(position.coords); }, 
      ex => { console.log(ex) },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
    );
    this.watchID = navigator.geolocation.watchPosition(
      position => { this.onUpdateCoords(position.coords); }, 
      ex => { console.log(ex) },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
    );

    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      if(this.state.coords) {
        this.onUpdateCoords(this.state.coords);
      }
    });
  }

  fetchNearestPois(coords) {
    return apolloQuery(graphqlActions.getNearestPois({
        limit: 8,
        x: coords.longitude,
        y: coords.latitude,
        uuids: this.state.uuids.length > 0 ? this.state.uuids : null
      })).then((pois) => {
        this.setState({nearPois: pois});
      })
  }

  fetchClusters(coords) {
    var {region} = this.state;

    var p = regionToPoligon(region);
    var regionString = p[0][0] + " " + p[0][1] + ", " + p[1][0] + " " + p[1][1] + ", " + p[2][0] + " " + p[2][1] + ", " + p[3][0] + " " + p[3][1] + ", " +  p[4][0] + " " + p[4][1];
    
    var uuids = this.state.uuids;
    var uuidString = "{";
    for(var i=0; i<uuids.length; i++) {
      uuidString += i < uuids.length - 1 ? uuids + "," : uuids;
    }
    uuidString += "}";

    var km = regionDiagonalKm(region);
    var dEps = (km / 1000) / (Layout.window.diagonal / Layout.map.markerPixels);

    apolloQuery(graphqlActions.getClusters({
      polygon: regionString,
      cats: uuidString,
      dbscan_eps: dEps
    })).then((clusters) => {
      console.log("clusters", clusters)
      this.setState({
        clusters: clusters,
        nearPois: []
      });
    });
  }

  onUpdateCoords(coords) {
    if(!this.state.coords || this.state.coords.latitude !== coords.latitude || this.state.coords.longitude !== coords.longitude) {
      var isCordsInBound = coordsInBound(coords);
      if(isCordsInBound)
      {
        this.setState({isCordsInBound: isCordsInBound, coords: coords, nearPoisRefreshing: true});
        this.fetchNearestPois(coords).then(() => {
          this.setState({
            nearPoisRefreshing: false
          });
        });
      } else {
        this.setState({isCordsInBound: isCordsInBound, coords: coords});
        this.fetchClusters(coords);
      }
    }
    if(this.state.term && (!this.state.term.terms || this.state.term.terms.length == 0)){
      this._loadMorePois();
    } 
  }
  
  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
    this._unsubscribe();
  }


  _renderHeaderBarContent = () => {
    return (
      //<Header backButtonVisible={this.state.term} />
      <ConnectedHeader 
        containerStyle={{
          marginTop: 0,
          height: Layout.header.height
        }}
        iconTintColor={Colors.colorScreen1} 
        backButtonVisible={typeof this.state.term !== "undefined"}/>
    )
  } 

  _renderTopContent = () => {
    return (
    <MapViewTop
      term={this.state.term}
      coords={this.state.coords}
      initRegion={this.state.region}
      pois={this.state.nearPois}
      clusters={this.state.clusters}
      uuids={this.state.uuids}
      onRegionChangeComplete={this._onRegionChangeComplete}
      style={{
          flex: 1,
      }}
      categoriesMap={this.props.categoriesMap}
      mapRef={ref => (this._refs["MapViewTop"] = ref)}
    />
    )
  }


  _renderHorizontalSeparator = () => {
    return (
      <View style={{width: 5, flex: 1}}></View>
    )
  }

  _renderListHeader = () => {
    var {nearPois} = this.state;
    const { nearToYou, whereToGo } = this.props.locale.messages;
      return (
        <View style={{marginLeft: -10, marginRight: -10}}>
          {/* { this.state.term &&  
            <Button
              type="clear"
              containerStyle={[styles.buttonContainer]}
              buttonStyle={styles.button}
              onPress={this.goBack}
              icon={
                <Ionicons
                  name={Platform.OS === 'ios' ? 'ios-arrow-back' : 'md-arrow-back'}
                  size={30}
                  color={Colors.tintColor}
                />
              }
            />
          } */}
            <AsyncOperationStatusIndicator
              loading={true}
              success={!this._isPoiList() && nearPois && nearPois.length > 0}
              loadingLayout={<PlacesScreenHeaderFlatlist locale={this.props.locale} style={styles.listContainerHeader}/>}>
              <View>  
                <Text style={styles.sectionTitle}>{nearToYou}</Text>
                <FlatList
                  horizontal={true}
                  renderItem={({item}) => this._renderPoiListItem(item)}
                  data={nearPois}
                  extraData={this.props.locale}
                  keyExtractor={item => item.nid.toString()}
                  ItemSeparatorComponent={this._renderHorizontalSeparator}
                  contentContainerStyle={styles.listContainerHeader}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </AsyncOperationStatusIndicator>
          <Text style={styles.sectionTitle}>{whereToGo}</Text>
        </View>
      )
  }

  _renderCategoryListItem = (item) => {
    return (
    <TouchableOpacity
      onPress={() => this._openCategory(item)}
      activeOpacity={0.7}
    >
      <CategoryListItem image={item.image} title={item.name} />
    </TouchableOpacity>)
  }

  goBack = () => {
    this.setState({
      term: null
    })
  }
  _renderCategoryList = () => {
    var {categories} = this.props;
    // var {term} = this.state;
    var currentCategories = term ? term.terms ? term.terms : [] : categories;

    const { term, coords, region, nearPois, clusters } = this.state;
    let map = {
      term: term,
      coords: coords,
      region: region,
      nearPois: nearPois,
      clusters: clusters,
      categoriesMap: this.props.categoriesMap
    }
    return (
      <ScrollableHeader
        renderHeaderBarContent={this._renderHeaderBarContent}
        renderTopContent={this._renderTopContent}
        topContentPressed={this._openMap.bind(this)}
        headerComponentStyle={{
          marginTop: Layout.statusbarHeight
        }}
        listItemStyle={{ backgroundColor: Colors.colorScreen1 }}
        scrollView={FlatList}
        data={currentCategories}
        renderItem={({item}) => this._renderCategoryListItem(item)}
        keyExtractor={item => item.tid.toString()}
        numColumns={1}
        keyList={"category-list"}
        listStyle={styles.listStyle}
        ListHeaderComponent={this._renderListHeader}
        bodyContainerStyle={styles.listContainer}
      />
      // <>
      
      //   <ScrollableComponent 
      //   clusters={this.state.clusters}
      //   map={map}
      //   onRegionChangeComplete={this._onRegionChangeComplete}
      //   />
      // </>
    );
  }
  

  _renderPoiListItem = (item) => {
    const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
    return (
      <PoiItem 
        keyItem={item.nid}
        backgroundTopLeftCorner={"white"}
        iconColor={Colors.colorScreen1}
        iconName={Platform.OS === 'ios' ? 'ios-map' : 'md-map'}
        onPress={() => this._openPoi(item)}
        title={`${title}`}
        place={`${item.term.name}`}
        image={`${item.image}`}
        distance={this.state.isCordsInBound && item.distance}
      />
  )}

  _renderPoiList = () => {

    var {pois} = this.state;
    return (
      <ScrollableHeader
          renderHeaderBarContent={this._renderHeaderBarContent}
          renderTopContent={this._renderTopContent}
          topContentPressed={this._openMap.bind(this)}
          headerComponentStyle={{
            marginTop: Layout.statusbarHeight
          }}
          listItemStyle={{ backgroundColor: Colors.colorScreen1 }}
          scrollView={FlatList}
          extraData={this.props.locale}
          onEndReached={this._loadMorePois.bind(this)}
          onEndReachedThreshold={0.5}
          data={pois}
          renderItem={({item}) => this._renderPoiListItem(item)}
          numColumns={2}
          horizontal={false}
          keyList={"poi-list"}
          listStyle={styles.listStyle}
          ItemSeparatorComponent={<View style={{height: 5}}></View>}
          keyExtractor={item => item.nid.toString()}
          refreshing={this.state.poisRefreshing}
          ListHeaderComponent={this._renderListHeader}
          bodyContainerStyle={styles.listContainer}
      />
    );
  }

  _loadMorePois = () => {
    var {coords} = this.state;
    if(coords && this._isPoiList() && !this.state.poisRefreshing){
      console.log("_loadMorePois");
      this.setState({
        poisRefreshing: true
      }, () => {
        //TODO: put into redux to cache results
        apolloQuery(graphqlActions.getNearestPois({
          limit: this.state.poisLimit,
          offset: this.state.pois ? this.state.pois.length : 0,
          x: coords.longitude,
          y: coords.latitude,
          uuids: this.state.uuids.length > 0 ? this.state.uuids : null
        })).then((pois) => {
          this.setState((prevState, nextProps) => ({
            pois: this.state.pois ? [...this.state.pois, ...pois] : pois,
            poisRefreshing: false
          }));
        })
      });
    }
  }

  _openCategory = (item) => {
    if(item) {
      this.props.navigation.push(Constants.NAVIGATION.NavPlacesScreen,
        {
          term: item,
          region: this.state.region,
          coords: this.state.coords
        },
      );
      // this.setState({
      //   term: item,
      //   region: this.state.region,
      //   coords: this.state.coords
      // }, () => {
      //   // console.log("term", item.terms)
      //   // this._loadMorePois();
      //   if(item && (!item.terms || item.terms.length == 0)){
      //     this._loadMorePois();
      //   } 
      // })
    }
  }

  _openMap = () => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavMapScreen, {
      region: this.state.region,
      pois: this.state.nearPois,
      term: this.state.term,
      coords: this.state.coords
    })
  }

  _openPoi = (item) => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, {
      place: item
    })
  }

  _onRegionChangeComplete = (region) => {
    this.state.region = region;
  }

  _isPoiList = () => {
    return this.state.term && (!this.state.term.terms || this.state.term.terms.length == 0);
  }

  render() {
    if(this._isPoiList()) 
      return this._renderPoiList();
    else 
      return this._renderCategoryList();
  }
}


PlacesScreen.navigationOptions = {
  title: 'Luoghi',
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.colorScreen1,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    flex: 1,
  },
  sectionTitle: {
      fontSize: 16,
      color: 'white',
      fontWeight: "bold",
      margin: 10
  },
  listContainer: {
    backgroundColor: Colors.colorScreen1,
    height: "100%"
  },
  listContainerHeader: {
    paddingLeft: 10,
  },
  listStyle: {
    paddingHorizontal: 10,
    paddingBottom: 25,
  }
});

function PlacesScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <PlacesScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}

const mapStateToProps = state => {
  return {
    categories: state.graphqlState.categories,
    categoriesMap: state.graphqlState.categoriesMap,
    error: state.restState.error,
    loading: state.restState.loading,
    locale: state.localeState,
  };
};

const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...graphqlActions, ...restActions, ...localeActions}, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(PlacesScreenContainer)