import * as Constants from '../constants';
import moment from 'moment';
import _ from 'lodash';

const INITIAL_STATE = {
  data: {},
  success: false,
  error: null,
  loading: false,
}

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case Constants.GET_NODES: 
      return { 
        ...state, 
        success: false,
        error: null,
        loading: true,
      };
    case Constants.GET_NODES_SUCCESS:
      //action.payload is an object keyed by the poi's nid: e.g. 1342: {...}
      return { 
        ...state, 
        data: {...state.data, ...action.payload }, 
        success: true,
        error: null,
        loading: false,
      };
    case Constants.GET_NODES_FAIL:
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