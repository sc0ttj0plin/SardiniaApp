import * as Constants from '../constants';
import moment from 'moment';
import _ from 'lodash';

export const INITIAL_STATE = {
         nearpoi: true,
         newcontent: true,
         eventreminder: true,
         eventnextweek: true,
         emergencyalert: true,
         newsfeed: true,
         gpsopenapp: true,
         gpsbackground: true,
         virtualenclosure: true,
       };

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    //SETTINGS
    case Constants.INIT_SETTINGS:
      return action.payload;
    case Constants.TOGGLE_SETTING:
      const settObj = { [action.payload.uuid]: action.payload.val };
      let newState = { 
        ...state, 
        lastSynced: action.payload.lastSynced,
        [action.payload.type]: { 
          ...state[action.payload.type], 
          ...settObj 
        } 
      }
      return newState;
      // return { ...state, [action.payload.uuid]: action.payload.val }
    default:
      return state;
  }
}