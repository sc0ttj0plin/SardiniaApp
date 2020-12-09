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

//Places
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

//Inspirers
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

// Accomodations
export function pushCurrentCategoryAccomodations(term) {
  return {
    type: Constants.PUSH_CURRENT_CATEGORY_ACCOMODATIONS,
    payload: term
  }
}

export function popCurrentCategoryAccomodations() {
  return {
    type: Constants.POP_CURRENT_CATEGORY_ACCOMODATIONS
  }
}

export function resetCurrentCategoryAccomodations() {
  return {
    type: Constants.RESET_CURRENT_CATEGORY_ACCOMODATIONS
  }
}

export function setCurrentMapEntity(entity) {
  return {
    type: Constants.SET_CURRENT_MAP_ENTITY,
    payload: entity
  }
}

export const setUrl = (url) => 
  async (dispatch) => {
    dispatch({ type: Constants.SET_URL, payload: url });
  }

export const setScrollableSnapIndex = (id, val) => 
  async (dispatch) => {
    dispatch({ type: Constants.SCROLLABLE_SET_SCROLLINDEX, payload: { id, val } });
  }

export const setScrollablePressIn = (id, val) => 
  async (dispatch) => {
    dispatch({ type: Constants.SCROLLABLE_SET_PRESSIN, payload: { id, val } });
  }
 

export const setMapIsDragging = (id, val) => 
  async (dispatch) => {
    dispatch({ type: Constants.MAP_SET_DRAGGING, payload: { id, val } });
  }
 