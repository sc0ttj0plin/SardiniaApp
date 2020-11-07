import React, {Component} from 'react';
import {Text, View, FlatList, ScrollView, StyleSheet, Dimensions, Linking, ImageBackground} from 'react-native';
import {WebView} from 'react-native-webview'
import { Header, GridGallery, ConnectedHeader, ConnectedFab, AsyncOperationStatusIndicatorPlaceholder } from '../components';
import Layout from '../constants/Layout';
import {Image, Icon, Button} from 'react-native-elements';
import AutoHeightWebView from 'react-native-autoheight-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import * as localeActions from '../actions/locale';
import * as favouritesActions from '../actions/favourites';
import { apolloQuery } from '../apollo/middleware';
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import Colors from '../constants/Colors';
import Gallery from 'react-native-image-gallery';
import * as Constants from '../constants';
import _ from 'lodash';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Video } from 'expo-av';
import HTML from 'react-native-render-html';
import { Fab } from 'native-base';
import {
  PoiItemsList
} from "../components"
import PoiItem from '../components/PoiItem';

import videos from '../constants/_sampleVideos'
import pois from '../constants/_samplePois';

var _tmpAddMockPois = (e) => {
  //get N points randomly from
  //console.log('>>', e.length)
  e.pois = pois.sort(() => Math.random() - Math.random()).slice(0, Math.ceil(Math.random()*5));
}

class TrendsScreen extends Component {  

  constructor(props) {
    super(props);

    
    var { nid, title } = props.route.params; 
    // console.log("poi nid", nid)
    this._refs = {};
    this.state = {
      nid: nid,
      pois: [],
      title: title,
      relatedEvents: null,
      relatedItineraries: null,
      relatedPois: null,
      ready: false
    };

  }

  async componentDidMount() {
    this.props.actions.getExtras({nids: [this.state.nid]});
    let relatedPois = []
    let relatedItineraries = []
    let relatedEvents = []
    await apolloQuery(graphqlActions.getNodes({
      type: "attrattore",
      offset: Math.ceil(Math.random()*100),
      limit: 5
    })).then((nodes) => {
      this.setState({relatedPois: nodes})
      // relatedPois =  nodes;
    })
    await apolloQuery(graphqlActions.getNodes({
      type: "evento",
      offset: Math.ceil(Math.random()*100),
      limit: 5
    })).then((nodes) => {
      // relatedEvents = nodes;
      this.setState({relatedEvents: nodes})
    })
    await apolloQuery(graphqlActions.getNodes({
      type: "itinerario",
      offset: Math.ceil(Math.random()*10),
      limit: 5
    })).then((nodes) => {
      nodes.forEach((e) => _tmpAddMockPois(e));
      this.setState({relatedItineraries: nodes})
      // relatedItineraries = nodes;
    })

    // this.setState({
    //   relatedItineraries: relatedItineraries,
    //   relatedEvents: relatedEvents,
    //   relatedPois: relatedPois,
    //   ready: true
    // })

  } 

  

  componentDidUpdate(prevProps) {
    if(this.state.pois != this.props.pois && Object.keys(this.props.pois).length > 0 && !this.state.pois){
      // console.log("found enter", Object.keys(this.props.pois))
      this.setState({
        pois: this.props.pois
      })
    }
  }

  async componentWillUnmount() {
  }

  _renderHorizontalSeparator = () => {
    return (
      <View style={{width: 5, flex: 1}}></View>
    )
  }

  _renderPoiListItem = (item) => {
    const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
    item.term = item.nodes_terms[0].term;
    return (
      <PoiItem 
        keyItem={item.nid}
        iconColor={"white"}
        type={item.type}
        onPress={() => this._openItem(item)}
        title={`${title}`}
        place={`${item.term.name}`}
        image={`${item.image}`}
        distance={this.state.isCordsInBound && item.distance}
      />
  )}

  _renderRelatedList = (title, relatedList, cornerColor, cornerIconColor, cornerIconName) => {
      return (
        <PoiItemsList
          horizontal={true}
          renderItem={({item}) => this._renderPoiListItem(item)}
          data={relatedList ? relatedList : []}
          extraData={this.props.locale}
          keyExtractor={item => item.nid.toString()}
          ItemSeparatorComponent={this._renderHorizontalSeparator}
          contentContainerStyle={styles.listContainerHeader}
          showsHorizontalScrollIndicator={false}
          locale={this.props.locale}
          onPressItem={this._openItem}
          cornerIconName={cornerIconName}
          cornerColor={cornerColor}
          cornerIconColor={cornerIconColor}
          cornderIconName={cornerIconName}
          listTitle={title}
          listTitleStyle={styles.sectionTitle}
        />
      )
  }

