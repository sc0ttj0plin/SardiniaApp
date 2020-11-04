import Colors from './Colors';
import { Platform } from "react-native"

// Actions
export const GET_ENTITIES = 'visitsardinia/entities/LOAD';
export const GET_ENTITIES_SUCCESS = 'visitsardinia/entities/LOAD_SUCCESS';
export const GET_ENTITIES_FAIL = 'visitsardinia/entities/LOAD_FAIL';
export const GET_ENTITY = 'visitsardinia/entity/LOAD';
export const GET_ENTITY_SUCCESS = 'visitsardinia/entity/LOAD_SUCCESS';
export const GET_ENTITY_FAIL = 'visitsardinia/entity/LOAD_FAIL';
export const GET_CATEGORIES = 'visitsardinia/categories/LOAD';
export const GET_CATEGORIES_SUCCESS = 'visitsardinia/categories/LOAD_SUCCESS';
export const GET_CATEGORIES_FAIL = 'visitsardinia/categories/LOAD_FAIL';
export const GET_CATEGORIES_INSPIRERS = 'visitsardinia/categoriesinspirers/LOAD';
export const GET_CATEGORIES_INSPIRERS_SUCCESS = 'visitsardinia/categoriesinspirers/LOAD_SUCCESS';
export const GET_CATEGORIES_INSPIRERS_FAIL = 'visitsardinia/categoriesinspirers/LOAD_FAIL';
export const GET_NEARPOIS = 'visitsardinia/nearpois/LOAD';
export const GET_NEARPOIS_SUCCESS = 'visitsardinia/nearpois/LOAD_SUCCESS';
export const GET_NEARPOIS_FAIL = 'visitsardinia/nearpois/LOAD_FAIL';
export const GET_NEARESTPOIS = 'visitsardinia/nearestpois/LOAD';
export const GET_NEARESTPOIS_SUCCESS = 'visitsardinia/nearestpois/LOAD_SUCCESS';
export const GET_NEARESTPOIS_FAIL = 'visitsardinia/nearestpois/LOAD_FAIL';
export const GET_NEARESTPOISIMAGES = 'visitsardinia/nearestpoisimages/LOAD';
export const GET_NEARESTPOISIMAGES_SUCCESS = 'visitsardinia/nearestpoisimages/LOAD_SUCCESS';
export const GET_NEARESTPOISIMAGES_FAIL = 'visitsardinia/nearestpoisimages/LOAD_FAIL';
export const GET_POIS = 'visitsardinia/pois/LOAD';
export const GET_POIS_SUCCESS = 'visitsardinia/pois/LOAD_SUCCESS';
export const GET_POIS_FAIL = 'visitsardinia/pois/LOAD_FAIL';
export const GET_EXTRAS = 'visitsardinia/extras/LOAD';
export const GET_EXTRAS_SUCCESS = 'visitsardinia/extras/LOAD_SUCCESS';
export const GET_EXTRAS_FAIL = 'visitsardinia/extras/LOAD_FAIL';
export const GET_POI = 'visitsardinia/poi/LOAD';
export const GET_POI_SUCCESS = 'visitsardinia/poi/LOAD_SUCCESS';
export const GET_POI_FAIL = 'visitsardinia/poi/LOAD_FAIL';
export const GET_NODES = 'visitsardinia/nodes/LOAD';
export const GET_NODES_SUCCESS = 'visitsardinia/nodes/LOAD_SUCCESS';
export const GET_NODES_FAIL = 'visitsardinia/nodes/LOAD_FAIL';
export const GET_INSPIRERS = 'visitsardinia/inspirers/LOAD';
export const GET_INSPIRERS_SUCCESS = 'visitsardinia/inspirers/LOAD_SUCCESS';
export const GET_INSPIRERS_FAIL = 'visitsardinia/inspirers/LOAD_FAIL';
export const GET_INSPIRERS_BY_ID = 'visitsardinia/inspirersById/LOAD';
export const GET_INSPIRERS_BY_ID_SUCCESS = 'visitsardinia/inspirersById/LOAD_SUCCESS';
export const GET_INSPIRERS_BY_ID_FAIL = 'visitsardinia/inspirersById/LOAD_FAIL';
export const GET_INSPIRER = 'visitsardinia/inspirer/LOAD';
export const GET_INSPIRER_SUCCESS = 'visitsardinia/inspirer/LOAD_SUCCESS';
export const GET_INSPIRER_FAIL = 'visitsardinia/inspirer/LOAD_FAIL';
export const GET_EVENTS = 'visitsardinia/events/LOAD';
export const GET_EVENTS_SUCCESS = 'visitsardinia/events/LOAD_SUCCESS';
export const GET_EVENTS_FAIL = 'visitsardinia/events/LOAD_FAIL';
export const GET_EVENTS_BY_ID = 'visitsardinia/events_by_id/LOAD';
export const GET_EVENTS_BY_ID_SUCCESS = 'visitsardinia/events_by_id/LOAD_SUCCESS';
export const GET_EVENTS_BY_ID_FAIL = 'visitsardinia/events_by_id/LOAD_FAIL';
export const RESET_EVENTS = 'visitsardinia/events/RESET_EVENTS';
export const FILTER_EVENTS = 'visitsardinia/events/FILTER';
export const CHANGE_LOCALE = 'visitsardinia/locale/CHANGE_LOCALE';
export const GET_CLUSTERS = 'visitsardinia/clusters/LOAD';
export const GET_CLUSTERS_SUCCESS = 'visitsardinia/clusters/LOAD_SUCCESS';
export const GET_CLUSTERS_FAIL = 'visitsardinia/clusters/LOAD_FAIL';
export const GET_EVENT_TYPES = 'visitsardinia/eventtypes/LOAD';
export const GET_EVENT_TYPES_SUCCESS = 'visitsardinia/eventtypes/LOAD_SUCCESS';
export const GET_EVENT_TYPES_FAIL = 'visitsardinia/eventtypes/LOAD_FAIL';
export const GET_ITINERARIES = 'visitsardinia/itineraries/LOAD';
export const GET_ITINERARIES_SUCCESS = 'visitsardinia/itineraries/LOAD_SUCCESS';
export const GET_ITINERARIES_FAIL = 'visitsardinia/itineraries/LOAD_FAIL';
export const GET_ITINERARIES_BY_ID = 'visitsardinia/itinerariesById/LOAD';
export const GET_ITINERARIES_BY_ID_SUCCESS = 'visitsardinia/itinerariesById/LOAD_SUCCESS';
export const GET_ITINERARIES_BY_ID_FAIL = 'visitsardinia/itinerariesById/LOAD_FAIL';
export const SEARCH = 'visitsardinia/search/LOAD';
export const SEARCH_SUCCESS = 'visitsardinia/search/LOAD_SUCCESS';
export const SEARCH_FAIL = 'visitsardinia/search/LOAD_FAIL';
export const AUTOCOMPLETE = 'visitsardinia/autocomplete/LOAD';
export const AUTOCOMPLETE_SUCCESS = 'visitsardinia/autocomplete/LOAD_SUCCESS';
export const AUTOCOMPLETE_FAIL = 'visitsardinia/autocomplete/LOAD_FAIL';
export const RESET_SEARCH_AND_AUTOCOMPLETE_RESULTS = 'visitsardinia/search_autocomplete/RESET_SEARCH_AND_AUTOCOMPLETE_RESULTS';
export const SWITCH_SEARCH_OR_AUTOCOMPLETE = 'visitsardinia/search_autocomplete/SWITCH_SEARCH_OR_AUTOCOMPLETE';
export const SET_SEARCH_OR_AUTOCOMPLETE = 'visitsardinia/search_autocomplete/SET_SEARCH_OR_AUTOCOMPLETE';
export const RESET_SEARCH_AND_AUTOCOMPLETE_STR = 'visitsardinia/search_autocomplete/RESET_SEARCH_AND_AUTOCOMPLETE_STR';
export const SET_FAVOURITE = 'visitsardinia/favourites/SET_FAVOURITE';
export const UNSET_FAVOURITE = 'visitsardinia/favourites/UNSET_FAVOURITE';
export const TOGGLE_FAVOURITE = 'visitsardinia/favourites/TOGGLE_FAVOURITE';
export const PUSH_CURRENT_CATEGORY_PLACES = 'visitsardinia/places/PUSH_CURRENT_CATEGORY_PLACES';
export const POP_CURRENT_CATEGORY_PLACES = 'visitsardinia/places/POP_CURRENT_CATEGORY_PLACES';
export const RESET_CURRENT_CATEGORY_PLACES = 'visitsardinia/places/RESET_CURRENT_CATEGORY_PLACES';
export const PUSH_CURRENT_CATEGORY_INSPIRERS = 'visitsardinia/inspirers/PUSH_CURRENT_CATEGORY_INSPIRERS';
export const POP_CURRENT_CATEGORY_INSPIRERS = 'visitsardinia/inspirers/POP_CURRENT_CATEGORY_INSPIRERS';
export const RESET_CURRENT_CATEGORY_INSPIRERS = 'visitsardinia/inspirers/RESET_CURRENT_CATEGORY_INSPIRERS';

