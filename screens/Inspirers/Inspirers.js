import React, { Component } from "react";
import { View, FlatList, StyleSheet, BackHandler } from "react-native";
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { 
  CategoryListItem, 
  EntityItem,
  AsyncOperationStatusIndicator,  
  ConnectedHeader, 
  ConnectedScreenErrorBoundary,
  LoadingLayoutVerticalItemsFlatlist
 } from "../../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { useSafeArea } from 'react-native-safe-area-context';

/* Deferred rendering to speedup page inital load: 
   deferred rendering delays the rendering reducing the initial 
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;
class InspirersScreen extends Component {

  constructor(props) {
    super(props);

    /* Get props from navigation */
    //let { someNavProps } = props.route.params; 

    this.state = {
      render: USE_DR ? false : true,
      //
      inspirers: props.inspirers.data || []
    };
      
    this._onHardwareBackButtonClick = this._onHardwareBackButtonClick.bind(this);
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    this.props.actions.getCategories({ vid: Constants.VIDS.inspirersCategories });
    this.props.actions.setMainScreenMounted(true); /* tell that the main screen has mounted (used by ConnectedSplashLoader) */
    BackHandler.addEventListener('hardwareBackPress', this._onHardwareBackButtonClick);
  }

  /**
   * Use this function to update state based on external props 
   * or to post-process data once it changes
   */
  componentDidUpdate(prevProps) {
    // If currently selected categories (terms) differ from the previous ones fetch other pois for those categories
    if(prevProps.others.inspirersTerms !== this.props.others.inspirersTerms && this._isPoiList()) {
      this._loadMorePois();
    }

    if(prevProps.isFocused !== this.props.isFocused){
      if(this.props.isFocused)
        BackHandler.addEventListener('hardwareBackPress', this._onHardwareBackButtonClick);
      else
        BackHandler.removeEventListener('hardwareBackPress', this._onHardwareBackButtonClick);
    }

    // if(prevProps.inspirers.data !== this.props.inspirers.data && this._isPoiList() && this.state.inspirers.length == 0) {
    //   this.setState({inspirers: this.props.inspirers.data})
    // }
  }

  /**
   * Use this function to unsubscribe or clear any event hooks
   */
  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _onHardwareBackButtonClick = () => {
    if (this.props.isFocused) {
      if(this.props.others.inspirersTerms.length > 0) {
        this._backButtonPress()
      } else {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Get current term (category) and its child uuids, 
   *   if fallbackToCategories is true fallbacks to initial categories
   */
  _getCurrentTerm = (fallbackToCategories=false) => {
    let term = this.props.others.inspirersTerms[this.props.others.inspirersTerms.length - 1];
    if (fallbackToCategories)
      term = term ? (term.terms ? term.terms : []) : this.props.categories.data[Constants.VIDS.inspirersCategories];
    const childUuids = term ? term.childUuids : null;
    return { term, childUuids };
  }

  /**
   * Get more pois when the user changes position and/or 
   * we reach the end of the category tree . 
   * Pois are loaded in order of distance from the user and are "categorized"
   * to load pois in the bottom scrollable container list (not header)
   * uuids controls the category of the pois
   */
  _loadMorePois = () => {
    const { childUuids } = this._getCurrentTerm();
    const { inspirers: stateInspirers } = this.state;
    if (this._isPoiList()) {
      apolloQuery(actions.getInspirers({
        limit: Constants.PAGINATION.poisLimit,
        offset: stateInspirers ? stateInspirers.length : 0,
        uuids: childUuids
      })).then((inspirers) => {
        if (inspirers && inspirers.length > 0)
          this.setState({ inspirers: [...stateInspirers, ...inspirers]});
      }).catch(e => {
        console.error("[Inspirers] Cannot fetch inspirers")
      });
    }
  }

  /**
   * Opens category item on click, push a new screen 
   * @param {*} item: list item clicked
   */
  _selectCategory = (item) => {
    // console.log("item", item)
    this._refFlatList.scrollToOffset({offset: 0, animated: true});
    this.props.actions.pushCurrentCategoryInspirers(item);
  }

  /**
   * Open single inspirer screen
   * @param {*} item: item list
   */
  _openPoi = (item) => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavInspirerScreen, { item, mustFetch: true });
  }

  /**
   * Is poi list returns true if we reached the end of the three (no more sub categories)
   */
  _isPoiList = () => {
    const { term } = this._getCurrentTerm();
    return term && (!term.terms || term.terms.length == 0);
  }

  _backButtonPress = () => {
    this.setState({ inspirers: [] });
    this._refFlatList.scrollToOffset({offset: 0, animated: true});
    this.props.actions.popCurrentCategoryInspirers();
  };

  _isSuccessData  = () => this.props.categories.success || this.props.inspirers.success;
  _isLoadingData  = () => this.props.categories.loading || this.props.inspirers.loading; 
  _isErrorData    = () => this.props.inspirers.error;   


  /********************* Render methods go down here *********************/

  /* Renders a poi in Header */
  _renderPoiListItem = (item, index) => {
    const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
    if (title)
      return (
        <EntityItem 
          keyItem={item.nid}
          listType={Constants.ENTITY_TYPES.inspirers}
          iconColor={Colors.colorInspirersScreen}
          onPress={() => this._openPoi(item)}
          title={title}
          subtitle={item.term.name}
          image={item.image}
          horizontal={false}
          sideMargins={10}
          extraStyle={styles.inspirersListItem}
          animated={true}
          style={{marginBottom: 10}}
        />
      )
    else 
      return null;
}

  /* Renders categories list */
  _renderCategoryListItem = (item) => 
      <CategoryListItem onPress={() => this._selectCategory(item)} image={item.image} title={item.name} style={{marginBottom: 10}}/>;


  _renderContent = () => {
    const { term } = this._getCurrentTerm(true);
    const { inspirers } = this.state;
    const isPoiList = this._isPoiList();
    let flatListData = [];
    let renderItem = null;
    // console.log("term", this._isSuccessData())
    let numColumns = 1; //One for categories, two for pois
    //if no more nested categories renders pois
    if (isPoiList) {
      flatListData = inspirers || [];
      renderItem = ({ item, index }) => this._renderPoiListItem(item, index);
      numColumns = 1;
    } else {
      //initially term is null so we get terms from redux, then term is populated with nested terms (categories) 
      flatListData = term || [];
      renderItem = ({ item }) => this._renderCategoryListItem(item);
    }

    return (
      <AsyncOperationStatusIndicator
        loading={this._isLoadingData()}
        success={this._isSuccessData()}
        error={this._isErrorData()}
        loadingLayout={
          <LoadingLayoutVerticalItemsFlatlist 
            numColumns={numColumns}
            key={"shimmer-layout" + numColumns} 
            itemStyle={styles.itemFlatlist} 
            style={styles.listStyleLL} 
            bodyContainerStyle={styles.listContainerLL}/>}>
          <View style={styles.listView}> 
            <FlatList
              ref={(ref) => this._refFlatList = ref}
              data={flatListData}
              renderItem={renderItem}
              numColumns={numColumns}
              key={"flatlist-layout" + numColumns} 
              onEndReached={this._loadMorePois}
              keyExtractor={item => item.uuid}
              initialNumToRender={6} // Reduce initial render amount
              maxToRenderPerBatch={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[styles.listContainer]}
              style={styles.listStyle}
              updateCellsBatchingPeriod={400} // Increase time between renders
              windowSize={5} // Reduce the window size
            />
          </View>   
      </AsyncOperationStatusIndicator>
    );
  }


  render() {
    const { render } = this.state;
    return (
      <ConnectedScreenErrorBoundary>
        <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
          <ConnectedHeader 
            onBackPress={this._backButtonPress}
            iconTintColor={Colors.colorInspirersScreen}  
            backButtonVisible={this.props.others.inspirersTerms.length > 0}
          />
          {render && this._renderContent()}
        </View>
      </ConnectedScreenErrorBoundary>
    )
  }
  
}


