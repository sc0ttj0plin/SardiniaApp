import * as Constants from '../constants';
import _ from 'lodash';

/**
 * Categories for inspirers (pois)
 */
const INITIAL_STATE = {
  //categories
  data: {}, /* data is keyed by vid (e.g. places: 36, inspirers: 46) */
  // names: {},
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
      // const names = {[action.payload.vid]: action.payload.terms[action.payload.vid].map(el => el.name)};
      return { 
        ...state, 
        success: true,
        error: null, 
        data: {...state.data, ...action.payload.terms}, /* hierarchy is preserved e.g. { 36: [ {name: "Archeologia e Arte", uuid: ...} ], 46: [ ... ] } */
        map: {...state.map, ...action.payload.termsMap}, /* hierarchy is not preserved e.g. { "2c217b84-6ab6-4702-a88b-c560970f1d3d": {"name": "Archeologia e Arte", ...} ...} */
        // names: {...state.names, ...names}, /* e.g. { 36: [ "Archeologia e Arte", "Isole nell'isola", "Città e Borghi", "Natura", "Mare",] } */
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