// API
export const FETCH_NUM_MONTHS_BACKWARDS = 1;
export const FETCH_NUM_MONTHS_FORWARD = 0;
// Others
export const DEFAULT_LANGUAGE = 'it';
export const DATE_SEP = '-';
export const DATE_FORMAT = `YYYY${DATE_SEP}MM${DATE_SEP}DD`;
export const DATE_FORMAT_RENDER = `DD / MM / YYYY`;
export const YEAR_MONTH_FORMAT = `YYYY${DATE_SEP}MM`;

export const REGION_SARDINIA = { longitude: 9.0, latitude: 40.0, longitudeDelta: 2, latitudeDelta: 2.5 };

export const WEBSITE_URL = "https://www.sardegnaturismo.it/";

/* NAVIGATION */
export const NAVIGATION = {
  NavPlacesScreen: "PlacesScreen",
  NavInspirersScreen: "InspirersScreen",
  NavMapScreen: "MapScreen",
  NavExperiencesScreen: "ExperiencesScreen",
  NavItinerariesStack: "ItinerariesStack",
  NavEventsStack: "EventsStack",
  NavItinerariesScreen: "ExperiencesItinerariesScreen",
  NavItineraryScreen: "ItineraryScreen",
  NavItineraryStagesMapScreen: "ItineraryStagesMapScreen",
  NavEventsScreen: "ExperiencesEventsScreen",
  NavEventScreen: "EventScreen",
  NavEventsMapScreen: "EventsMapScreen",
  NavExploreScreen: "ExploreScreen",
  NavVirtualTourScreen: "VirtualTourScreen",
  NavPlaceScreen: "PlaceScreen",
  NavVideoScreen: "VideoScreen",
  NavInspirerScreen: "InspirerScreen",
  NavExtrasScreen: "ExtrasScreen",
  NavExperiences: "Experiences",
  NavPlaces: "Places",
  NavInspirers: "Inspirers",
  NavGalleryScreen: "GalleryScreen",
  NavExplore: "Explore",
  NavEvents: "Events",
  NavExtrasScreen: "Extras",
  NavExtraScreen: "Extra",
  NavItineraries: "Itineraries",
  NavTabNavigator: "TabNavigator",
  NavLanguageScreen1: "LanguageScreen1",
  NavSearchScreen: "SearchScreen",
  NavSearchStackScreen: "SearchStackScreen",
  NavMainStackScreen: "MainStackScreen",
  NavFavouritesScreen: "FavouritesScreen",
  NavFavouritesStackScreen: "FavouritesStackScreen",
  NavEventsSubset: "EventsSubsetScreen",
  NavBoilerPlate: "Boilerplate"
}

