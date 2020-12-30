import React, { Component } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, Animated } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from "react-native-elements";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { ConnectedHeader, CustomText, EntityItem } from "../../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { distance, distanceToString, coordsInBound } from '../../helpers/maps';

/* Deferred rendering to speedup page inital load: 
   deferred rendering delays the rendering reducing the initial 
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;
class ItineraryStagesMapScreen extends Component {

  constructor(props) {
    super(props);

    const markers = _.get(props.route, "params.markers", []);
    const term = _.get(props.route, "params.term", "");
    const region = _.get(props.route, "params.region", "");

    console.log("term", props.route.params.term);

    this.state = {
      render: USE_DR ? false : true,
      //
      markers,
      term,
      region: region || Constants.REGION_SARDINIA,
      coords: {},
      tracksViewChanges: false
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    
    // Detect when scrolling has stopped then animate!
    this.animation.addListener(({ value }) => {
      let index = Math.floor(value / Layout.map.card.width + 0.3); 
      if (index >= this.state.markers.length)
        index = this.state.markers.length - 1;
      if (index <= 0) 
        index = 0;

      clearTimeout(this.regionTimeout);
      this.regionTimeout = setTimeout(() => {
        if (this.index !== index) {
          this.index = index;
          const coordinates = this.state.markers[index].coords;
          this._selectMarker(index);
          this.map.animateToRegion({
              ...coordinates,
              latitudeDelta: this.state.region.latitudeDelta,
              longitudeDelta: this.state.region.longitudeDelta,
            },
            350
          );
        }
      }, 10);
    });

    if(this.props.others.geolocation && this.props.others.geolocation.coords) {
      this._onUpdateCoords(this.props.others.geolocation.coords);
    }
  }

  componentWillMount() {
    this.index = 0;
    this.animation = new Animated.Value(0); 
  }

  componentDidUpdate(prevProps) {
    // NEW-GEO
    if (prevProps.others && prevProps.others.geolocation !== this.props.others.geolocation && this.props.others.geolocation.coords) {
      // { coords: { latitude, longitude }, altitude, accuracy, altitudeAccuracy, heading, speed, timestamp (ms since epoch) }
      this._onUpdateCoords(this.props.others.geolocation.coords);
    }
  }

  
  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _onUpdateCoords(newCoords) {
    // const { coords, term } = this.state;
    const { coords } = this.state;
    if(!coords || coords.latitude !== newCoords.latitude || coords.longitude !== newCoords.longitude) {
      let isCordsInBound = coordsInBound(newCoords); 
      // Are coordinates within sardinia's area? fetch the updated pois list
      if (isCordsInBound) {
        this.setState({ isCordsInBound, coords: newCoords, nearPoisRefreshing: true });
      }
    }
  }

  _selectMarker = (index) => {
    this.setState({tracksViewChanges: true}, () => {
      this.setState({selectedIndex: index}, () => {
        this.setState({tracksViewChanges: false});
      })
    });
  }

  _handleMarkerPress = (index) => {
    this._selectMarker(index);
    this._scroll.scrollTo({x: index * Layout.map.card.width, y: 0, animated: true});
  }

  _openRelatedEntity = (item) => {
    var type = item.type;
    switch(type) {
      case Constants.NODE_TYPES.places:
        this.props.navigation.push(Constants.NAVIGATION.NavPlaceScreen, { item });
        break;
      case Constants.NODE_TYPES.events:
        this.props.navigation.navigate(Constants.NAVIGATION.ItineraryStagesMapScreen, { item });
        break;
      case Constants.NODE_TYPES.itineraries:
        this.props.navigation.navigate(Constants.NAVIGATION.NavItineraryScreen, { item })
        break;
      case Constants.NODE_TYPES.inspirers:
        this.props.navigation.navigate(Constants.NAVIGATION.NavInspirerScreen, { item })
        break;
      default:
        break;
    }
  }

  
  _onRegionChangeComplete = (region) => {
    this.setState({region})
  }

  /********************* Render methods go down here *********************/
  _renderStage = (stage) => {
    const { coords } = this.state;
    const { lan } = this.props.locale;
    const title = stage.title;
    const image = stage.image;
    const term = this.state.term.name;
    let distanceStr = null;

    // Add distance from the first itinerary stage
    distanceStr = distanceToString(distance(coords.latitude, coords.longitude, stage.coords.latitude, stage.coords.longitude));

    return(
      <EntityItem 
        keyItem={stage.nid}
        listType={Constants.ENTITY_TYPES.itineraries}
        onPress={() => this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, { item: { uuid: stage.uuid } })}
        title={`${title}`}
        image={`${image}`}
        subtitle={`${term}`}
        style={styles.itinerariesListItem}
        horizontal={true}
        topSpace={10}
        distance={this.state.isCordsInBound ? distanceStr : null}
        extraStyle={{
          width: Layout.map.card.width,
          marginLeft: 10,
          marginRight: 10,
        }}
      />
    )
  }
  _renderContent = () => {
    const interpolations = this.state.markers.map((marker, index) => {
      const inputRange = [
        (index - 1) * Layout.map.card.width,
        index * Layout.map.card.width,
        ((index + 1) * Layout.map.card.width),
      ];
      const scale = this.animation.interpolate({
        inputRange,
        outputRange: [1, 2.5, 1],
        extrapolate: "clamp",
      });
      const opacity = this.animation.interpolate({
        inputRange,
        outputRange: [0.35, 1, 0.35],
        extrapolate: "clamp",
      });
      return { scale, opacity };
    });

    let bgColor = Colors.colorItinerariesScreen;
    let bgColorTransparent = Colors.colorItinerariesScreenTransparent;

    return (
      <View style={styles.container}>
        <MapView
          ref={ map => this.map = map }
          initialRegion={ this.state.region }
          onRegionChangeComplete={this._onRegionChangeComplete}
          provider={ PROVIDER_GOOGLE }
          style={styles.container}
          >
          {this.state.markers.map((marker, index) => {
            const coordinates = marker.coords;
            //const opacityStyle = { opacity: interpolations[index].opacity };
            const opacityStyle = { opacity: 1 };
            var backgroundColor = index == this.state.selectedIndex ? bgColorTransparent : "transparent";
            return (
              <MapView.Marker
                key={index} 
                coordinate={coordinates}
                tracksViewChanges={this.state.tracksViewChanges}
                onPress={() => this._handleMarkerPress(index)}
              >
                <View style={[styles.markerContainer, { backgroundColor: backgroundColor}, opacityStyle]}>
                  <View style={[styles.marker, { backgroundColor: bgColor }]}>
                    <CustomText style={{color: "white"}}>{index + 1}</CustomText>
                  </View>
                </View>
              </MapView.Marker>
            );
          })}
        </MapView>
        <Animated.ScrollView
          horizontal
          scrollEventThrottle={1}
          ref={(c) => {this._scroll = c}}
          showsHorizontalScrollIndicator={false}
          snapToInterval={Layout.map.card.width}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: this.animation }}}], { useNativeDriver: true })}
          style={styles.flatlist}
          contentContainerStyle={{paddingRight: Layout.window.width - Layout.map.card.width}}
          >
          {this.state.markers.map((marker, index) => this._renderStage(marker, index))}

          {/* (

<TouchableOpacity
  style={[styles.card, {width: Layout.map.card.width}]}
  onPress={() => this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, { item: { uuid: marker.uuid } })}
  activeOpacity={0.7}
  key={index}
>
  <Image
    source={{ uri: marker.image}}
    style={[styles.cardImage, {width: Layout.map.card.width, height: 100}]}
    resizeMode="cover"
    PlaceholderContent={<ActivityIndicator/>}
  />
  <View style={styles.cardTextContainer}>
    <CustomText numberOfLines={1} style={styles.cardtitle}>{marker.title}</CustomText>
  </View>
</TouchableOpacity>
) */}
        </Animated.ScrollView>
      </View>
     );
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        <ConnectedHeader iconTintColor={Colors.colorItinerariesScreen} />
        {render && this._renderContent()}
      </View>
    )
  }
  
}


ItineraryStagesMapScreen.navigationOptions = {
  title: 'Event',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  container: {
    flex: 1,
  },
  flatlist: {
    position: "absolute",
    bottom: 0,
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  marker: {
    // backgroundColor: "transparent",
    // justifyContent: 'center',
    // alignItems: 'center'
    width: "100%",
    height: "100%",
    display: "flex",
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
    borderRadius: 50,
  },
  text:{
    transform: [
      { rotateZ: "45deg" },  
    ],
    alignSelf: 'center'
  },
  itinerariesListItem: {
    height: 160
  },
});


function ItineraryScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <ItineraryStagesMapScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    //others
    others: state.othersState,
    //language
    locale: state.localeState,
    //favourites
    favourites: state.favouritesState,
    //graphql
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
})(ItineraryScreenContainer)