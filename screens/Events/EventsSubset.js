import React, { Component } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView, PixelRatio } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  ConnectedHeader, 
  EventListItem, 
  CustomText,
  ScreenErrorBoundary,
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
import { useSafeArea } from 'react-native-safe-area-context';

/* Deferred rendering to speedup page inital load: 
   deferred rendering delays the rendering reducing the initial 
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;
class EventsSubsetScreen extends Component {

  constructor(props) {
    super(props);
    /* Get props from navigation */
    let { headerTitle, eventsSubset } = props.route.params; 

    this.state = {
      render: USE_DR ? false : true,
      //
      headerTitle,
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


  _openMap = () => {
    const { eventsSubset, headerTitle } = this.state;
    this.props.navigation.navigate(Constants.NAVIGATION.NavEventsMapScreen, {events: eventsSubset, headerTitle});
  }
  
  /********************* Render methods go down here *********************/
  _renderBottomToast = () => {
    const { go, exploreEventsOnMap, filterEvents, filter } = this.props.locale.messages;
    return(
      <View style={[styles.toastContainer]}>
        <View style={styles.toastInnerContainer}>
          <CustomText style={styles.toastText}>{exploreEventsOnMap}</CustomText>
          <TouchableOpacity 
            style={styles.toastButton}
            activeOpacity={0.7}
            onPress={this._openMap}>
            <CustomText style={styles.toastButtonText}>{go}</CustomText>
          </TouchableOpacity>
        </View>
        <View style={[styles.toastInnerContainer, {marginTop: 5, marginBottom: this.props.insets.bottom}]}>
          <CustomText style={styles.toastText}>{filterEvents}</CustomText>
          <TouchableOpacity 
            style={styles.toastButton}
            activeOpacity={0.7}
            onPress={this._openFilters}>
            <CustomText style={styles.toastButtonText}>{filter}</CustomText>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

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
        contentContainerStyle={[styles.content, {paddingBottom: 45 * PixelRatio.getFontScale() + this.props.insets.bottom}]}
        renderItem={({ item }) => this._renderEventsListItem(item)}
        style={styles.listContent}
        ItemSeparatorComponent={() => <View style={{height: 10}}></View>}
      />
    )
  }
  
  _renderContent = () => {
     return (
      <View style={styles.calendarList}>
        <View style={styles.calendarListTitleView}>
          <CustomText style={styles.calendarListTitle}>{this.state.headerTitle}</CustomText>
        </View>
        {this._renderEventsList()}
        {this._renderBottomToast()}
      </View>
     )
  }


  render() {
    const { render } = this.state;
    return (
      <ScreenErrorBoundary>
        <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
          <ConnectedHeader iconTintColor={Colors.colorEventsScreen} />
          {render && this._renderContent()}
        </View>
      </ScreenErrorBoundary>
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
    paddingTop: 10,
    paddingBottom:35
  },
  listContent: {
    paddingHorizontal: 5,
    flex: 1
  },
  calendarList: {
    flex: 1
  },
  calendarListTitleView: {
    backgroundColor: "rgb(248,248,248)",
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: "center"
  },
  calendarListTitle: {
    fontSize: 16,
    color: "#000000E6",
    fontFamily: "montserrat-bold",
    textTransform: "capitalize"
  },
  toastContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    width: "100%",
    paddingHorizontal: 16
    // marginHorizontal: 16,
  },
  toastInnerContainer: {
    width: "100%",
    backgroundColor: "#000000",
    borderRadius: 4,
    paddingLeft: 13,
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  toastText: {
    fontSize: 13,
    color: "white",
    flex: 1,
  },
  toastButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    alignItems: "flex-end",
  },
  toastButtonText: {
    fontSize: 14,
    fontFamily: "montserrat-bold",
    color: "#D9531E",
    textAlign: "right"
  }
});


function EventsSubsetScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();
  const insets = useSafeArea();

  return <EventsSubsetScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store}
    insets={insets}
     />;
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