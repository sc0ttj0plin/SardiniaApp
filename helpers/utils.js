import _ from 'lodash';

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

/**
 * 
 * @param {*} entity 
 * @param {*} fields 
 * @param {*} lan 
 */
export const getEntityInfo = (entity, fields={}, getTree=["it", 0, "value"], defaults={}) => {
  let returnObj = _.reduce(fields, (acc, el, key) => {
    if (entity[key])
      acc[key] = _.get(entity[key], getTree, defaults[key] || null);
  }, {});
  return returnObj;
}