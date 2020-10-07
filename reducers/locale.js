import * as Constants from '../constants';
import dict from '../constants/Localization';

const INITIAL_STATE = {
  lan: Constants.DEFAULT_LANGUAGE, //Localization.locale, (to use expo)
  messages: dict[Constants.DEFAULT_LANGUAGE], 
}

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case Constants.CHANGE_LOCALE:
      return { 
        ...state, 
        lan: action.payload,
        messages: dict[action.payload]
      };
    default:
      return state;
  }
}