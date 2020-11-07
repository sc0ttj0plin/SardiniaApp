import * as Constants from '../constants';
import moment from 'moment';
import _ from 'lodash';

/**
 * events: Calendar events key'd by date (used in the calendar screen)
 * eventsById: events key'd by their uuid (used in favourite screen)
 * eventTypes: types of events
 */
const INITIAL_STATE = {
  //events
  eventsSuccess: false, 
  eventsError: null,
  eventsLoading: false,
  eventsById: {},
  eventsByYearMonth: {},
  eventsByYearMonthDay: {},
  eventsCalendarMarkers: {},
  /* { YYYY-MM-DD: {markerStyle} }, init with today */
  eventsCalendarMarkers: { 
    [moment().format(Constants.DATE_FORMAT)]: Constants.SCREENS.events.calendar.todayMarkerDefaultConf 
  },
  eventsFiltersByType: {},
  eventsMonthsStatuses: {},
  // timeMin: null,
  // timeMax: null,
  //eventsById
  eventsByIdSuccess: false, 
  eventsByIdError: null,
  eventsByIdLoading: false,
  //terms
  eventTypes: [],
  eventTypesSuccess: false, 
  eventTypesError: null,
  eventTypesLoading: false,
}


export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    //EVENTS BY ID
    case Constants.GET_EVENTS_BY_ID:
      return {
        ...state,
        eventsByIdSuccess: false, 
        eventsByIdError: null,
        eventsByIdLoading: true,
      };
    case Constants.GET_EVENTS_BY_ID_SUCCESS:
      // console.log("EvetsBYID SUCCESS", action.payload)
      return {
        ...state,
        //NOTE: also updated by GET_EVENTS_SUCCESS to store events from another action
        eventsById: { ...state.eventsById, ...action.payload },
        eventsByIdSuccess: true, 
        eventsByIdError: null,
        eventsByIdLoading: false,
      }
    case Constants.GET_EVENTS_BY_ID_FAIL:
      return {
        ...state,
        eventsByIdSuccess: false, 
        eventsByIdError: "Error while fetching events",
        eventsByIdLoading: false,
      };
    //EVENTS BY TIME
    case Constants.GET_EVENTS:
      return { 
        ...state, 
        eventsSuccess: false,
        eventsError: null, 
        eventsLoading: true 
      };
    case Constants.GET_EVENTS_SUCCESS:
      // action.payload.events data format: [{"title", "description", "date1" (unix epoch), "date2" (unix epoch), "uuid", "nid", "term", "image", "language", "abstract", "itinerary", "url_alias", "__typename"}, ...]
      //[Agenda only]: calendar wants empty array [] if no event for a date, so what we do?
      //we create as many empty arrays as the days between the smallest date (timeMinMin) and greatest (timeMaxMax)!
      //let timeMinMin = !state.eventsTimeMin ? action.payload.timeMin : (moment(action.payload.timeMin).isBefore(state.eventsTimeMin) ?  action.payload.timeMin : state.eventsTimeMin);
      //let timeMaxMax = !state.eventsTimeMax ? action.payload.timeMax : (moment(action.payload.timeMax).isAfter(state.eventsTimeMax) ?  action.payload.timeMax : state.eventsTimeMax);
      
      // By uuid format ({uuid: {event}, ...})
      // By YYYY-MM-DD format && YYYY-MM format (for quick calendar access (year-month))
      // Markers for calendar
      let eventsById = {} 
      let eventsByYearMonth = {};
      let eventsByYearMonthDay = {};
      let eventsCalendarMarkers = {};
      console.log("events", action.payload.events.length)
      action.payload.events.forEach((event) => { 
        const eventDate = moment.unix(event.date1).add(1,"year");
        // let dateFormatted = moment.unix(e.date1).format(Constants.DATE_FORMAT); //TODO: temporary fix to show events
        let eventYearMonthDay = eventDate.format(Constants.DATE_FORMAT);
        let eventYearMonth = eventYearMonthDay.substr(0, eventYearMonthDay.lastIndexOf(Constants.DATE_SEP));
        event.date1render = eventDate.format(Constants.DATE_FORMAT_RENDER);
        eventsById[event.uuid] = event;
        eventsByYearMonth[eventYearMonth] = eventsByYearMonth[eventYearMonth] || [];
        eventsByYearMonthDay[eventYearMonthDay] = eventsByYearMonthDay[eventYearMonthDay] || [];
        eventsByYearMonth[eventYearMonth].push(event)
        eventsByYearMonthDay[eventYearMonthDay].push(event);
        eventsCalendarMarkers[eventYearMonthDay] = Constants.SCREENS.events.calendar.markedDatesDefaultConf;
      });
      
      let newEventsById = { ...state.eventsById, ...eventsById };
      let newEventsByYearMonth = { ...state.eventsByYearMonth, ...eventsByYearMonth };
      let newEventsByYearMonthDay = { ...state.eventsByYearMonthDay, ...eventsByYearMonthDay };
      let newEventsCalendarMarkers = { ...state.eventsCalendarMarkers,  ...eventsCalendarMarkers };

      return { 
        ...state, 
        eventsCalendarMarkers,
        eventsById: newEventsById,
        eventsByYearMonth: newEventsByYearMonth,
        eventsByYearMonthDay: newEventsByYearMonthDay,
        eventsCalendarMarkers: newEventsCalendarMarkers,
        eventsSuccess: true,
        eventsError: null, 
        eventsLoading: false,
        eventsFiltersByType: action.payload.filtersByType,
        //eventsTimeMin: timeMinMin,
        //eventsTimeMax: timeMaxMax,
      };
    case Constants.GET_EVENTS_FAIL:
      return { 
        ...state, 
        eventsSuccess: false,
        eventsLoading: false, 
        eventsError: 'Error while fetching events',
      };
    case Constants.RESET_EVENTS:
      return INITIAL_STATE;
    // EVENT TYPES
    case Constants.GET_EVENT_TYPES:
      return { 
        ...state, 
        eventTypesSuccess: false,
        eventTypesError: null, 
        eventTypesLoading: true 
      };
    case Constants.GET_EVENT_TYPES_SUCCESS:
      return { 
        ...state, 
        eventTypesSuccess: true,
        eventTypes: action.payload.eventTypes, 
        eventTypesError: null, 
        eventTypesLoading: false
      };
    case Constants.GET_EVENT_TYPES_FAIL:
      return { 
        ...state, 
        eventTypesSuccess: false,
        eventTypesLoading: false, 
        eventTypesError: 'Error while fetching eventTypes',
      };
    default:
      return state;
  }
}

