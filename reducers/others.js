import * as Constants from '../constants';

const INITIAL_STATE = {
  searchOrAutocomplete: "autocomplete",
  searchStr: "",
  url: null,
  urlType: null,
  mainScreenDidMount: false,
  mainScreenIsShown: false,
  placesTerms: [],
  inspirersTerms: [],
  accomodationsTerms: [],
  currentMapEntity: null,
  mapIsDragging: {},
  geolocation: {},
  geolocationSource: null,
  checkForUpdates: true, // see notes in reducer.
  networkStatus: {},
  navigatorReady: false,
  //global redux error
  reduxError: null, //the error object
  reduxErrorSourceAction: null, //the action that caused the error (retry)
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
      console.log("Setting urls", action.payload)
      return { 
        ...state, 
        url: action.payload.url,
        urlType: action.payload.type 
      };
    // DRAGGING
    case Constants.MAP_SET_DRAGGING:
      return { 
        ...state, 
        mapIsDragging: { ...state.mapIsDragging, [action.payload.id]: action.payload.val }, 
      };
    // GEOLOCATION 
    case Constants.SET_GEOLOCATION:
      return {
        ...state,
        geolocation: action.payload.geolocation,
        geolocationSource: action.payload.source,
      }
    // CHECK FOR UDPATES
    // NOTE: OTA updates are checked initially and randomly during app execution (see didMount)
    //       however the actual check is performed with a probability of p. ConnectedUpdateHandler performs actual update and restart
    case Constants.CHECK_FOR_UPDATES:
      const prob = Constants.CHECK_FOR_UPDATES_WHILE_FOREGROUNDED_PROB;
      if (Math.random() <= prob) {
        console.log('Update check triggered with probability', 1-prob);
        return {
          ...state,
          checkForUpdates: !state.checkForUpdates
        }
      }
      else 
        return state;
    case Constants.SET_NETWORK_STATUS:
      return {
        ...state,
        networkStatus: action.payload
      }
    case Constants.SET_NAVIGATOR_READY:
      return {
        ...state,
        navigatorReady: action.payload
      }
    case Constants.SET_MAIN_SCREEN_MOUNTED:
      return {
        ...state,
        mainScreenDidMount: action.payload
      }
    case Constants.SET_MAIN_SCREEN_SHOWN:
      return {
        ...state,
        mainScreenIsShown: action.payload
      }
    case Constants.SET_ERROR:
      return {
        ...state,
        reduxError: action.payload.error,
        reduxErrorSourceAction: action.payload.sourceAction
      }
    case Constants.UNSET_ERROR: 
      return {
        ...state,
        reduxError: null,
        reduxErrorSourceAction: null,
      }
    default:
      return state;
  }
}