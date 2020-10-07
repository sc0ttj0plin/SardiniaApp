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
  events: {},
  eventsSuccess: false, 
  eventsFiltersByType: {},
  eventsMonthsStatuses: {},
  eventsError: null,
  eventsLoading: false,
  timeMin: null,
  timeMax: null,
  //eventsById
  eventsById: {},
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
      return {
        ...state,
        //NOTE: also updated by GET_EVENTS_SUCCESS to store events from another action
        eventsById: {...state.eventsById, ...action.payload},
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
      //calendar wants empty array [] if no event for a date, so what we do?
      //we create as many empty arrays as the days between the smallest date (timeMinMin) and greatest (timeMaxMax)!
      let timeMinMin = !state.eventsTimeMin ? action.payload.timeMin : (moment(action.payload.timeMin).isBefore(state.eventsTimeMin) ?  action.payload.timeMin : state.eventsTimeMin);
      let timeMaxMax = !state.eventsTimeMax ? action.payload.timeMax : (moment(action.payload.timeMax).isAfter(state.eventsTimeMax) ?  action.payload.timeMax : state.eventsTimeMax);
      let newEvents = {};
      if (_.isEqual(state.eventsFiltersByType, action.payload.filtersByType)) {
        //aggregate events
        newEvents = {...state.events, ...action.payload.events};
      } else {
        //reset all the events
        newEvents = action.payload.events;
      }
      //iterate over the days and add empty arrays as needed
      for (let m = moment(timeMinMin); m.isBefore(timeMaxMax); m.add(1, 'days')) {
        let date = m.format(Constants.DATE_FORMAT);
        if (!newEvents[date])
          newEvents[date] = [];
      }
      //NOTE: edits also eventsById state to store loaded events by id
      return { 
        ...state, 
        eventsSuccess: true,
        events: newEvents, 
        eventsById: { ...state.eventsById, ...action.payload.eventsById },
        eventsError: null, 
        eventsLoading: false,
        eventsFiltersByType: action.payload.filtersByType,
        eventsTimeMin: timeMinMin,
        eventsTimeMax: timeMaxMax,
      };
    case Constants.GET_EVENTS_FAIL:
      return { 
        ...state, 
        eventsSuccess: false,
        eventsLoading: false, 
        eventsError: 'Error while fetching events',
      };
    case Constants.RESET_EVENTS:
      const { events, eventsSuccess, eventsMonthsStatuses, eventsError, eventsLoading } = INITIAL_STATE
      return { 
        ...state, 
        events, 
        eventsSuccess,
        eventsMonthsStatuses, 
        eventsError, 
        eventsLoading 
      };
    // case Constants.FILTER_EVENTS:
    //   //Edits all the events "show" variables
    //   let newEventsFiltered = state.events;
    //   for (let key in newEventsFiltered) {
    //     let eventsByDate = newEventsFiltered[key];
    //     for (let idx in eventsByDate) {
    //       let event = eventsByDate[idx];
    //       event.show = action.ids[event.term.id] || true;
    //     }
    //   }
    //   return { ...state, events: newEventsFiltered };
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

