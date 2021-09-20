import * as Constants from '../constants';

const INITIAL_STATE = {
  //terms
  placeTypes: [],
  placeTypesSuccess: false,
  placeTypesError: null,
  placeTypesLoading: false,
  selectedPlaceTypes: [],
}

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    // PLACE TYPES
    case Constants.GET_PLACE_TYPES:
      return {
        ...state,
        placeTypesSuccess: false,
        placeTypesError: null,
        placeTypesLoading: true
      };
    case Constants.GET_PLACE_TYPES_SUCCESS:
      return {
        ...state,
        placeTypesSuccess: true,
        placeTypes: action.payload.placeTypes,
        placeTypesError: null,
        placeTypesLoading: false
      };
    case Constants.GET_PLACE_TYPES_FAIL:
      return {
        ...state,
        placeTypesSuccess: false,
        placeTypesLoading: false,
        placeTypesError: 'Error while fetching itineraryTypes',
      };
    case Constants.SET_SELECTED_PLACE_TYPES:
      return {
        ...state,
        selectedPlaceTypes: action.types
      };
    default:
      return state;
  }
}
