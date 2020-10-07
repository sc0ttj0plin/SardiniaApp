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
import Layout from '../constants/Layout'
import { Header, ConnectedHeader } from '../components';
import { apolloQuery } from '../apollo/middleware';
import Colors from '../constants/Colors';


class ExtraScreen extends Component {

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




  render() {
    const { usefulInfo, howToReach, howToRoam } = this.props.locale.messages;

    return (
      <View style={styles.fill}>
        <ConnectedHeader />
        <View style={styles.container}>
          <View style={styles.group}>
            <Button buttonStyle={styles.btnItineraries} title={usefulInfo} />
            <Button buttonStyle={styles.btnEvents} title={howToReach}  />
            <Button buttonStyle={styles.btnInspirers} title={howToRoam}  />
          </View>
        </View>
      </View>
    )
  }
  
}

ExtraScreen.navigationOptions = {
  title: 'Extra',
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

function ExtraScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <ExtraScreen 
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
  return {...bindActionCreators({ ...graphqlActions, ...restActions}, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(ExtraScreenContainer)