import React, { Component } from "react";
import { 
  View, 
  Image, 
  Text,
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  StyleSheet, 
  BackHandler, 
  Platform, 
  ScrollView,
  Modal,
  Switch
} from "react-native";
import { List, ListItem, SearchBar, Button, Card, Icon } from "react-native-elements";
import { FlatGrid } from 'react-native-super-grid';
import MapView from 'react-native-maps';
import { NavigationEvents, useNavigation, useRoute } from '@react-navigation/native';
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as graphqlActions from '../actions/graphql';
import * as restActions from '../actions/rest';
import * as localeActions from '../actions/locale';
import { apolloQuery } from '../apollo/middleware';
import { Agenda, LocaleConfig, CalendarList } from 'react-native-calendars';
import Layout from '../constants/Layout'
import { Header, ConnectedHeader, CalendarListItem } from '../components';
import moment from 'moment';
import * as Constants from '../constants';
import _ from 'lodash';
import Colors from '../constants/Colors';
import { ActionSheetCustom as ActionSheet } from 'react-native-actionsheet'
import { CheckBox, Accordion } from 'native-base';
import { FETCH_NUM_MONTHS_FORWARD, FETCH_NUM_MONTHS_BACKWARDS } from '../constants';

class ExperiencesEventsScreen extends Component {

  
  constructor(props) {
    super(props);
    // Agenda's locales
    
    const { lan } = props.locale;
    for (let language in Constants.SCREENS.events.agendaLocale)
      LocaleConfig.locales[language] = Constants.SCREENS.events.agendaLocale[language];
    LocaleConfig.defaultLocale = props.locale.lan;

    this._refs = {};
    this._queriedMonths = {};
    //the upper and lower bound for date fetcher: use to load more months
    this._ubLb = { 
      lb: this.props.eventsTimeMin || null,
      ub: this.props.eventsTimeMax || null
    };
    this.currentMonth = null;

    this.state = {
      loading: false,
      error: null,
      selectedDay: moment().subtract(2, 'month').format('YYYY-MM-DD'),
      filtersModalVisible: false,
      selectedFilters: {},
      eventTypes: [],
      defaultSelected: false,
    };

    this.props.navigation.addListener('didFocus', this._navigationOnFocus);

  }

  componentDidMount() {
    // Calendar gives the previous month reference
    let month = moment().startOf('month');
    this.props.actions.getEventTypes()
  }


  //implemented as focus event as after modal sometimes does not re-render
  _navigationOnFocus = () => {
    if (this._ubLb)
      this.props.actions.getEvents(this._ubLb.lb, this._ubLb.ub);
  }