/**
 * (backend) Categories of Nodes: 
 * Vocabulary ids used for queries
 */
export const VIDS = {
  events: 4,
  pois: 14,
  inspirersCategories: 46,
  poisCategories: 36,
}

/* (backend) Nodes types: used for queries */
export const NODE_TYPES = {
  places: "attrattore",
  inspirers: "ispiratore",
  itineraries: "itinerario",
  events: "evento",
  turisticLocation: "localit_turistica",
}

export const ENTITY_TYPES = {
  places: "places",
  inspirers: "inspirers",
  itineraries: "itineraries",
  events: "events",
}

/* SCREENS CONFIGURATIONS */
export const SCREENS = {
  events: {
    agendaLocale: {
      'it': {
        monthNames: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
        monthNamesShort: ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'],
        dayNames: ['Domenica','Lunedi','Martedi','Mercoledì','Giovedi','Venerdì','Sabato'],
        dayNamesShort: ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'],
        today: 'Oggi'
      },
      'en': {
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
        dayNames: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        dayNamesShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        today: 'Today'
      },
      'fr': {
        monthNames: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
        monthNamesShort: ['Janv.','Févr.','Mars','Avril','Mai','Juin','Juil.','Août','Sept.','Oct.','Nov.','Déc.'],
        dayNames: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
        dayNamesShort: ['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'],
        today: 'Aujourd\'hui'
      },
      'de': {
          monthNames: [ 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'July', 'August', 'September', 'Oktober', 'November', 'Dezember'],
          monthNamesShort: [ 'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep.', 'Okt', 'Nov', 'Dez' ],
          dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
          dayNamesShort: ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'],
      }
    },
    calendar: {
      //Prevent having too many copies of the same object (this) in calendar dates reducer 
      // for other props see: https://github.com/wix/react-native-calendars
      //Marked dates
      markedDatesDefaultConf: {
        marked: true, 
        customStyles: {
          container: {
            backgroundColor: Colors.lightRed
          }
        }
      },
      //Today color
      todayMarkerDefaultConf: {
        marked: true, 
        customStyles: {
          container: {
            backgroundColor: Colors.red
          }
        }
      }
    },
  },
  extras: {
    defaultUuids: [
      "deba536c-a275-4c54-8848-25fa3244593d",
      "d065c9c3-070c-4965-9ee5-072e893f990d", 
      "7a432c9f-fbf1-41b0-bd10-9f2440eb1c9f", 
      "a67d6b6d-716d-40ae-8a49-c845e85f68f2",
    ]
  }
}

