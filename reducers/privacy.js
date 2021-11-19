import * as Constants from '../constants';

export const INITIAL_STATE = {
  privacyValue: true,
  lastSynced:0,
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case Constants.INIT_PRIVACY:
      return action.payload;
    case Constants.TOGGLE_PRIVACY:
      const setObj = action.payload.val ;
      let newState = { 
        ...state, 
        lastSynced: action.payload.lastSynced,
        privacyValue: setObj
      }
      return newState;
    default:
      return state;
  }
}