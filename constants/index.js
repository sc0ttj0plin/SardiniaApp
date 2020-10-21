import Colors from './Colors';
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

// API
export const FETCH_NUM_MONTHS_BACKWARDS = 1;
export const FETCH_NUM_MONTHS_FORWARD = 0;
// Others
export const DEFAULT_LANGUAGE = 'it';
export const DATE_FORMAT = 'YYYY-MM-DD';
export const AGENDA_LOCALE = {
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
};
export const REGION_SARDINIA = { longitude: 9.0, latitude: 40.0, longitudeDelta: 2, latitudeDelta: 2.5 };

export const WEBSITE_URL = "https://www.sardegnaturismo.it/";

//NAVIGATION
export const NAVIGATION = {
  NavPlacesScreen: "PlacesScreen",
  NavInspirersScreen: "InspirersScreen",
  NavMapScreen: "MapScreen",
  NavExperiencesScreen: "ExperiencesScreen",
  NavItinerariesStack: "ItinerariesStack",
  NavEventsStack: "EventsStack",
  NavExperiencesItinerariesScreen: "ExperiencesItinerariesScreen",
  NavItineraryScreen: "ItineraryScreen",
  NavEventsScreen: "ExperiencesEventsScreen",
  NavEventScreen: "EventScreen",
  NavExploreScreen: "ExploreScreen",
  NavVirtualTourScreen: "VirtualTourScreen",
  NavPlaceScreen: "PlaceScreen",
  NavVideoScreen: "VideoScreen",
  NavInspirerScreen: "InspirerScreen",
  NavTrendsScreen: "TrendsScreen",
  NavTrendScreen: "TrendScreen",
  NavExtrasScreen: "ExtrasScreen",
  NavExperiences: "Experiences",
  NavPlaces: "Places",
  NavInspirers: "Inspirers",
  NavGalleryScreen: "GalleryScreen",
  NavExplore: "Explore",
  NavEvents: "Events",
  NavTrends: "Trends",
  NavItineraries: "Itineraries",
  NavTabNavigator: "TabNavigator",
  NavLanguageScreen1: "LanguageScreen1",
  NavSearchScreen: "SearchScreen",
  NavSearchStackScreen: "SearchStackScreen",
  NavMainStackScreen: "MainStackScreen",
  NavFavouritesScreen: "FavouritesScreen",
  NavFavouritesStackScreen: "FavouritesStackScreen",
  NavBoilerPlate: "Boilerplate"
}

/**
 * Vocabulary ids:
 *  inspirers, pois, events
 */
export const VIDS = {
  events: 4,
  pois: 14,
  inspirersCategories: 46,
  poisCategories: 36,
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

export const NAVIGATOR_OPTS = { 
  enableHighAccuracy: true, 
  timeout: 20000, 
  maximumAge: 5000 
};

/* CALENDAR */
export const CALENDAR = {
  //Prevent having too many copies of the same object (this) in calendar dates reducer 
  // for other props see: https://github.com/wix/react-native-calendars
  markedDatesDefaultConf: {
    marked: true, 
    customStyles: {
      container: {
        backgroundColor: Colors.lightRed
      }
    }
  },
  todayMarkerDefaultConf: {
    marked: true, 
    customStyles: {
      container: {
        backgroundColor: Colors.red
      }
    }
  }
}

export const styles = {
  html: {
    shortText: "textAlign: center; color: black; font-size: 15;",
    shortTextSecondary: "textAlign: center; color: white; font-size: 15;",
    longText: "textAlign: justify; opacity: 1; font-size: 15;",
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
    selectedDayBackgroundColor: "red",
    selectedDayTextColor: Colors.colorScreen5,
    dayTextColor: "black",
    monthTextColor: "black",
    color: "black",
    textSectionTitleColor: "black",
    textMonthFontWeight: "bold",
    textDisabledColor: "#ECECEC",
    todayTextColor: "white",
    dotColor: "white" ,
    textSectionTitleDisabledColor: '#d9e1e8',
    selectedDotColor: '#ffffff',
    disabledArrowColor: '#d9e1e8',
    indicatorColor: 'blue',
    // textDayFontFamily: 'space-mono',
    // textMonthFontFamily: 'space-mono',
    // textDayHeaderFontFamily: 'space-mono',
    textDayFontWeight: 'bold',
    textMonthFontWeight: 'bold',
    textDayHeaderFontWeight: '300',
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 16
  },
}

