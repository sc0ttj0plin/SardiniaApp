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
import SectionTitle from '../../components/SectionTitle';
import { distance, distanceToString, coordsInBound } from '../../helpers/maps';
import { useSafeArea } from 'react-native-safe-area-context';

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
    const title = _.get(props.route, "params.title", "");

    this.disableSelectDuringScrolling = false;

    this.state = {
      render: USE_DR ? false : true,
      //
      markers,
      term,
      region: region || Constants.REGION_SARDINIA,
      title: title,
      coords: {},
      tracksViewChanges: false,
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
      if(!this.disableSelectDuringScrolling ) {
        clearTimeout(this.regionTimeout);
        this.regionTimeout = setTimeout(() => {
          if (this.index !== index) {
            this.index = index;
            this._selectMarker(index);
          }
        }, 10);
      }
    });

    if(this.props.others.geolocation && this.props.others.geolocation.coords) {
      this._onUpdateCoords(this.props.others.geolocation.coords);
    }

    this._selectMarker(0);
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

  _onScrollBeginDrag = () => {
    this.disableSelectDuringScrolling = false;
  }

  _selectMarker = (index) => {
    const coordinates = this.state.markers[index].coords;
    this.map.animateCamera({
      center:
        {
          ...coordinates,
        }
      },
      350
    );
    this.setState({tracksViewChanges: true}, () => {
      this.setState({selectedIndex: index}, () => {
        this.setState({tracksViewChanges: false});
      })
    });
  }

  _handleMarkerPress = (index) => {
    this.disableSelectDuringScrolling = true;
    this._selectMarker(index);
    this._scroll.scrollTo({x: index * Layout.map.card.width, y: 0, animated: true});
  }

  _openEntity = (entity) => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, { item: { uuid: entity.uuid }, mustFetch: true })
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
        onPress={() => this._openEntity(stage)}
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

  _renderMapTitle = () => {
    const { title } = this.state;
      if(title != ""){
        return (
          <SectionTitle numberOfLines={3} text={title} textStyle={{ fontSize: 15 }} style={styles.mapTitle} />
        )
      }
  }

  _renderContent = () => {
    const bottom = this.props.insets.bottom;
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
          style={[styles.flatlist, {bottom: bottom}]}
          contentContainerStyle={{paddingRight: Layout.window.width - Layout.map.card.width}}
          onScrollBeginDrag={this._onScrollBeginDrag}
          >
          {this.state.markers.map((marker, index) => this._renderStage(marker, index))}
        </Animated.ScrollView>
      </View>
     );
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        <ConnectedHeader iconTintColor={Colors.colorItinerariesScreen} />
        {render && this._renderMapTitle()}
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
  mapTitle: {
    width: "100%",
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
    color: "#000000E6",
    backgroundColor: "#F2F2F2",
    fontSize: 15,
    fontFamily: "montserrat-bold",
    paddingHorizontal: 5
  },
});


function ItineraryScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();
  const insets = useSafeArea();

  return <ItineraryStagesMapScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store}
    insets={insets} />;
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