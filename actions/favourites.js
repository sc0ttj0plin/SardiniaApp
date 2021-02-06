import * as firebase from 'firebase';
import * as Constants from '../constants';
import _ from 'lodash';

export const initFavourites = () =>  async (dispatch) => {
  try {
    const user = firebase.auth().currentUser;
    let ref = await firebase.database().ref(`users/${user.uid}/favourites`).once('value');
    let initialFavs = ref.val() || {};
    initialFavs = _.reduce(initialFavs, (favs, el, uuid) => {
      favs[uuid] = el.val;
      return favs;
    }, {});
    dispatch({
      type: Constants.INIT_FAVOURITES,
      payload: initialFavs,
    });
  } catch(e) {
    console.log(e);
  }
}

export const toggleFavourite = (payload) => async (dispatch) => {
  try {
    //type: this.props.type, uuid: this.state.uuid
    const user = firebase.auth().currentUser;
    // let ref = await firebase.database().ref(`users/${user.uid}/favourites/${payload.type}/${payload.uuid}`);
    let ref = await firebase.database().ref(`users/${user.uid}/favourites/${payload.uuid}`);
    let favVal = await ref.once('value');
    favVal = favVal.val() || { uuid: payload.uuid, val: false };
    favVal.val = !favVal.val;
    await ref.set({ type: payload.type, val: favVal.val }); //if we need the type
    dispatch({
      type: Constants.TOGGLE_FAVOURITE,
      payload: { uuid: payload.uuid, val: favVal.val } ,
    });
  } catch(e) {
    console.log(e)
  }
}