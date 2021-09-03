import * as Constants from '../constants';
import _ from 'lodash';

/**
 * Itineraries, used in itineraries screen, are a set of ordered pois key'd by id
 */
const INITIAL_STATE = {
  //itineraries
  data: [],
  dataById: {},
  success: false, 
  error: null,
  loading: false,
  //terms
  itineraryTypes: [],
  itineraryTypesSuccess: false,
  itineraryTypesError: null,
  itineraryTypesLoading: false,
  selectedItineraryTypes: [],
}

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    // ITINERARIES
    case Constants.GET_ITINERARIES:
    case Constants.GET_ITINERARIES_BY_ID:
      return { 
        ...state, 
        success: false,
        error: null, 
        loading: true 
      };
    case Constants.GET_ITINERARIES_SUCCESS:
    case Constants.GET_ITINERARIES_BY_ID_SUCCESS:
      let dataById = { ...state.dataById, ...action.payload.dataById };
      return { 
        ...state, 
        success: true,
        data: Object.values(dataById),
        dataById,
        error: null, 
        loading: false
      };
    case Constants.GET_ITINERARIES_FAIL:
    case Constants.GET_ITINERARIES_BY_ID_FAIL:
      return { 
        ...state, 
        success: false,
        loading: false, 
        error: 'Error while fetching itineraries',
      };// ITINERARY TYPES
    case Constants.GET_ITINERARY_TYPES:
      return {
        ...state,
        itineraryTypesSuccess: false,
        itineraryTypesError: null,
        itineraryTypesLoading: true
      };
    case Constants.GET_ITINERARY_TYPES_SUCCESS:
      return {
        ...state,
        itineraryTypesSuccess: true,
        itineraryTypes: action.payload.itineraryTypes,
        itineraryTypesError: null,
        itineraryTypesLoading: false
      };
    case Constants.GET_ITINERARY_TYPES_FAIL:
      return {
        ...state,
        itineraryTypesSuccess: false,
        itineraryTypesLoading: false,
        itineraryTypesError: 'Error while fetching itineraryTypes',
      };
    case Constants.SET_SELECTED_ITINERARY_TYPES:
      return {
        ...state,
        selectedItineraryTypes: action.types
      };
    default:
      return state;
  }
}