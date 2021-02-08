import * as Constants from '../constants';

const INITIAL_STATE = {

};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    //FAVOURITES
    case Constants.INIT_FAVOURITES:
      return action.payload;
    case Constants.TOGGLE_FAVOURITE:
      return { ...state, [action.payload.uuid]: action.payload.val }
    default:
      return state;
  }
}