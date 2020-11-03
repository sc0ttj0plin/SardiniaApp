import React, { Component } from "react";
import { View, Text, FlatList, ActivityIndicator, Dimensions, TouchableOpacity, StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { List, ListItem, SearchBar, Button, Image } from "react-native-elements";
import { FlatGrid } from 'react-native-super-grid';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { NavigationEvents, useNavigation, useRoute } from '@react-navigation/native';
import { MapViewItineraries, CategoryListItem, ScrollableHeader, ConnectedHeader, AsyncOperationStatusIndicator, BoxWithText } from "../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import * as localeActions from '../actions/locale';
import Layout from '../constants/Layout'
import { apolloQuery } from '../apollo/middleware';
import Colors from '../constants/Colors';
import * as Constants from '../constants';


class ExperiencesItinerariesScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {
      itineraries: [],
      //Array of arrays of markers (an array per itinerary)
      markers: [],
      polyLineCoords: [],
      currentItineraryIdx: 0,
    };
  }

  componentDidMount() {
    //TODO: note: pois are added from mock data in middleware.js
    this.props.actions.getItineraries();
  }

  componentDidUpdate(prevProps) {
    if (this.props.itineraries !== prevProps.itineraries) {
      let markers = [];
      let polyLineCoords = [];
      for (let nid in this.props.itineraries) {
        let itinerary = this.props.itineraries[nid];
        let markersTmp = [];
        let polyLineCoordsTmp = [];
        let idx = 0;
        for (let poi of itinerary.pois) {
          polyLineCoordsTmp.push({ latitude: poi.georef.coordinates[1], longitude: poi.georef.coordinates[0]});
          markersTmp.push(poi);
          // markersTmp.push({
          //   idx: (idx + 1).toString(),
          //   title: poi.title,
          //   description: poi.abstract,
          //   coordinate,
          //   image: { 
          //     uri: poi.image 
          //   }
          // });
          //idx++;
        }
        //Array of arrays
        markers.push(markersTmp);
        polyLineCoords.push(polyLineCoordsTmp);
      }
      // console.log('kere', markers.length)
      this.setState({ itineraries : Object.values(this.props.itineraries), markers, polyLineCoords });
    }
  }

  _onItineraryPressed = (item, markers) => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavItineraryScreen, { entity: item })
  }

  _renderItem = (item, index) => {
    const { lan } = this.props.locale;
    const { markers, currentItineraryIdx } = this.state;
    const title = _.get(item.title, [lan, 0, "value"], null);
    const abstract = _.get(item.abstract, ["value"], null);
    const { image } = item;
    return (
      <TouchableOpacity
        style={[styles.card, {width: Layout.map.card.width}]}
        onPress={() => this._onItineraryPressed(item, markers[currentItineraryIdx])}
        activeOpacity={0.7}
        key={index}
        >
            <Image
              source={{ uri: image }}
              style={[styles.cardImage, {width: Layout.map.card.width, height: 150}]}
              PlaceholderContent={<ActivityIndicator/>}
            >

            <BoxWithText 
              extraStyle={{margin: 0}}
              title={title}
              opacityBackground={0.9}
              titleStyle={{
                fontSize: 13,
                fontWeight: "500",
                color: Colors.colorItinerariesScreen
              }}
              backgroundColor={"#ffffff"}/>
            </Image>
            {/* <View style={styles.cardTextContainer}>
              <Text numberOfLines={1} style={styles.cardtitle}>{title}</Text>
              <Text numberOfLines={1} style={styles.cardDescription}>{abstract}</Text>
            </View> */}
      </TouchableOpacity>
    );
  }
  

  //Can show the loading outcome for the entire page with this component but for the moment
  // _isLoadingData = () => this.props.itinerariesLoading;
  // _isErrorData = () => this.props.itinerariesError;
  // _renderLoadingOutcome = () => <AsyncOperationStatusIndicator loading={this._isLoadingData()} error={this._isErrorData()} />;

  _onScroll = (e) => {
    let offset = e.nativeEvent.contentOffset.x + (Layout.map.card.width / 2);
    let index = parseInt(offset / (Layout.map.card.width + Layout.map.card.paddingVertical * 2));  
    if (this.state.currentItineraryIdx !== index && index < this.state.markers.length)
      this.setState({ currentItineraryIdx: index });
  }

  _renderMarkers = () => {
    const { markers, currentItineraryIdx } = this.state;
    if (this.state.markers.length > 0) {
      return markers[currentItineraryIdx].map((marker, index) => {
        const coordinates = { latitude: marker.georef.coordinates[1], longitude: marker.georef.coordinates[0] };
        return (
          <MapView.Marker
            key={index} 
            coordinate={coordinates}
            tracksViewChanges={true}
            title={marker.title}
            description={marker.abstract}
            onPress={() => this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, { place: marker })}
          >
            <View style={[styles.markerWrap]}>
              <View style={styles.marker}>
                <Text style={styles.text}>{index+1}</Text>
              </View>
            </View>
          </MapView.Marker>
        );
      });
    } else {
      return null;
    }
  }

  _renderRoute = () => {
    const { polyLineCoords, currentItineraryIdx } = this.state;
    if (this.state.polyLineCoords.length > 0) 
      return (<MapView.Polyline
        coordinates={polyLineCoords[currentItineraryIdx]}
        strokeWidth={1}
        strokeColor={Colors.tintColor}
      />);
    else
      return null;
  }

  _renderContent = () => {
    const { currentItineraryIdx, markers, itineraries, polyLineCoords } = this.state;
    return (
      <View style={styles.fill}>
        <ConnectedHeader 
          iconTintColor={Colors.colorItinerariesScreen}
          containerStyle={{
            paddingTop: 0,
            height: Layout.header.height + 20,
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
          }}/>
        <View style={styles.fill}>
          <MapView
            initialRegion={ Constants.REGION_SARDINIA }
            provider={ PROVIDER_GOOGLE }
            style={styles.container}
          >
            {this._renderMarkers()}
            {this._renderRoute()}
          </MapView>
          <FlatList
            key={1}
            horizontal
            keyExtractor={item => item.uuid}
            data={itineraries}
            renderItem={({item, index}) => this._renderItem(item, index)}
            style={[styles.flatList, ]}
            onScroll={(e)=> this._onScroll(e)}
          />
        </View>
      </View>
    );
  }

  render() {
    return this._renderContent();
  }
  
}

