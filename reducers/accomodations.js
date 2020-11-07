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
    case Constants.GET_ACCOMODATIONS: 
    case Constants.GET_ACCOMODATIONS_BY_ID: 
      return { 
        ...state, 
        success: false,
        error: null,
        loading: true,
      };
    case Constants.GET_ACCOMODATIONS_SUCCESS:
    case Constants.GET_ACCOMODATIONS_BY_ID_SUCCESS:
      return { 
        ...state, 
        data: [ ...state.data, ...action.payload.data ],
        dataById: { ...state.dataById, ...action.payload.dataById }, 
        success: true,
        error: null,
        loading: false,
      };
    case Constants.GET_ACCOMODATIONS_FAIL:
    case Constants.GET_ACCOMODATIONS_BY_ID_FAIL:
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