import React, {Component} from 'react';
import {Text, View, FlatList, ScrollView, StyleSheet, Share, Dimensions, Linking, ImageBackground} from 'react-native';
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
import { useSafeArea } from 'react-native-safe-area-context';
import PoiItem from '../components/PoiItem';
import videos from '../constants/_sampleVideos';
import pois from '../constants/_samplePois';

class PlaceScreen extends Component {  

  constructor(props) {
    super(props);

    
    var { place } = props.route.params; 
    this._vPlayer = null;
    this._refs = {};
    this.state = {
      nid: place.nid,
      // entity: place,
      showMore: false,
      isVideoEnded: false,
      isVideoLoaded: false,
      isVideoPlaying: false,
      isVideoLandscape: false,
      orientation: null,
    };

  }

  async componentDidMount() {
    this.props.actions.getPoi({ nid: this.state.nid });
    apolloQuery(graphqlActions.getNodes({
      type: "attrattore",
      offset: Math.ceil(Math.random()*100),
      limit: 5
    })).then((nodes) => {
      this.setState({relatedHotels: nodes})
    })
    apolloQuery(graphqlActions.getNodes({
      type: "evento",
      offset: Math.ceil(Math.random()*100),
      limit: 5
    })).then((nodes) => {
      this.setState({relatedEvents: nodes})
    })
    apolloQuery(graphqlActions.getNodes({
      type: "itinerario",
      offset: Math.ceil(Math.random()*10),
      limit: 5
    })).then((nodes) => {
      this.setState({relatedItineraries: nodes})
    })
  } 

  componentDidUpdate(prevProps) {
  }

  async componentWillUnmount() {
  }


  _onShowMoreButtonPressed () {
    this.setState({showMore: true});
  }

