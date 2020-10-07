import * as Constants from '../constants';

export function toggleFavourite(payload) {
  return {
    type: Constants.TOGGLE_FAVOURITE,
    payload
  };
}


