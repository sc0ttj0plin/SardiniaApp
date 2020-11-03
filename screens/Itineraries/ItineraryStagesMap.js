import React, { Component } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, Animated } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { Image } from "react-native-elements";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { ConnectedHeader } from "../../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';

/* Deferred rendering to speedup page inital load: 
   deferred rendering delays the rendering reducing the initial 
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;
class ItineraryStagesMapScreen extends Component {

  constructor(props) {
    super(props);

    this._region = Constants.REGION_SARDINIA;
    const markers = _.get(props.route, "params.markers", []);

    this.state = {
      render: USE_DR ? false : true,
      //
      markers
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  componentDidUpdate(prevProps) {
    /**
     * Is the former props different from the newly propagated prop (redux)? perform some action
     * if(prevProps.xxx !== this.props.xxx)
     *  doStuff();
     */
  }

  componentWillUnmount() {
  }

  componentWillMount() {
    this.index = 0;
    this.animation = new Animated.Value(0);
  }

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
          this.map.animateToRegion({
              ...coordinates,
              latitudeDelta: this._region.latitudeDelta,
              longitudeDelta: this._region.longitudeDelta,
            },
            350
          );
        }
      }, 10);
    });
  }

  
  /********************* Non React.[Component|PureComponent] methods go down here *********************/
  
  _handleMarkerPress = (e) => {
    this._scroll.getNode().scrollTo({x: e * Layout.map.card.width, y: 0, animated: false});
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

  /********************* Render methods go down here *********************/

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

    return (
      <View style={styles.container}>
        <MapView
          ref={ map => this.map = map }
          initialRegion={ this._region }
          provider={ PROVIDER_GOOGLE }
          style={styles.container}
          >
          {this.state.markers.map((marker, index) => {
            const coordinates = marker.coords;
            const opacityStyle = { opacity: interpolations[index].opacity };
            return (
              <MapView.Marker
                key={index} 
                coordinate={coordinates}
                tracksViewChanges={true}
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
          {this.state.markers.map((marker, index) => (

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
                <Text numberOfLines={1} style={styles.cardtitle}>{marker.title}</Text>
                {/* <Text numberOfLines={1} style={styles.cardDescription}>
                  {marker.abstract}
                </Text> */}
              </View>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>
      </View>
     );
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        <ConnectedHeader iconTintColor={Colors.colorScreen4} />
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
    left: 0,
    right: 0,
    paddingVertical: 10,
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
    backgroundColor: Colors.colorScreen4,
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
    backgroundColor: Colors.green,
    position: "absolute",
    borderWidth: 1,
    borderColor: 'black',
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