/* PAGINATION */
export const PAGINATION = {
  poisLimit: 12,
  poisOffset: null, //not used yet
}

/* MAP CONSTANTS */
export const MAP = {
  //Sardinia
  defaultRegion: {
    longitude: 9.053451,
    latitude: 40.0711,
    latitudeDelta: 3,
    longitudeDelta: 3
  },
}

export const NAVIGATOR = {
  watchPositionOpts: { 
    enableHighAccuracy: true, 
    timeout: 20000, 
    maximumAge: 5000,
    distanceFilter: 50, /* only trigger callback when distance differs of 25 meters */
  },
  getCurrentPositionOpts: { 
    enableHighAccuracy: true, 
    timeout: 20000, 
    maximumAge: 1000,
  } 
}



/* related list options by key */
export const VIDS_AND_NODE_TYPES_ENTITY_TYPES_ICON_OPTS = {
  //Vids (categories, terms)
  [VIDS.pois]: {
    backgroundTopRightCorner: Colors.colorPlacesScreen,
    iconColor: Colors.colorPlacesScreen,
    iconName: Platform.OS === 'ios' ? 'ios-map' : 'md-map'
  },
  [VIDS.poisCategories]: {
    backgroundTopRightCorner: Colors.colorPlacesScreen,
    iconColor: Colors.colorPlacesScreen,
    iconName: Platform.OS === 'ios' ? 'ios-map' : 'md-map'
  },
  [VIDS.inspirersCategories]: {
    backgroundTopRightCorner: Colors.colorInspirersScreen,
    iconColor: Colors.colorInspirersScreen,
    iconName: Platform.OS === 'ios' ? 'ios-flag' : 'md-flag'
  }, 
  [VIDS.events]: {
    backgroundTopRightCorner: Colors.colorEventsScreen,
    iconColor: Colors.colorEventsScreen,
    iconName: Platform.OS === 'ios' ? 'ios-calendar' : "md-calendar"
  },
  // Node types
  [NODE_TYPES.places]: {
    backgroundTopRightCorner: Colors.colorPlacesScreen,
    iconColor: Colors.colorPlacesScreen, 
    iconName: Platform.OS === 'ios' ? 'ios-map' : 'md-map'
  },
  [NODE_TYPES.inspirers]: {
    backgroundTopRightCorner: Colors.colorInspirersScreen,
    iconColor: Colors.colorInspirersScreen,
    iconName: Platform.OS === 'ios' ? 'ios-flag' : 'md-flag'
  }, 
  [NODE_TYPES.itineraries]: {
    backgroundTopRightCorner: Colors.colorItinerariesScreen,
    iconColor: Colors.colorItinerariesScreen,
    iconName: Platform.OS === 'ios' ? 'ios-analytics' : 'md-analytics'
  },
  [NODE_TYPES.events]: {
    backgroundTopRightCorner: Colors.colorEventsScreen,
    iconColor: Colors.colorEventsScreen,
    iconName: Platform.OS === 'ios' ? 'ios-calendar' : "md-calendar"
  },
  [NODE_TYPES.turisticLocation]: {
    backgroundTopRightCorner: Colors.colorPlacesScreen,
    iconColor: Colors.colorPlacesScreen, 
    iconName: Platform.OS === 'ios' ? 'ios-map' : 'md-map'
  },
  //Entity types
  [ENTITY_TYPES.places]: {
    backgroundTopRightCorner: Colors.colorPlacesScreen,
    iconColor: "white",
    iconName: Platform.OS === 'ios' ? 'ios-map' : 'md-map'
  },
  [ENTITY_TYPES.inspirers]: {
    backgroundTopRightCorner: Colors.colorInspirersScreen,
    iconColor: "white",
    iconName: Platform.OS === 'ios' ? 'ios-flag' : 'md-flag'
  }, 
  [ENTITY_TYPES.itineraries]: {
    backgroundTopRightCorner: Colors.colorItinerariesScreen,
    iconColor: "white",
    iconName: Platform.OS === 'ios' ? 'ios-analytics' : 'md-analytics'
  },
  [ENTITY_TYPES.events]: {
    backgroundTopRightCorner: Colors.colorEventsScreen,
    iconColor: "white",
    iconName: Platform.OS === 'ios' ? 'ios-calendar' : "md-calendar"
  }
}

