import * as Constants from '../constants';
import _ from 'lodash';

/**
 * Categories for inspirers (pois)
 */
const INITIAL_STATE = {
  //categories
  data: [],
  success: false, 
  map: {},
  error: null,
  loading: false,
}

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case Constants.GET_CATEGORIES:
      return { 
        ...state, 
        success: false,
        error: null, 
        loading: true 
      };
    case Constants.GET_CATEGORIES_SUCCESS:
      return { 
        ...state, 
        success: true,
        error: null, 
        data: action.payload.terms, 
        map: action.payload.termsMap, 
        loading: false
      };
    case Constants.GET_CATEGORIES_FAIL:
      return { 
        ...state, 
        success: false,
        loading: false, 
        error: 'Error while fetching categories' 
      };
    default:
      return state;
    }
  }