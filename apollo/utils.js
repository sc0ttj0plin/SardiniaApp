import moment from 'moment';
import * as Constants from '../constants';
import {distance, distanceToString} from '../helpers/maps'
import samplePois from '../constants/_samplePois';
import sampleMarkers from '../constants/_sampleMarkers';
import sampleImages from '../constants/_sampleImages';

/**
 * Process events after fetching: normalizes date and image fields
 * Builds an object consisting of events keyed by their date: YYYY-MM-DD
 * @param {*} events The events array
 * @param {*} filtersByType Filter
 */
export const processEvents = function(events) {
  let eventsObj = {};
  events.forEach((e) => {
      if (e.date1) {
        //TODO: remove .add(1,"year")
        let dateFormatted = moment.unix(e.date1).add(1,"year").format(Constants.DATE_FORMAT);
        let singleEvent = { 
          ...e,
          image: e.image.replace("public://", "https://www.sardegnaturismo.it/sites/default/files/"),
          date1Str: moment.unix(e.date1).add(1,"year").format('DD MMMM YYYY'),
        };
        eventsObj[dateFormatted] = eventsObj[dateFormatted] ? [...eventsObj[dateFormatted], singleEvent] : [singleEvent] 
      }
  });
  return eventsObj;
}

/**
 * Process categories 
 * @param {*} categories: 
 * @param {*} termsMap
 */
export const processCategories = function(categories, termsMap) {
  var cCategories = [];
  for(var i = 0; i < categories.length; i++){
      var c = categories[i];
      processEntity(c);
      if(c.image)
        c.image = c.image.replace("public://", "https://www.sardegnaturismo.it/sites/default/files/");
      else if(sampleImages[c.tid]) 
        c.image = sampleImages[c.tid].image;
      else
        c.image = "https://www.sardegnainblog.it/video/wp-content/uploads/2018/06/isola-asinara-escursioni-in-barca.jpg"
        if(c.nodes_terms_aggregate.aggregate.count > 0) {
          c.uuids = [c.uuid];
      }

      if(c.terms && c.terms.length > 0) {
          var terms = processCategories(c.terms, termsMap);   
          for(var j=0; j<terms.length; j++){
              c.uuids = c.uuids ? c.uuids.concat(terms[j].uuids) : terms[j].uuids;
              c.image = terms[j].image.replace("public://", "https://www.sardegnaturismo.it/sites/default/files/");
          };
          c.terms = terms;
      }
      if(c.nodes_terms_aggregate.aggregate.count > 0 || (c.terms && c.terms.length > 0) ) {
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
 * Process a generic entity replacing image urls and computing distance
 * @param {*} entity: a generic entity
 * @param {*} coords: coordinates for that entity
 */
export const processEntity = function(entity, coords=null) {
  if(entity.image) {
      entity.image = entity.image.replace("public://", "https://www.sardegnaturismo.it/sites/default/files/");
  }
  if(entity.marker) {
      entity.marker = entity.marker.replace("public://", "https://www.sardegnaturismo.it/sites/default/files/");
  }
  if(entity.gallery) {
      entity.gallery.forEach((item) => {
          item.uri = item.uri.replace("public://", "https://www.sardegnaturismo.it/sites/default/files/");
      })
  }
  if(!entity.distance && coords && entity.georef) {
      entity.distance = distanceToString(distance(coords[0], coords[1], entity.georef.coordinates[0], entity.georef.coordinates[1]));
  }
}

/**
 * Get N points randomly for temporarily generating itineraries point of interest
 * @param {*} itinerary: the itinerary to which we add pois
 */
export const _tmpAddMockPois = function(itinerary){
  itinerary.pois = samplePois.sort(() => Math.random() - Math.random()).slice(0, Math.ceil(Math.random()*5));
}
