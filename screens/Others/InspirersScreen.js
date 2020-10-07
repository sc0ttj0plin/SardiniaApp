import React, { Component } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, BackHandler, Platform, ScrollView, ColorPropType } from "react-native";
import { List, ListItem, SearchBar } from "react-native-elements";
import { GeoRefHListItem, CategoryListItem, ScrollableHeader, Header} from "../components/index";
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
import _ from 'lodash';
import * as Constants from '../constants';
import ConnectedHeader from "../components/ConnectedHeader";
import InspirerScreen from "./InspirerScreen";
import Colors from "../constants/Colors"
import { Col } from "native-base";

class InspirersScreen extends Component {

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
      this.props.actions.getCategoriesInspirers({
        vid: 46
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
    // console.log
    return (
      //<Header backButtonVisible={this.state.term} />
      <ConnectedHeader 
        iconTintColor={Colors.colorScreen2}
        containerStyle={{
          paddingTop: 0,
          height: Layout.header.height,
          backgroundColor: "white",
          marginTop: Layout.statusbarHeight
        }}
        style={{
          backgroundColor: "white",
          height: 51,
          width: "100%"
        }}
        buttonContainer={{
          backgroundColor: "white"
        }}
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

  _renderCategoryList = () => {
    var {categories} = this.props;
    var {term} = this.state;
    var currentCategories = term ? term.terms ? term.terms : [] : categories;

    return (
      <FlatList
        data={currentCategories}
        renderItem={({item}) => this._renderCategoryListItem(item)}
        keyExtractor={item => item.tid.toString()}
        style={styles.listStyle}
        bodyContainerStyle={styles.listContainer}
      />
    );
  }
  

  _renderPoiListItem = (item) => {
    const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
    return (
      <TouchableOpacity 
        key={item.nid} 
        onPress={() => this._openPoi(item)}
        activeOpacity={0.7}
        style={{ width: "50%", paddingRight: 10, marginBottom: 10 }} 
      >
        <GeoRefHListItem
          title={`${title}`}
          place={`${item.term.name}`}
          image={`${item.image}`}
          distance={this.state.isCordsInBound && item.distance}
          style={{flex: 1}} />
      </TouchableOpacity>

  )}

  _renderPoiList = () => {

    var {pois} = this.state;

    return (
      <FlatList
          renderHeaderBarContent={this._renderHeaderBarContent}
          
          listItemStyle={{ backgroundColor: Colors.colorScreen2 }}
          headerComponentStyle={styles.headerComponentStyle}
          scrollView={FlatList}
          extraData={this.props.locale}
          onEndReached={this._loadMorePois.bind(this)}
          onEndReachedThreshold={0.5}
          data={pois}
          renderItem={({item}) => this._renderPoiListItem(item)}
          numColumns={2}
          horizontal={false}
          style={styles.listStyle}
          keyExtractor={item => item.nid.toString()}
          refreshing={this.state.poisRefreshing}
          bodyContainerStyle={styles.listContainer}
          topContentInnerStyle={{
            height: 0
          }}
      />
    );
  }

  _loadMorePois = () => {
    var {coords} = this.state;
    if(coords && this._isPoiList() && !this.state.poisRefreshing){
      this.setState({
        poisRefreshing: true
      }, () => {
        //TODO: put into redux to cache results
        apolloQuery(graphqlActions.getInspirers({
          limit: this.state.poisLimit,
          offset: this.state.pois ? this.state.pois.length : 0,
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
      this.props.navigation.push(Constants.NAVIGATION.NavInspirersScreen,
        {
          term: item,
          region: this.state.region,
          coords: this.state.coords
        },
      );
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
    this.props.navigation.navigate(Constants.NAVIGATION.NavInspirerScreen, {
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
    // console.log(new Date(), "Render InspirersScreen", this.state.term ? this.state.term.name : "HOME");
    return (
    <View style={[styles.fill, {paddingBottom: 100}]}>
        {this._renderHeaderBarContent()}

        {this._isPoiList() && this._renderPoiList()}

        {!this._isPoiList() && this._renderCategoryList()}

      </View>

      )
  }
}


InspirersScreen.navigationOptions = {
  title: 'Luoghi',
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.colorScreen2,
    flex: 1,
  },
  sectionTitle: {
      fontSize: 16,
      color: 'white',
      fontWeight: "bold",
      margin: 10
  },
  listContainer: {
    marginTop: 0,
    paddingTop: 0,
  },
  listContainerHeader: {
    paddingLeft: 10,
  },
  mainListContainer: {
    backgroundColor: "white",
  },
  listStyle: {
    paddingTop: 10, 
    backgroundColor: Colors.colorScreen2,
    paddingHorizontal: 10,
    height: "100%",
  },
  listStyle2: {
    paddingTop: 10, 
    backgroundColor: Colors.colorScreen2,
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 25,
    marginBottom: 20,
    marginTop: 10,
  },
  headerComponentStyle: {
    marginTop: 0,
    paddingTop: 0,
    top: -15
  },
  listTitleStyle: {
    fontSize: 16,
    color: 'white',
    fontWeight: "bold",
    marginBottom: 10,
    flex: 1
  }
});

function InspirersScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <InspirersScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}

const mapStateToProps = state => {
  return {
    categories: state.graphqlState.categoriesInspirers,
    categoriesMap: state.graphqlState.categoriesInspirersMap,
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
})(InspirersScreenContainer)