// import React, { Component } from "react";
// import { 
//   View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
//   StyleSheet, BackHandler, Platform, ScrollView } from "react-native";
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { 
//   // CategoryListItem, 
//   // GeoRefHListItem, 
//   // GridGallery, 
//   // GridGalleryImage, 
//   // MapViewTop, 
//   // ScrollableHeader,
//   // TabBarIcon, 
//   // CalendarListItem, 
//   // EntityAbstract,
//   // EntityDescription,
//   // EntityGallery,
//   // EntityHeader,
//   // EntityItem,
//   // EventListItem,
//   // EntityMap,
//   // EntityRelatedList,
//   // EntityVirtualTour,
//   // EntityWhyVisit,
//   // TopMedia,
//   AsyncOperationStatusIndicator, 
//   // AsyncOperationStatusIndicatorPlaceholder,
//   // Webview, 
//   // ConnectedText, 
//   ConnectedHeader, 
//   // ImageGridItem, 
//   // ConnectedLanguageList, 
//   // BoxWithText,
//   // ConnectedFab, 
//   // PoiItem, 
//   // PoiItemsList, 
//   // ExtrasListItem, 
//   // MapViewItinerary
//   CustomText
//  } from "../../components";
//  import { FontAwesome5, Ionicons } from "@expo/vector-icons";
// import { connect, useStore } from 'react-redux';
// import { bindActionCreators } from 'redux';
// import _ from 'lodash';
// import Layout from '../../constants/Layout';
// import { greedyArrayFinder, getEntityInfo, getCoordinates, getSampleVideoIndex, getGalleryImages } from '../../helpers/utils';
// import { apolloQuery } from '../../apollo/queries';
// import actions from '../../actions';
// import * as Constants from '../../constants';
// import Colors from '../../constants/Colors';
// import { LoadingLayoutEntitiesFlatlist } from "../../components/layouts";

// /* Deferred rendering to speedup page inital load: 
//    deferred rendering delays the rendering reducing the initial 
//    number of components loaded when the page initially mounts.
//    Other components are loaded right after the mount */
// const USE_DR = false;

// const renderItem = ({ item }) => <Item title={item.title} />;

// class InfoScreen extends Component {

//   constructor(props) {
//     super(props);

//     /* Get props from navigation */
//     //let { someNavProps } = props.route.params; 

//     this.state = {
//       render: USE_DR ? false : true,
//     };
      
//   }

//   /********************* React.[Component|PureComponent] methods go down here *********************/

//   /**
//    * Use this function to perform data fetching
//    * e.g. this.props.actions.getPois();
//    */
//   componentDidMount() {
//     //Deferred rendering to make the page load faster and render right after
//     {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
//   }

//   /**
//    * Use this function to update state based on external props 
//    * or to post-process data once it changes
//    */
//   componentDidUpdate(prevProps) {
//     /**
//      * Is the former props different from the newly propagated prop (redux)? perform some action
//      * if(prevProps.xxx !== this.props.xxx)
//      *  doStuff();
//      */
//   }

//   /**
//    * Use this function to unsubscribe or clear any event hooks
//    */
//   componentWillUnmount() {
//   }

//   /********************* Non React.[Component|PureComponent] methods go down here *********************/

//   /**
//    * If the reducer embeds a single data type then e.g. only pois:
//    *    Data is stored in this.props.pois.data
//    *    Success state is stored in this.props.pois.success
//    *    Loading state is stored in this.props.pois.loading
//    *    Error state is stored in this.props.pois.error
//    * If the reducer embeds multiple data types then (e.g. search + autocomplete):
//    *    Data is stored in this.props.searchAutocomplete.search
//    *    Success state is stored in this.props.searchAutocomplete.searchSuccess
//    *    Loading state is stored in this.props.searchAutocomplete.searchLoading
//    *    Error state is stored in this.props.searchAutocomplete.searchError
//    */
//   _isSuccessData  = () => true;    /* e.g. this.props.pois.success; */mock
//   _isLoadingData  = () => true;   /* e.g. this.props.pois.loading; */
//   _isErrorData    = () => null;    /* e.g. this.props.pois.error; */


//   /********************* Render methods go down here *********************/
//   _renderContent = () => {
//     const { info } = this.props.locale.messages;
//      return (
//        <AsyncOperationStatusIndicator
//          loading={this._isLoadingData()}
//          success={this._isSuccessData()}
//          error={this._isErrorData()}
//          retryFun={() => {}}
//          loadingLayout={
//            <LoadingLayoutEntitiesFlatlist
//              horizontal={false}
//              numColumns={1}
//              itemStyle={styles.itemFlatlist}
//              style={styles.listStyle}
//              bodyContainerStyle={styles.listContainer}
//            />
//          }
//        >
//          <CustomText style={styles.title}>{info}</CustomText>
//          <SimpleList
//            data={DATA}
//            title={title}
//          />
//        </AsyncOperationStatusIndicator>
//      );
//   }


//   render() {
//     const { render } = this.state;
//     return (
//       <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
//         <ConnectedHeader />
//         {render && this._renderContent()}
//       </View>
//     )
//   }
  
// }


// InfoScreen.navigationOptions = {
//   title: 'Info',
// };


// const styles = StyleSheet.create({
//   fill: {
//     flex: 1,
//     backgroundColor: "white",
//   },
//   header: {
//     backgroundColor: "white",
//   },
//   container: {
//     padding: 10,
//   },
//   title: {
//     textAlign: "center",
//     paddingTop: 10,
//     paddingBottom: 10,
//     color: "#000000E6",
//     backgroundColor: "#F2F2F2",
//     fontSize: 15,
//     fontFamily: "montserrat-bold",
//     textTransform: "uppercase",
//   },
//   element: {
//     textAlign: "left",
//     paddingTop: 24,
//     paddingStart: 25,
//     paddingBottom: 24,
//     color: "black",
//     //backgroundColor: "#F2F2F2",
//     fontSize: 15,
//     fontFamily: "montserrat-regular",
//     //textTransform: "uppercase"
//   },
//   chevron: {
//     textAlign: "left",
//     paddingTop: 20,
//     paddingEnd: 15,
//     paddingBottom: 24,
//     color: "black",
//     //backgroundColor: "#F2F2F2",
   
//     //textTransform: "uppercase"
//   },
// });


// function InfoScreenContainer(props) {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const store = useStore();

//   return <InfoScreen 
//     {...props}
//     navigation={navigation}
//     route={route}
//     store={store} />;
// }


// const mapStateToProps = state => {
//   return {
//     restState: state.restState,
//     //auth
//     auth: state.authState,
//     //mixed state
//     others: state.othersState,
//     //language
//     locale: state.localeState,
//     //favourites
//     favourites: state.favouritesState,
//     //graphql
//     categories: state.categoriesState,
//     events: state.eventsState,
//     inspirers: state.inspirersState,
//     itineraries: state.itinerariesState,
//     nodes: state.nodesState,
//     pois: state.poisState,
//     searchAutocomplete: state.searchAutocompleteState,
//   };
// };


// const mapDispatchToProps = dispatch => {
//   return {...bindActionCreators({ ...actions }, dispatch)};
// };


// export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
//   return {
//     ...stateProps,
//     actions: dispatchProps,
//     ...props
//   }
// })(InfoScreenContainer)