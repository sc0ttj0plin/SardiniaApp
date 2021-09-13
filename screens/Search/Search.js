import React, {Component} from "react";
import {View, FlatList, TouchableOpacity, StyleSheet, Platform} from "react-native";
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  AsyncOperationStatusIndicator,
  ConnectedHeader,
  ConnectedScreenErrorBoundary,
  CustomIcon,
  LoadingDots
} from "../../components";
import {connect, useStore} from 'react-redux';
import {bindActionCreators} from 'redux';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import actions from '../../actions';
import * as Constants from '../../constants';
import * as utils from '../../helpers/utils';
import HTML from 'react-native-render-html';
import Colors from "../../constants/Colors";
import CustomText from "../../components/others/CustomText";
import {SearchBar} from "react-native-elements";
import {Ionicons} from "@expo/vector-icons";

/**
 * Search working mechanism
 * We can autocomplete/search both for terms (categories) and nodes
 * If the returned element is a category then it will have the "term" field and "node" field to null set with its category e.g.:
 *       "term": {
 *         "uuid": "93cb5320-a3b3-40a7-877e-f296a6e2381f",
 *         "vid": 36, => Constants.VIDS
 *       },
 *       "node": null,
 * If the returned element is a node then it will have the "term" field to null  and "node" field
 *       "term": null,
 *       "node": {
 *         "nid": 19883,
 *         "uuid": "fa9ddc59-df47-488d-ae14-6fc189e9f192",
 *         "type": "ispiratore", => Constants.NODE_TYPES
 */
const USE_DR = false;

class SearchScreen extends Component {

  constructor(props) {
    super(props);

    /* Get props from navigation */
    //let { someNavProps } = props.route.params;
    this.state = {
      render: USE_DR ? false : true,
      //
      search: "",
    };

  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {
      (USE_DR && setTimeout(() => (this.setState({render: true})), 0))
    }
    ;
  }

  componentDidUpdate(prevProps) {
  }

  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _getNavScreenFromType = (type) => {
    const {places, inspirers, itineraries, events, turisticLocation} = Constants.NODE_TYPES;
    const {NavItineraryScreen, NavEventScreen, NavPlaceScreen, NavInspirerScreen,} = Constants.NAVIGATION;
    switch (type) {
      case places:
        return NavPlaceScreen;
      case turisticLocation:
        return NavPlaceScreen;
      case inspirers:
        return NavInspirerScreen;
      case itineraries:
        return NavItineraryScreen;
      case events:
        return NavEventScreen;
      default:
        return NavPlaceScreen;
    }
  }

  _listItemOnPress = (el, elType) => {
    const {searchOrAutocomplete} = this.props.others;
    // If autocomplete and has node or is search, navigate directly, otw fill the search box
    if (searchOrAutocomplete === "autocomplete" && !el.node) {
      //set search string, switch to search instead of autocomplete
      this.props.actions.setSearchOrAutocomplete(el.keywords); //new
      this.props.actions.switchSearchOrAutocomplete("search");
      let queryStr = utils.searchParser(el.keywords);
      this.props.actions.search({queryStr});
    } else {
      // Navigate to node screen
      const navScreen = this._getNavScreenFromType(elType);
      // console.log("NAVIGATEEEEE", elType, navScreen)
      this.props.navigation.navigate(navScreen, {item: el.node, mustFetch: true});
    }
  }

  _isNavigableItem = (el) => {
    const {searchOrAutocomplete} = this.props.others;
    return searchOrAutocomplete === "autocomplete" && el.node;
  }

  _isSuccessData = () => this.props.others.searchOrAutocomplete === "search" ? this.props.searchAutocomplete.searchSuccess : this.props.searchAutocomplete.autocompleteSuccess;
  _isLoadingData = () => this.props.searchAutocomplete.searchLoading || this.props.searchAutocomplete.autocompleteLoading;
  _isErrorData = () => this.props.searchAutocomplete.searchError || this.props.searchAutocomplete.autocompleteError;


  /********************* Render methods go down here *********************/

  _renderItem = (el, index) => {
    const {searchOrAutocomplete} = this.props.others;
    const {lan} = this.props.locale;
    //const title = searchOrAutocomplete === "autocomplete" ? el.keywords : _.get(el.node.title, [lan, 0, "value"], null);
    var title = null;
    if (el.node && el.node.title) {
      var title = _.get(el.node.title, [lan, 0, "value"], null);
      if (lan == "en" && !title)
        title = _.get(el.node.title, ["en-gb", 0, "value"], null);
    }
    if (!title && searchOrAutocomplete === "autocomplete") {
      title = el.keywords
    }
    if (!title)
      return;
    let termName = null;
    if (el.node && searchOrAutocomplete === "autocomplete") {
      termName = el.node.term.name
    }
    const isNode = el.term === null && el.node !== null; /* is node or category? */
    const elType = isNode ? el.node.type : el.term.vid;
    let entityIconOpts = Constants.VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS[elType] || {};
    return (
      <TouchableOpacity
        key={index}
        onPress={() => this._listItemOnPress(el, elType)}
        style={[styles.listItem]}>
        <View style={[styles.icon, {
          backgroundColor: entityIconOpts.iconColor,
        }]}>
          <CustomIcon
            name={entityIconOpts.iconName}
            size={14}
            color={"white"}
          />
        </View>
        <View style={{ flexDirection: 'column' }}>
          <HTML baseFontStyle={this._isNavigableItem(el) ? styles.normalText : styles.boldText} html={title}></HTML>
          {termName && <CustomText style={[styles.normalText, { fontSize: 12, textTransform: 'uppercase' }]}>{termName}</CustomText>}
        </View>
      </TouchableOpacity>
    );
  }

