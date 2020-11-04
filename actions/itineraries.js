import * as Constants from '../constants';

export function getItineraries(query, props) {
  return {
    type: Constants.GET_ITINERARIES,
    query: query,
    ...props
  };
}

export function getItinerariesById(query, props) {
  return {
    type: Constants.GET_ITINERARIES_BY_ID,
    query: query,
    ...props
  };
}

