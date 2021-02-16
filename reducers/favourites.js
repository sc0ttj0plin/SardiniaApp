import * as Constants from '../constants';

export const INITIAL_STATE = {
  lastSynced: 0,
  places: {},
  accomodations: {},
  events: {},
  itineraries: {},
  inspirers: {},
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    //FAVOURITES
    case Constants.INIT_FAVOURITES:
      return action.payload;
    case Constants.TOGGLE_FAVOURITE:
      const favObj = { [action.payload.uuid]: action.payload.val };
      let newState = { 
        ...state, 
        lastSynced: action.payload.lastSynced,
        [action.payload.type]: { 
          ...state[action.payload.type], 
          ...favObj 
        } 
      }
      return newState;
      // return { ...state, [action.payload.uuid]: action.payload.val }
    default:
      return state;
  }
}