import * as Constants from '../constants';
import _ from 'lodash';

/**
 * Categories for inspirers (pois)
 */
const INITIAL_STATE = {
  //categories for inspirers
  categoriesInspirers: [], 
  categoriesInspirersSuccess: true,
  categoriesInspirersMap: {}, 
  categoriesInspirersError: null, 
  categoriesInspirersLoading: false
}

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case Constants.GET_CATEGORIES_INSPIRERS:
      return { 
        ...state,
        categoriesInspirersSuccess: false,
        categoriesInspirersError: null, 
        categoriesInspirersLoading: true 
      };
    case Constants.GET_CATEGORIES_INSPIRERS_SUCCESS:
      return { 
        ...state, 
        categoriesInspirersSuccess: true,
        categoriesInspirersError: null, 
        categoriesInspirers: action.payload.terms, 
        categoriesInspirersMap: action.payload.termsMap, 
        categoriesInspirersLoading: false
      };
    case Constants.GET_CATEGORIES_INSPIRERS_FAIL:
      return { 
        ...state, 
        categoriesInspirersSuccess: false,
        categoriesInspirersLoading: false, 
        categoriesInspirersError: 'Error while fetching categories' 
      };
    default:
      return state;
    }
  }