import * as Constants from '../constants';

export function switchSearchOrAutocomplete(payload) {
  return {
    type: Constants.SWITCH_SEARCH_OR_AUTOCOMPLETE,
    payload
  };
}

export function setSearchOrAutocomplete(payload) {
  return {
    type: Constants.SET_SEARCH_OR_AUTOCOMPLETE,
    payload
  };
}

export function resetSearchAndAutocompleteStr() {
  return {
    type: Constants.RESET_SEARCH_AND_AUTOCOMPLETE_STR,
  };
}
