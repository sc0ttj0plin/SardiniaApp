import React, { Component } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { Header} from "../components";
import { ImageGridItem, ConnectedHeader } from "../components"
import Layout from '../constants/Layout';
import { NavigationEvents, useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import * as localeActions from '../actions/locale';
import { apolloQuery } from '../apollo/middleware';
import _ from 'lodash';
import * as Constants from '../constants';
// import { Colors } from "react-native/Libraries/NewAppScreen";
import Colors from "../constants/Colors";

class ExploreScreen  extends Component{

  constructor(props) {
    super(props);

    this.state = {
      listRefreshing: false,
      fetchLimit: 12,
      pois: [],
      images: []
    }

    this._isLoadedAny = false;
  }

  componentDidMount() {
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
  }

  onUpdateCoords(coords) {
    if(!this.state.coords || this.state.coords.latitude !== coords.latitude || this.state.coords.longitude !== coords.longitude) {
      this.setState({coords: coords}, () => {
        if(!this._isLoadedAny){
          this._loadMoreImages();
          this._isLoadedAny = true;
        }
      });
    }
  }
  
  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  _openPoi = (item) => {
    if(item.virtualtour)
      this.props.navigation.navigate(Constants.NAVIGATION.NavVirtualTourScreen, {
        entity: item
      });
    else
      this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, {
        place: item
      });
  }

  _createVirtualTourItem = (title, virtualTourUrl, imageUrl) => {
    var image = {};
    image.nid = virtualTourUrl;
    image.title = {
      it: [
        {
          value: title
        }
      ]
    };
    image.image = imageUrl;
    image.distance = 10;
    image.uuid = virtualTourUrl;
    image.virtualtour = virtualTourUrl;
    return image
  }

  _loadMoreImages = () => {
    var {coords} = this.state;
    if(this.state.coords) {
      this.setState({
        listRefreshing: true
      })
      apolloQuery(graphqlActions.getNearestPoisImages({
        x: coords.longitude,
        y: coords.latitude,
        limit: this.state.fetchLimit,
        offset: this.state.pois ? this.state.pois.length : 0
      })).then((pois) => {
        var newImages = [];
        if(this.state.images == 0) {
          newImages.push(this._createVirtualTourItem("Barumini", "https://sketchfab.com/models/0569f020894644b18d0c20eae09bd54c/embed?preload=1&amp;ui_controls=1&amp;ui_infos=1&amp;ui_inspector=1&amp;ui_stop=1&amp;ui_watermark=1&amp;ui_watermark_link=1", "https://www.gelestatic.it/thimg/teXsanBQDUd6E8ooJvvaNivQxFw=/960x540/smart/filters:format(webp)/https%3A//www.lanuovasardegna.it/image/contentid/policy%3A1.17825402%3A1570605747/image/image.jpg%3Ff%3Ddetail_558%26h%3D720%26w%3D1280%26%24p%24f%24h%24w%3Dd5eb06a"));
          newImages.push(this._createVirtualTourItem("Galleria Comunale", "https://my.matterport.com/show/?m=Sbi2Lko9jqf", "http://sistemamuseale.museicivicicagliari.it/wp-content/uploads/2018/12/galleria-comunale-esterno-notte.jpg"));
        }
        pois.forEach((p) => {
          if(p.gallery) {
            p.gallery.forEach((i) => {
              var image = {};
              image.nid = p.nid;
              image.title = p.title;
              image.image = i.uri;
              image.distance = p.distance;
              image.uuid = i.uuid;
              newImages.push(image);
            })
          }
        })
        this.setState((prevState, nextProps) => ({
          pois: this.state.pois ? [...this.state.pois, ...pois] : pois,
          images: this.state.images ? [...this.state.images, ...newImages] : images,
          listRefreshing: false
        }));
      })
    }
  }

  _renderImageListItem = (item) => {
    const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
    return (
      <TouchableOpacity 
          key={item.nid} 
          onPress={() => this._openPoi(item)}
          activeOpacity={0.7}
          style={{flex: 1}}
      >
        <ImageGridItem
          title={`${title}`}
          image={`${item.image}`}
          distance={`${item.distance}`}
          style={{flex: 1}} />
      </TouchableOpacity>

  )}

  _renderImageList = () => {

    var {images} = this.state;
    return (
        <FlatList
            scrollView={FlatList}
            onEndReached={this._loadMoreImages.bind(this)}
            onEndReachedThreshold={0.5}
            data={images}
            renderItem={({item}) => this._renderImageListItem(item)}
            numColumns={2}
            horizontal={false}
            keyExtractor={item => item.uuid}
            refreshing={this.state.entityRefreshing}
            bodyContainerStyle={styles.listContainer}
            style={styles.listContainer}
        />
    );
  }

  render() {
    return (
      <View style={styles.fill}>
        <ConnectedHeader 
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
        {this._renderImageList()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1
  },
  header: {
    backgroundColor: "white" 
  },
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: "white"

  },
  listContainer: {
  }
});

function ExploreScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <ExploreScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}

const mapStateToProps = state => {
  return {
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
})(ExploreScreenContainer)