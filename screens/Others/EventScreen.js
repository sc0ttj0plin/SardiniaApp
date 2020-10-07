import React, {Component} from 'react';
import {Text, View, FlatList, ScrollView, StyleSheet, Dimensions, Linking, Share } from 'react-native';
import AutoHeightWebView from 'react-native-autoheight-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import * as localeActions from '../actions/locale';
import Colors from '../constants/Colors';
import * as favouritesActions from '../actions/favourites';
import {Image, Icon, Button} from 'react-native-elements';
import Layout from '../constants/Layout'
import { Header, Webview, ConnectedHeader, ConnectedFab } from '../components';
import * as Constants from '../constants';
import _ from 'lodash';

class EventScreen extends Component {  

  constructor(props) {
    super(props);

    ({ event: this._entity } = props.route.params); 
    const { image = null } = this._entity;
    const { lan } = props.locale;
    this.state = {
      image
    };
  }

  _renderFab = (nid) => {
    const isFavourite = this.props.favourites.events[nid];
    return (
        <View style={{position: "absolute", zIndex: 9, top: 130, right: -10}}>
          <ConnectedFab color={Colors.colorScreen5} direction="down">
            <Button 
              style={{ backgroundColor: Colors.colorScreen5 }} 
              onPress={() => Linking.openURL("https://www.sardegnaturismo.it")}>
              <Icon name={"share"} size={20} type="font-awesome" color="white" /> 
            </Button>
            <Button 
              style={{ backgroundColor: Colors.colorScreen5 }} 
              onPress={() => this.props.actions.toggleFavourite({ type: "events", id: nid })}>
              <Icon name={isFavourite ? "heart" : "heart-o"} size={20} type="font-awesome" color="white" /> 
            </Button>
          </ConnectedFab>
        </View>
    )
  }

  render() {
    const { lan } = this.props.locale;
    let abstract = _.get(this._entity.abstract, [lan, 0, "value"], null);
    let title = _.get(this._entity.title, [lan, 0, "value"], null);
    let description = _.get(this._entity.description, [lan, 0, "value"], null);
    const nid = this._entity.nid;
    const { image } = this.state;
    const isFavourite = this.props.favourites.events[nid];

    return (
      <View style={styles.fill}>
        <ConnectedHeader 
          containerStyle={{
            marginTop: Layout.statusbarHeight
          }}/>
        
        {/*this._renderFab(nid)*/}
        
        <Webview 
          lan={lan}
          locale={this.props.locale}
          image={image} 
          abstract={abstract} 
          title={title} 
          description={description}
          urlAlias={this._entity.url_alias}
          category={"Evento"}
          categoryColor={Colors.colorScreen5}
          toggleFavourite={() => { this.props.actions.toggleFavourite({ type: "events", id: nid })}}
          isFavourite={this.props.favourites.events[nid]}
          />
      </View>

    );
  }
}

const styles = StyleSheet.create({
  image: {
      flex: 1,
      //The trick is to make the image height same as the screen dimensions
      height: 200, 
      width: null
  },
  headerContainer: {
    padding: 10,
    backgroundColor: "white"
  },
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  header: {
    backgroundColor: "white"
  },
  container: {
    padding: 10,
    backgroundColor: "white"
  },
  title: {
      fontSize: 16,
      flex: 1,
      textAlign: "center",
  },
  category: {
      fontSize: 12,
      flex: 1,
      textAlign: "center",
  },
  sectionTitle: {
    flex: 1,
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10
  },
  showMoreButton: {
      marginBottom: 10
  },
  fabStyle: {
    height: 40,
    width: 40,
    backgroundColor: Colors.orange,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  }
});

function EventContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();
  return <EventScreen {...props} navigation={navigation} route={route} store={store} />;
}

const mapStateToProps = state => {
  return {
    categories: state.graphqlState.categories,
    error: state.restState.error,
    loading: state.restState.loading,
    locale: state.localeState,
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
})(EventContainer)