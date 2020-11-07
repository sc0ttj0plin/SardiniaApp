import * as Constants from '../constants';
import _ from 'lodash';

/**
 * Categories for inspirers (pois)
 */
const INITIAL_STATE = {
  //categories
  data: {}, /* data is keyed by vid (e.g. places: 36, inspirers: 46) */
  success: false, 
  map: {}, /* map are terms keyed by uuid */
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
      // console.log("CATEGORIES", action.payload, "END CATEGORIES");
      return { 
        ...state, 
        success: true,
        error: null, 
        data: {...state.data, ...action.payload.terms}, /* e.g. { 36: [ {name: "xxx", uuid: ...} ], 46: [ ... ] } */
        map: {...state.map, ...action.payload.termsMap}, /* e.g. { "2c217b84-6ab6-4702-a88b-c560970f1d3d": {"name": "Archeologia e Arte", ...} ...} */
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