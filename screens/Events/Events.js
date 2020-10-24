import React, { Component } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, 
  StyleSheet, BackHandler, Platform, ScrollView, SectionList, TouchableHighlight, NativeModules } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
const { StatusBarManager } = NativeModules;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBarManager.HEIGHT;

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
import moment from "moment";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { Calendar, LocaleConfig, CalendarList } from 'react-native-calendars';
import Layout from '../../constants/Layout';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { LLEntitiesFlatlist } from "../../components/loadingLayouts";

import { FETCH_NUM_MONTHS_FORWARD, FETCH_NUM_MONTHS_BACKWARDS } from '../../constants';

//Example calendar: https://github.com/wix/react-native-calendars/blob/master/example/src/screens/calendars.js
const USE_DR = false;
const INITIAL_DATE = { "dateString": moment().format("YYYYMMDD") };
const INITIAL_MONTH = moment().format("YYYY-MM");

class EventsScreen extends Component {

  constructor(props) {
    super(props);

    /* Get props from navigation */
    //let { someNavProps } = props.route.params; 
    for (let language in Constants.AGENDA_LOCALE)
      LocaleConfig.locales[language] = Constants.AGENDA_LOCALE[language];
    LocaleConfig.defaultLocale = props.locale.lan;

    this._refs = {};
    this._queriedMonths = {};

    /* The upper and lower bound for date fetcher: use to load more months */
    this._ubLb = { 
      lb: this.props.eventsTimeMin || null,
      ub: this.props.eventsTimeMax || null
    };

    this.state = {
      render: USE_DR ? false : true,
      selectedDay: moment().subtract(2, 'month').format('YYYY-MM-DD'),
      currentMonth: INITIAL_MONTH
    };

      
  }