  //TODO: remove .subtract(1,"year")
  _getDateIntervals = (dateString) => {
    //specify N months "around" today's month
    if (dateString)
      return ({
        lb: moment(dateString).startOf('month').subtract(1,"year").subtract(FETCH_NUM_MONTHS_BACKWARDS, 'month'),
        ub: moment(dateString).endOf('month').subtract(1,"year").add(FETCH_NUM_MONTHS_FORWARD, 'month')
        // lb: moment(dateString).startOf('month').subtract(FETCH_NUM_MONTHS_BACKWARDS, 'month'),
        // ub: moment(dateString).endOf('month').add(FETCH_NUM_MONTHS_FORWARD, 'month')
      });
    return ({
      lb: moment().startOf('month').subtract(1,"year").subtract(FETCH_NUM_MONTHS_BACKWARDS, 'month'),
      ub: moment().endOf('month').subtract(1,"year").add(FETCH_NUM_MONTHS_FORWARD, 'month')
      // lb: moment().startOf('month').subtract(FETCH_NUM_MONTHS_BACKWARDS, 'month'),
      // ub: moment().endOf('month').add(FETCH_NUM_MONTHS_FORWARD, 'month')
    });
  }
 

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.locale.lan !== this.props.locale.lan){
      const { lan } = this.props.locale;
      LocaleConfig.defaultLocale = lan;
    }
  }

  //TODO: remove .add(1,"year")
  _loadItemsForMonth = (dateString) => {
    //set current month loading
    const month = moment(dateString).subtract(1,"year").startOf('month');
    // const month = moment(dateString).startOf('month');
    const monthFormatted = month.format('YYYYMM');
    if (!this._queriedMonths[monthFormatted]) {
      //set current date string have a reference month
      this._currentMonth = month;
      //compute new lower and upper bounds to date/time so the action creator knows how many empty [] it has to put in
      this._ubLb = this._getDateIntervals(dateString);
      //compute seleted filters' tids
      const selectedFilterTids = _.reduce(this.state.selectedFilters, 
        (tids, val, key) => { 
          if (val) tids.push(key);
          return tids;
        }, []);
      //fetch the events using upper and lower time bounds 
      const eventsQuery = {
        start: Math.floor(this._ubLb.lb.valueOf()/1000), 
        end: Math.floor(this._ubLb.ub.valueOf()/1000), 
        types: selectedFilterTids.length > 0 ? selectedFilterTids : null,
      };
      this.props.actions.getEvents(eventsQuery, this.state.selectedFilters, this._ubLb);
      this._queriedMonths[monthFormatted] = true;
    }
  }

  _onEventCardPress = (item) => {
    if(item) {
      this.props.navigation.push(Constants.NAVIGATION.NavEventScreen, { event: item })
    }
  }

  _filterBtnOnPress = () => this.setState({ filtersModalVisible: true });
  
  _closeModalBtnOnPress = () => this.setState({ filtersModalVisible: false });

  _applyChangesBtnOnPress = () => {
      //cleans the queried months (redux state is cleaned if filters differ) (TODO: conditionally clean months)
      this._queriedMonths = {};
      this._loadItemsForMonth(this._currentMonth);
      this.setState({ filtersModalVisible: false });
  }

  _renderCalendarItem = (item, firstItemInDay) => {
    //use firstItemInDay to pad the subsequent items after the first
    const { lan } = this.props.locale;
    const title = _.get(item.title, [lan, 0, 'value'], null);
    const termName = _.get(item.term, 'name', null);
    return (
      <CalendarListItem 
        style={styles.item} 
        title={title}
        termName={termName}
        image={item.image}
        item={item} 
        onPress={this._onEventCardPress} 
      />);
  };


  _renderDay = (day) => (
    day ? <View><Text>{day.dateString}</Text></View> : null
  );

  _renderEmptyDate = () => {
    return (
      <View style={styles.emptyDate}>
      </View>
    );
  }

  _selectFilter = (id) => { 
    this.setState({ 
      selectedFilters: { 
        ...this.state.selectedFilters, 
        [id]: this.state.selectedFilters[id] !== undefined ? !this.state.selectedFilters[id] : !this.state.defaultSelected 
      } 
    });
  }

  _renderFilterItem = (item) => {
      let enabled = this.state.selectedFilters[item.id];
      return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: "black", fontWeight: "bold" }}>{item.name}</Text>
          <Switch
            trackColor={{ false: "#ECECEC", true: Colors.colorEventsScreen }}
            thumbColor={enabled ? "#ECECEC" : Colors.colorEventsScreen}
            onValueChange={() => this._selectFilter(item.id)}
            value={enabled}
          />
        </View>
       );
    
  };



  _renderFilterItemHorizontalSeparator = () => {
    return (
      <View style={{height: 3, width: '100%'}}></View>
    )
  }

  _renderFiltersModal = () => {
      return (
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.filtersModalVisible}
          onRequestClose={() => { }}>
            <View style={[styles.filtersModalView, {
                borderColor: "black",
                borderWidth: 2
            }]} >
              <View style={styles.filtersModalView1} >
                <View style={styles.filtersModalFiltersView}>
                  <FlatList
                    key={1}
                    keyExtractor={(item, index) => item.id}
                    data={this.props.eventTypes}
                    renderItem={({ item, index }) => this._renderFilterItem(item)}
                    extraData={this.state.selectedFilters}
                    ItemSeparatorComponent={this._renderFilterItemHorizontalSeparator}
                    style={styles.fill}
                  />
                </View>
                <View style={[styles.filtersModalBottomView,
                  {
                    marginTop:  40
                  }]}> 
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.filterButtonModal}
                    onPress={this._applyChangesBtnOnPress}>
                    <Text style={styles.filterButtonModalText}>{'Applica'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.filterButtonModal}
                    onPress={this._closeModalBtnOnPress}>
                    <Text style={styles.filterButtonModalText}>{'Annulla'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
        </Modal>
      )
  }

  _renderDateItem = (date, item) => {
    var dateObj, month;
    if(date) {
      dateObj = new Date(date.dateString);
      var dayOfWeek = dateObj.getDay();
      var dayString = LocaleConfig.locales[this.props.locale.lan].dayNamesShort[dayOfWeek];
    }
    return(
    <View style={styles.dateListItemIndicator}>
      {date && (
        <View style={{alignItems: "flex-end"}}>
          <Text style={styles.dayListItemIndicator}>{date.day}</Text>
          <Text style={styles.dayStringListItemIndicator}>{dayString.toUpperCase()}</Text>
          <Text style={styles.monthYearListItemIndicator}>{date.month}/{date.year}</Text>
        </View>
      )}
    </View>)
  }

  _renderCalendar = () => {
    const { open } = this.props.locale.messages;
    const { selectedDay } = this.state;
    return (
      <Agenda
        items={this.props.events}
        style={{
          backgroundColor: Colors.colorEventsScreen
        }}
        theme={{
          backgroundColor: Colors.colorEventsScreen,
          calendarBackground: Colors.colorEventsScreen,
          agendaDayNumColor: "white",
          agendaTodayColor: "white",
          agendaDayTextColor: "white",
          selectedDayBackgroundColor: "white",
          selectedDayTextColor: Colors.colorEventsScreen,
          dayTextColor: "white",
          monthTextColor: "white",
          color: "white",
          textSectionTitleColor: "white",
          textMonthFontWeight: "bold",
          textDisabledColor: "#ECECEC",
          todayTextColor: "white",
          dotColor: "white" 
        }}
        loadItemsForMonth={(month) => this._loadItemsForMonth(month.dateString)}
        onDayChange={(day)=> this.setState({ selectedDay: day })}
        selected={selectedDay}
        renderItem={(item, firstItemInDay) => this._renderCalendarItem(item, firstItemInDay)}
        renderEmptyDate={() => this._renderEmptyDate()}
        renderKnob={() => {return (
          <TouchableOpacity 
            activeOpacity={0.8}
            style={styles.knobContainer}>
            <Text style={styles.knobText}>{open}</Text>
          </TouchableOpacity>
        )}}
        rowHasChanged={(r1, r2) => {return r1.text !== r2.text}}
      />
    )
  }


  render() {
    const { lan } = this.props.locale;
    LocaleConfig.defaultLocale = lan;
    const { filterBy } = this.props.locale.messages;
    return (
      <View style={styles.fill}>
        <ConnectedHeader
          iconTintColor={Colors.colorEventsScreen}
          containerStyle={{
            paddingTop: 0,
            height: Layout.header.height + 20,
            backgroundColor: "white",
            marginTop: Layout.statusbarHeight
          }}
          style={{
            backgroundColor: "white",
            height: 51,
            width: "100%"
          }}
          buttonContainer={{
            backgroundColor: "white"
          }}/>
        <View style={styles.container}>
          {this._renderCalendar()}
          <View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.filterButton}
              onPress={this._filterBtnOnPress}>
              <Text style={styles.filterButtonText}>{filterBy}</Text>
            </TouchableOpacity>
          </View>
          {this._renderFiltersModal()}
        </View>
      </View>
    )
  }
  
}

