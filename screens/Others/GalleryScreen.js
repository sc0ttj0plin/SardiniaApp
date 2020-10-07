import React, {Component} from 'react';
import {Text, View, FlatList, ScrollView, StyleSheet, Dimensions} from 'react-native';
import {Header, ConnectedHeader } from '../components';
import { Button } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import Layout from '../constants/Layout'
import Colors from '../constants/Colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import * as localeActions from '../actions/locale';
import Gallery from 'react-native-image-gallery';
import _ from 'lodash';
import HeaderFullscreen from '../components/HeaderFullscreen';
// import { ScreenOrientation } from 'expo';
import * as ScreenOrientation from 'expo-screen-orientation'

const { OrientationLock } = ScreenOrientation;

class GalleryScreen extends Component {  

  constructor(props) {
    super(props);

    var { images, initialPage } = props.route.params; 

    this.state = {
        images: images,
        initialPage: initialPage,
        currentPage: initialPage,
        orientation: null,
    };
  }

  async componentDidMount() {
    const { orientation } = await ScreenOrientation.getOrientationAsync();
    this.setState({ orientation });
    await ScreenOrientation.unlockAsync();
    // ScreenOrientation.addOrientationChangeListener(this._onOrientationChange);
  } 

  async componentWillUnmount() {
    // Screen orientation (lock & remove callback) for video playing
    await ScreenOrientation.lockAsync(OrientationLock.PORTRAIT);
    // ScreenOrientation.removeOrientationChangeListeners();
  }

  _onPageSelected = (p) => {
    this.setState({
        currentPage: p
    })
  }

  render() {
    const { lan } = this.props.locale;
    const image = this.state.images[this.state.currentPage];
    const title = _.get(image, ['title_field', lan, 0, 'safe_value'], null);

    return (
      <View style={styles.fill}>
        <Gallery
            style={styles.gallery}
            images={this.state.images}
            initialPage={this.state.initialPage}
            onPageSelected={this._onPageSelected}>
        </Gallery>
        <HeaderFullscreen
          text={(this.state.currentPage+1) + '/' + this.state.images.length}
          goBackPressed={() => {this.props.navigation.goBack()}}
          >
        </HeaderFullscreen>
        {title && (
            <View style={[styles.footer]}>
                <Text style={styles.footerText}>{title}</Text>
            </View>
        )}
      </View>

    );
  }
}

const styles = StyleSheet.create({
    buttonTopHeader: {
        width: "100%",
        position: 'absolute',
        top: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    gallery: { 
      flex: 1, 
      backgroundColor: 'black' 
    },
    centerButtonContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        top: 0,
        height: '100%',
    },
    rightButtonContainer: {
        position: 'absolute',
        height: '100%',
        alignItems: 'flex-end',
        top: 0,
        right: 0,
        padding: 5,
        justifyContent: 'center'
    },
    pageIndex: {
        color: 'white',
        backgroundColor: "rgba(0,0,0,0.5)",
        fontSize: 14,
        textAlign: 'center',
        padding: 10,
        borderRadius: 20
    },
    buttonContainer: {
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 50,
        height: 50,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: "100%",
        height: 60,
        textAlign: 'center',
        justifyContent: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    footerText: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
    },
  button: {
    height: 50,
    width: 50
  },
  fill: {
    flex: 1
  },
  headerContainer: {
    padding: 10,
    backgroundColor: "white"
  },
});

function GalleryScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();
  return <GalleryScreen {...props} navigation={navigation} route={route} store={store} />;
}

const mapStateToProps = state => {
  return {
    categories: state.graphqlState.categories,
    error: state.restState.error,
    loading: state.restState.loading,
    locale: state.localeState
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
})(GalleryScreenContainer)