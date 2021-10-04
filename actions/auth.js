import * as firebase from 'firebase';
import * as Constants from '../constants';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-community/async-storage';
import ExpoConstants from 'expo-constants';

export const passwordSignup = (email,password) =>
  async (dispatch, getState) => {
    dispatch({ type: Constants.AUTH });
    try {
      const result = await firebase.auth().signInWithEmailAndPassword(email,password);
      const token = await firebase.auth().currentUser.getIdToken(/* forceRefresh */true);
      if (result.user) {
        let user = result.user;
        let userInfo = await firebase.database().ref(`users/${user.uid}/info`).once('value');
        await AsyncStorage.setItem('firebaseUid', user.uid);
        user.info = userInfo.val();
        dispatch({ type: Constants.AUTH_SUCCESS, payload: { user: user, token } });
      } else
        dispatch({ type: Constants.AUTH_FAIL, payload: { message: 'Errore nel login!' } });
    } catch (e) {
      console.log(e.message);
      dispatch({ type: Constants.AUTH_FAIL, payload: { message: e.message } });
    }}

//register and login

export const passwordReset = (email) => 
  async (dispatch) => {
    try  {
      console.log('Reset Password');
      console.log(email)
      await firebase.auth().sendPasswordResetEmail(email)
    } catch(e) {
      console.log("Reset Password", e.message);
    }
    dispatch({ type: Constants.LOGOUT_SUCCESS });
  }

export const registerAndSignup = (email,password,el) =>
  async (dispatch, getState) => {
    dispatch({ type: Constants.AUTH });
    try {
      const result = await firebase.auth().createUserWithEmailAndPassword(email,password);
      const token = await firebase.auth().currentUser.getIdToken(/* forceRefresh */true);
      if (result.user) {
        console.log(result.user)
        let user = result.user;
        let userInfo = await firebase.database().ref(`users/${user.uid}/info`).once('value');
        await AsyncStorage.setItem('firebaseUid', user.uid);
        user.info = userInfo.val();
        try {
          const user = firebase.auth().currentUser;
          let ref = await firebase.database().ref(`users/${user.uid}/info`);
          await ref.set(el);
          console.log("update usert ok")
          dispatch({ type: Constants.AUTH_SUCCESS, payload: { user: user, token ,userInfo: el} });
        } catch(e) { 
          dispatch({ type: Constants.USER_EDIT_FAIL });
          console.log(e.message); 
        }
      } else
        dispatch({ type: Constants.AUTH_FAIL, payload: { message: 'Errore nel login!' } });
    } catch (e) {
      console.log(e.message);
      dispatch({ type: Constants.AUTH_FAIL, payload: { message: e.message } });
    }
    
  
  
  }

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

export const editUser = (el) =>
async (dispatch) => {
  try {
    let user =await firebase.auth().currentUser;
    let ref = await firebase.database().ref(`users/${user.uid}/info`);
    await ref.set({ ...el });
    dispatch({ type: Constants.USER_EDIT_SUCCESS, payload: {userInfo: {...el} }});
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