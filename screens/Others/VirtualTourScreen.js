import React, {Component} from 'react';
import {Text, View, FlatList, ScrollView, StyleSheet, Dimensions} from 'react-native';
import { Image } from 'react-native-elements'
import AutoHeightWebView from 'react-native-autoheight-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import Layout from '../constants/Layout'
import { Header } from '../components';
import * as Constants from '../constants';
import {WebView} from 'react-native-webview';
import HeaderFullscreen from '../components/HeaderFullscreen';
import _ from 'lodash';

class VirtualTourScreen extends Component {  

  constructor(props) {
    super(props);

    this.state = {
      entity: props.route.params.entity,
    };
  }


  render() {
    {/* WARNING: WebView needs opacity: 0.99 to avoid segmentation fault bug! */}

    const { entity } = this.state;
    return (
      <View style={[styles.fill]}>
        <WebView style={[styles.fill, {opacity: 0.99, overflow: "hidden"}]}
            source={{uri: entity.virtualtour }}
            scalesPageToFit={true}
            originWhitelist={['*']}
            ignoreSslError={true}
            scrollEnabled={false}
            viewportContent={'width=device-width, user-scalable=no'} />
        <HeaderFullscreen
          goBackPressed={() => {this.props.navigation.goBack()}}
          ></HeaderFullscreen>
      </View>
      

    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  }
});

function VirtualTourScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();
  return <VirtualTourScreen {...props} navigation={navigation} route={route} store={store} />;
}

const mapStateToProps = state => {
  return {
    categories: state.graphqlState.categories,
    error: state.restState.error,
    loading: state.restState.loading,
    locale: state.localeState,
  };
};

const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...graphqlActions, ...restActions}, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(VirtualTourScreenContainer)