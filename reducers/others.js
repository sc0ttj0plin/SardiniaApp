import * as Constants from '../constants';

const INITIAL_STATE = {
  searchOrAutocomplete: "autocomplete",
  searchStr: "",
  placesTerms: [],
  inspirersTerms: [],
  accomodationsTerms: [],
  currentMapEntity: null,
  mapIsDragging: {},
  scrollableSnapIndex: {},
  scrollablePressIn: {},
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
    //ACCOMODATIONS CATEGORIES (POP/PUSH) (scoped case to reuse var names)
    case Constants.PUSH_CURRENT_CATEGORY_ACCOMODATIONS: {
      let newAccomodationsTerms = [...state.accomodationsTerms];
      newAccomodationsTerms.push(action.payload);
      return {
        ...state,
        accomodationsTerms: newAccomodationsTerms,
      }
    } case Constants.POP_CURRENT_CATEGORY_ACCOMODATIONS: {
      let newAccomodationsTerms = [...state.accomodationsTerms];
      newAccomodationsTerms.pop();
      return {
        ...state,
        accomodationsTerms: newAccomodationsTerms,
      }
    } case Constants.RESET_CURRENT_CATEGORY_ACCOMODATIONS:
      return {
        ...state,
        accomodationsTerms: INITIAL_STATE.accomodationsTerms
      }
    // MAP POI PRESS     
    case Constants.SET_CURRENT_MAP_ENTITY:
      return { 
        ...state, 
        currentMapEntity: action.payload
      };
    // SET LINKING URL (LINKING)
    case Constants.SET_URL:
      console.log("Set link", action.payload);
      return { 
        ...state, 
        url: action.payload, 
      };
    // DRAGGING
    case Constants.MAP_SET_DRAGGING:
      return { 
        ...state, 
        mapIsDragging: { ...state.mapIsDragging, [action.payload.id]: action.payload.val }, 
      };
    // SNAP INDEX
    case Constants.SCROLLABLE_SET_SCROLLINDEX:
      return { 
        ...state, 
        scrollableSnapIndex: { ...state.scrollableSnapIndex, [action.payload.id]: action.payload.val }, 
      };
    // SNAP INDEX
    case Constants.SCROLLABLE_SET_PRESSIN:
      return { 
        ...state, 
        scrollablePressIn: { ...state.scrollablePressIn, [action.payload.id]: action.payload.val }, 
      };
    default:
      return state;
  }
}