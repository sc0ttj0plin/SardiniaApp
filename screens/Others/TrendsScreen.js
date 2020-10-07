import React, { Component } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { List, ListItem, SearchBar, Button } from "react-native-elements";
import { FlatGrid } from 'react-native-super-grid';
import MapView from 'react-native-maps';
import { NavigationEvents, useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import Layout from '../constants/Layout';
import { Header, ConnectedHeader, TrendsListItem } from '../components';
import { apolloQuery } from '../apollo/middleware';
import Colors from '../constants/Colors';
import _ from 'lodash';


class TrendsScreen extends Component {

  constructor(props) {
    super(props);

    this._refs = {};

    this.state = {
      loading: false,
      error: null,
      pois: []
    };
      
  }


  componentDidMount() {
    // console.log("props", this.props.actions)
    let nids = ["237136", "14903", "15166", "127136"]

    this.props.actions.getPois({nids: nids});

  }

  componentDidUpdate(prevProps){
    if(prevProps.pois != this.props.pois){
      // console.log(this.props.pois)
      let titles = ["Natura Selvaggia", "Isola del mito", "La terra dei Centenari", "Vivere il Mare"];
      titles.reverse();
      let pois = [];
      let index = 0;
      let nids = [237136, 14903, 15166, 127136]

      for( let key in this.props.pois){
        let element = this.props.pois[key];
        if(nids.indexOf(_.get(element, ["nid"], null)) != -1){
          // console.log("title", titles[index] ? titles[index] : _.get(element, ["title", "it", 0, "value"], null), titles[index], index)
          let poi = {
            title: titles[index] ? titles[index] : _.get(element, ["title", "it", 0, "value"], null),
            image:  _.get(element, ["image"], null),
            id:  _.get(element, ["nid"], null)
          }
          // console.log("poi", poi)
          pois.push(poi);
          index++;
        }
      }
      pois.reverse();
      this.setState({
        pois: pois
      })
    }

    // console.log("title", title, image)
  }

//artigianato
//centenari
  //benessere
//mito
  //archeologia (nuraghi, giganti, etc.)
//tradizione
  //folklore - costumi
  //cibo
//natura selvaggia
//blu incontaminato
  _renderItem = (item , index) => {
    return(
      <TrendsListItem 
        onPress={ () => this.props.navigation.navigate("TrendScreen", { nid: item.id, title: item.title})}
        keyItem={index + "a"}
        item={item}
      />
    )
  } 

  render() {
    const { craft, centenarians, myth, pristineBlu, tradition, wildNature } = this.props.locale.messages;

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
          { this.state.pois &&
            <FlatList 
              key={1}
              keyExtractor={item => item.id}
              data={this.state.pois}
              renderItem={({item, index}) => this._renderItem(item, index)}
              style={styles.fill}
            />
          }
      </View>
    )
  }
  
}

TrendsScreen.navigationOptions = {
  title: 'Trends',
};


const styles = StyleSheet.create({
  header: {
    backgroundColor: "white"
  },
  container: {
    flex: 1,
    backgroundColor: 'red',
    paddingTop: 10
  },
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  group: {
    width: '100%'
  },
  categoryListItem: {
    width: '100%',
    height: 240
  },
  titlePrefix: {
    fontSize: 15,
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: {width: -2, height: 3},
    textShadowRadius: 2,
    paddingBottom: -5,
    marginBottom: -5
  },
  title: {
    padding: 0,
    fontSize: 27,
    textShadowColor: 'rgba(0, 0, 0, 1)',
    textShadowOffset: {width: -2, height: 3},
    textShadowRadius: 2
  }
});

function TrendsScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <TrendsScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}

const mapStateToProps = state => {
  return {
    itineraries: state.graphqlState.itineraries,
    itinerariesError: state.graphqlState.itinerariesError,
    itinerariesLoading: state.graphqlState.itinerariesLoading,
    locale: state.localeState,
    pois: state.graphqlState.pois,
    poisSuccess: state.graphqlState.poisSuccess,
    poisError: state.graphqlState.poisError,
    poisLoading: state.graphqlState.poisLoading,
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
})(TrendsScreenContainer)