import * as Constants from '../constants';

export function getEvents(query, filtersByType, ubLb, props) {
  return {
    type: Constants.GET_EVENTS,
    query: query,
    filtersByType,
    ubLb,
    ...props
  };
}

export function getEventsById(query, props) {
  return {
    type: Constants.GET_EVENTS_BY_ID,
    query: query,
    ...props
  };
}

export function resetEvents(query, props) {
  return {
    type: Constants.RESET_EVENTS,
    ...props
  };
}

export function getEventTypes(query, props) {
  return {
    type: Constants.GET_EVENT_TYPES,
    query: query,
    ...props
  };
}