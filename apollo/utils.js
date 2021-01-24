import moment from 'moment';
import * as Constants from '../constants';
import {distance, distanceToString} from '../helpers/maps'
import  { normalizeLanguage } from '../helpers/language';
import samplePois from '../constants/_samplePois';
import sampleMarkers from '../constants/_sampleMarkers';
import sampleImages from '../constants/_sampleImages';

const IMAGE_REPLACE_SRC = "public://";
// const IMAGE_REPLACE_DST = "https://www.sardegnaturismo.it/sites/default/files/";
// const IMAGE_REPLACE_DST = "http://sinnos.andreamontaldo.com:81/img/400x300/";
const IMAGE_REPLACE_DST_621x = "http://sinnos.andreamontaldo.com:81/img/621x/"; //width only
const IMAGE_REPLACE_DST_350x = "http://sinnos.andreamontaldo.com:81/img/350x/";

/**
 * Process categories 
 * Process each category adding the field: "uuids" which adds the current category's sub-categories
 * e.g.:
 * {   
 *     ...
 *     "uuid": "2c217b84-6ab6-4702-a88b-c560970f1d3d", //current category uuid
 *     "uuids": Array [                                //sub categories uuids
 *       "844ac546-4da8-406a-8258-8e5b96fc6f7f",
 *       "db9db33b-df26-41b2-8a86-ceaf7c4e313e",
 *       "1b3f8171-db41-4811-a824-3d9eb622e40a",
 *       "1a8de1f9-c101-406c-87c6-8561f52a3565",
 *     ],
 *     ...
 *  IMPORTANT TODO: for inspirers we dont' have images just yet, adding sample images
 * @param {*} categories input categories (with nested terms)
 * @param {*} termsMap terms keys by uuid
 */
export const processCategories = function(categories, termsMap) {
  var cCategories = [];
  for(var i = 0; i < categories.length; i++){
      var c = categories[i];
      processEntity(c);
      if(c.image)
        // c.image = c.image.replace(IMAGE_REPLACE_SRC, IMAGE_REPLACE_DST);
        c.image = c.image.replace(IMAGE_REPLACE_SRC, IMAGE_REPLACE_DST_621x);
      else if(sampleImages[c.tid]) 
        c.image = sampleImages[c.tid].image;
      else
        c.image = "https://www.sardegnainblog.it/video/wp-content/uploads/2018/06/isola-asinara-escursioni-in-barca.jpg"
        if(c.nodes_terms_aggregate && c.nodes_terms_aggregate.aggregate.count > 0)
          c.childUuids = [c.uuid];

      if(c.terms && c.terms.length > 0) {
          var terms = processCategories(c.terms, termsMap);   
          for(var j=0; j<terms.length; j++){
              c.childUuids = c.childUuids ? c.childUuids.concat(terms[j].childUuids) : terms[j].childUuids;
              // c.image = terms[j].image.replace(IMAGE_REPLACE_SRC, IMAGE_REPLACE_DST_621x);
              c.image = terms[j].image.replace(IMAGE_REPLACE_SRC, IMAGE_REPLACE_DST_621x);
          };
          c.terms = terms;
      }
      if(c.nodes_terms_aggregate && c.nodes_terms_aggregate.aggregate.count > 0 || (c.terms && c.terms.length > 0) ) {
          cCategories.push(c);
          termsMap[c.uuid] = c;
      }
  }
  return cCategories;
}

/**
 * Create an array of event type objects extracting the id and the name
 * @param {*} eventTypes: types of events
 */
export const processEventTypes = function(eventTypes) {
  let eventTypesArr = [];
  eventTypes.forEach((el, idx) => {
      eventTypesArr.push({ id: el.term.tid.toString(), name: el.term.name });
  });
  return eventTypesArr;
}

/**
 * Process a generic entity retrieved from a query normalizing it, replacing image urls, computing distances etc..
 * @param {*} entity: a generic entity
 * @param {*} coords: coordinates for that entity
 */
export const processEntity = function(entity, coords=null) {

  // Normalize language keys into a common key (e.g. en-GB: {}, en-US: {} => en: {})
  if (entity.title) 
    normalizeLanguage(entity.title);
  if (entity.abstract) 
    normalizeLanguage(entity.abstract);
  if (entity.description) 
    normalizeLanguage(entity.description);

  if (entity.image)
      // entity.image = entity.image.replace(IMAGE_REPLACE_SRC, IMAGE_REPLACE_DST_621x);
      entity.image = entity.image.replace(IMAGE_REPLACE_SRC, IMAGE_REPLACE_DST_621x);
      
  if (entity.image350x)
    entity.image350x = entity.image350x.replace(IMAGE_REPLACE_SRC, IMAGE_REPLACE_DST_350x);

  if (entity.marker) 
      // entity.marker = entity.marker.replace(IMAGE_REPLACE_SRC, IMAGE_REPLACE_DST_621x);
      entity.marker = entity.marker.replace(IMAGE_REPLACE_SRC, IMAGE_REPLACE_DST_621x);

  if (entity.gallery) 
      entity.gallery.forEach((item) => {
          // item.uri = item.uri.replace(IMAGE_REPLACE_SRC, IMAGE_REPLACE_DST_621x);
          item.uri = item.uri.replace(IMAGE_REPLACE_SRC, IMAGE_REPLACE_DST_621x);
      });

  if (entity && !entity.term && entity.nodes_terms && entity.nodes_terms[0]) 
    entity.term = entity.nodes_terms[0].term;
  
  if (entity.distance)
    entity.distanceStr = distanceToString(entity.distance * 100); 

  // Hasn't a distance, but user coords -> compute distance from user
  if (!entity.distance && coords && entity.georef) {
    entity.distance = distanceToString(distance(coords[0], coords[1], entity.georef.coordinates[0], entity.georef.coordinates[1]));
  }

  // Related pois array
  if (entity.nodes_linked) {
    entity.nodes_linked = entity.nodes_linked.reduce((acc, el, index) => {
      el.node.image = el.node.image.replace("public://", "https://www.sardegnaturismo.it/sites/default/files/");
      acc.push(el.node);
      return acc;
    }, []);
  }

  // Itineraries
  if (entity.stages && entity.stages.length) {
    let stages = {}; 
    entity.stages.forEach((el) => {
      if (!stages[el.language])
        stages[el.language] = [];
      el.poi.image = el.poi.image.replace("public://", "https://www.sardegnaturismo.it/sites/default/files/");
      stages[el.language].push(el);
    });
    entity.stages = stages;
    entity.loaded = true;
  }



  //Events (normalize georef)
  // if (entity.steps) {
  //   for (let lan in entity.steps) 
  //     for (let step of entity.steps[lan])
  //       step.georef = {coordinates: [step.georef.lon, step.georef.lat]}
  // }
}

/**
 * Get N points randomly for temporarily generating itineraries point of interest
 * @param {*} itinerary: the itinerary to which we add pois
 */
export const _tmpAddMockPois = function(itinerary){
  itinerary.pois = samplePois.sort(() => Math.random() - Math.random()).slice(0, Math.ceil(Math.random()*5));
}
