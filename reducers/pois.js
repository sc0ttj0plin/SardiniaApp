import * as Constants from '../constants';
import _ from 'lodash';

/**
 * Points of interest are the actual places, used in place[s] screen, they are the leafs of the query tree 
 * Extras are pois too
 */
const INITIAL_STATE = {
  //pois
  data: {},
  success: false,
  error: null,
  loading: false,
}

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    // SINGLE POIS & MULTIPLE POIS
    case Constants.GET_EXTRAS: 
    case Constants.GET_POIS: 
    case Constants.GET_POI:
      return { 
        ...state, 
        success: false,
        error: null,
        loading: true,
      };
    case Constants.GET_EXTRAS_SUCCESS:
    case Constants.GET_POIS_SUCCESS:
    case Constants.GET_POI_SUCCESS:
      //action.payload is an object keyed by the poi's uuid: e.g. cd07df75-9870-41dd-8bd6-5884403f9302: {...}
      return { 
        ...state, 
        data: { ...state.data, ...action.payload }, 
        success: true,
        error: null,
        loading: false,
      };
    case Constants.GET_EXTRAS_FAIL:
    case Constants.GET_POIS_FAIL:
    case Constants.GET_POI_FAIL:
      return { 
        ...state,
        success: false,
        error: action.payload.message,
        loading: false,
      }; 
    default:
      return state;
  }
}
