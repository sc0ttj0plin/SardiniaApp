import * as Constants from '../constants';

export const INITIAL_STATE = {
         lastSynced:0,
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
    case Constants.INIT_SETTING:
      return action.payload;
    case Constants.TOGGLE_SETTING:
      const settObj = { [action.payload.type]: action.payload.value };
      console.log(settObj)
      let newState = { 
        ...state,
        lastSynced: action.payload.lastSynced,
        aggiornato:true,
          ...settObj
        
      }
      return newState;
      // return { ...state, [action.payload.uuid]: action.payload.val }
    default:
      return state;
  }
}