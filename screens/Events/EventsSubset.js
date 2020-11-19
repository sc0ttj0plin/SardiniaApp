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
  // AsyncOperationStatusIndicatorPlaceholder,
  // Webview, 
  // ConnectedText, 
  ConnectedHeader, 
  EventListItem, 
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
import moment from 'moment';
import it from 'moment/locale/it'
import en from 'moment/locale/en-gb'
import Layout from '../../constants/Layout';
import { greedyArrayFinder, getEntityInfo, getCoordinates, getSampleVideoIndex, getGalleryImages } from '../../helpers/utils';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { LLEntitiesFlatlist } from "../../components/loadingLayouts";

/* Deferred rendering to speedup page inital load: 
   deferred rendering delays the rendering reducing the initial 
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;
class EventsSubsetScreen extends Component {

  constructor(props) {
    super(props);

    moment.locale(Constants.DEFAULT_LANGUAGE);

    /* Get props from navigation */
    let { dateString, dateHeaderFormat, eventsSubset } = props.route.params; 

    this.state = {
      render: USE_DR ? false : true,
      //
      headerDate: moment(dateString).format(dateHeaderFormat),
      eventsSubset,
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
  }

  componentDidUpdate(prevProps) {

  }

  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/


  /********************* Render methods go down here *********************/
  _renderEventsListItem = (item) => {
    // console.log(item.title)
    const { lan } = this.props.locale;
    const title = _.get(item.title, [lan, 0, "value"], null);
    const term = _.get(item.term, "name", "");
    const image = item.image;
    const date = item.date1render;
    return(
      <EventListItem 
        onPress={() => this.props.navigation.navigate(Constants.NAVIGATION.NavEventScreen, { item })}  
        title={title} 
        term={term}
        image={image}
        date={date}
      />
    )
  }

  _renderEventsList = () => {
    return(
      <FlatList
        data={this.state.eventsSubset}
        keyExtractor={(item) => item.title}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => this._renderEventsListItem(item)}
        style={styles.listContent}
      />
    )
  }
  
  _renderContent = () => {
     return (
      <View style={styles.calendarList}>
        <View style={styles.calendarListTitleView}>
          <Text style={styles.calendarListTitle}>{this.state.headerDate}</Text>
        </View>
        {this._renderEventsList()}
      </View>
     )
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        <ConnectedHeader iconTintColor={Colors.colorEventsScreen} />
        {render && this._renderContent()}
      </View>
    )
  }
  
}


EventsSubsetScreen.navigationOptions = {
  title: 'EventsSubset',
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
  content: {
    paddingBottom:20
  },
  listContent: {
    paddingHorizontal: 17,
    flex: 1
  },
  calendarList: {
    flex: 1
  },
  calendarListTitleView: {
    backgroundColor: "#F2F2F2",
    height: 60,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: "center"
  },
  calendarListTitle: {
    color: "#000000E6",
    fontWeight: "bold",
    textTransform: "capitalize"
  }
});


function EventsSubsetScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <EventsSubsetScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    others: state.othersState,
    //language
    locale: state.localeState,
    //graphql
    events: state.eventsState,
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
})(EventsSubsetScreenContainer)