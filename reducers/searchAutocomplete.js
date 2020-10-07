import * as Constants from '../constants';
import moment from 'moment';
import _ from 'lodash';

/**
 * Search and autocomplete state, the former contains search results with actual data embedded into them (inspirers, pois, ...)
 *  the latter is just an array of strings that match user's input
 */
const INITIAL_STATE = {
  //search
  search: [],
  searchSuccess: false, 
  searchError: null,
  searchLoading: false,
  //autocomplete
  autocomplete: [],
  autocompleteSuccess: false, 
  autocompleteError: null,
  autocompleteLoading: false,
}


export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
   // SEARCH (note: resets the search prop to prevent old queries to be shown)
    case Constants.SEARCH:
      return { 
        ...state, 
        searchSuccess: false,
        search: INITIAL_STATE.search, 
        searchError: null, 
        searchLoading: true 
      };
    case Constants.SEARCH_SUCCESS:
      return { 
        ...state, 
        searchSuccess: true,
        search: action.payload.search, 
        searchError: null, 
        searchLoading: false
      };
    case Constants.SEARCH_FAIL:
      return { 
        ...state, 
        searchSuccess: false,
        searchLoading: false, 
        searchError: 'Error while fetching search result',
      }; 
   // AUTOCOMPLETE 
    case Constants.AUTOCOMPLETE:
      return { 
        ...state, 
        autocompleteSuccess: false,
        autocompleteError: null, 
        autocompleteLoading: true 
      };
    case Constants.AUTOCOMPLETE_SUCCESS:
      return { 
        ...state, 
        autocompleteSuccess: true,
        autocomplete: action.payload.autocomplete, 
        autocompleteError: null, 
        autocompleteLoading: false
      };
    case Constants.AUTOCOMPLETE_FAIL:
      return { 
        ...state, 
        autocompleteSuccess: false,
        autocompleteLoading: false, 
        autocompleteError: 'Error while fetching search result',
      }; 
    // AUTOCOMPLETE + SEARCH
    case Constants.RESET_SEARCH_AND_AUTOCOMPLETE_RESULTS: 
      return {
        ...state,
        searchSuccess: INITIAL_STATE.searchSuccess,
        search: INITIAL_STATE.search,
        searchError: INITIAL_STATE.searchError,
        searchLoading: INITIAL_STATE.searchLoading,
        autocompleteSuccess: INITIAL_STATE.autocompleteSuccess,
        autocomplete: INITIAL_STATE.autocomplete,
        autocompleteError: INITIAL_STATE.autocompleteError,
        autocompleteLoading: INITIAL_STATE.autocompleteLoading,
      }
    default:
      return state;
  }
}