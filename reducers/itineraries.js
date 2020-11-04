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
      return { 
        ...state, 
        success: true,
        data: [ ...state.data, ...action.payload.data ],
        dataById: { ...state.dataById, ...action.payload.dataById },
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
      }; 
    default:
      return state;
  }
}