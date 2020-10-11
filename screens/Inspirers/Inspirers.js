import React, { Component } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
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
import actions from '../../actions';
import Colors from '../../constants/Colors';
import * as Constants from '../../constants';
import { LLEntitiesFlatlist } from "../../components/loadingLayouts";

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
    };
      
  }

  /**
   * Use this function to perform data fetching
   * e.g. this.props.actions.getPois();
   */
  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    (USE_DR && setTimeout(() => (this.setState({ render: true })), 0));
    console.log(this.props.actions)
    this.props.actions.getCategories({ vid: Constants.VIDS.inspirersCategories });
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
  _isSuccessData  = () => false;    /* e.g. this.props.pois.success; */
  _isLoadingData  = () => true;   /* e.g. this.props.pois.loading; */
  _isErrorData    = () => null;    /* e.g. this.props.pois.error; */


  _renderCategoryList = () => {
    // var {categories} = this.props;
    // var {term} = this.state;
    // var currentCategories = term ? term.terms ? term.terms : [] : categories;

    return (
        <AsyncOperationStatusIndicator
          loading={this._isLoadingData()}
          success={this._isSuccessData()}
          error={this._isErrorData()}
          loadingLayout={
            <LLEntitiesFlatlist 
              horizontal={false} 
              numColumns={1} 
              itemStyle={styles.itemFlatlist} 
              style={styles.listStyle} 
              bodyContainerStyle={styles.listContainer}/>}
        >
          <Text>CIAO</Text>
          {/* <FlatList
            data={currentCategories}
            renderItem={({item}) => this._renderCategoryListItem(item)}
            keyExtractor={item => item.tid.toString()}
            style={styles.listStyle}
            bodyContainerStyle={styles.listContainer}
            initialNumToRender={3} // Reduce initial render amount
            maxToRenderPerBatch={2}
            updateCellsBatchingPeriod={400} // Increase time between renders
            windowSize={5} // Reduce the window size
            /> */}
        </AsyncOperationStatusIndicator>
    );
  }

  _renderContent = () => {
    return (
      <>
        {this._renderCategoryList()}
      </>
    )
  }


  render() {
    const { render } = this.state;
    return (
      <View style={styles.fill}>
        <ConnectedHeader iconTintColor="#24467C" />
        {render && this._renderContent()}
      </View>
    )
  }
  
}


InspirersScreen.navigationOptions = {
  title: 'Inspirers',
};


const styles = StyleSheet.create({
  fill: {
  },
  container: {
    backgroundColor: Colors.colorScreen2,
    flex: 1,
  },
  sectionTitle: {
      fontSize: 16,
      color: 'white',
      fontWeight: "bold",
      margin: 10
  },
  listContainer: {
    marginTop: 0,
    paddingTop: 0,
    backgroundColor: Colors.colorScreen2,

  },
  listContainerHeader: {
    paddingLeft: 10,
  },
  mainListContainer: {
    backgroundColor: "white",
  },
  listStyle: {
    paddingTop: 10, 
    backgroundColor: Colors.colorScreen2,
    paddingHorizontal: 10,
    height: "100%",
  },
  listStyle2: {
    paddingTop: 10, 
    backgroundColor: Colors.colorScreen2,
    paddingLeft: 20,
    paddingRight: 10,
    paddingBottom: 25,
    marginBottom: 20,
    marginTop: 10,
  },
  headerComponentStyle: {
    marginTop: 0,
    paddingTop: 0,
    top: -15
  },
  listTitleStyle: {
    fontSize: 16,
    color: 'white',
    fontWeight: "bold",
    marginBottom: 10,
    flex: 1
  },
  itemFlatlist: {
    height: 240, 
    width: "100%", 
    marginBottom: 8
  }
});


function InspirersScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <InspirersScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    restState: state.restState,
    //mixed state
    othersState: state.othersState,
    //language
    locale: state.localeState,
    //favourites
    favourites: state.favouritesState,
    //graphql
    categories: state.categoriesState,
    events: state.eventsState,
    inspirers: state.inspirersState,
    itineraries: state.itinerariesState,
    nodes: state.nodesState,
    pois: state.poisState,
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