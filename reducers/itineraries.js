import * as Constants from '../constants';
import _ from 'lodash';

/**
 * Itineraries, used in itineraries screen, are a set of ordered pois key'd by id
 */
const INITIAL_STATE = {
  //itineraries
  data: {},
  success: false, 
  error: null,
  loading: false,
}

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    // ITINERARIES
    case Constants.GET_ITINERARIES:
      return { 
        ...state, 
        success: false,
        error: null, 
        loading: true 
      };
    case Constants.GET_ITINERARIES_SUCCESS:
      return { 
        ...state, 
        success: true,
        data: [...action.payload.data ],
        dataByKey: { ...state.data, ...action.payload.dataByKey },
        error: null, 
        loading: false
      };
    case Constants.GET_ITINERARIES_FAIL:
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