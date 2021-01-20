import * as Constants from '../constants';

export function autocomplete(query, lan) {
  return {
    type: Constants.AUTOCOMPLETE,
    query: query,
    lan: lan
  };
}

export function search(query, lan) {
  return {
    type: Constants.SEARCH,
    query: query,
    lan: lan
  };
}

export function resetSearchAndAutocompleteResults() {
  return {
    type: Constants.RESET_SEARCH_AND_AUTOCOMPLETE_RESULTS,
  }
}