import React, { PureComponent } from "react";
import { View, Image, StyleSheet, Platform, NativeModules } from "react-native";
const { StatusBarManager } = NativeModules;
import { SearchBar, Button, Icon } from "react-native-elements";
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../constants/Layout';
import actions from '../actions';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as Constants from '../constants';
import * as utils from '../helpers/utils';

//backButtonVisible == true: shows backButton, if set to false shows drawer menù icon
const HEADER_BUTTONS_PER_SCREEN = {
  [Constants.NAVIGATION.NavPlacesScreen]: {backButtonVisible: false, searchButtonVisible: true},
  [Constants.NAVIGATION.NavInspirersScreen]: {backButtonVisible: false, searchButtonVisible: true},
  [Constants.NAVIGATION.NavMapScreen]: {backButtonVisible: true, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavExperiencesScreen]: {backButtonVisible: false, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavItinerariesStack]: {backButtonVisible: false, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavEventsStack]: {backButtonVisible: false, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavItinerariesScreen]: {backButtonVisible: false, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavItineraryScreen]: {backButtonVisible: true, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavItineraryStagesMapScreen]: {backButtonVisible: true, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavEventsScreen]: {backButtonVisible: false, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavEventScreen]: {backButtonVisible: true, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavEventsSubset]: {backButtonVisible: true, searchButtonVisible: true},
  [Constants.NAVIGATION.NavEventsMapScreen]: {backButtonVisible: true, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavExploreScreen]: {backButtonVisible: true, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavVirtualTourScreen]: {backButtonVisible: false, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavPlaceScreen]: {backButtonVisible: true, searchButtonVisible: true},
  [Constants.NAVIGATION.NavInspirerScreen]: {backButtonVisible: true, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavExtrasScreen]: {backButtonVisible: false, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavExtraScreen]: {backButtonVisible: true, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavExperiences]: {backButtonVisible: false, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavInspirers]: {backButtonVisible: false, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavExplore]: {backButtonVisible: false, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavEvents]: {backButtonVisible: false, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavTabNavigator]: {backButtonVisible: false, searchButtonVisible: true}, 
  [Constants.NAVIGATION.NavLanguageScreen1]: {backButtonVisible: false, searchButtonVisible: true},
  [Constants.NAVIGATION.NavSearchScreen]: {backButtonVisible: true, searchButtonVisible: true},
  [Constants.NAVIGATION.NavFavouritesScreen]: {backButtonVisible: true, searchButtonVisible: true},
  [Constants.NAVIGATION.NavFavouritesListScreen]: {backButtonVisible: true, searchButtonVisible: true},
  [Constants.NAVIGATION.NavAccomodationsScreen]: {backButtonVisible: true, searchButtonVisible: true},
  [Constants.NAVIGATION.NavAccomodationScreen]: {backButtonVisible: true, searchButtonVisible: true},
  [Constants.NAVIGATION.NavBoilerPlate]: {backButtonVisible: true, searchButtonVisible: true},

  ["default"]: {backButtonVisible: false, searchButtonVisible: true}
}

/**
 * Header component that is connected to redux and determines which buttons
 * are visible in each screen through the above mapping. 
 * Additionally it implements the search button logic
 */
class ConnectedHeader extends PureComponent {

  constructor(props) {
    super(props);

    const { name: routeName = "default" } = this.props.route;

    this.state = {
      routeName,
      searchbarVisible: routeName == Constants.NAVIGATION.NavSearchScreen ? true : false,
      backButtonVisible: props.backButtonVisible ? props.backButtonVisible : HEADER_BUTTONS_PER_SCREEN[routeName].backButtonVisible,
      searchButtonVisible: props.searchButtonVisible ? props.searchButtonVisible : HEADER_BUTTONS_PER_SCREEN[routeName].searchButtonVisible,
    };

  }

  
  _searchButtonPressed = () => {
    //If we are on the search screen perform the actual search, 
    //otherwise navigate to search screen resetting search str and results
    if (this.state.routeName == Constants.NAVIGATION.NavSearchScreen) {
      this.setState({ searchbarVisible: true });
      if (this.props.others.searchOrAutocomplete !== "search")
        this.props.actions.switchSearchOrAutocomplete("search");
      let queryStr = utils.searchParser(this.props.others.searchStr);
      this.props.actions.search({ 
        queryStr, 
        nodeTypes: [Constants.NODE_TYPES.places, Constants.NODE_TYPES.events, Constants.NODE_TYPES.inspirers, Constants.NODE_TYPES.itineraries] 
      });
    } else {
      this.props.actions.resetSearchAndAutocompleteStr();
      this.props.actions.resetSearchAndAutocompleteResults();
      this.props.navigation.navigate(Constants.NAVIGATION.NavSearchStackScreen, { screen: Constants.NAVIGATION.NavSearchScreen });
    }
  }
  
  _backButtonPressed = () => {
    if (this.props.backOnPress) 
      this.props.backOnPress()
    else {
      this.props.navigation.goBack();
    }
  }

  _updateSearch = search => {
    if (this.props.others.searchOrAutocomplete !== "autocomplete")
      this.props.actions.switchSearchOrAutocomplete("autocomplete");
      //Returns: Nodes OR Categories (terms)
      this.props.actions.autocomplete({ 
        queryStr: search, 
        vidsInclude: [Constants.VIDS.poisCategories, Constants.VIDS.pois, Constants.VIDS.inspirersCategories, Constants.VIDS.events],
        typesExclude: [Constants.NODE_TYPES.events]
      });
    this.props.actions.setSearchOrAutocomplete(search);
  };

