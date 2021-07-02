import * as firebase from "firebase";
import * as Constants from "../constants";
import AsyncStorage from "@react-native-community/async-storage";
import _ from "lodash";

import { INITIAL_STATE } from "../reducers/settings";

export const initSettings = () => async (dispatch, getState) => {
  console.log("initsettingaction")
  try {
     console.log("initsettingaction");
    const user = firebase.auth().currentUser;
    const settings = getState().settingsState;
    const lastSyncedLocal = settings.lastSynced;
    // if authenticated: get remote ts, apply sync
    if (user) {
      let refLastSynced = await firebase
        .database()
        .ref(`users/${user.uid}/settings/lastSynced`);
      let refLastSyncedRemote = await refLastSynced.once("value");
      refLastSyncedRemote = refLastSyncedRemote.val() || 0;

      // If last sync in remote happened before last sync in local -> update remote from local
      if (refLastSyncedRemote < lastSyncedLocal) {
        console.log("[settings] sync favs from local to remote!");
        let refSett = await firebase
          .database()
          .ref(`users/${user.uid}/settings`);
        await refSett.set(settings);
      } else if (refLastSyncedRemote > lastSyncedLocal) {
        console.log("[settings] sync favs from remote to local");
        // If last sync in remote happened after last sync in local -> update local from remote
        let ref = await firebase
          .database()
          .ref(`users/${user.uid}/settings`)
          .once("value");
        let initialSett = ref.val() || INITIAL_STATE;
        dispatch({
          type: Constants.INIT_FAVOURITES,
          payload: initialSett,
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

export const toggleSettings = (payload) => async (dispatch, getState) => {
  //type: this.props.type, uuid: this.state.uuid
  // So if is logged in the fav value comes from firebase (set val to either false or true), else it comes from the store (set favVal to null)
  // Note: the update is a little slow since we wait for firebase to ack our request and firebase is our reference
  const user = firebase.auth().currentUser;
  const lastSynced = Date.now();
  const settings = getState().settingsState;
  let settValFinal = !settings[payload.type][payload.uuid];
  // Optimistic rendering
  dispatch({
    type: Constants.TOGGLE_SETTING,
    payload: {
      type: payload.type,
      uuid: payload.uuid,
      lastSynced,
      val: settValFinal,
    },
  });
  try {
    if (user) {
      // if is logged: reference is firebase, set timestamp to firebase + local + favs to firebase + local
      let refLastSynced = await firebase
        .database()
        .ref(`users/${user.uid}/settings/lastSynced`);
      let refSett = await firebase
        .database()
        .ref(`users/${user.uid}/settings/${payload.type}/${payload.uuid}`);
      let settValRemote = await refFav.once("value");
      settValFinal = !settValRemote.val();
      await refSett.set(settValFinal); // toggle remote value (Note: !null == true, !undefined==true)
      await refLastSynced.set(lastSynced);
    }
    // In any case set to local: set timestamp to local only + favs to local
    // If we got the value from firebase use it, else fetch it from local redux store
  } catch (e) {
    console.log(e);
    //reset to original value on failure
    dispatch({
      type: Constants.TOGGLE_SETTING,
      payload: {
        type: payload.type,
        uuid: payload.uuid,
        lastSynced,
        val: !settValFinal,
      },
    });
  }
};
