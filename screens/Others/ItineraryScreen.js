import React, { Component } from "react";
import { View, Image, Text, FlatList, Linking, Share, ActivityIndicator, TouchableOpacity, StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { List, ListItem, SearchBar, Button, Icon } from "react-native-elements";
import { NavigationEvents, useNavigation, useRoute } from '@react-navigation/native';
import { MapViewItinerary, Header, Webview, ConnectedHeader, ConnectedFab } from "../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import * as localeActions from '../actions/locale';
import * as favouritesActions from '../actions/favourites';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import * as Constants from '../constants';

// TODO: Since we don't have pois: sample pois
import pois from '../constants/_samplePois';

class ItineraryScreen extends Component {

  constructor(props) {
    super(props);

    
    // TODO: get a random number of pois
    // this._poisSlice = pois.sort(() => Math.random() - Math.random()).slice(0, 5);
    ({ entity: this._entity } = props.route.params);
    this.state = {
      showText: true,
      image: this._entity.image
    };
      
  }


  componentDidMount() {
  }

  _renderFab = (nid) => {
    const isFavourite = this.props.favourites.itineraries[nid];
    const { showText } = this.state;
    return (
      <View style={{position: "absolute", zIndex: 9, top: 130, right: -10}}>
        <ConnectedFab color={Colors.colorScreen4} direction={"down"}>
          <Button 
            style={{ backgroundColor: Colors.colorScreen4 }} 
            onPress={() => Linking.openURL("https://www.sardegnaturismo.it")}>
            <Icon name={"share"} size={20} type="font-awesome" color="white" /> 
          </Button>
          <Button 
            style={{ backgroundColor: Colors.colorScreen4 }} 
            onPress={() => this.props.actions.toggleFavourite({ type: "itineraries", id: nid })}>
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
    const { image, showText } = this.state;
    const nid = this._entity.nid;

    return (
      <View style={styles.fill}>
        <ConnectedHeader 
        iconTintColor={Colors.colorScreen4}
        containerStyle={{
          paddingTop: 0,
          height: Layout.header.height,
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
        {/*this._renderFab(nid)*/}
        
        <View style={styles.fill}>
          {!showText && 
            <MapViewItinerary 
              locale={this.props.locale}
              region={Constants.REGION_SARDINIA}
              markers={this._entity.pois}
          />
          }
          {showText && 
            <Webview 
              locale={this.props.locale}
              lan={lan}
              image={image} 
              abstract={abstract} 
              title={title} 
              description={description}
              category={"Itinerario"}
              urlAlias={this._entity.url_alias}
              categoryColor={Colors.colorScreen4}
              toggleFavourite={() => { this.props.actions.toggleFavourite({ type: "itineraries", id: nid })}}
              isFavourite={this.props.favourites.itineraries[nid]}
            />
          }
          <Button
            buttonStyle={styles.fabStyle}
            containerStyle={styles.fabContainerFav, {position: "absolute", right: 10, top: 10, backgroundColor: Colors.colorScreen4 }}
            onPress={() => this.setState({ showText: !showText })}
            icon={<Icon name={ showText ? "map" : "text-fields" } size={25} color="white" />}>
          </Button>

          
          
        </View>
      </View>
    );
  }
  
}


ItineraryScreen.navigationOptions = {
  title: 'Boilerplate',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  image: {
    flex: 1,
    height: 200
  },
  headerContainer: {
    padding: 10,
    backgroundColor: "white"
  },
  header: {
    backgroundColor: "white"
  },
  fabStyle: {
    height: 50,
    width: 50,
    backgroundColor: Colors.colorScreen4,
    borderRadius: 50
  },
  fabContainerMap: {
    zIndex: 99,
    position: "absolute",
    top: 10,
    right: 10,
    paddingVertical: 10,
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
  }
});

function ItineraryScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <ItineraryScreen 
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
    error: state.restState.error,
    loading: state.restState.loading,
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
})(ItineraryScreenContainer)
