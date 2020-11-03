import * as Constants from '../constants';

const INITIAL_STATE = {
  searchOrAutocomplete: "autocomplete",
  searchStr: "",
  placesTerms: [],
  inspirersTerms: [],
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
    //PLACES CATEGORIES (POP/PUSH) (scoped case to reuse var names)
    case Constants.PUSH_CURRENT_CATEGORY_PLACES: {
      let newplacesTerms = [...state.placesTerms];
      newplacesTerms.push(action.payload);
      return {
        ...state,
        placesTerms: newplacesTerms,
      }
    } case Constants.POP_CURRENT_CATEGORY_PLACES: {
      let newplacesTerms = [...state.placesTerms];
      newplacesTerms.pop();
      return {
        ...state,
        placesTerms: newplacesTerms,
      }
    } case Constants.RESET_CURRENT_CATEGORY_PLACES:
      return {
        ...state,
        placesTerms: INITIAL_STATE.placesTerms
      }
    //INSPIRERS CATEGORIES (POP/PUSH) (scoped case to reuse var names)
    case Constants.PUSH_CURRENT_CATEGORY_INSPIRERS: {
      let newInspirersTerms = [...state.inspirersTerms];
      newInspirersTerms.push(action.payload);
      return {
        ...state,
        inspirersTerms: newInspirersTerms,
      }
    } case Constants.POP_CURRENT_CATEGORY_INSPIRERS: {
      let newInspirersTerms = [...state.inspirersTerms];
      newInspirersTerms.pop();
      return {
        ...state,
        inspirersTerms: newInspirersTerms,
      }
    } case Constants.RESET_CURRENT_CATEGORY_INSPIRERS:
      return {
        ...state,
        inspirersTerms: INITIAL_STATE.inspirersTerms
      }
    default:
      return state;
  }
}