
import _ from 'lodash';
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
 * Extracts coordinates from an entity and returns {latitude: x, longitude: y}
 * @param {*} entity: node item
 */
export const getCoordinates = (entity) => {
  return entity && entity.georef ? { latitude: entity.georef.coordinates[1], longitude: entity.georef.coordinates[0] } : null;
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
 * @param {*} entity: node
 * @param {*} fields e.g. { "coordinates": 1, "image": 1, }
 * @param {*} path 
 */
export const getEntityInfo = (entity, fields=[], path=["it", 0, "value"], defaultVal=null) => {
  if(entity){
    let returnObj = _.reduce(fields, (acc, el) => {
      if (entity[el])
        acc[el] = _.get(entity[el], path, defaultVal);
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

