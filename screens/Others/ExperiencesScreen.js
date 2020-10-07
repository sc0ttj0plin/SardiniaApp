import React, { Component } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { List, ListItem, SearchBar, Button } from "react-native-elements";
import { FlatGrid } from 'react-native-super-grid';
import MapView from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import * as localeActions from '../actions/locale';
import Layout from '../constants/Layout'
import { Header, ConnectedHeader } from '../components';
import { apolloQuery } from '../apollo/middleware';
import Colors from '../constants/Colors';
import { NavigationEvents } from "react-navigation";
import * as Constants from '../constants';

class ExperiencesScreen extends Component {

  constructor(props) {
    super(props);

    this._refs = {};

    this.state = {
      loading: false,
      error: null,
    };
  }

  componentDidMount() {

  }

  _openItinerary = () => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavExperiencesItinerariesScreen);
  }

  _openEvents = () => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavExperiencesEventsScreen);
  }

  _openInspirers = () => {
    return false;
  }


  render() {
    const { itineraries, events, get_inspired } = this.props.locale.messages;
    
    return (
      <View style={styles.fill}>
        <ConnectedHeader />
        <View style={styles.container}>
          <View style={styles.group}>
            <Button buttonStyle={styles.btnItineraries} title={itineraries} onPress={this._openItinerary}/>
            <Button buttonStyle={styles.btnEvents} title={events} onPress={this._openEvents} />
            <Button buttonStyle={styles.btnInspirers} title={get_inspired} />
          </View>
        </View>
      </View>
    )
  }
  
}

ExperiencesScreen.navigationOptions = {
  title: 'Esperienze',
};


const styles = StyleSheet.create({
  header: {
    backgroundColor: "white"
  },
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    flex: 1
  },
  group: {
    width: '80%',
    height: '80%',
    justifyContent: "space-between",
    marginTop: 10,
    marginLeft: 10,
  },
  btnItineraries: {
    backgroundColor: Colors.green,
    height: 100,
    borderRadius: 10
  },
  btnEvents: {
    backgroundColor: Colors.orange,
    height: 100,
    borderRadius: 10
  },
  btnInspirers: {
    backgroundColor: Colors.yellow,
    height: 100,
    borderRadius: 10
  },
});

function ExperiencesScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <ExperiencesScreen 
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
})(ExperiencesScreenContainer)