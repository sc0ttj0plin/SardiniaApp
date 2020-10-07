import React, { Component } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { List, ListItem, SearchBar, Button } from "react-native-elements";
import MapView from 'react-native-maps';
import { NavigationEvents, useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { GeoRefHListItem, CategoryListItem, ScrollableHeader, ConnectedHeader, AsyncOperationStatusIndicator} from "../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import * as Constants from '../constants';
import Layout from '../constants/Layout';
import { apolloQuery } from '../apollo/middleware';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import * as localeActions from '../actions/locale';
import * as favouritesActions from '../actions/favourites';
import Colors from '../constants/Colors';


class FavouritesScreen extends Component {

  constructor(props) {
    super(props);

    //let { someNavProps } = props.route.params; 

    this.state = {
      favPois: [],
      favItineraries: [],
      favEvents: [],
    };
      
  }


  _renderListItem = (item) => {
    return (
    <TouchableOpacity
      onPress={() => this._openCategory(item)}
      activeOpacity={0.7}
    >
      <CategoryListItem image={item.image} title={item.name} />
    </TouchableOpacity>)
  }


  componentDidMount() {
    let poiNids = Object.keys(this.props.favourites.places);
    let eventsNids = Object.keys(this.props.favourites.events);
    let inspirersNids = Object.keys(this.props.favourites.inspirers);
    this.props.actions.getPois({ nids: poiNids });
    this.props.actions.getEventsById({ nids: eventsNids });
    this.props.actions.getItineraries();
  }

  componentDidUpdate(prevProps, prevState) {
    //Once pois are retrieved you filter only the favourites
    if ((prevProps.pois !== this.props.pois) || (prevProps.favourites.places !== this.props.favourites.places)) {
      let favNids = Object.keys(this.props.favourites.places);
      let favPois = favNids.reduce((acc, favNid) => {
        if (this.props.pois[favNid]) 
          acc.push(this.props.pois[favNid])
        return acc;
      }, []);
      this.setState({ favPois });
    }

    if ((prevProps.itineraries !== this.props.itineraries) || (prevProps.favourites.itineraries !== this.props.favourites.itineraries)) {
      let favNids = Object.keys(this.props.favourites.itineraries);
      let favItineraries = favNids.reduce((acc, favNid) => {
        if (this.props.itineraries[favNid]) 
          acc.push(this.props.itineraries[favNid])
        return acc;
      }, []);
      this.setState({ favItineraries });
    }

    if ((prevProps.eventsById !== this.props.eventsById) || (prevProps.favourites.events !== this.props.favourites.events)) {
      let favNids = Object.keys(this.props.favourites.events);
      let favEvents = favNids.reduce((acc, favNid) => {
        if (this.props.eventsById[favNid]) 
          acc.push(this.props.eventsById[favNid])
        return acc;
      }, []);
      this.setState({ favEvents });
    }
  }

  _openItem = (item, type) => {
    switch(type) {
      case "pois":
        this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, { place: item });
        break;
      case "events":
        this.props.navigation.navigate(Constants.NAVIGATION.NavEventScreen, { event: item });
        break;
      case "itineraries":
        this.props.navigation.navigate(Constants.NAVIGATION.NavItineraryScreen, { entity: item })
        break;
      default:
        break;
    }
  }

  _renderListItem = (item, type) => {
    const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
    const name = _.get(item, "term.name", " ");
    return (
      <TouchableOpacity 
        key={item.nid} 
        onPress={() => this._openItem(item, type)}
        activeOpacity={0.7}
        style={{flex: 1}} 
      >
        <GeoRefHListItem
          title={title}
          place={name}
          image={item.image}
          distance={item.distance}
           />
      </TouchableOpacity>

  )}


  _renderHorizontalSeparator = () => {
    return (
      <View style={{width: 5, flex: 1}}></View>
    )
  }

  _renderList = (list, title, extraData, type) => {
    return (
      <View style={{flex: 1, marginLeft: 10, marginRight: 10}}>
      {list && list.length > 0 && (
        <View style={{}}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <FlatList
            horizontal={true}
            renderItem={({item}) => this._renderListItem(item, type)}
            data={list}
            extraData={extraData}
            keyExtractor={item => item.nid.toString()}
            ItemSeparatorComponent={this._renderHorizontalSeparator}
            // contentContainerStyle={styles.listContainerHeader}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
    </View>
    );
  }

  _renderContent = () => {
    const { favouritesPlaces, favouritesEvents, favouriteItineraries } = this.props.locale.messages;
    return (
      <>
      {this.state.favPois.length > 0 && this._renderList(this.state.favPois, favouritesPlaces, this.props.pois, "pois")}
      {this.state.favEvents.length > 0 && this._renderList(this.state.favEvents, favouritesEvents, this.props.eventsById, "events")}
      {this.state.favItineraries.length > 0 && this._renderList(this.state.favItineraries, favouriteItineraries, this.props.itineraries, "itineraries")}
      </>
    )
  }


  render() {
    return (
      <View style={styles.fill}>
          <ConnectedHeader 
            iconTintColor="#24467C"
            containerStyle={{
              marginTop: Layout.statusbarHeight,
              height: Layout.header.height
            }}
            />
        {this._renderContent()}
      </View>
    )
  }
  
}


FavouritesScreen.navigationOptions = {
  title: 'Favourites',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  sectionTitle: {
    fontSize: 16,
    color: 'black',
    fontWeight: "bold",
    margin: 10
},
  header: {
    backgroundColor: "white"
  },
  container: {
    padding: 10,
  },
});


function FavouritesScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <FavouritesScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    // someState: state.graphqlState.someState,
    // someStateError: state.graphqlState.someStateError,
    // someStateLoading: state.graphqlState.someStateLoading,
    locale: state.localeState,
    pois: state.graphqlState.pois,
    poisSuccess: state.graphqlState.poisSuccess,
    poisError: state.graphqlState.poisError,
    poisLoading: state.graphqlState.poisLoading,
    itineraries: state.graphqlState.itineraries,
    itinerariesError: state.graphqlState.itinerariesError,
    itinerariesLoading: state.graphqlState.itinerariesLoading,
    eventsById: state.graphqlState.eventsById,
    eventsByIdSuccess: state.graphqlState.eventsByIdSuccess,
    eventsByIdError: state.graphqlState.eventsByIdError,
    eventsByIdLoading: state.graphqlState.eventsByIdLoading,
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
})(FavouritesScreenContainer)