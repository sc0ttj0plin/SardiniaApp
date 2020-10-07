import * as Constants from '../constants';

const INITIAL_STATE = {
  searchOrAutocomplete: "autocomplete",
  searchStr: "",
}


export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    //SEARCH AND AUTOCOMPLETE
    case Constants.SWITCH_SEARCH_OR_AUTOCOMPLETE:
      return { 
        ...state, 
        searchOrAutocomplete: action.payload
      };
    case Constants.SET_SEARCH_OR_AUTOCOMPLETE:
      return { 
        ...state, 
        searchStr: action.payload
      };
    //  note: this resets the querystring, to reset the results we use resetSearchAndAutocompleteResults in graphql actions
    case Constants.RESET_SEARCH_AND_AUTOCOMPLETE_STR:
      return {
        ...state,
        searchStr: INITIAL_STATE.searchStr,
      }
    default:
      return state;
  }
}