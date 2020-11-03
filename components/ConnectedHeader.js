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
const { NavPlacesScreen, NavInspirersScreen ,NavMapScreen, NavExperiencesScreen, 
  NavItinerariesStack, NavEventsStack, 
  NavItinerariesScreen, NavItineraryScreen, NavItineraryStagesMapScreen, NavEventsScreen, NavEventsMapScreen, NavBoilerPlate,
  NavEventScreen, NavExploreScreen, NavVirtualTourScreen, NavPlaceScreen, NavInspirerScreen, NavEventsSubset, 
  NavExperiences, NavPlaces,NavInspirers ,NavExplore, NavEvents, NavTabNavigator, NavLanguageScreen1,
  NavSearchScreen, NavGalleryScreen, NavExtrasScreen, NavExtraScreen, NavFavouritesScreen } = Constants.NAVIGATION;
 
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;

//backButtonVisible == true: shows backButton, if set to false shows drawer menù icon
const HEADER_BUTTONS_PER_SCREEN = {
  [NavPlacesScreen]: {backButtonVisible: false, searchButtonVisible: true},
  [NavInspirersScreen]: {backButtonVisible: false, searchButtonVisible: true},
  [NavMapScreen]: {backButtonVisible: true, searchButtonVisible: true}, 
  [NavExperiencesScreen]: {backButtonVisible: false, searchButtonVisible: true}, 
  [NavItinerariesStack]: {backButtonVisible: false, searchButtonVisible: true}, 
  [NavEventsStack]: {backButtonVisible: false, searchButtonVisible: true}, 
  [NavItinerariesScreen]: {backButtonVisible: false, searchButtonVisible: true}, 
  [NavItineraryScreen]: {backButtonVisible: true, searchButtonVisible: true}, 
  [NavItineraryStagesMapScreen]: {backButtonVisible: true, searchButtonVisible: true}, 
  [NavEventsScreen]: {backButtonVisible: false, searchButtonVisible: true}, 
  [NavEventScreen]: {backButtonVisible: true, searchButtonVisible: true}, 
  [NavEventsSubset]: {backButtonVisible: true, searchButtonVisible: true},
  [NavEventsMapScreen]: {backButtonVisible: true, searchButtonVisible: true}, 
  [NavExploreScreen]: {backButtonVisible: true, searchButtonVisible: true}, 
  [NavVirtualTourScreen]: {backButtonVisible: false, searchButtonVisible: true}, 
  [NavPlaceScreen]: {backButtonVisible: true, searchButtonVisible: true},
  [NavInspirerScreen]: {backButtonVisible: true, searchButtonVisible: true}, 
  [NavExtrasScreen]: {backButtonVisible: false, searchButtonVisible: true}, 
  [NavExtraScreen]: {backButtonVisible: true, searchButtonVisible: true}, 
  [NavExperiences]: {backButtonVisible: false, searchButtonVisible: true}, 
  [NavPlaces]: {backButtonVisible: false, searchButtonVisible: true},
  [NavInspirers]: {backButtonVisible: false, searchButtonVisible: true}, 
  [NavExplore]: {backButtonVisible: false, searchButtonVisible: true}, 
  [NavEvents]: {backButtonVisible: false, searchButtonVisible: true}, 
  [NavTabNavigator]: {backButtonVisible: false, searchButtonVisible: true}, 
  [NavLanguageScreen1]: {backButtonVisible: false, searchButtonVisible: true},
  [NavSearchScreen]: {backButtonVisible: true, searchButtonVisible: true},
  [NavFavouritesScreen]: {backButtonVisible: true, searchButtonVisible: true},
  [NavBoilerPlate]: {backButtonVisible: true, searchButtonVisible: true},
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
      searchbarVisible: routeName == NavSearchScreen ? true : false,
      backButtonVisible: props.backButtonVisible ? props.backButtonVisible : HEADER_BUTTONS_PER_SCREEN[routeName].backButtonVisible,
      searchButtonVisible: props.searchButtonVisible ? props.searchButtonVisible : HEADER_BUTTONS_PER_SCREEN[routeName].searchButtonVisible,
    };

  }

 
  _searchButtonPressed = () => {
    //If we are on the search screen perform the actual search, 
    //otherwise navigate to search screen resetting search str and results
    if (this.state.routeName == NavSearchScreen) {
      this.setState({ searchbarVisible: true });
      if (this.props.others.searchOrAutocomplete !== "search")
        this.props.actions.switchSearchOrAutocomplete("search");
      let queryStr = utils.searchParser(this.props.others.searchStr);
      this.props.actions.search({ queryStr, nodeTypes: Object.values(Constants.NODE_TYPES) });
    } else {
      this.props.actions.resetSearchAndAutocompleteStr();
      this.props.actions.resetSearchAndAutocompleteResults();
      this.props.navigation.navigate(Constants.NAVIGATION.NavSearchStackScreen, { screen: Constants.NAVIGATION.NavSearchScreen });
    }
  }
  
  _backButtonPressed = () => {
    if (this.props.backOnPress)
      this.props.backOnPress()
    else 
      this.props.navigation.goBack();
  }

  _updateSearch = search => {
    if (this.props.others.searchOrAutocomplete !== "autocomplete")
      this.props.actions.switchSearchOrAutocomplete("autocomplete");
    this.props.actions.autocomplete({ queryStr: search });
    this.props.actions.setSearchOrAutocomplete(search);
  };

  componentDidUpdate(prevProps){
    if(prevProps.backButtonVisible != this.props.backButtonVisible)
      this.setState({
        backButtonVisible: this.props.backButtonVisible
      })
  }

  render() {
    const { searchStr } = this.props.others;
    const { insertHere } = this.props.locale.messages;

    return (
      <View style={[styles.container,this.props.containerStyle, {height: Layout.header.height}]}>
        {this.state.backButtonVisible && (
        <Button
          type="clear"
          containerStyle={[styles.buttonContainer]}
          buttonStyle={[styles.button, this.props.searchButton]}
          onPress={this._backButtonPressed}
          icon={
            <Ionicons
              name={Platform.OS === 'ios' ? 'ios-arrow-back' : 'md-arrow-back'}
              size={30}
              color={this.props.iconTintColor ? this.props.iconTintColor : Colors.tintColor}
            />
          }
        />
        )}
        {!this.state.backButtonVisible && (
        <Button
          type="clear"
          containerStyle={[styles.buttonContainer, this.props.buttonContainer, this.props.buttonContainer, this.props.buttonContainer]}
          buttonStyle={styles.button}
          onPress={() => this.props.navigation.toggleDrawer()}
          icon={
            <Ionicons
              name={Platform.OS === 'ios' ? 'ios-menu' : 'md-menu'}
              size={40}
              color={this.props.iconTintColor ? this.props.iconTintColor : Colors.tintColor}
            />
            }
        />
        )}
      <View
        style={[styles.searchBarContainer, this.props.style]}>
        {this.state.searchbarVisible ? (
        <SearchBar
          lightTheme={true}
          placeholder={insertHere}
          onChangeText={this._updateSearch}
          value={searchStr}
          containerStyle={[styles.searchBarExternalContainer, this.props.searchBarExternalContainer]}
          inputContainerStyle={styles.searchBarInputContainer}
          inputStyle={styles.searchBarInput}
          platform={Platform.OS === 'ios' ? 'ios' : 'android'}
        />
        ) : 
        (
        <Image
          style={styles.logo} 
          source={require('../assets/images/header-logo.png')}
          />
        )
        }
        </View>

      {this.state.searchButtonVisible && (
        <Button
          type="clear"
          containerStyle={[styles.buttonContainer, this.props.buttonContainer]}
          buttonStyle={styles.button}
          onPress={this._searchButtonPressed}
          icon={
            <Ionicons
              name={Platform.OS === 'ios' ? 'ios-search' : 'md-search'}
              size={30}
              color={this.props.iconTintColor ? this.props.iconTintColor : Colors.tintColor}
            />
          }
        />
        )}
        
      </View>
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
    backgroundColor: 'rgba(255,255,255,0.90)',
    height: 70,
    // marginTop: STATUSBAR_HEIGHT, //Layout.header.height,
    alignItems: "center",
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
    // height: 60,
    height: 70,
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