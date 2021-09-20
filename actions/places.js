import * as Constants from '../constants';

export function getPlaceTypes(query, props) {
  return {
    type: Constants.GET_PLACE_TYPES,
    query: query,
    ...props
  };
}
