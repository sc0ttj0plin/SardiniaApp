import React, { PureComponent } from "react";
import { View, Image, StyleSheet, Platform, NativeModules, StatusBar } from "react-native";
const { StatusBarManager } = NativeModules;
import { SearchBar, Button, Icon } from "react-native-elements";
import { useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../constants/Layout';
import actions from '../actions';
import Colors from '../constants/Colors';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as Constants from '../constants';
import * as utils from '../helpers/utils';
import CustomText from "./CustomText";

//backButtonVisible == true: shows backButton, if set to false shows drawer menù icon
const HEADER_BUTTONS_PER_SCREEN = {
  [Constants.NAVIGATION.NavPlacesScreen]: {backButtonVisible: false, searchButtonVisible: true, filterButtonVisible: false},
  [Constants.NAVIGATION.NavInspirersScreen]: {backButtonVisible: false, searchButtonVisible: true, filterButtonVisible: false},
  [Constants.NAVIGATION.NavMapScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavExperiencesScreen]: {backButtonVisible: false, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavItinerariesStack]: {backButtonVisible: false, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavEventsStack]: {backButtonVisible: false, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavItinerariesScreen]: {backButtonVisible: false, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavItineraryScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavItineraryStagesMapScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavEventsScreen]: {backButtonVisible: false, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavEventScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavEventsSubset]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false},
  [Constants.NAVIGATION.NavEventsMapScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavExploreScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavVirtualTourScreen]: {backButtonVisible: false, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavPlaceScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false},
  [Constants.NAVIGATION.NavInspirerScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavExtrasScreen]: {backButtonVisible: false, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavExtraScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavExperiences]: {backButtonVisible: false, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavInspirers]: {backButtonVisible: false, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavExplore]: {backButtonVisible: false, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavEvents]: {backButtonVisible: false, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavTabNavigator]: {backButtonVisible: false, searchButtonVisible: true, filterButtonVisible: false}, 
  [Constants.NAVIGATION.NavLanguageScreen1]: {backButtonVisible: false, searchButtonVisible: true, filterButtonVisible: false},
  [Constants.NAVIGATION.NavSearchScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false},
  [Constants.NAVIGATION.NavFavouritesScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false},
  [Constants.NAVIGATION.NavFavouritesListScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false},
  [Constants.NAVIGATION.NavAccomodationsScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false},
  [Constants.NAVIGATION.NavAccomodationScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false},
  [Constants.NAVIGATION.NavGalleryScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false},
  [Constants.NAVIGATION.NavPreferencesScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false},
  [Constants.NAVIGATION.NavAuthScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false},
  [Constants.NAVIGATION.NavFiltersScreen]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false},
  [Constants.NAVIGATION.NavBoilerPlate]: {backButtonVisible: true, searchButtonVisible: true, filterButtonVisible: false},
  ["default"]: {backButtonVisible: false, searchButtonVisible: true, filterButtonVisible: false}
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
      filterButtonVisible: props.filterButtonVisible ? props.filterButtonVisible : HEADER_BUTTONS_PER_SCREEN[routeName].filterButtonVisible,
      //
      searchStr: "",
    };
    this._searchBarRef = null;

    StatusBar.setBarStyle("dark-content");
  }

  componentDidUpdate(prevProps){
    if(prevProps.backButtonVisible != this.props.backButtonVisible){
      this.setState({
        backButtonVisible: this.props.backButtonVisible
      })
    }
    if(prevProps.others.searchStr !== this.props.others.searchStr){
      this.setState({searchStr: this.props.others.searchStr})
      this.props.actions.resetSearchAndAutocompleteResults();
    }
  }

  componentDidMount() {
    this._searchBarRef && this._searchBarRef.focus();
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
      }, this.props.locale.lan);
    } else {
      this.props.actions.resetSearchAndAutocompleteStr();
      this.props.navigation.navigate(Constants.NAVIGATION.NavSearchStackScreen, { screen: Constants.NAVIGATION.NavSearchScreen });
    }
  }
  
  _backButtonPressed = () => {
    if (this.props.onBackPress) 
      this.props.onBackPress()
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
      }, this.props.locale.lan);
    this.setState({ searchStr: search });
    this.props.actions.setSearchOrAutocomplete(search);
  };


  _renderDrawerButton = () => {
    return(
      <Button
        type="clear"
        containerStyle={[styles.buttonContainer, this.props.buttonContainer]}
        buttonStyle={[styles.button, {
          marginLeft: 5
        }]}
        onPress={() => this.props.navigation.toggleDrawer()}
        icon={
          <Ionicons
            name={Platform.OS === 'ios' ? 'ios-menu' : 'md-menu'}
            size={35}
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
        buttonStyle={[styles.button, this.props.searchButton, {
          marginLeft: 5
        }]}
        onPress={this._backButtonPressed}
        icon={
          <Ionicons
            name={Platform.OS === 'ios' ? 'ios-arrow-back' : 'md-arrow-back'}
            size={35}
            color={Colors.headerIconColor}
          />
        }
      />
    )
  }

  _onFilterButtonPress = () => {
    if(this.props.filterPress){
      this.props.filterPress()
    }
    else{
      const { filterType } = this.props;
      this.props.navigation.navigate(Constants.NAVIGATION.NavFiltersScreen, { filterType })
    }
  }

  _renderFilterButton = () => {
    return (
      <Button
        type="clear"
        containerStyle={[styles.buttonContainer]}
        buttonStyle={[styles.button, this.props.searchButton, {
          marginRight: 0
        }]}
        onPress={this._onFilterButtonPress}
        icon={
          <FontAwesome
            name={"sliders"}
            size={30}
            color={Colors.headerIconColor}
          />
        }
      />
    )
  }

  _renderSearchBar = () => {
    const { searchStr } = this.state;
    const { insertHere } = this.props.locale.messages;
    
    return(
      <SearchBar
        lightTheme={true}
        ref={ref => (this._searchBarRef = ref)}
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
    let marginLeft = (this.state.filterButtonVisible ? 50 : 0) + (!this.state.searchButtonVisible ? -50 : 0);

    return (
      <Image
        style={[styles.logo, {
          marginLeft
        }]} 
        source={require('../assets/images/header-logo.png')}
        />
    )
  }

  _renderSearchButton = () => {
    return (
      <Button
        type="clear"
        containerStyle={[styles.buttonContainer, this.props.buttonContainer]}
        buttonStyle={[styles.button, {
          marginRight: 5
        }]}
        onPress={this._searchButtonPressed}
        icon={
          <Ionicons
            name={Platform.OS === 'ios' ? 'ios-search' : 'md-search'}
            size={35}
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
        {this.state.filterButtonVisible && this._renderFilterButton()}
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
    zIndex: 10,
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
    backgroundColor: Colors.lightGray,
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
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    flex: 1,
    resizeMode: "contain",
    width: 160,
    backgroundColor: "transparent",
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