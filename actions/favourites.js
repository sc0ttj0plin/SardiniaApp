import * as firebase from 'firebase';
import * as Constants from '../constants';
import AsyncStorage from '@react-native-community/async-storage';
import _ from 'lodash';

import { INITIAL_STATE } from '../reducers/favourites';

export const initFavourites = () =>  async (dispatch, getState) => {
  try {
    const user = firebase.auth().currentUser;
    const favourites = getState().favouritesState;
    const lastSyncedLocal = favourites.lastSynced;
    // if authenticated: get remote ts, apply sync
    if (user) {
      let refLastSynced = await firebase.database().ref(`users/${user.uid}/favourites/lastSynced`);
      let refLastSyncedRemote = await refLastSynced.once('value');
      refLastSyncedRemote = refLastSyncedRemote.val() || 0;
      
      // If last sync in remote happened before last sync in local -> update remote from local
      if (refLastSyncedRemote < lastSyncedLocal) {
        console.log("[favourites] sync favs from local to remote!");
        let refFav = await firebase.database().ref(`users/${user.uid}/favourites`);
        await refFav.set(favourites);
      } else if (refLastSyncedRemote > lastSyncedLocal) {
        console.log("[favourites] sync favs from remote to local");
        // If last sync in remote happened after last sync in local -> update local from remote
        let ref = await firebase.database().ref(`users/${user.uid}/favourites`).once('value');
        let initialFavs = ref.val() || INITIAL_STATE;
        dispatch({
          type: Constants.INIT_FAVOURITES,
          payload: initialFavs,
        });
      }
    }
  } catch(e) {
    console.log(e);
  }
}


export const toggleFavourite = (payload) => async (dispatch, getState) => {
  try {
    //type: this.props.type, uuid: this.state.uuid
    // So if is logged in the fav value comes from firebase (set val to either false or true), else it comes from the store (set favVal to null)
    // Note: the update is a little slow since we wait for firebase to ack our request and firebase is our reference
    const user = firebase.auth().currentUser;
    const lastSynced = Date.now();
    const favourites = getState().favouritesState;
    let favValFinal = !favourites[payload.type][payload.uuid];
    // Optimistic rendering
    dispatch({
      type: Constants.TOGGLE_FAVOURITE,
      payload: { type: payload.type, uuid: payload.uuid, lastSynced, val: favValFinal } ,
    });
    if (user) {
      // if is logged: reference is firebase, set timestamp to firebase + local + favs to firebase + local 
      let refLastSynced = await firebase.database().ref(`users/${user.uid}/favourites/lastSynced`);
      let refFav = await firebase.database().ref(`users/${user.uid}/favourites/${payload.type}/${payload.uuid}`);
      let favValRemote = await refFav.once('value');
      favValFinal = !favValRemote.val()
      await refFav.set(favValFinal); // toggle remote value (Note: !null == true, !undefined==true)
      await refLastSynced.set(lastSynced);
    }
    // In any case set to local: set timestamp to local only + favs to local
    // If we got the value from firebase use it, else fetch it from local redux store

  } catch(e) {
    console.log(e);
    //reset to original value on failure
    dispatch({
      type: Constants.TOGGLE_FAVOURITE,
      payload: { type: payload.type, uuid: payload.uuid, lastSynced, val: !favValFinal } ,
    });
  }
}
