import React, { Component } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { List, ListItem, SearchBar, Button } from "react-native-elements";
import MapView from 'react-native-maps';
import { NavigationEvents, useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { ConnectedHeader, AsyncOperationStatusIndicator} from "../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../constants/Layout';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import * as localeActions from '../actions/locale';
import * as othersActions from '../actions/others';
import * as Constants from '../constants';
import * as utils from '../helpers/utils';
import Colors from '../constants/Colors';


class SearchScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {  
      search: ""
    };
      
  }

  componentDidUpdate(prevProps, prevState) {

  }

  componentDidMount() {

  }

  //Can show the loading outcome for the entire page with this component but for the moment
  _isSuccessData = () => 
    this.props.others.searchOrAutocomplete === "search" ? this.props.searchSuccess : this.props.autocompleteSuccess;
  _isLoadingData = () => this.props.searchLoading || this.props.autocompleteLoading;
  //_isErrorData = () => this.props.searchError || this.props.autocompleteError;
  _renderLoadingOutcome = () => {
    let error = null;
    if (this.props.others.searchOrAutocomplete === "search" && this.props.searchError)
      error = this.props.searchError;
    else if (this.props.others.searchOrAutocomplete === "autocomplete" && this.props.autocompleteError)
      error = this.props.autocompleteError;
    return <AsyncOperationStatusIndicator loading={this._isLoadingData()} error={error} />;
  }


  _listItemOnPress = (el) => {
    const { searchOrAutocomplete } = this.props.others;
    // If autocomplete and has node or is search, navigate directly, otw fill the search box
    if (searchOrAutocomplete === "autocomplete" && !el.node) {
      //set search string, switch to search instead of autocomplete
      this.props.actions.setSearchOrAutocomplete(el.keywords); //new
      this.props.actions.switchSearchOrAutocomplete("search");
      let queryStr = utils.searchParser(el.keywords);
      this.props.actions.search({ queryStr });
    } else {
      this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, { place: el.node }); 
    }
  }

  _isNavigableItem = (el) => {
    const { searchOrAutocomplete } = this.props.others;
    return searchOrAutocomplete === "autocomplete" && el.node;
  }

  _renderItem = (el, index) => {
    const { searchOrAutocomplete } = this.props.others;
    const { lan } = this.props.locale;
    const title = searchOrAutocomplete === "autocomplete" ? el.keywords : _.get(el.node.title, [lan, 0, "value"], "?");
    return (
      <ListItem
        key={index}
        title={title}
        titleStyle={this._isNavigableItem(el) ? { fontWeight: 'bold' } : undefined}
        bottomDivider
        onPress={() => this._listItemOnPress(el)}
      />
    );
  }


  _renderContent = () => {
    const { searchOrAutocomplete } = this.props.others;
    const data = searchOrAutocomplete === "autocomplete" ? this.props.autocomplete : this.props.search;
    if (this._isSuccessData()) {
      return (
        <View>
          <FlatList
            key={1}
            keyExtractor={(item, index) => index.toString()}
            data={data}
            renderItem={({item, index}) => this._renderItem(item, index)}
            style={styles.scrollView}
          />
        </View>
      );
    } else {
      return null;
    }

  }


  render() {
    return (
      <View style={styles.fill}>
        <ConnectedHeader 
          containerStyle={{
            marginTop: Layout.statusbarHeight
          }}
          // injectedSearchStr={this.state.search}
          iconTintColor={this.props.iconTintColor}/>
        {this._renderLoadingOutcome()}
        {this._renderContent()}
      </View>
    )
  }
  
}


SearchScreen.navigationOptions = {
  title: 'Boilerplate',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  header: {
    backgroundColor: "white"
  },
  container: {
    padding: 10,
  },
  searchBarExternalContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0
  },
  searchBarInputContainer: {
    height: "100%",
  },
  searchBarContainer: {
    flex: 1,
    alignItems:'center',
    height: 60
  },
});


function SearchScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <SearchScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store}
     />;
}


const mapStateToProps = state => {
  return {
    search: state.graphqlState.search,
    searchSuccess: state.graphqlState.searchSuccess,
    searchError: state.graphqlState.searchError,
    searchLoading: state.graphqlState.searchLoading,
    autocomplete: state.graphqlState.autocomplete,
    autocompleteSuccess: state.graphqlState.autocompleteSuccess,
    autocompleteError: state.graphqlState.autocompleteError,
    autocompleteLoading: state.graphqlState.autocompleteLoading,
    locale: state.localeState,
    others: state.othersState,
  };
};


const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...graphqlActions, ...restActions, ...localeActions, ...othersActions}, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(SearchScreenContainer)