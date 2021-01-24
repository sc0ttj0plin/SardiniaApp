import React, { Component } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, 
  StyleSheet, BackHandler, Platform, ScrollView, SectionList, TouchableHighlight, NativeModules, PixelRatio} from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
const { StatusBarManager } = NativeModules;
import { 
  AsyncOperationStatusIndicator, 
  ConnectedHeader,
  EventListItem, 
  CustomText
 } from "../../components";
import moment from "moment";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { Calendar, LocaleConfig, CalendarList, ExpandableCalendar, CalendarProvider } from 'react-native-calendars';
import Layout from '../../constants/Layout';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { LLVerticalItemsFlatlist } from "../../components/loadingLayouts";
import * as Animatable from 'react-native-animatable';
import { FETCH_NUM_MONTHS_FORWARD, FETCH_NUM_MONTHS_BACKWARDS } from '../../constants';
import TouchableOpacity from '../../components/ScrollableContainerTouchableOpacity';

//Example calendar: https://github.com/wix/react-native-calendars/blob/master/example/src/screens/calendars.js
const USE_DR = false;
const INITIAL_DATE = { "dateString": moment().format("YYYYMMDD") };
const INITIAL_MONTH = moment().format(Constants.YEAR_MONTH_FORMAT);

class EventsScreen extends Component {

