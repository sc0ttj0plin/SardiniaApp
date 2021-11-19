import _ from 'lodash';
import { createIconSetFromFontello } from 'react-native-vector-icons';
import * as Constants from '../constants';

//for this reducer the initial state is simply an array
const INITIAL_STATE = {
  user: null, //auth data
  token: null,
  loading: false,
  error: null,
  success: false,
  userInfo: null,
};

export default (state = INITIAL_STATE, action) => {
  //To avoid resetting the whole reducer state, we must propagate it! (single reducer = single store piece!);
  switch (action.type) {
    case Constants.AUTH_RESET:
      return INITIAL_STATE;
    case Constants.AUTH:
      return { 
        ...state, 
        error: null, 
        loading: true,
        success: false
      };
    case Constants.AUTH_SUCCESS:
      return { 
        ...state, 
        user: action.payload.user, 
        userInfo: action.payload.userInfo, 
        token: action.payload.token, 
        error: null, 
        loading: false,
        success: true
      };
    case Constants.USER_EDIT_SUCCESS:
      console.log(action.payload.userInfo)
      return { 
      
        ...state, 
        userInfo: action.payload.userInfo, 
      };
    case Constants.AUTH_FAIL:
      console.log("Error in auth", action.payload.message);
      return { 
        ...state, 
        loading: false, 
        error: action.payload.message,
        success: false
      };
    //LOGOUT
    case Constants.LOGOUT:
      return {
        ...INITIAL_STATE
      }
    case Constants.LOGOUT_SUCCESS:
      return {
        ...INITIAL_STATE
      }
    default:
      return state;
  }
}