ExperiencesItinerariesScreen.navigationOptions = {
  title: 'Esperienze',
};


const styles = StyleSheet.create({
  header: {
    backgroundColor: "white"
  },
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    flex: 1
  },
  group: {
    width: '80%',
    height: '80%',
    justifyContent: "space-between",
    marginTop: 10,
    marginLeft: 10,
  },
  btnItineraries: {
    backgroundColor: Colors.green
  },
  btnEvents: {
    backgroundColor: Colors.orange
  },
  btnInspirers: {
    backgroundColor: Colors.yellow
  },
  listContainer: {
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: '#fff',
  },
  markerWrap: {
    alignItems: "center",
    justifyContent: "center",
    height: 45, 
    // width: 30
    // width: 30,
    // height: 30,
  },
  marker: {
    transform: [
      { rotateZ: "-45deg" },  
    ],
    width: 30,
    height: 30,
    overflow: 'visible',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    backgroundColor: Colors.colorItinerariesScreen,
    color: "white",
    borderColor: 'white',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text:{
    transform: [
      { rotateZ: "45deg" },  
    ],
    alignSelf: 'center',
    color: "white"
  },
  flatList: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 30,
    backgroundColor: "transparent"
  },
  card: {
    elevation: 2,
    borderRadius: 10,
    backgroundColor: "#FFF",
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: { x: 2, y: -2 },
    overflow: "hidden"
  },
  cardImage: {
    flex: 3,
    width: "100%",
    height: "100%",
    alignSelf: "flex-end",
    justifyContent: "flex-end"
  },
  cardTextContainer: {
    flex: 1,
    padding: 10,
  },
  cardtitle: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cardDescription: {
    fontSize: 12,
    color: "#444",
  },
});

function ExperiencesItinerariesScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <ExperiencesItinerariesScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}

const mapStateToProps = state => {
  return {
    itineraries: state.graphqlState.itineraries,
    itinerariesError: state.graphqlState.itinerariesError,
    itinerariesLoading: state.graphqlState.itinerariesLoading,
    locale: state.localeState,
    // error: state.restState.error,
    // loading: state.restState.loading
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
})(ExperiencesItinerariesScreenContainer)