  constructor(props) {
    super(props);

    moment.locale(Constants.DEFAULT_LANGUAGE);

    /* Get props from navigation */
    //let { someNavProps } = props.route.params; 
    for (let language in Constants.SCREENS.events.agendaLocale)
      LocaleConfig.locales[language] = Constants.SCREENS.events.agendaLocale[language];
    LocaleConfig.defaultLocale = props.locale.lan;

    this._refs = { calendarView: null };
    this._queriedMonths = {};

    /* The upper and lower bound for date fetcher: use to load more months */
    this._ubLb = { 
      lb: this.props.eventsTimeMin || null,
      ub: this.props.eventsTimeMax || null
    };

    this.state = {
      render: USE_DR ? false : true,
      selectedDay: moment().subtract(2, 'month').format('YYYY-MM-DD'),
      currentMonth: INITIAL_MONTH,
      eventsTypes: []
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
    this.props.actions.resetEvents();
    this.props.actions.setMainScreenMounted(true); /* tell that the main screen has mounted (used by ConnectedSplashLoader) */
    this._loadEvents(INITIAL_DATE);
  }

  /**
   * Use this function to update state based on external props 
   * or to post-process data once it changes
   */
  componentDidUpdate(prevProps) {
    //  if(prevProps.events !== this.props.events)
      // console.log(this.props.events.eventsCalendarMarkers);
    if(prevProps.events.eventTypes !== this.props.events.eventTypes){
      this.setState({eventTypes: this.props.events.eventTypes})
      // console.log("this.props.events.eventsTYpes", this.props.events.eventTypes )
    }

    if(prevProps.events.selectedTypes !== this.props.events.selectedTypes){
      // console.log("new filters")
      this._queriedMonths = {}
      this._loadEvents(INITIAL_DATE);
    }
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  handleCalendarViewRef = ref => this._refs.calendarView = ref;

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
      // console.log("event types", this.props.events.selectedTypes)
      const eventsQuery = {
        start: Math.floor(this._ubLb.lb.valueOf()/1000), 
        end: Math.floor(this._ubLb.ub.valueOf()/1000), 
        types: this.props.events.selectedTypes.length > 0 ? this.props.events.selectedTypes : null
      };
      this.props.actions.getEvents(eventsQuery, this._ubLb);
      // this.props.actions.getEventTypes()
      this._queriedMonths[monthFormatted] = true;
    }
    this.setState({
      currentMonth: moment(dateString).format(Constants.YEAR_MONTH_FORMAT)
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

  _isSuccessData  = () => this.props.events.eventsSuccess;    /* e.g. this.props.pois.success; */
  _isLoadingData  = () => this.props.events.eventsLoading;   /* e.g. this.props.pois.loading; */
  _isErrorData    = () => this.props.events.eventsError;    /* e.g. this.props.pois.error; */


  /*
  * TODO: remove .add/.subtract(1,"year")
  */
  _openMap = () => {
    const { currentMonth } = this.state;
    let events = this.props.events.eventsByYearMonth[currentMonth];
    var headerTitle = moment(this._currentMonth).add(1,"year").format("MMMM YYYY");
    this.props.navigation.navigate(Constants.NAVIGATION.NavEventsMapScreen, {events, headerTitle: headerTitle});
  }

  _openFilters = () => {
    this.props.navigation.navigate(Constants.NAVIGATION.NavFiltersScreen, {filters: Constants.ENTITY_TYPES.events});
  }
  
  /**
   * Navigate to subset of events (in this case of the day)
   * @param {*} dateString: "2020-11-14"
   */
  _onDatePress = (dateString) => {
    const { eventsByYearMonthDay } = this.props.events;
    const eventsSubset = eventsByYearMonthDay[dateString];
    if (eventsSubset) {
      var headerTitle = moment(dateString).format("DD MMMM YYYY");
      this.props.navigation.navigate(Constants.NAVIGATION.NavEventsSubset, { headerTitle, eventsSubset });
    }
  }

  /********************* Render methods go down here *********************/

  _renderBottomToast = () => {
    const { go, exploreEventsOnMap, filterEvents, filter } = this.props.locale.messages;
    return(
      <View style={styles.toastContainer}>
        <View style={styles.toastInnerContainer}>
          <CustomText style={styles.toastText}>{exploreEventsOnMap}</CustomText>
          <TouchableOpacity 
            style={styles.toastButton}
            activeOpacity={0.7}
            onPress={this._openMap}>
            <CustomText style={styles.toastButtonText}>{go}</CustomText>
          </TouchableOpacity>
        </View>
        <View style={[styles.toastInnerContainer,{marginTop: 5}]}>
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

  /** Pan Gesture Calendar */
  _renderContent = () => {
    const { lan } = this.props.locale;
    LocaleConfig.defaultLocale = lan;
     return (
        <View style={[styles.fill, styles.calendarView]}>
          <CalendarProvider
            onMonthChange={(date) => this._loadEvents(date)}
          >
            <ExpandableCalendar
              theme={Constants.styles.calendarTheme}
              onDayPress={(date) => this._onDatePress(date.dateString)}  /* { "dateString" : "2020-12-16","day": 16,"month": 12,"timestamp": 1608076800000,"year": 2020,} */
              monthFormat={'MMMM yyyy'}
              hideExtraDays={true}
              collapseOnDayPress={false}
              markingType={'custom'}
              markedDates={this.props.events.eventsCalendarMarkers}
              firstDay={1}
              hideDayNames={false}
              enableSwipeMonths={true}
            />
            <AsyncOperationStatusIndicator
              loading={this._isLoadingData()}
              success={this._isSuccessData()}
              error={this._isErrorData()}
              loadingLayout={<LLVerticalItemsFlatlist style={[styles.content, styles.calendarList]} numColumns={1} itemStyle={styles.eventListItemLoadingLayout} />}>
            <View style={styles.calendarList}>
              {this._renderEventsList()}
            </View>
            </AsyncOperationStatusIndicator>
          </CalendarProvider>
          {this._renderBottomToast()}
        </View>
     )
  }

  _renderEventsList = () => {
    const { currentMonth } = this.state;
    return(
      <FlatList
        data={this.props.events.eventsByYearMonth[currentMonth]}
        keyExtractor={(item) => item.title}
        contentContainerStyle={[styles.content, {paddingBottom: 95 * PixelRatio.getFontScale()}]}
        ItemSeparatorComponent={() => <View style={{height: 10, backgroundColor: "transparent"}}></View>}
        renderItem={({ item }) => this._renderEventsListItem(item)}
        style={styles.listContent}
      />
    )
  }

  _renderEventsListItem = (item) => {
    // console.log(item.title)
    const { lan } = this.props.locale;
    const title = _.get(item.title, [lan, 0, "value"], null);
    const term = _.get(item, "term.name", null);
    const image = item.image;
    const date1 = item.date1render;
    const date2 = item.date2render;
    if (title)
      return(
        <EventListItem 
          onPress={() => this.props.navigation.navigate(Constants.NAVIGATION.NavEventScreen, { item })}  
          title={title} 
          term={term}
          image={image}
          startDate={date1}
          endDate={date2}
        />
      )
    else 
      return null;
  }

  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        <ConnectedHeader iconTintColor={Colors.colorEventsScreen}/>
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
  eventListItemLoadingLayout: {
    width: "100%",
    height: 78,
    borderRadius: 5,
    marginBottom: 13,
  },
  container: {
    padding: 10,
  },
  content: {
    paddingBottom:50,
    paddingTop: 15,
    paddingHorizontal: 5
  },
  listContent: {
    flex: 1
  },
  calendarList: {
    marginTop: 0,
    flex: 1
  },
  calendarView: {
    display: "flex",
    flexDirection: "column",
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