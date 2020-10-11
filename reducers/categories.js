import * as Constants from '../constants';
import _ from 'lodash';

/**
 * Categories for inspirers (pois)
 */
const INITIAL_STATE = {
  //categories
  data: {}, /** data is keyed by vid (e.g. places: 36, inspirers: 46) */
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
      console.log(action.payload)
      return { 
        ...state, 
        success: true,
        error: null, 
        data: {...state.data, ...action.payload.terms}, /* e.g. { 36: { ... }, 46: { ... } } */
        map: {...state.map, ...action.payload.termsMap},
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