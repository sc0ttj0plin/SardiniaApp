import * as firebase from 'firebase';
import * as Constants from '../constants';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-community/async-storage';

export const setPreferences = (el) =>
  async (dispatch) => {
    try {
      // dispatch({ type: Constants.USER_EDIT }); // Commented as we don't want to additionally bother the user 
      const user = firebase.auth().currentUser;
      let ref = firebase.database().ref(`users/${user.uid}/preferences/${el.uuid}`);
      ref.set({ name: el.name, rating: el.rating });
      // dispatch({ type: Constants.USER_EDIT_SUCCESS, payload: {userInfo: {...el}}}); // Commented as we don't want to additionally bother the user 
    } catch(e) { 
      // dispatch({ type: Constants.USER_EDIT_FAIL }); // Commented as we don't want to additionally bother the user 
      console.log(e.message); 
    }
  }  


export function getCategoriesPreferences(query) {
  return {
    type: Constants.GET_CATEGORIES_PREFERENCES,
    query: query,
  }
}