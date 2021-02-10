import * as firebase from 'firebase';
import axios from 'axios';
import * as Constants from '../constants';
import * as Device from 'expo-device';
import ExpoConstants from 'expo-constants';

const { isDevice, brand, manufacturer, modelName, modelId , designName , productName , deviceYearClass, totalMemory, supportedCpuArchitectures, osName, osVersion, osBuildId, osInternalBuildId, osBuildFingerprint, platformApiLevel, deviceName } = Device;
const deviceInfo = { isDevice, brand, manufacturer, modelName, modelId , designName , productName , deviceYearClass, totalMemory, supportedCpuArchitectures, osName, osVersion, osBuildId, osInternalBuildId, osBuildFingerprint, platformApiLevel, deviceName };

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
/**
 * Sends user interaction to backend periodically (after reportedActionsAccumulator has reached Constants.ANALYTICS_MAX_STORED_ACTIONS)
 * @param {*} el object like 
 * { 
 *  analyticsActionType: Constants.ANALYTICS_TYPES.*, 
 *  uuid: '12udsa...', 
 *  entityType: 'node', 
 *  entitySubType: Constants.NODE_TYPES.places, 
 *  meta: extra metadata information:
 *    in case of Constants.ANALYTICS_TYPES.gpsTracking is the location object
 *    in case of Constants.ANALYTICS_TYPES.gpsTracking is a generic js error object
 *    in case of Constants.ANALYTICS_TYPES.userSearches is the search string
 * }
 */
var storedActionsAccumulator = [];
export const reportAction = (el) =>
  async (dispatch) => {
    if (storedActionsAccumulator.length < Constants.ANALYTICS_MAX_STORED_ACTIONS) {
      storedActionsAccumulator.push(el);
      console.log("[Action reporting]", el.analyticsActionType);
    } else {
      console.log("[Action reporting]", el.analyticsActionType);
      storedActionsAccumulator.push(el);
      console.log("[Action reporting] sending:", storedActionsAccumulator.length, " actions to the backend");
      try {
        // const user = firebase.auth().currentUser;
        // await axios.put(`${Constants.BACKEND_ANALYTICS_USER_INTERACTION_URL`, storedActionsAccumulator, deviceInfo);
        storedActionsAccumulator = [];
      } catch(e) { 
        console.log(e.message); 
      }
    }
  } 


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

