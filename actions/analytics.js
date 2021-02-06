import * as firebase from 'firebase';
import axios from 'axios';
import * as Constants from '../constants';

/**
 * Actions in this file are for reporting purposes, therefore, since we 
 * don't want to additionally bother the user with error messages about analytics so we don't dispatch error/success actions.
 */

//////////////////// PROFILE ////////////////////
export const reportProfileUpdate = (el) =>
  async (dispatch) => {
    try {
      //el: { username, age, country, sex, updateDate }
      const user = firebase.auth().currentUser;
      // await axios.put(`${Constants.BACKEND_ANALYTICS_PROFILE_UPDATE_URL`, { uid: user.uid, username: el.username, age: el.age, country: el.country, sex: el.sex });
    } catch(e) { 
      console.log(e.message); 
    }
  }  

export const reportProfileRemoval = (el) =>
  async (dispatch) => {
    try {
      //el: { username, age, country, sex, updateDate }
      // const user = firebase.auth().currentUser;
      // await axios.put(`${Constants.BACKEND_ANALYTICS_PROFILE_REMOVAL_URL`, { uid: user.uid, username: el.username, age: el.age, country: el.country, sex: el.sex });
    } catch(e) { 
      console.log(e.message); 
    }
  }  

//////////////////// USER INTERACTION ////////////////////
export const reportUserInteraction = (el) =>
  async (dispatch) => {
    // el is like: {analyticsActionType, uuid, entityType: 'node', entitySubType: Constants.NODE_TYPES.places}
    try {
      //el: { actionId, age, country, sex, updateDate }
      // const user = firebase.auth().currentUser;
      // await axios.put(`${Constants.BACKEND_ANALYTICS_USER_INTERACTION_URL`, { uid: user.uid, username: el.username, age: el.age, country: el.country, sex: el.sex });
    } catch(e) { 
      console.log(e.message); 
    }
  } 

//////////////////// BUGS ////////////////////
export const reportBugs = (el) =>
  async (dispatch) => {
    // el is an error object
    try {
      //el: { actionId, age, country, sex, updateDate }
      // const user = firebase.auth().currentUser;
      // await axios.put(`${Constants.BACKEND_ANALYTICS_BUGS_URL`, { error: el });
    } catch(e) { 
      console.log(e.message); 
    }
  } 

//////////////////// XXX ////////////////////

//////////////////// PREFERENCES ////////////////////
export const setPreferences = (el) =>
  async (dispatch) => {
    try {
      const user = firebase.auth().currentUser;
      // await axios.put(`${Constants.BACKEND_ANALYTICS_PREFERENCES_URL`, { uid: user.uid, uuid: el.uuid, , name: el.name, rating: el.rating });
      let ref = await firebase.database().ref(`users/${user.uid}/preferences/${el.uuid}`);
      await ref.set({ name: el.name, rating: el.rating });
    } catch(e) { 
      console.log(e.message); 
    }
  }  

