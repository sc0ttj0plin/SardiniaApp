import * as firebase from 'firebase';
import * as Constants from '../constants';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-community/async-storage';
import ExpoConstants from 'expo-constants';

//@passwordless
export const passwordLessSignup = (email) =>
  async (dispatch, getState) => {
    dispatch({ type: Constants.AUTH });
    let token = null;
    //Auth Storage is persisted (see store.js)
    const expoLink = Linking.makeUrl(); //no navigation path, no params
    //Note: This is added to authorized domains in firebase
    const proxyUrl = `${ExpoConstants.manifest.extra.firebasePassLessAuthLinkProxy}?redirectUrl=${encodeURIComponent(expoLink)}`;

    var actionCodeSettings = {
      handleCodeInApp: true,
      url: proxyUrl,
    };

    try {
      await firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings);
      AsyncStorage.setItem('email', email); //Store email to finish auth later
    } catch(e) {
      console.log("Error", e.message);
      dispatch({ type: Constants.AUTH_FAIL, payload: { message: e.message } });
    }
}

//@passwordless
export const passwordLessLinkHandler = (url) =>
async (dispatch, getState) => {
  // const auth = getState().authState;
  //Auth Storage is persisted (see store.js)
  const isSignInWithEmailLink = firebase.auth().isSignInWithEmailLink(url);
  if (isSignInWithEmailLink) {
    try {
      const email = await AsyncStorage.getItem('email');
      const result = await firebase.auth().signInWithEmailLink(email, url);
      const token = await firebase.auth().currentUser.getIdToken(/* forceRefresh */true);
      // Get user information if any, the discriminant for a complete profile is a populated user.info object
      if (result.user) {
        let user = result.user;
        let userInfo = await firebase.database().ref(`users/${user.uid}/info`).once('value');
        user.info = userInfo.val();
        dispatch({ type: Constants.AUTH_SUCCESS, payload: { user: user, token } });
      } else
        dispatch({ type: Constants.AUTH_FAIL, payload: { message: 'Errore nel login!' } });
    } catch (e) {
      console.log(e.message);
      dispatch({ type: Constants.AUTH_FAIL, payload: { message: e.message } });
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
 } catch(error) {
    console.log("passwordLessLogin", error.message);
    dispatch({ type: Constants.AUTH_FAIL, payload: { message: error.message } });
  }
}

//
export const editUser = (el) =>
  async (dispatch) => {
    try {
      dispatch({ type: Constants.USER_EDIT });
      const user = firebase.auth().currentUser;
      let ref = await firebase.database().ref(`users/${user.uid}/info`);
      await ref.set({ ...el });
      dispatch({ type: Constants.USER_EDIT_SUCCESS, payload: {userInfo: {...el}}});
    } catch(e) { 
      dispatch({ type: Constants.USER_EDIT_FAIL });
      console.log(e.message); 
    }
  }  

export const logout = () => 
  async (dispatch) => {
    try  {
      console.log('Logout..');
      await AsyncStorage.removeItem('email');
      const user = firebase.auth().currentUser;
      await firebase.auth().signOut();
    } catch(e) {
      console.log("Logout error", e.message);
    }
    //ignoring the logout outcome, since we remove the token there's no need to validate it
    dispatch({ type: Constants.LOGOUT_SUCCESS });
  }


export const removeUser = () => 
  async (dispatch) => {
    try  {
      console.log('Remove User..');
      await AsyncStorage.removeItem('email');
      const user = firebase.auth().currentUser;
      await firebase.database().ref(`users/${user.uid}/info`).remove();
      await firebase.auth().currentUser.delete();
    } catch(e) {
      console.log("Logout error", e.message);
    }
    //ignoring the logout outcome, since we remove the token there's no need to validate it
    dispatch({ type: Constants.LOGOUT_SUCCESS });
  }