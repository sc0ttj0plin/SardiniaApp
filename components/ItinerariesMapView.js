import React, { PureComponent } from "react";
import { StyleSheet, Text, View, Animated, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import * as localeActions from '../actions/locale';
import * as othersActions from '../actions/others';
import Color from '../constants/Colors';
import { Image } from "react-native-elements";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import Layout from "../constants/Layout";
import * as Constants from '../constants';

/**
 * ItinerariesMapView is used in ItineraryScreen to show a set of markers in a map once the user has selected 
 * the itinerary of interest. A scroll in the list of pois triggers the map focus to shift to the current marker.
 */
class ItinerariesMapView extends PureComponent {

  constructor(props) {
    super(props);
    this._region = props.region;
  }


  componentWillMount() {
    this.index = 0;
    this.animation = new Animated.Value(0);
  }

  componentDidMount() {
    // Detect when scrolling has stopped then animate!
    this.animation.addListener(({ value }) => {
      let index = Math.floor(value / Layout.map.card.width + 0.3); 
      if (index >= this.props.markers.length)
        index = this.props.markers.length - 1;
      if (index <= 0) 
        index = 0;

      clearTimeout(this.regionTimeout);
      this.regionTimeout = setTimeout(() => {
        if (this.index !== index) {
          this.index = index;
          const { coordinates } = this.props.markers[index].georef;
          const coordinate = { latitude: coordinates[1], longitude: coordinates[0] };
          this.map.animateToRegion({
              ...coordinate,
              latitudeDelta: this._region.latitudeDelta,
              longitudeDelta: this._region.longitudeDelta,
            },
            350
          );
        }
      }, 10);
    });
  }

  _handleMarkerPress = (e) => {
    this._scroll.getNode().scrollTo({x: e * Layout.map.card.width, y: 0, animated: false});
  }

  render() {
    const interpolations = this.props.markers.map((marker, index) => {
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

    return (
      <View style={styles.container}>
        <MapView
          ref={ map => this.map = map }
          initialRegion={ this._region }
          provider={ PROVIDER_GOOGLE }
          style={styles.container}
          >
          {this.props.markers.map((marker, index) => {
            const coordinates = { latitude: marker.georef.coordinates[1], longitude: marker.georef.coordinates[0] };
            const opacityStyle = { opacity: interpolations[index].opacity };
            return (
              <MapView.Marker
                key={index} 
                coordinate={coordinates}
                tracksViewChanges={false}
                title={marker.title}
                description={marker.abstract}
                onPress={() => this._handleMarkerPress(index)}
              >
                <Animated.View style={[styles.markerWrap, opacityStyle]}>
                  <View style={styles.marker}>
                    <Text style={styles.text}>{index+1}</Text>
                  </View>
                </Animated.View>
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
          {this.props.markers.map((marker, index) => (

            <TouchableOpacity
              style={[styles.card, {width: Layout.map.card.width}]}
              onPress={() => this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, { place: marker })}
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
                <Text numberOfLines={1} style={styles.cardtitle}>{marker.title}</Text>
                <Text numberOfLines={1} style={styles.cardDescription}>
                  {marker.abstract}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatlist: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    backgroundColor: Color.colorItinerariesScreen
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
    overflow: "hidden",
  },
  cardImage: {
    flex: 3,
    width: "100%",
    height: "100%",
    alignSelf: "center",
  },
  cardTextContainer: {
    flex: 1,
    padding: 10
  },
  cardtitle: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cardDescription: {
    fontSize: 12,
    color: "#444",
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
    color: "white",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    backgroundColor: Color.colorItinerariesScreen,
    borderColor: 'white',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text:{
    transform: [
      { rotateZ: "45deg" },  
    ],
    alignSelf: 'center'
  },
  ring: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Color.green,
    position: "absolute",
    borderWidth: 1,
    borderColor: 'black',
  },
});

function ConnectedItinerariesMapViewContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <ItinerariesMapView 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    locale: state.localeState,
    others: state.othersState,
  };
};


const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...graphqlActions, ...restActions, ...localeActions, ...othersActions}, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(ConnectedItinerariesMapViewContainer)