ExperiencesEventsScreen.navigationOptions = {
  title: 'Eventi',
};


const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.colorEventsScreen
  },
  container: {
    flex: 1,
    // height: '90%',
    backgroundColor: '#D3644D',
  },
  fill: {
    flex: 1,
  },
  filtersModalView: { 
    padding: 10, 
    justifyContent: 'center', 
    flex: 1, 
    alignItems: 'center', 
    borderBottomWidth: 2, 
    borderBottomColor: Colors.tintColor 
  },
  filtersModalView1: { 
    height: '80%', 
    width: '90%', 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignSelf: 'center', 
    padding: 20,

  },
  filtersModalFiltersView: {
    flex: 1
  },
  filtersModalBottomView: {
    justifyContent: 'flex-end'
  },
  filtersApplyButton: { 
    marginBottom: 5 
  },
  item: {
    flex: 1,
    backgroundColor: Colors.colorEventsScreen
  },
  emptyDate: {
    height: 15,
    flex:1,
    paddingTop: 30,
    backgroundColor: Colors.colorEventsScreen
  },
  dateListItemIndicator: {
    paddingTop: 12,
    paddingLeft: 5,
    width: 45,
    backgroundColor: "black"
  },
  dayStringListItemIndicator: {
    fontSize: 14,
    color: "#aaaaaa",
    fontStyle: "italic"
  },
  dayListItemIndicator: {
    fontSize: 25,
    color: "#aaaaaa",
    fontStyle: "italic"
  },
  monthListItemIndicator: {
    fontSize: 18,
    color: "#aaaaaa",
    fontStyle: "italic"
  },
  monthYearListItemIndicator: {
    fontSize: 10,
    color: "#aaaaaa",
    fontStyle: "italic"
  },
  yearListItemIndicator: {
    fontSize: 15,
    color: "#aaaaaa",
    fontStyle: "italic"
  },
  filterButton: {
    position: "absolute",
    bottom: 120,
    right: 10,
    alignItems: "center",
    height: 50,
    width: 100,
    backgroundColor: "white",
    borderRadius: 50,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    textAlignVertical: "center",
    alignSelf: "center",
    color: Colors.colorEventsScreen,
    height: 50,
    textAlign: "center"
  },
  filterButtonModal: {
    backgroundColor: Colors.colorEventsScreen,
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 20,
    marginBottom: 5,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonModalText: {
    textAlignVertical: "center",
    alignSelf: "center",
    color: "white",
    fontWeight: "bold",
    height: 50,
    textAlign: "center"
  },
  knobContainer: {
    backgroundColor: Colors.colorEventsScreen,
    width: Layout.window.width,
    borderBottomColor: "white",
    borderBottomWidth: 2
  },
  knobText: {
    color: "white",
    textAlign: "center",
    alignSelf: "center",
    height: "100%",
  }
});

function ExperiencesScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <ExperiencesEventsScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}

const mapStateToProps = state => {
  return {
      events: state.graphqlState.events,
      eventsError: state.graphqlState.eventsError,
      eventsLoading: state.graphqlState.eventsLoading,
      eventsMonthsStatuses: state.graphqlState.eventsMonthsStatuses,
      eventsTimeMin: state.graphqlState.eventsTimeMin,
      eventsTimeMax: state.graphqlState.eventsTimeMax,
      eventTypes: state.graphqlState.eventTypes,
      eventTypesError: state.graphqlState.eventTypesError,
      eventTypesLoading: state.graphqlState.eventTypesLoading,
      locale: state.localeState,
  };
};

const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...graphqlActions, ...restActions, ...localeActions}, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(ExperiencesScreenContainer)