  /**
   * Use this function to perform data fetching
   * e.g. this.props.actions.getPois();
   */
  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};

    this._loadEvents(INITIAL_DATE);

  }

  /**
   * Use this function to update state based on external props 
   * or to post-process data once it changes
   */
  componentDidUpdate(prevProps) {
    //  if(prevProps.events !== this.props.events)
      // console.log(this.props.events.markedDates);
     
  }


  /**
   * Load events for the current month
   * @param {*} date: { "dateString": "2020-11-14", "day": 14, "month": 11, "timestamp": 1605312000000, "year": 2020 }
   * TODO: remove .add/subtract(1,"year")
   */
  _loadEvents = (date) => {
    const dateString = date.dateString;
    const month = moment(dateString).subtract(1,"year").startOf('month');
    // const month = moment(dateString).startOf('month');
    const monthFormatted = month.format('YYYYMM');
    //Is the month already loaded? skip
    if (!this._queriedMonths[monthFormatted]) {
      //set current date string have a reference month
      this._currentMonth = month;
      //compute new lower and upper bounds to date/time so the action creator knows how many empty [] it has to put in
      this._ubLb = this._getDateIntervals(dateString);
      //fetch the events using upper and lower time bounds in unix epoch time
      const eventsQuery = {
        start: Math.floor(this._ubLb.lb.valueOf()/1000), 
        end: Math.floor(this._ubLb.ub.valueOf()/1000), 
      };
      this.props.actions.getEvents(eventsQuery, {}, this._ubLb);
      this._queriedMonths[monthFormatted] = true;
    }
    this.setState({
      currentMonth: moment(dateString).format("YYYY-MM")
    })
  }

  /**
   * Creates the upper and lower time bounds for the query adding and removing months 
   * @param {*} dateString: "2020-11-14"
   * @returns { "lb": "2019-08-31T22:00:00.000Z", "ub": "2019-10-31T22:59:59.999Z" }
   * TODO: remove .add/.subtract(1,"year")
   */
  _getDateIntervals = (dateString) => {
    //specify N months "around" today's month
    if (dateString)
      return ({
        lb: moment(dateString).startOf('month').subtract(1,"year").subtract(FETCH_NUM_MONTHS_BACKWARDS, 'month'),
        // lb: moment(dateString).startOf('month').subtract(FETCH_NUM_MONTHS_BACKWARDS, 'month'),
        ub: moment(dateString).endOf('month').subtract(1,"year").add(FETCH_NUM_MONTHS_FORWARD, 'month')
        // ub: moment(dateString).endOf('month').add(FETCH_NUM_MONTHS_FORWARD, 'month')
      });
    return ({
      // lb: moment().startOf('month').subtract(FETCH_NUM_MONTHS_BACKWARDS, 'month'),
      lb: moment().startOf('month').subtract(1,"year").subtract(FETCH_NUM_MONTHS_BACKWARDS, 'month'),
      // ub: moment().endOf('month').add(FETCH_NUM_MONTHS_FORWARD, 'month')
      ub: moment().endOf('month').subtract(1,"year").add(FETCH_NUM_MONTHS_FORWARD, 'month')
    });
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
  _isSuccessData  = () => true;    /* e.g. this.props.pois.success; */
  _isLoadingData  = () => false;   /* e.g. this.props.pois.loading; */
  _isErrorData    = () => null;    /* e.g. this.props.pois.error; */



  _renderContent = () => {
    const { lan } = this.props.locale;
    LocaleConfig.defaultLocale = lan;
     return (
      <AsyncOperationStatusIndicator
        loading={this._isLoadingData()}
        success={this._isSuccessData()}
        error={this._isErrorData()}
        loadingLayout={<Text>NOW LOADING</Text>}>
          <Calendar
            theme={Constants.styles.calendarTheme}
            onDayPress={(day) => {console.log('selected day', day)}}
            onDayLongPress={(day) => {console.log('selected day', day)}}
            monthFormat={'MMMM yyyy'}
            onMonthChange={(date) => this._loadEvents(date)}
            hideExtraDays={true}
            markingType={'custom'}
            markedDates={this.props.events.markedDates}
            firstDay={1}
            hideDayNames={false}
            // Handler which gets executed when press arrow icon left. It receive a callback can go back month
            // onPressArrowLeft={subtractMonth => subtractMonth()}
            // Handler which gets executed when press arrow icon right. It receive a callback can go next month
            // onPressArrowRight={addMonth => addMonth()}
            // Replace default month and year title with custom one. the function receive a date as parameter.
            // renderHeader={(date) => {/*Return JSX*/}}
            // Enable the option to swipe between months. Default = false
            enableSwipeMonths={true}
          />
          {this._renderEventsList()}
      </AsyncOperationStatusIndicator>
     )
  }

  _renderEventsList = () => {
    // const events = _.get(this.props.events, "events", [])
    // let newEvents = []
    // let currentMonth = parseInt(this.state.currentMonth.split("-")[1])
    // let currentYear = parseInt(this.state.currentMonth.split("-")[0])
    // // console.log("current month", this.state.currentMonth, INITIAL_MONTH)
    // for(let key in events){
    //   console.log("key", key, events[key].length)
    //   let month = parseInt(("" + key).split("-")[1])
    //   let year = parseInt(("" + key).split("-")[0])
    //   // console.log("events length", events[key].length > 5, month, year, currentMonth, currentYear)
    //   if(month == currentMonth && year == currentYear){
    //     let event = {
    //       title: key,
    //       data: events[key]
    //     }
    //     newEvents.push(event)
    //   }
    // }
    const { currentMonth } = this.state;
    console.log("currentmo", this.state.currentMonth)
    return(
      <SectionList
        sections={this.props.events.events[currentMonth]}
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => this._renderEventsListItem(item)}
        style={styles.listContent}
        renderSectionHeader={({ section: { title } }) => (
          <View style={{flex:1, backgroundColor: Colors.lightGrey, justifyContent: 'center', borderRadius: 5, marginTop: 5, marginBottom: 5}}>
            <Text style={styles.header}>{title}</Text>
          </View>
        )}
      />
    )
  }

  _renderEventsListItem = (item) => {
    // console.log(item.title)
    const { lan } = this.props.locale;
    let title = _.get(item.title, [lan, 0, "value"], null);
    let term = _.get(item.term, "name", null);
    let image = _.get(item, "image", "")
    return(
      <EventListItem 
        title={title}
        term={term}
        image={image}/>
    )
  }

  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: STATUSBAR_HEIGHT}]}>
        <ConnectedHeader iconTintColor="#24467C" />
        {render && this._renderContent()}
      </View>
    )
  }
  
}


EventsScreen.navigationOptions = {
  title: 'Calendar',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  header: {
    // backgroundColor: "white",
    margin: 5,
    color: Colors.red,
    fontWeight: 'bold'
  },
  container: {
    padding: 10,
  },
  listContent: {
    paddingHorizontal: 17
  },
  
});


function EventsScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <EventsScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    locale: state.localeState,
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
})(EventsScreenContainer)