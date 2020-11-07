import * as Constants from '../constants';
import moment from 'moment';
import _ from 'lodash';

/**
 * Inspirers are a generic term used to identify events, itineraries and articles
 */
const INITIAL_STATE = {
  data: [],
  dataById: {},
  success: false,
  error: null,
  loading: false,
}

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case Constants.GET_INSPIRERS: 
    case Constants.GET_INSPIRERS_BY_ID: 
      return { 
        ...state, 
        success: false,
        error: null,
        loading: true,
      };
    case Constants.GET_INSPIRERS_SUCCESS:
    case Constants.GET_INSPIRERS_BY_ID_SUCCESS:
      let dataById = { ...state.dataById, ...action.payload.dataById };
      return { 
        ...state, 
        data: Object.values(dataById),
        dataById, 
        success: true,
        error: null,
        loading: false,
      };
    case Constants.GET_INSPIRERS_FAIL:
    case Constants.GET_INSPIRERS_BY_ID_FAIL:
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