import * as firebase from "firebase";
import * as Constants from "../constants";
import AsyncStorage from "@react-native-community/async-storage";
import _ from "lodash";

import { INITIAL_STATE } from "../reducers/privacy";

export const initialPrivacy = () => async (dispatch, getState) => {
  console.log("initprivacyaction");
  try {
    const user = firebase.auth().currentUser;
    const privacy = getState().privacyState;
    const lastSyncedLocal = privacy.lastSynced;
    // if authenticated: get remote ts, apply sync
    if (user) {
      let refLastSynced = await firebase
        .database()
        .ref(`users/${user.uid}/privacy/lastSynced`);
      console.log(refLastSynced);
      let refLastSyncedRemote = await refLastSynced.once("value");
      refLastSyncedRemote = refLastSyncedRemote.val() || 0;
      // If last sync in remote happened before last sync in local -> update remote from local
      if (refLastSyncedRemote < lastSyncedLocal) {
        console.log("[privacy] sync from local to remote!");
        let ref = await firebase
          .database()
          .ref(`users/${user.uid}/privacy/privacyValue`);
        await ref.set(privacy);
      } else if (refLastSyncedRemote > lastSyncedLocal) {
        console.log("[privacy] sync s from remote to local");
        // If last sync in remote happened after last sync in local -> update local from remote
        let ref = await firebase
          .database()
          .ref(`users/${user.uid}/privacy/`)
          .once("value");
        let initialPrivacy = ref.val() || INITIAL_STATE;
        dispatch({
          type: Constants.INIT_PRIVACY,
          payload: initialPrivacy,
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

export const togglePrivacy = (payload) => async (dispatch, getState) => {
  const user = firebase.auth().currentUser;
  const lastSynced = Date.now();
  const privacy = getState().privacyState;
  console.log("dentro action toggle");
  let ValFinal = payload;
  // Optimistic rendering
  dispatch({
    type: Constants.TOGGLE_PRIVACY,
    payload: { type: "privacyValue", lastSynced, val: ValFinal },
  });
  try {
    if (user) {
      // if is logged: reference is firebase, set timestamp to firebase + local + favs to firebase + local
      let refLastSynced = await firebase
        .database()
        .ref(`users/${user.uid}/privacy/lastSynced`);
      let ref = await firebase
        .database()
        .ref(`users/${user.uid}/privacy/privacyValue`);
      let ValRemote = await ref.once("value");
      ValFinal = ValRemote.val();
      await ref.set(ValFinal); // toggle remote value (Note: !null == true, !undefined==true)
      await refLastSynced.set(lastSynced);
      console.log(ValFinal)
    }
    // In any case set to local: set timestamp to local only + favs to local
    // If we got the value from firebase use it, else fetch it from local redux store
  } catch (e) {
    console.log(e);
    //reset to original value on failure
    dispatch({
      type: Constants.TOGGLE_PRIVACY,
      payload: { type: "privacy", lastSynced, val: ValFinal },
    });
  }
};
