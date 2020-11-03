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

export function pushCurrentCategoryPlaces(term) {
  return {
    type: Constants.PUSH_CURRENT_CATEGORY_PLACES,
    payload: term
  }
}

export function popCurrentCategoryPlaces() {
  return {
    type: Constants.POP_CURRENT_CATEGORY_PLACES
  }
}

export function resetCurrentCategoryPlaces() {
  return {
    type: Constants.RESET_CURRENT_CATEGORY_PLACES
  }
}

export function pushCurrentCategoryInspirers(term) {
  return {
    type: Constants.PUSH_CURRENT_CATEGORY_INSPIRERS,
    payload: term
  }
}

export function popCurrentCategoryInspirers() {
  return {
    type: Constants.POP_CURRENT_CATEGORY_INSPIRERS
  }
}

export function resetCurrentCategoryInspirers() {
  return {
    type: Constants.RESET_CURRENT_CATEGORY_INSPIRERS
  }
}