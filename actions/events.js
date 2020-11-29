import * as Constants from '../constants';

export function getEvents(query, ubLb, props) {
  return {
    type: Constants.GET_EVENTS,
    query: query,
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

export function setSelectedEventTypes(types, props) {
  return {
    type: Constants.SET_SELECTED_EVENT_TYPES,
    types,
    ...props
  };
}

