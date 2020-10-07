import * as Constants from '../constants';

export function autocomplete(query) {
  return {
    type: Constants.AUTOCOMPLETE,
    query: query
  };
}

export function search(query) {
  return {
    type: Constants.SEARCH,
    query: query
  };
}

export function resetSearchAndAutocompleteResults() {
  return {
    type: Constants.RESET_SEARCH_AND_AUTOCOMPLETE_RESULTS,
  }
}