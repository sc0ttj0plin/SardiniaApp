
import _, { replace } from 'lodash';
import videos from '../constants/_sampleVideos';
import { Linking, Alert } from 'react-native';
import * as Constants from "../constants"

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

/**
 * Returns a sample videos for that entity if its nid matches the current one
 */
export const getSampleVideoIndex = (nid) => {
  for(let i = 0; i < videos.length; i++ ){
   if(videos[i].nid == nid)
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


