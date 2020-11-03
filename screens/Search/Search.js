import React, { Component } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
import { ListItem } from "react-native-elements";
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  // CategoryListItem, 
  // GeoRefHListItem, 
  // GridGallery, 
  // GridGalleryImage, 
  // MapViewTop, 
  // ScrollableHeader,
  // TabBarIcon, 
  // CalendarListItem, 
  // EntityAbstract,
  // EntityDescription,
  // EntityGallery,
  // EntityHeader,
  // EntityItem,
  // EventListItem,
  // EntityMap,
  // EntityRelatedList,
  // EntityVirtualTour,
  // EntityWhyVisit,
  // TopMedia,
  AsyncOperationStatusIndicator, 
  // AsyncOperationStatusIndicatorPlaceholder,
  // Webview, 
  // ConnectedText, 
  ConnectedHeader, 
  // ImageGridItem, 
  // ConnectedLanguageList, 
  // BoxWithText,
  // ConnectedFab, 
  // PoiItem, 
  // PoiItemsList, 
  // ExtrasListItem, 
  // MapViewItinerary
 } from "../../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import { greedyArrayFinder, getEntityInfo, getCoordinates, getSampleVideoIndex, getGalleryImages } from '../../helpers/utils';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import * as utils from '../../helpers/utils';
import { LLEntitiesFlatlist } from "../../components/loadingLayouts";

/* Deferred rendering to speedup page inital load: 
   deferred rendering delays the rendering reducing the initial 
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;
class SearchScreen extends Component {

  constructor(props) {
    super(props);

    /* Get props from navigation */
    //let { someNavProps } = props.route.params; 
    console.log(props)
    this.state = {
      render: USE_DR ? false : true,
      //
      search: "",
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * Use this function to perform data fetching
   * e.g. this.props.actions.getPois();
   */
  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
  }

  /**
   * Use this function to update state based on external props 
   * or to post-process data once it changes
   */
  componentDidUpdate(prevProps) {
    /**
     * Is the former props different from the newly propagated prop (redux)? perform some action
     * if(prevProps.xxx !== this.props.xxx)
     *  doStuff();
     */
  }

  /**
   * Use this function to unsubscribe or clear any event hooks
   */
  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/
 
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
      this.props.navigation.navigate(Constants.NAVIGATION.NavPlaceScreen, { item: el.node }); 
    }
  }

  _isNavigableItem = (el) => {
    const { searchOrAutocomplete } = this.props.others;
    return searchOrAutocomplete === "autocomplete" && el.node;
  }

  /**
   * If the reducer embeds a single data type then e.g. only pois:
   *    Data is stored in this.props.pois.data
   *    Success state is stored in this.props.pois.success
   *    Loading state is stored in this.props.pois.loading
   *    Error state is stored in this.props.pois.error
   * If the reducer embeds multiple data types then (e.g. search + autocomplete):
   *    Data is stored in this.props.searchAutocomplete.search
   *    Success state is stored in this.props.searchAutocomplete.searchSuccess
   *    Loading state is stored in this.props.searchAutocomplete.searchLoading
   *    Error state is stored in this.props.searchAutocomplete.searchError
   */
  _isSuccessData  = () => this.props.others.searchOrAutocomplete === "search" ? this.props.searchAutocomplete.searchSuccess : this.props.searchAutocomplete.autocompleteSuccess;
  _isLoadingData  = () => this.props.searchAutocomplete.searchLoading || this.props.searchAutocomplete.autocompleteLoading;
  _isErrorData    = () => this.props.searchAutocomplete.searchError || this.props.searchAutocomplete.autocompleteError;


  /********************* Render methods go down here *********************/

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

  _renderContent = () => {
    const { searchOrAutocomplete } = this.props.others;
    const data = searchOrAutocomplete === "autocomplete" ? this.props.searchAutocomplete.autocomplete : this.props.searchAutocomplete.search;
     return (
      <AsyncOperationStatusIndicator
        loading={this._isLoadingData()}
        success={this._isSuccessData()}
        error={this._isErrorData()}
        retryFun={() => {}} 
        loadingLayout={
          <LLEntitiesFlatlist 
            horizontal={false} 
            numColumns={1} 
            itemStyle={styles.itemFlatlist} 
            style={styles.listStyle} 
            bodyContainerStyle={styles.listContainer}/>}
        >
        <FlatList
          key={1}
          keyExtractor={(item, index) => index.toString()}
          data={data}
          renderItem={({item, index}) => this._renderItem(item, index)}
          style={styles.scrollView}
        />
      </AsyncOperationStatusIndicator>
     )
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        <ConnectedHeader iconTintColor={Colors.blue} />
        {render && this._renderContent()}
      </View>
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
  header: {
    backgroundColor: "white"
  },
  container: {
    padding: 10,
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
    store={store} />;
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
  return {...bindActionCreators({ ...actions }, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(SearchScreenContainer)