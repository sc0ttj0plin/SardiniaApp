import * as firebase from 'firebase';
import * as Constants from '../constants';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-community/async-storage';


//@passwordless
export const passwordLessSignup = (email) =>
  async (dispatch, getState) => {
    dispatch({ type: Constants.AUTH });
    let token = null;
    //Auth Storage is persisted (see store.js)
    const expoLink = Linking.makeUrl(); //no navigation path, no params
    //Note: This is added to authorized domains in firebase
    const FIREBASE_LINK_PROXY = Constants.FIREBASE_LINK_PROXY;
    const proxyUrl = `${FIREBASE_LINK_PROXY}?redirectUrl=${encodeURIComponent(expoLink)}`;

    var actionCodeSettings = {
      handleCodeInApp: true,
      url: proxyUrl,
    };

    try {
      await firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings);
      AsyncStorage.setItem('email', email); //Store email to finish auth later
    } catch(error) {
      console.log("Error", e.message);
      dispatch({ type: Constants.AUTH_FAIL, payload: { message: error.message } });
    }
}

//@passwordless
export const passwordLessLinkHandler = (url) =>
async (dispatch, getState) => {
  //Auth Storage is persisted (see store.js)
  const isSignInWithEmailLink = firebase.auth().isSignInWithEmailLink(url);
  if (isSignInWithEmailLink) {
    try {
      const email = await AsyncStorage.getItem('email');
      const result = await firebase.auth().signInWithEmailLink(email, url);
      const storeUserData = await firebase.auth()
      const token = await firebase.auth().currentUser.getIdToken(/* forceRefresh */true);
      if (result.user)
        dispatch({ type: Constants.AUTH_SUCCESS, payload: { user: result.user, token } });
      else
        dispatch({ type: Constants.AUTH_FAIL, payload: { message: 'Errore nel login!' } });
    } catch (error) {
      console.log(error.message);
      dispatch({ type: Constants.AUTH_FAIL, payload: { message: error.message } });
    }
  }
}

//Login 
_checkAuthStatus = () => {
  return new Promise((resolve, reject) => {
    try {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          resolve(user);
        }
        else reject();
      });
    } catch {
      reject();
    } 
  });
}


//@passwordless
export const passwordLessLogin = (url) => 
async (dispatch, getState) => {
  dispatch({ type: Constants.AUTH });
  try  {
    let user = await _checkAuthStatus();
    let userInfo = await firebase.database().ref(`users/${user.uid}/info`).once('value');
    user.info = userInfo.val();
    const token = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true);
    dispatch({ type: Constants.AUTH_SUCCESS, payload: { user, token } });
 } catch(e) {
    console.log("Error", e.message);
    dispatch({ type: Constants.AUTH_FAIL, payload: { message: e.message } });
  }
}

//
export const editUser = (el) =>
  async (dispatch) => {
    try {
      dispatch({ type: Constants.USER_EDIT });
      const user = firebase.auth().currentUser;
      let ref = firebase.database().ref(`users/${user.uid}/info`);
      await AsyncStorage.setItem('username',el.username);
      ref.set({...el});
      dispatch({ type: Constants.USER_EDIT_SUCCESS, payload: {userInfo: {...el}}});
    } catch(error) { 
      dispatch({ type: Constants.USER_EDIT_FAIL });
      console.log(error); 
    }
  }  

export const logout = () => 
  async (dispatch) => {
    try  {
      console.log('Logout..');
      await AsyncStorage.removeItem('email');
      await AsyncStorage.removeItem('username');
      await firebase.auth().signOut();
    } catch(e) {
      console.log("Logout error", e.message);
    }
    //ignoring the logout outcome, since we remove the token there's no need to validate it
    dispatch({ type: Constants.LOGOUT_SUCCESS });
  }