export const styles = {
  html: {
    shortText: "textAlign: center; color: #333333; font-size: 15;",
    shortTextSecondary: "textAlign: center; color: #333333; font-size: 15;",
    longText: "textAlign: center; opacity: 1; font-size: 15; padding-left: 16px; padding-right: 16px;",
    longTextLeft: "textAlign: left; opacity: 1; font-size: 15;",
  },
  innerText: {
    paddingLeft: 10,
    paddingRight: 10
  },
  calendarTheme: {
    backgroundColor: Colors.lightGrey,
    calendarBackground: Colors.lightGrey,
    agendaDayNumColor: "black",
    agendaTodayColor: "black",
    agendaDayTextColor: "black",
    arrowColor: 'black',
    selectedDayBackgroundColor: Colors.salmon,
    selectedDayTextColor: 'black',
    dayTextColor: "black",
    monthTextColor: "black",
    color: "black",
    textSectionTitleColor: "black",
    textMonthFontWeight: "bold",
    textDisabledColor: "#ECECEC",
    todayTextColor: "white",
    dotColor: Colors.salmon,
    // selectedDotColor: 'white',
    // disabledDotColor: 'black',
    dotStyle: {marginTop: -2},
    textSectionTitleDisabledColor: '#d9e1e8',
    selectedDotColor: '#ffffff',
    disabledArrowColor: '#d9e1e8',
    indicatorColor: 'blue',
    textDayFontWeight: 'bold',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '300',
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 16,
    // textDayStyle: {marginTop: Platform.OS === 'android' ? 2 : 4},
  },
}

