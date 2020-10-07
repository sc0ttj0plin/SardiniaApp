import * as Constants from '../constants';

export function getItineraries(query, props) {
  return {
    type: Constants.GET_ITINERARIES,
    query: query,
    ...props
  };
}