  componentDidUpdate(prevProps){
    if(prevProps.backButtonVisible != this.props.backButtonVisible)
      this.setState({
        backButtonVisible: this.props.backButtonVisible
      })
  }

  _renderDrawerButton = () => {
    return(
      <Button
        type="clear"
        containerStyle={[styles.buttonContainer, this.props.buttonContainer, this.props.buttonContainer, this.props.buttonContainer]}
        buttonStyle={styles.button}
        onPress={() => this.props.navigation.toggleDrawer()}
        icon={
          <Ionicons
            name={Platform.OS === 'ios' ? 'ios-menu' : 'md-menu'}
            size={40}
            color={Colors.headerIconColor}
          />
          }
      />
    )
  }

  _renderBackButton = () => {
    return (
      <Button
        type="clear"
        containerStyle={[styles.buttonContainer]}
        buttonStyle={[styles.button, this.props.searchButton]}
        onPress={this._backButtonPressed}
        icon={
          <Ionicons
            name={Platform.OS === 'ios' ? 'ios-arrow-back' : 'md-arrow-back'}
            size={30}
            color={Colors.headerIconColor}
          />
        }
      />
    )
  }

  _renderSearchBar = () => {
    const { searchStr } = this.props.others;
    const { insertHere } = this.props.locale.messages;
    
    return(
      <SearchBar
        lightTheme={true}
        placeholder={insertHere}
        onChangeText={this._updateSearch}
        value={searchStr}
        containerStyle={[styles.searchBarExternalContainer, this.props.searchBarExternalContainer]}
        inputContainerStyle={styles.searchBarInputContainer}
        inputStyle={styles.searchBarInput}
        platform={Platform.OS === 'ios' ? 'ios' : 'android'}
        searchIcon={null}
        cancelIcon={null}
        clearIcon={null}
      />
    )
  }

  _renderLogoImage = () => {
    return (
      <Image
        style={styles.logo} 
        source={require('../assets/images/header-logo.png')}
        />
    )
  }

  _renderSearchButton = () => {
    return (
      <Button
        type="clear"
        containerStyle={[styles.buttonContainer, this.props.buttonContainer]}
        buttonStyle={styles.button}
        onPress={this._searchButtonPressed}
        icon={
          <Ionicons
            name={Platform.OS === 'ios' ? 'ios-search' : 'md-search'}
            size={30}
            color={Colors.headerIconColor}
          />
        }
      />
    )
  }

  _renderBottomLine = () => 
    <View style={[styles.bottomLine, { 
      backgroundColor: this.props.iconTintColor || Colors.tintColor
    }]}></View>

  _renderMixedBottomLine = () => {
    return(
      <View style={[styles.mixedBottomLine]}>
        <View style={[styles.mixedBottomLineItem, {backgroundColor: Colors.colorPlacesScreen}]}/>
        <View style={[styles.mixedBottomLineItem, {backgroundColor: Colors.colorInspirersScreen}]}/>
        <View style={[styles.mixedBottomLineItem, {backgroundColor: Colors.colorItinerariesScreen}]}/>
        <View style={[styles.mixedBottomLineItem, {backgroundColor: Colors.colorEventsScreen}]}/>
      </View>
    )
  }

  render() {

    return (
      <>
      <View style={styles.statusBar}></View>
      <View style={[styles.container,this.props.containerStyle, {height: Layout.header.height}]}>
        {this.state.backButtonVisible && this._renderBackButton()}
        {!this.state.backButtonVisible && this._renderDrawerButton()}
        <View
          style={[styles.searchBarContainer, this.props.style]}>
          {this.state.searchbarVisible ? this._renderSearchBar() : this._renderLogoImage()}
        </View>
        {this.state.searchButtonVisible && this._renderSearchButton()}
      </View>
      { this.props.iconTintColor && this._renderBottomLine()}
      { !this.props.iconTintColor && this._renderMixedBottomLine()}
      </>
    );
  }
  
}


ConnectedHeader.navigationOptions = {
  title: '',
};


const styles = StyleSheet.create({
  container: {
    zIndex: 999,
    flexDirection: "row",
    width: "100%",
    backgroundColor: 'white',
    height: Constants.COMPONENTS.header.height,
    maxHeight: Constants.COMPONENTS.header.height,
    minHeight: Constants.COMPONENTS.header.height,
    alignItems: "center",
  },
  statusBar: {
    height: Layout.statusbarHeight, 
    width: '100%', 
    marginTop: -Layout.statusbarHeight, 
    backgroundColor: Colors.lightGrey
  },
  searchBarExternalContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0
  },
  searchBarInputContainer: {
    height: "100%",
    backgroundColor: 'transparent',
  },
  searchBarContainer: {
    flex: 1,
    alignItems:'center',
    height: Constants.COMPONENTS.header.height,
  },
  buttonContainer: {
    backgroundColor: "transparent"
  },
  button: {
    height: "100%",
    width: 50
  },
  logo: {
    flex: 1,
    resizeMode: "contain",
    width: "80%",
    height: "100%",
    backgroundColor: "transparent"
  },
  bottomLine: {
    width: "100%",
    height: Constants.COMPONENTS.header.bottomLineHeight,
    marginBottom: 0,
  },
  mixedBottomLine: {
    width: "100%",
    height: Constants.COMPONENTS.header.bottomLineHeight,
    marginBottom: 0,
    display: "flex",
    flexDirection: "row",
  },
  mixedBottomLineItem: {
    flex: 1
  }
});

function ConnectedHeaderContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <ConnectedHeader 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    locale: state.localeState,
    others: state.othersState,
  };
};


const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...actions }, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(ConnectedHeaderContainer)