  _onRegionChangeComplete = (region) => {
    this.state.region = region;
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

  _onShare = async (link) => {
    try {
      const result = await Share.share({
        message: link,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

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
        type={item.type}
        iconColor={"white"}
        onPress={() => this._openItem(item)}
        title={`${title}`}
        place={`${item.term.name}`}
        image={`${item.image}`}
        distance={this.state.isCordsInBound && item.distance}
      />
  )}

  _renderRelatedList = (title, relatedList) => {
      return (
        <View>
          {relatedList && relatedList.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>{title}</Text>
              <FlatList
                horizontal={true}
                renderItem={({item}) => this._renderPoiListItem(item)}
                data={relatedList}
                extraData={this.props.locale}
                keyExtractor={item => item.nid.toString()}
                ItemSeparatorComponent={this._renderHorizontalSeparator}
                contentContainerStyle={styles.listContainerHeader}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}
        </View>
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

  _onVideoEnd = () => {
    this.setState({
      isVideoEnded: true
    });
  }

  _onVideoError = (e) => {
    console.log(e);
  }

  _onVideoLoad = () => {
    this.setState({
      isVideoLoaded: true,
    }, () => this._playVideo());
  }

  _playVideo = () => {
    if(this.state.isVideoLoaded) 
      this._vPlayer.playAsync();
  }

  _onPlaybackStatusUpdate = (status) => {
    if(status.didJustFinish) {
      this._onVideoEnd();
    }
    if(status.isPlaying && !this.state.isVideoPlaying) {
      this.setState({
        isVideoPlaying: true
      });
    }
  }

  _renderFab = (nid, title=null, coordinates=null) => {
    const isFavourite = this.props.favourites.places[nid];
    return (
      <View style={{position: "absolute", zIndex: 9, top: 30, right: -5}}>
        <ConnectedFab color={Colors.colorPlacesScreen} direction="down">
          <Button 
            style={{ backgroundColor: Colors.colorPlacesScreen }} 
            onPress={() => this._onShare("https://www.sardegnaturismo.it")}>
            <Icon name={"share"} size={20} type="font-awesome" color="white" /> 
          </Button>
          <Button 
            style={{ backgroundColor: Colors.colorPlacesScreen }} 
            onPress={() => this.props.actions.toggleFavourite({ type: "places", id: nid })}>
            <Icon name={isFavourite ? "heart" : "heart-o"} size={20} type="font-awesome" color="white" /> 
          </Button>
          {coordinates && (
            <Button
              style={{ backgroundColor: Colors.colorPlacesScreen }} 
              onPress={() => this._openNavigator(title, coordinates)}>
              <Icon name="map" size={25} color="white" />
            </Button>
          )}
        </ConnectedFab>
      </View>
    )
  }

  _getUrlAlias = (url_alias, lan) => {
    for(var i = 0; i < url_alias.length; i++) {
      var alias = url_alias[i];
      if(alias.language == lan)
        return alias.alias;
    }
    return "";
  }

  _renderContent = () => {
    const { nid } = this.state;
    const entity = this.props.pois[nid];
    const isFavourite = this.props.favourites.places[nid];
    const coordinates = entity  && entity.georef ? { latitude: entity.georef.coordinates[1], longitude: entity.georef.coordinates[0] } : null;

    if (entity) {
      const { lan } = this.props.locale;
      const { whyVisit: whyVisitTitle, discoverMore } = this.props.locale.messages;
      let abstract = _.get(entity.abstract, [lan, 0, "value"], null);
      let title = _.get(entity.title, [lan, 0, "value"], null);
      let description = _.get(entity.description, [lan, 0, "value"], null);
      let whyVisit = _.get(entity.whyVisit, [lan, 0, "value"], null);
      const { orientation } = this.state;
      const socialUrl = "https://www.sardegnaturismo.it/" + this._getUrlAlias(entity.url_alias, lan);

      var VIDEO_INDEX = -1;
      for(var i = 0; i < videos.length; i++ ){
       if(videos[i].nid == nid)
        VIDEO_INDEX = i;
      }

      return (
        <View style={[styles.fill]}>
            
            {/* NOTE: for the video player to show we had to move it out the ScrollView */}
            <ScrollView style={styles.fill} contentContainerStyle={{paddingBottom: this.props.insets.bottom + 10}}>
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
                {/*this._renderFab(nid, title, coordinates)*/}
                
                
                
                
                <View style={[styles.headerContainer]}>
                  {entity.term && (
                    <View style={[styles.categoryContainer]}>
                      <Text style={[styles.category]}>{entity.term.name}</Text>
                      <View style={styles.borderLine}></View>
                    </View>
                  )}
                  <Text style={[styles.title]}>{title}</Text>

                </View>

                <View style={{width: "100%", height: 30, position: "absolute", left: 0, top: 180}}>
                  <Button
                      buttonStyle={styles.fabStyle, {position: "absolute", top: 5, left: 5, borderRadius: 50, backgroundColor: Colors.colorPlacesScreen }}
                      containerStyle={styles.fabContainerFav}
                      onPress={() => this.props.actions.toggleFavourite({ type: "places", id: nid })}
                      icon={<Icon name={isFavourite ? "heart" : "heart-o"} size={20} type="font-awesome" color="white"/>}>
                  </Button>
                  <Button
                    buttonStyle={styles.fabStyle, {position: "absolute", top: 5, left: Layout.window.width - 45, borderRadius: 50, backgroundColor: Colors.colorPlacesScreen }}
                    containerStyle={styles.fabContainerFav}
                    onPress={() => this._onShare(socialUrl)}
                    icon={<Icon name={"share"} size={20} type="font-awesome" color="white" />}>
                  </Button>
                  <Button
                    buttonStyle={styles.fabStyle, {borderRadius: 50, backgroundColor: Colors.colorPlacesScreen }}
                    containerStyle={styles.fabContainerFav, {position: "absolute", top: 5, left: Layout.window.width - 95}}
                    onPress={() => this._openNavigator(title, coordinates)}
                    icon={<Icon name="map" size={25} color="white" />}>
                  </Button>
                </View>

                <View style={[styles.container]}>
                  {abstract && (
                      <HTML containerStyle={[Constants.styles.innerText]} html={"<font style=\"" + Constants.styles.html.shortText + "\">" + abstract + "</font>"} />
                    )}

                  <View>
                    {whyVisit && (
                        <>
                          <View style={[Constants.styles.innerText, styles.notForgetContainer]}>
                            <Text style={styles.notForgetContainerTitle}>{whyVisitTitle}</Text>
                            <View style={[styles.borderLine, {backgroundColor: "white", width: 60, marginBottom: 25}]}></View>
                            <HTML html={"<font style=\"" + Constants.styles.html.shortTextSecondary + "\">" + whyVisit + "</font>"} />
                          </View>
                          
                        </>
                    )} 
                    {entity.georef && this._renderMap(title)}
                  </View>

                  {/*!this.state.showMore && description && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.button} 
                      onPress={this._onShowMoreButtonPressed.bind(this)}>
                        <Text style={styles.buttonText}>{discoverMore}</Text>
                    </TouchableOpacity>
                  )*/}

                  {entity.gallery && (
                      this._renderGallery(entity.gallery.map((item) => { 
                          var image = {};
                          image.title_field = item.title_field;
                          image.key = item.uid;
                          image.source = {uri: item.uri};
                          image.dimensions = {width: item.width, height: item.height};
                          return image;}))
                  )}
                  {description && (
                      <View style={[Constants.styles.innerText, {flexDirection: "column", marginBottom: 30}]}>
                        <Text style={[styles.sectionTitle]}>Descrizione</Text>
                        <View style={{...styles.borderLine, backgroundColor: "#F59F1C", width: 60, marginTop: -5, marginBottom: 25}}></View>
                        <HTML html={"<font style=\"" + Constants.styles.html.longText + "\">" + description + "</font>"} />
                      </View>
                  )}

                  {this.state.relatedHotels && (
                    this._renderRelatedList("Strutture ricettive nelle vicinanze", this.state.relatedHotels)
                  )}

                  {this.state.relatedItineraries && (
                    this._renderRelatedList("Itinerari", this.state.relatedItineraries)
                  )}

                  {this.state.relatedEvents && (
                    this._renderRelatedList("Eventi", this.state.relatedEvents)
                  )}


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
        {this._renderContent()}
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
    fontWeight: "300",
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
  listContainerHeader: {
    paddingLeft: 10,
  },
});

function PlaceScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();
  const insets = useSafeArea();
  return <PlaceScreen {...props} navigation={navigation} route={route} store={store} insets={insets} />;
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
})(PlaceScreenContainer)