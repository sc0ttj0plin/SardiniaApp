
import _ from 'lodash';
import videos from '../constants/_sampleVideos';
import virtualTours from '../constants/_sampleVrModels';
import { Linking, Alert } from 'react-native';
import * as Constants from "../constants";
import Url from 'url-parse';
import * as Device from 'expo-device';
import ExpoConstants from 'expo-constants';
import * as firebase from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Crypto from 'expo-crypto';
import md5 from 'md5';

export const searchParser = (queryStr) => {
  return queryStr.replace(/ /g, " & ");
}

/**
 * Finds element in array and return as soon as it finds it.
 * If array[i][findKey] == match then return array[i][returnKey]
 * @param {*} array: array of objects: [{ findKey: x, }]
 * @param {*} findKey: key used for comparison array[i][findKey]
 * @param {*} match: match array[i][key] with "match"
 * @param {*} returnKey:
 */
export const greedyArrayFinder = (array, findKey, match, returnKey, notFoundReturnVal=null) => {
  for(let i = 0; i < array.length; i++) {
    let el = array[i];
    if (el[findKey] == match)
      return el[returnKey];
  }
  return notFoundReturnVal;
}

/**
 * Split the url into composing subelements
 * @param {*} url input url
 * @returns url object made of:
 *  href
 *  protocol
 *  username
 *  password
 *  host
 *  hostname
 *  port
 *  pathname
 *  search
 *  hash
 */
//hostname, pathname, query, hash
export const parseUrl = (url) => new Url(url);


/**
 * Normalizes coordinates in accordance with React Native Maps format { latitude: lat, longitude: lng }
 * @param {*} entity input entity
 */
export const getCoordinates = (entity, locale='it') => {
  // // Itineraries (array)
  // if (entity.steps && entity.steps[locale])
  //   return entity.steps[locale].map(c => ({ latitude: c.georef.coordinates[1], longitude: c.georef.coordinates[0] }));
  // // Events steps (array)
  // if (entity.steps && entity.steps[locale])
  //   return entity.steps[locale].map(c => ({ latitude: c.georef.coordinates[1], longitude: c.georef.coordinates[0] }));
  // Generic
  if (entity && entity.georef)
    return ({ latitude: entity.georef.coordinates[1], longitude: entity.georef.coordinates[0] });
  else
    return null;
}

export const linkingOpenMail = (email, subject="", body="") => Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
export const linkingOpenNavigator = (title, coords) => {
  const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
  const latLng = `${coords.latitude},${coords.longitude}`;
  const label = title;
  const url = Platform.select({
    ios: `${scheme}${label}@${latLng}`,
    android: `${scheme}${latLng}(${label})`
  });
  Linking.openURL(url);
}
export const linkingCallNumber = phone => {
  let phoneNumber = `tel:${phone}`;
  Linking.canOpenURL(phoneNumber).then(supported => {
    if (!supported)
      Alert.alert('Phone number is not available');
    else
      return Linking.openURL(phoneNumber);
  }).catch(err => console.log(err));
};
export const linkingOpenUrl = url => Linking.openURL(url);


/**
 * Safe multiple fields _.get
 * @param {*} entity: A db entity to parse having "fields" fields
 * @param {*} fields the fields to extract e.g. ["coordinates", "image", ...]
 * @param {*} path the path where to search the final value of the field (might recurse)
 * @param {*} defaultVal a default value to assign to the output field variable if it doesn't exist
 * @param {*} replaceObj apply replace to the output value  { "fieldName": { s: "sourceText", d: "destinationText" } }
 */
export const getEntityInfo = (entity, fields=[], path=[Constants.DEFAULT_LANGUAGE, 0, "value"], defaultVal=null, replaceObj={}) => {
  if(entity){
    let returnObj = _.reduce(fields, (acc, el) => {
      if (entity[el]) {
        let value = _.get(entity[el], path, defaultVal);
        if (replaceObj[el] && typeof(value) === 'string')
          acc[el] = value.replace(replaceObj[el].s, replaceObj[el].d);
        else
          acc[el] = value;
      }
      return acc;
    }, {});
    return returnObj;
  }
  else return {}
}


export const getSampleVrModelIndex = (uuid) => {
  for(let i = 0; i < virtualTours.length; i++ ){
   if(virtualTours[i].uuid == uuid)
    return virtualTours[i]["vr_url"];
  }
  return null;
}
/**
 * Returns a sample videos for that entity if its nid matches the current one
 */
export const getSampleVideoIndex = (uuid) => {
  for(let i = 0; i < videos.length; i++ ){
   if(videos[i].uuid == uuid)
    return videos[i]["video_url"];
  }
  return null;
}

/**
 * Extract images from gallery in a simpler format
 * @param {*} entity: node
 */
export const getGalleryImages = (entity) => {
  if(entity && entity.gallery){
    return entity.gallery.map((item) => {
      var image = {
        title_field: item.title_field,
        key: item.uid,
        source: {uri: item.uri},
        dimensions: {
          width: item.width,
          height: item.height
        }
      }
      return image;
    })
  }
  else return []
}


export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Get user token as a device id (an artifical token for when we don't have authentication tokens)
 * NOTE: Skipping osName, osVersion, osBuildId, osInternalBuildId, osBuildFingerprint, platformApiLevel
 *        as when the system upgrades we might lose the "unique" device id
 */
export const getUserTokenFromDeviceSpecs = () => {
  const { isDevice, brand, manufacturer, modelName, modelId , designName , productName , deviceYearClass, totalMemory, supportedCpuArchitectures, deviceName } = Device;
  const deviceInfo = { isDevice, brand, manufacturer, modelName, modelId , designName , productName , deviceYearClass, totalMemory, supportedCpuArchitectures, deviceName };
  const deviceInfoStr = JSON.stringify(deviceInfo);
  return md5(deviceInfoStr);
}


/**
 * Retrieves the unique device token using either device or auth information.
 * It's important to note that firebase initialization takes too much for the user
 * to wait for it to complete, so we "sacrifice" one execution app to have the token
 * loaded from the async storage at the next execution after logging in
 * @returns userToken object {
 *  userFirebaseToken: firebase uid
 *  userDeviceToken: device token
 * }
 * We return both as the backend may want to reference the firebase uid to the device token
 */
export const getUserToken = async () => {
  // If not logged in get
  const userFirebaseToken = await AsyncStorage.getItem('firebaseUid') || null;
  const userDeviceToken = getUserTokenFromDeviceSpecs();
  return { userDeviceToken, userFirebaseToken };
}

