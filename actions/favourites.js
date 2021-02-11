import * as firebase from 'firebase';
import * as Constants from '../constants';
import _ from 'lodash';

import { INITIAL_STATE } from '../reducers/favourites';

export const initFavourites = () =>  async (dispatch) => {
  try {
    const user = firebase.auth().currentUser;
    if (user) {
      let ref = await firebase.database().ref(`users/${user.uid}/favourites`).once('value');
      let initialFavs = ref.val() || INITIAL_STATE;
      // initialFavs = _.reduce(initialFavs, (favs, el, uuid) => {
      //   favs[uuid] = el.val;
      //   return favs;
      // }, {});
      dispatch({
        type: Constants.INIT_FAVOURITES,
        payload: initialFavs,
      });
    }
  } catch(e) {
    console.log(e);
  }
}

export const toggleFavourite = (payload) => async (dispatch, getState) => {
  try {
    //type: this.props.type, uuid: this.state.uuid
    // So if is logged in the fav value comes from firebase (set val to either false or true), else it comes from the store (set favVal to null)
    const user = firebase.auth().currentUser;
    const favourites = getState().favouritesState;
    let favValLocal = favourites[payload.type][payload.uuid];
    let favValRemote = null;
    let favValFinal = favValLocal;
    if (user) {
      //tries to get the fav val from firebase first to toggle it
      let ref = await firebase.database().ref(`users/${user.uid}/favourites/${payload.type}/${payload.uuid}`);
      // let ref = await firebase.database().ref(`users/${user.uid}/favourites/${payload.uuid}`);
      favValRemote = await ref.once('value');
      favValRemote = favValRemote.val();
      // If remote does exist then set final to !remote value, else (remote does not exist), final set to !local 
      if (favValRemote !== null || favValRemote !== undefined)
        favValFinal = favValRemote;
      else 
        favValFinal = favValLocal;
      await ref.set(favValFinal);
    }
    dispatch({
      type: Constants.TOGGLE_FAVOURITE,
      payload: { type: payload.type, uuid: payload.uuid, val: !favValFinal } ,
    });
  } catch(e) {
    console.log(e)
  }
}