InspirersScreen.navigationOptions = {
  title: 'Boilerplate',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  list: {
    marginBottom: 50,
    width: "100%",
    paddingHorizontal: 10
  },
  listView: {
    width: "100%",
    marginTop: 0,
  },
  header: {
    backgroundColor: "white"
  },
  container: {
    padding: 10,
  },
  //loading layout
  listContainerLL: {
    marginTop: 0,
    paddingTop: 0,
    marginHorizontal: 20
  },
  listContainerHeader: {
    paddingLeft: 10,
  },
  mainListContainer: {
    backgroundColor: "white",
  },
  listStyle: {
    backgroundColor: "transparent",
    marginHorizontal: 10,
    height: "100%",
  },
  listContainer: {
    paddingTop: 10,
    paddingBottom: 60
  },
  listStyleLL: {
    backgroundColor: "transparent",
    marginHorizontal: 10,
    height: "100%",
  },
  itemFlatlist: {
    marginTop: 10,
    marginBottom: 0,
    height: 160, 
    width: "100%", 
  },
  inspirersListItem: {
    width: "100%"
  },
});


function InspirersScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();
  const isFocused = useIsFocused();
  const insets = useSafeArea();

  return <InspirersScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store}
    isFocused={isFocused}
    insets={insets} />;
}


const mapStateToProps = state => {
  return {
    //mixed state
    others: state.othersState,
    //language
    locale: state.localeState,
    //favourites
    favourites: state.favouritesState,
    //graphql
    categories: state.categoriesState,
    inspirers: state.inspirersState,
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
})(InspirersScreenContainer)