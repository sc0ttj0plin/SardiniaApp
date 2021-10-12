import * as Constants from '../constants';

export const INITIAL_STATE = {
  privacy: {},
};

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {

    case Constants.INIT_PRIVACY:
      return action.payload;
    case Constants.TOGGLE_PRIVACY:
      const privacyObj = { [action.payload.uuid]: action.payload.val };
      let newState = { 
        ...state, 
        lastSynced: action.payload.lastSynced,
        [action.payload.type]: { 
          ...state[action.payload.type], 
          ...privacyObj 
        } 
      }
      return newState;
      // return { ...state, [action.payload.uuid]: action.payload.val }
    default:
      return state;
  }
}