  _renderLoading = () => {
    return (
      <View style={styles.loadingDotsView1}>
        <View style={styles.loadingDotsView2}>
          <LoadingDots isLoading={true}/>
        </View>
      </View>
    )
  }

  _renderListEmptyComponent = () => {
    if (this._isLoadingData()) return this._renderLoading()

    const { searchEmptyListTitle, searchEmptyListDescription } = this.props.locale.messages;

    return (
      <View style={styles.emptyListContainer}>
        <View style={styles.emptyListIcon}>
          <CustomIcon name="icon-mic" size={100} color={Colors.orange}/>
        </View>
        <CustomText style={styles.emptyListTitle}>{searchEmptyListTitle}</CustomText>
        <CustomText style={styles.emptyListDescription}>{searchEmptyListDescription}</CustomText>
      </View>
    )
  }

  _setSearch = (search) => {
      if (this.props.others.searchOrAutocomplete !== "autocomplete")
          this.props.actions.switchSearchOrAutocomplete("autocomplete");
      //Returns: Nodes OR Categories (terms)
      this.props.actions.autocomplete({
          queryStr: search,
          vidsInclude: [Constants.VIDS.poisCategories, Constants.VIDS.pois, Constants.VIDS.inspirersCategories, Constants.VIDS.events],
          // typesExclude: [Constants.NODE_TYPES.events]
      });
      this.setState({ search });
      this.props.actions.setSearchOrAutocomplete(search);
  }

  _renderListHeaderComponent = () => {
    const { insertHere } = this.props.locale.messages;

    return (
      <SearchBar
        lightTheme={true}
        ref={ref => (this._searchBarRef = ref)}
        placeholder={insertHere}
        onChangeText={this._setSearch}
        value={this.state.search}
        placeholderTextColor={Colors.mediumGray}
        inputContainerStyle={{ fontFamily: 'montserrat-light', fontSize: 40, backgroundColor: 'transparent' }}
        containerStyle={{ backgroundColor: Colors.lightGray, padding: Platform.OS === 'ios' ? 0 : 16, borderBottomColor: Colors.black, borderBottomWidth: 2 }}
        platform={Platform.OS === 'ios' ? 'ios' : 'android'}
        searchIcon={<Ionicons name="md-search" size={32} color={Colors.black} />}
        clearIcon={null}
        cancelIcon={null}
        cancelButtonProps={{ color: Colors.mediumGray }}
      />
    )
  }

  _renderContent = () => {
    const {searchOrAutocomplete} = this.props.others;
    const data = searchOrAutocomplete === "autocomplete" ? this.props.searchAutocomplete.autocomplete : this.props.searchAutocomplete.search;

    return (
        <FlatList
            key={1}
            keyExtractor={(item, index) => index.toString()}
            data={data}
            renderItem={({item, index}) => this._renderItem(item, index)}
            contentContainerStyle={{flexGrow: 1}}
            ListEmptyComponent={this._renderListEmptyComponent()}
            ListHeaderComponent={this._renderListHeaderComponent()}
            ListHeaderComponentStyle={{ padding: 16 }}
        />
    )
  }


  render() {
    const {render} = this.state;
    return (
      <ConnectedScreenErrorBoundary>
        <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
          <ConnectedHeader/>
          {render && this._renderContent()}
        </View>
      </ConnectedScreenErrorBoundary>
    )
  }

}


SearchScreen.navigationOptions = {
  title: 'Search',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    padding: 10,
  },
  listItem: {
    flex: 1,
    alignItems: "center",
    flexDirection: 'row',
    borderBottomColor: '#f2f2f2',
    borderBottomWidth: 1,
    paddingVertical: 10
  },
  listItemIcon: {
    // marginLeft: 20,
    // marginRight: 20
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginLeft: 15
  },
  normalText: {
    fontSize: 15,
    fontFamily: "montserrat-regular",
    color: Colors.mediumGray
  },
  boldText: {
    fontSize: 15,
    fontFamily: "montserrat-bold",
    color: Colors.mediumGray
  },
  loadingDotsView1: {
    width: '100%',
    alignItems: "center",
    justifyContent: "center",
    height: '90%'
  },
  loadingDotsView2: {
    width: 100
  },
  emptyListContainer: {
    flex: 1,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyListIcon: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 6,
    borderColor: Colors.orange,
    borderRadius: 69,
    width: 126,
    height: 126,
    paddingLeft: 8
  },
  emptyListTitle: {
    marginTop: 30,
    fontFamily: "montserrat-bold",
    fontSize: 20,
    textAlign: "center"
  },
  emptyListDescription: {
    fontSize: 20,
    textAlign: "center"
  }
});


function SearchScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <SearchScreen
    {...props}
    navigation={navigation}
    route={route}
    store={store}/>;
}


const mapStateToProps = state => {
  return {
    //mixed state
    others: state.othersState,
    //language
    locale: state.localeState,
    //graphql
    searchAutocomplete: state.searchAutocompleteState,
  };
};


const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({...actions}, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(SearchScreenContainer)