  _renderVideoPlayer = (url, urlImage) => {
    return (
      <View style={{
        position: "relative"
      }}>
        <ImageBackground style={[styles.image, {
          backgroundColor: "#aaaaaa",
          alignItems: "flex-start"
        }]}
          source={{uri: urlImage}}
        >
          <View style={[styles.fill, {
            width: "100%",
            maxHeight: 200-20,
            backgroundColor: "transparent",
            alignItems: "center",
            justifyContent: "center"}]}>
            <TouchableOpacity
              style={{
                width: 84,
                height: 84,
                backgroundColor: "transparent",
                padding: 10,
                zIndex: 99,
                justifyContent: "center",
                alignItems: "center"
              }}
              activeOpacity={0.7}
              onPress={ () => this.props.navigation.navigate("VideoScreen", { source: url })}>
                <ImageBackground source={require("../assets/icons/play_bg.png")} style={{
                  width: 84,
                  height: 84,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingLeft: 7
                }}>
                  <Image 
                    
                    source={require("../assets/icons/play.png")} style={{
                    width: 28,
                    height: 32,
                  }}>  
                  </Image>

                </ImageBackground>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  }

  _openNavigator = (title, coords) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${coords.latitude},${coords.longitude}`;
    const label = title;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    Linking.openURL(url); 
  }

  _renderMap = (title) => {
    const { nid } = this.state;
    const entity = this.props.pois[nid];

    if (entity) {
      const { openNavigator } = this.props.locale.messages;
      const coordinates = { latitude: entity.georef.coordinates[1], longitude: entity.georef.coordinates[0] };
      return (
        <>
          <View style={styles.mapContainer}
            pointerEvents="none">
            <MapView
              ref={ map => this.map = map }
              initialRegion={Constants.REGION_SARDINIA}
              provider={ PROVIDER_GOOGLE }
              style={{flex: 1}}>
              <MapView.Marker
                coordinate={coordinates}
                tracksViewChanges={false} />
          </MapView>
          </View>
      </>
     )
    } else {
      return null
    }
  }

  _renderGallery(images) {
    const { gallery } = this.props.locale.messages; 
    return (
    <View style={{marginBottom: 10, flexDirection: "column"}}>
      <Text style={[styles.sectionTitle]}>{gallery}</Text>
      <View style={{...styles.borderLine, backgroundColor: "#F59F1C", width: 60, marginTop: -5, marginBottom: 25}}></View>
      <GridGallery images={images} onPress={(index) => {
          this.props.navigation.navigate(Constants.NAVIGATION.NavGalleryScreen, {
            images: images,
            initialPage: index
          })
      }}/>
    </View>
    );
  }

  _isSuccessData = () => this.props.poisSuccess;
  _isLoadingData = () => this.props.poisLoading;
  _isErrorData = () => this.props.poisError;
  _renderLoadingOutcome = () => 
    <AsyncOperationStatusIndicatorPlaceholder 
      retryFun={() => this.props.actions.getPoi({ nid: this.state.nid })} 
      size={"large"} 
      loading={this._isLoadingData()} 
      error={this._isErrorData()} 
    />;


  _renderFab = (nid, title=null, coordinates=null) => {
    const isFavourite = this.props.favourites.places[nid];
    return (
      <View style={{position: "absolute", zIndex: 1, top: 25, right: 20, height: 50, width: 50}}>
        <ConnectedFab color={Colors.colorPlacesScreen} direction="down">
          <TouchableOpacity
            activeOpacity={0.7} 
            style={{ backgroundColor: Colors.colorPlacesScreen, padding: 8, borderRadius: 50, marginBottom: 10 }} 
            onPressIn={() => Linking.openURL("https://www.sardegnaturismo.it")}>
            <Icon name={"share"} size={20} type="font-awesome" color="white" /> 
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7} 
            style={{ backgroundColor: Colors.colorPlacesScreen, padding: 8, borderRadius: 50, marginBottom: 10 }} 
            onPress={() => this.props.actions.toggleFavourite({ type: "places", id: nid })}>
            <Icon name={isFavourite ? "heart" : "heart-o"} size={20} type="font-awesome" color="white" /> 
          </TouchableOpacity>
          {coordinates && (
            <TouchableOpacity
              activeOpacity={0.7}
              style={{ backgroundColor: Colors.colorPlacesScreen, padding: 8, borderRadius: 50, marginBottom: 10 }} 
              onPress={() => this._openNavigator(title, coordinates)}>
              <Icon name="map" size={25} color="white" />
            </TouchableOpacity>
          )}
        </ConnectedFab>
      </View>
    )
  }

  _openVRContent = () => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavVirtualTourScreen, {
      entity: {
        virtualtour: "https://sketchfab.com/models/0569f020894644b18d0c20eae09bd54c/embed?preload=1&amp;ui_controls=1&amp;ui_infos=1&amp;ui_inspector=1&amp;ui_stop=1&amp;ui_watermark=1&amp;ui_watermark_link=1",
      }
    });
  }

  _openItem = (item) => {
    var type = item.type;
    switch(type) {
      case "attrattore":
        this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, { place: item });
        break;
      case "evento":
        this.props.navigation.navigate(Constants.NAVIGATION.NavEventScreen, { event: item });
        break;
      case "itinerario":
        this.props.navigation.navigate(Constants.NAVIGATION.NavItineraryScreen, { entity: item })
        break;
      default:
        break;
    }
  }

  _renderContent = () => {
    const { nid } = this.state;
    // console.log("poi", this.state.poi)
    const entity = this.props.pois[nid];
    // console.log("poi", entity.relatedEvents, entity.relatedItineraries)
    const coordinates = entity ? { latitude: entity.georef.coordinates[1], longitude: entity.georef.coordinates[0] } : null;

    if (entity) {
      const { lan } = this.props.locale;
      const { whyVisit: whyVisitTitle, discoverMore } = this.props.locale.messages;
      let abstract = _.get(entity.abstract, [lan, 0, "value"], null);
      let title = _.get(entity.title, [lan, 0, "value"], null);
      let description = _.get(entity.description, [lan, 0, "value"], null);
      let whyVisit = _.get(entity.whyVisit, [lan, 0, "value"], null);
      const { orientation } = this.state;
      
      var VIDEO_INDEX = -1;
      for(var i = 0; i < videos.length; i++ ){
       if(videos[i].nid == nid)
        VIDEO_INDEX = i;
      }

      // console.log("", this.state.relatedEvents.length, this.state.relatedItineraries.length, this.state.relatedPois.length)

      return (
        <View style={[styles.fill]}>
            
            {/* NOTE: for the video player to show we had to move it out the ScrollView */}
            <ScrollView style={styles.fill}>
                {
                  VIDEO_INDEX < 0 &&
                    <Image 
                      style={[styles.image]}
                      source={{uri: entity.image}}
                      resizeMode='cover'
                      imageStyle={[styles.image]}
                    />
                }
                { VIDEO_INDEX >= 0 &&
                    <>
                      {this._renderVideoPlayer(videos[VIDEO_INDEX].video_url, entity.image)}
                    </>
                }
                {this._renderFab(nid, title, coordinates)}
                <View style={[styles.headerContainer]}>
                  {entity.term && (
                    <View style={[styles.categoryContainer]}>
                      {/* <Text style={[styles.category]}>{entity.term.name}</Text> */}
                      <View style={styles.borderLine}></View>
                    </View>
                  )}
                  <Text style={[styles.title]}>{this.state.title}</Text>
                </View>
                <View style={[styles.container]}>
                  {abstract && (
                      <HTML containerStyle={[Constants.styles.innerText]} html={"<font style=\"" + Constants.styles.html.shortText + "\">" + abstract + "</font>"} />
                    )}

                  {nid === 127136 && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.button} 
                      onPress={() => this._openVRContent()}>
                        <Text style={styles.buttonText}>3D</Text>
                    </TouchableOpacity>
                  )}

                  {entity.gallery && (
                      this._renderGallery(entity.gallery.map((item) => { 
                          var image = {};
                          image.title_field = item.title_field;
                          image.key = item.uid;
                          image.source = {uri: item.uri};
                          image.dimensions = {width: item.width, height: item.height};
                          return image;}))
                  )}
                  {this.state.relatedPois && (
                    this._renderRelatedList("Luoghi in evidenza", this.state.relatedPois, Colors.colorPlacesScreen, "white", Platform.OS === 'ios' ? 'ios-map' : 'md-map')
                  )}

                  {this.state.relatedItineraries && (
                    this._renderRelatedList("Itinerari", this.state.relatedItineraries, Colors.colorItinerariesScreen, "white", Platform.OS === 'ios' ? 'ios-analytics' : 'md-analytics')
                  )}

                  {this.state.relatedEvents && (
                    this._renderRelatedList("Eventi", this.state.relatedEvents, Colors.colorEventsScreen, "white", Platform.OS === 'ios' ? 'ios-calendar' : "md-calendar")
                  )}
                  <View style={{
                    height: 40
                  }}></View>
              </View>
              </ScrollView>
        </View>
      );
    } else {
      return null;
    }
  }

  render() {
    const { orientation, nid } = this.state;
    return (
      <View style={styles.fill}>
          <ConnectedHeader 
            iconTintColor="#24467C"
            containerStyle={{
              marginTop: Layout.statusbarHeight,
              height: Layout.header.height
            }} />
        {this.state.pois &&
          this._renderContent()
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  image: {
      maxHeight: 200,
      height: 200,
      resizeMode: "cover"
  },
  mapContainer: {
    flex: 1,
    height: Layout.window.height / 3,
    marginBottom: 10,
  },
  headerContainer: {
    padding: 10,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20, 
    marginTop: -20
  },
  fill: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    backgroundColor: "white"
  },
  container: {
    backgroundColor: "white",
    textAlign: "center"
  },
  title: {
      fontSize: 16,
      flex: 1,
      textAlign: "center",
      opacity: 0.6,
      color: "black",
      fontWeight: "bold"
  },
  category: {
      fontSize: 12,
      flex: 1,
      opacity: 0.6,
      textAlign: "center",
      color: "black"
  },
  sectionTitle: {
    flex: 1,
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
    opacity: 0.6,
    color: "black",
    fontWeight: "bold"
  },
  portraitVideo: {
    width: "100%",
    height: 230,
    marginBottom: 10,
    backgroundColor: "white"
  },
  button: {
      margin: 10,
      height: 50,
      backgroundColor: "#24467C",
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    height: "100%",
    fontWeight: "800",
    textAlignVertical: 'center',
    lineHeight: 50
  },
  categoryContainer: {
    flexDirection: "column",
    justifyContent: "center"
  },
  borderLine: {
    backgroundColor: "#24467C",
    height: 7,
    width: 100,
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 10
  },
  landscapeVideo: {
    width: '100%', 
    height: '100%', 
    backgroundColor: "white"
  },
  notForgetContainer: {
    width: "100%",
    marginTop: 30,
    backgroundColor: "#24467C",
    flexDirection: "column",
    paddingBottom: 20
  },
  notForgetContainerTitle: {
    alignSelf: "center",
    marginTop: 25,
    color: "white",
    fontWeight: "bold"
  },
  fabStyle: {
    height: 40,
    width: 40,
    backgroundColor: Colors.orange,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  fabContainerMap: {
    zIndex: 99,
    position: "absolute",
    top: 10,
    right: 10,
    paddingVertical: 10,
  },
  fabContainerFav: {
    zIndex: 99,
    position: "absolute",
    top: 10,
    left: 10,
    paddingVertical: 10,
  },
  listContainerHeader: {
    paddingLeft: 10,
    paddingRight: 10
  },
});

function TrendsScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();
  return <TrendsScreen {...props} navigation={navigation} route={route} store={store} />;
}

const mapStateToProps = state => {
  return {
    categories: state.graphqlState.categories,
    categoriesMap: state.graphqlState.categoriesMap,
    error: state.restState.error,
    loading: state.restState.loading,
    locale: state.localeState,
    pois: state.graphqlState.pois,
    poisSuccess: state.graphqlState.poisSuccess,
    poisError: state.graphqlState.poisError,
    poisLoading: state.graphqlState.poisLoading,
    favourites: state.favouritesState,
  };
};

const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...graphqlActions, ...restActions, ...localeActions, ...favouritesActions}, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(TrendsScreenContainer)