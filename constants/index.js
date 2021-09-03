import Colors from './Colors';
import { Platform } from "react-native"
import * as Location from 'expo-location';
import * as Localization from 'expo-localization';
import  { normalizeLanguage } from '../helpers/language';

// ACTIONS
export const SET_URL = 'sardinia/others/SET_URL';
export const AUTH = 'sardinia/auth/AUTH';
export const AUTH_SUCCESS = 'sardinia/auth/AUTH_SUCCESS';
export const AUTH_FAIL = 'sardinia/auth/AUTH_FAIL';
export const AUTH_RESET = 'sardinia/auth/AUTH_RESET';
export const LOGOUT = 'sardinia/auth/LOGOUT';
export const LOGOUT_SUCCESS = 'sardinia/auth/LOGOUT_SUCCESS';
export const LOGOUT_FAIL = 'sardinia/auth/LOGOUT_FAIL';
export const LOGOUT_RESET = 'sardinia/auth/LOGOUT_RESET';
export const GET_ENTITIES = 'sardinia/entities/LOAD';
export const GET_ENTITIES_SUCCESS = 'sardinia/entities/LOAD_SUCCESS';
export const GET_ENTITIES_FAIL = 'sardinia/entities/LOAD_FAIL';
export const GET_ENTITY = 'sardinia/entity/LOAD';
export const GET_ENTITY_SUCCESS = 'sardinia/entity/LOAD_SUCCESS';
export const GET_ENTITY_FAIL = 'sardinia/entity/LOAD_FAIL';
export const GET_CATEGORIES = 'sardinia/categories/LOAD';
export const GET_CATEGORIES_SUCCESS = 'sardinia/categories/LOAD_SUCCESS';
export const GET_CATEGORIES_FAIL = 'sardinia/categories/LOAD_FAIL';
export const GET_CATEGORIES_PREFERENCES = 'sardinia/categoriesPreferences/LOAD';
export const GET_CATEGORIES_PREFERENCES_SUCCESS = 'sardinia/categoriesPreferences/LOAD_SUCCESS';
export const GET_CATEGORIES_PREFERENCES_FAIL = 'sardinia/categoriesPreferences/LOAD_FAIL';
export const GET_CATEGORIES_INSPIRERS = 'sardinia/categoriesinspirers/LOAD';
export const GET_CATEGORIES_INSPIRERS_SUCCESS = 'sardinia/categoriesinspirers/LOAD_SUCCESS';
export const GET_CATEGORIES_INSPIRERS_FAIL = 'sardinia/categoriesinspirers/LOAD_FAIL';
export const GET_NEARPOIS = 'sardinia/nearpois/LOAD';
export const GET_NEARPOIS_SUCCESS = 'sardinia/nearpois/LOAD_SUCCESS';
export const GET_NEARPOIS_FAIL = 'sardinia/nearpois/LOAD_FAIL';
export const GET_NEARESTPOIS = 'sardinia/nearestpois/LOAD';
export const GET_NEARESTPOIS_SUCCESS = 'sardinia/nearestpois/LOAD_SUCCESS';
export const GET_NEARESTPOIS_FAIL = 'sardinia/nearestpois/LOAD_FAIL';
export const GET_NEARESTPOISLIGHT = 'sardinia/nearestpoislight/LOAD';
export const GET_NEARESTPOISLIGHT_SUCCESS = 'sardinia/nearestpoislight/LOAD_SUCCESS';
export const GET_NEARESTPOISLIGHT_FAIL = 'sardinia/nearestpoislight/LOAD_FAIL';
export const GET_NEARESTPOISIMAGES = 'sardinia/nearestpoisimages/LOAD';
export const GET_NEARESTPOISIMAGES_SUCCESS = 'sardinia/nearestpoisimages/LOAD_SUCCESS';
export const GET_NEARESTPOISIMAGES_FAIL = 'sardinia/nearestpoisimages/LOAD_FAIL';
export const GET_NEARESTACCOMODATIONS = 'sardinia/nearestaccomodations/LOAD';
export const GET_NEARESTACCOMODATIONS_SUCCESS = 'sardinia/nearestaccomodations/LOAD_SUCCESS';
export const GET_NEARESTACCOMODATIONS_FAIL = 'sardinia/nearestaccomodations/LOAD_FAIL';
export const GET_NEARESTACCOMODATIONSIMAGES = 'sardinia/nearestaccomodationsimages/LOAD';
export const GET_NEARESTACCOMODATIONSIMAGES_SUCCESS = 'sardinia/nearestaccomodationsimages/LOAD_SUCCESS';
export const GET_NEARESTACCOMODATIONSIMAGES_FAIL = 'sardinia/nearestaccomodationsimages/LOAD_FAIL';
export const GET_NEAREST_NODES_BY_TYPE = 'sardinia/nearest_nodes_by_type/LOAD';
export const GET_NEAREST_NODES_BY_TYPE_SUCCESS = 'sardinia/nearest_nodes_by_type/LOAD_SUCCESS';
export const GET_NEAREST_NODES_BY_TYPE_FAIL = 'sardinia/nearest_nodes_by_type/LOAD_FAIL';
export const GET_POIS = 'sardinia/pois/LOAD';
export const GET_POIS_SUCCESS = 'sardinia/pois/LOAD_SUCCESS';
export const GET_POIS_FAIL = 'sardinia/pois/LOAD_FAIL';
export const GET_EXTRAS = 'sardinia/extras/LOAD';
export const GET_EXTRAS_SUCCESS = 'sardinia/extras/LOAD_SUCCESS';
export const GET_EXTRAS_FAIL = 'sardinia/extras/LOAD_FAIL';
export const GET_POI = 'sardinia/poi/LOAD';
export const GET_POI_SUCCESS = 'sardinia/poi/LOAD_SUCCESS';
export const GET_POI_FAIL = 'sardinia/poi/LOAD_FAIL';
export const GET_NODES = 'sardinia/nodes/LOAD';
export const GET_NODES_SUCCESS = 'sardinia/nodes/LOAD_SUCCESS';
export const GET_NODES_FAIL = 'sardinia/nodes/LOAD_FAIL';
export const GET_ACCOMODATIONS = 'sardinia/accomodations/LOAD';
export const GET_ACCOMODATIONS_SUCCESS = 'sardinia/accomodations/LOAD_SUCCESS';
export const GET_ACCOMODATIONS_FAIL = 'sardinia/accomodations/LOAD_FAIL';
export const GET_ACCOMODATION = 'sardinia/accomodation/LOAD';
export const GET_ACCOMODATION_SUCCESS = 'sardinia/accomodation/LOAD_SUCCESS';
export const GET_ACCOMODATION_FAIL = 'sardinia/accomodation/LOAD_FAIL';
export const GET_ACCOMODATIONS_BY_ID = 'sardinia/accomodationsById/LOAD';
export const GET_ACCOMODATIONS_BY_ID_SUCCESS = 'sardinia/accomodationsById/LOAD_SUCCESS';
export const GET_ACCOMODATIONS_BY_ID_FAIL = 'sardinia/accomodationsById/LOAD_FAIL';
export const GET_INSPIRERS = 'sardinia/inspirers/LOAD';
export const GET_INSPIRERS_SUCCESS = 'sardinia/inspirers/LOAD_SUCCESS';
export const GET_INSPIRERS_FAIL = 'sardinia/inspirers/LOAD_FAIL';
export const GET_INSPIRERS_BY_ID = 'sardinia/inspirersById/LOAD';
export const GET_INSPIRERS_BY_ID_SUCCESS = 'sardinia/inspirersById/LOAD_SUCCESS';
export const GET_INSPIRERS_BY_ID_FAIL = 'sardinia/inspirersById/LOAD_FAIL';
export const GET_INSPIRER = 'sardinia/inspirer/LOAD';
export const GET_INSPIRER_SUCCESS = 'sardinia/inspirer/LOAD_SUCCESS';
export const GET_INSPIRER_FAIL = 'sardinia/inspirer/LOAD_FAIL';
export const GET_EVENTS = 'sardinia/events/LOAD';
export const GET_EVENTS_SUCCESS = 'sardinia/events/LOAD_SUCCESS';
export const GET_EVENTS_FAIL = 'sardinia/events/LOAD_FAIL';
export const GET_EVENTS_BY_ID = 'sardinia/events_by_id/LOAD';
export const GET_EVENTS_BY_ID_SUCCESS = 'sardinia/events_by_id/LOAD_SUCCESS';
export const GET_EVENTS_BY_ID_FAIL = 'sardinia/events_by_id/LOAD_FAIL';
export const RESET_EVENTS = 'sardinia/events/RESET_EVENTS';
export const FILTER_EVENTS = 'sardinia/events/FILTER';
export const CHANGE_LOCALE = 'sardinia/locale/CHANGE_LOCALE';
export const GET_CLUSTERS = 'sardinia/clusters/LOAD';
export const GET_CLUSTERS_SUCCESS = 'sardinia/clusters/LOAD_SUCCESS';
export const GET_CLUSTERS_FAIL = 'sardinia/clusters/LOAD_FAIL';

/* event types */
export const SET_SELECTED_EVENT_TYPES = 'sardinia/eventtypes/SET';
export const GET_EVENT_TYPES = 'sardinia/eventtypes/LOAD';
export const GET_EVENT_TYPES_SUCCESS = 'sardinia/eventtypes/LOAD_SUCCESS';
export const GET_EVENT_TYPES_FAIL = 'sardinia/eventtypes/LOAD_FAIL';
/* itinerary types */
export const SET_SELECTED_ITINERARY_TYPES = 'sardinia/itinerarytypes/SET';
export const GET_ITINERARY_TYPES = 'sardinia/itinerarytypes/LOAD';
export const GET_ITINERARY_TYPES_SUCCESS = 'sardinia/itinerarytypes/LOAD_SUCCESS';
export const GET_ITINERARY_TYPES_FAIL = 'sardinia/itinerarytypes/LOAD_FAIL';
/* place types */
export const SET_SELECTED_PLACE_TYPES = 'sardinia/placetypes/SET';
export const GET_PLACE_TYPES = 'sardinia/placetypes/LOAD';
export const GET_PLACE_TYPES_SUCCESS = 'sardinia/placetypes/LOAD_SUCCESS';
export const GET_PLACE_TYPES_FAIL = 'sardinia/placetypes/LOAD_FAIL';

export const GET_ITINERARIES = 'sardinia/itineraries/LOAD';
export const GET_ITINERARIES_SUCCESS = 'sardinia/itineraries/LOAD_SUCCESS';
export const GET_ITINERARIES_FAIL = 'sardinia/itineraries/LOAD_FAIL';
export const GET_ITINERARIES_BY_ID = 'sardinia/itinerariesById/LOAD';
export const GET_ITINERARIES_BY_ID_SUCCESS = 'sardinia/itinerariesById/LOAD_SUCCESS';
export const GET_ITINERARIES_BY_ID_FAIL = 'sardinia/itinerariesById/LOAD_FAIL';
export const SEARCH = 'sardinia/search/LOAD';
export const SEARCH_SUCCESS = 'sardinia/search/LOAD_SUCCESS';
export const SEARCH_FAIL = 'sardinia/search/LOAD_FAIL';
export const AUTOCOMPLETE = 'sardinia/autocomplete/LOAD';
export const AUTOCOMPLETE_SUCCESS = 'sardinia/autocomplete/LOAD_SUCCESS';
export const AUTOCOMPLETE_FAIL = 'sardinia/autocomplete/LOAD_FAIL';
export const RESET_SEARCH_AND_AUTOCOMPLETE_RESULTS = 'sardinia/search_autocomplete/RESET_SEARCH_AND_AUTOCOMPLETE_RESULTS';
export const SWITCH_SEARCH_OR_AUTOCOMPLETE = 'sardinia/search_autocomplete/SWITCH_SEARCH_OR_AUTOCOMPLETE';
export const SET_SEARCH_OR_AUTOCOMPLETE = 'sardinia/search_autocomplete/SET_SEARCH_OR_AUTOCOMPLETE';
export const RESET_SEARCH_AND_AUTOCOMPLETE_STR = 'sardinia/search_autocomplete/RESET_SEARCH_AND_AUTOCOMPLETE_STR';
export const SET_FAVOURITE = 'sardinia/favourites/SET_FAVOURITE';
export const UNSET_FAVOURITE = 'sardinia/favourites/UNSET_FAVOURITE';
export const TOGGLE_FAVOURITE = 'sardinia/favourites/TOGGLE_FAVOURITE';
export const INIT_FAVOURITES = 'sardinia/favourites/INIT_FAVOURITES';
export const PUSH_CURRENT_CATEGORY_PLACES = 'sardinia/places/PUSH_CURRENT_CATEGORY_PLACES';
export const POP_CURRENT_CATEGORY_PLACES = 'sardinia/places/POP_CURRENT_CATEGORY_PLACES';
export const RESET_CURRENT_CATEGORY_PLACES = 'sardinia/places/RESET_CURRENT_CATEGORY_PLACES';
export const PUSH_CURRENT_CATEGORY_INSPIRERS = 'sardinia/inspirers/PUSH_CURRENT_CATEGORY_INSPIRERS';
export const POP_CURRENT_CATEGORY_INSPIRERS = 'sardinia/inspirers/POP_CURRENT_CATEGORY_INSPIRERS';
export const RESET_CURRENT_CATEGORY_INSPIRERS = 'sardinia/inspirers/RESET_CURRENT_CATEGORY_INSPIRERS';
export const PUSH_CURRENT_CATEGORY_ACCOMODATIONS = 'sardinia/accomodations/PUSH_CURRENT_CATEGORY_ACCOMODATIONS';
export const POP_CURRENT_CATEGORY_ACCOMODATIONS = 'sardinia/accomodations/POP_CURRENT_CATEGORY_ACCOMODATIONS';
export const RESET_CURRENT_CATEGORY_ACCOMODATIONS = 'sardinia/accomodations/RESET_CURRENT_CATEGORY_ACCOMODATIONS';
export const SET_CURRENT_MAP_ENTITY = 'sardinia/map/SET_CURRENT_MAP_ENTITY'; /* to set the snap index on parent components */
export const USER_EDIT = 'sardinia/user/LOAD';
export const USER_EDIT_SUCCESS = 'sardinia/user/LOAD_SUCCESS';
export const USER_EDIT_FAIL = 'sardinia/user/LOAD_FAIL';
export const MAP_SET_DRAGGING = 'sardinia/others/MAP_SET_DRAGGING';
export const SCROLLABLE_SET_PRESSIN = 'sardinia/others/SCROLLABLE_SET_PRESSIN';
export const SCROLLABLE_SET_SCROLLINDEX = 'sardinia/others/SCROLLABLE_SET_SCROLLINDEX';
export const SET_GEOLOCATION = 'sardinia/others/SET_GEOLOCATION';
export const CHECK_FOR_UPDATES = 'sardinia/others/CHECK_FOR_UPDATES';
export const SET_NETWORK_STATUS = 'sardinia/others/SET_NETWORK_STATUS';
export const SET_NAVIGATOR_READY = 'sardinia/others/SET_NAVIGATOR_READY';
export const SET_MAIN_SCREEN_MOUNTED = 'sardinia/others/SET_MAIN_SCREEN_MOUNTED';
export const SET_MAIN_SCREEN_SHOWN = 'sardinia/others/SET_MAIN_SCREEN_SHOWN';
export const SET_ERROR = 'sardinia/others/SET_ERROR';
export const UNSET_ERROR = 'sardinia/others/UNSET_ERROR';
export const FAVOURITES_EDIT = 'sardinia/favourites/FAVOURITES_EDIT'; 
export const FAVOURITES_EDIT_SUCCESS = 'sardinia/favourites/FAVOURITES_EDIT_SUCCESS'; 
export const FAVOURITES_EDIT_FAIL = 'sardinia/favourites/FAVOURITES_EDIT_FAIL'; 

// API
export const FETCH_NUM_MONTHS_BACKWARDS = 1;
export const FETCH_NUM_MONTHS_FORWARD = 0;

// OTHERS
export const RESTART_DELAY = 2000;
/* probability that a main component checks for OTA updates on didMount: 0.5: 50%, 0.2: 20% */
export const CHECK_FOR_UPDATES_WHILE_FOREGROUNDED_PROB = 0.1; 
export const DEFAULT_LANGUAGE = normalizeLanguage(Localization.locale); /* deal with en or en-gb => en */
export const DATE_SEP = '-';
export const DATE_FORMAT = `YYYY${DATE_SEP}MM${DATE_SEP}DD`;
export const DATE_FORMAT_RENDER = `DD / MM / YYYY`;
export const YEAR_MONTH_FORMAT = `YYYY${DATE_SEP}MM`;

export const REGION_SARDINIA = { longitude: 9.0, latitude: 40.0, longitudeDelta: 2, latitudeDelta: 3.2 };

//DOMAIN & LINKING
export const LINKING_AUTH_SEARCHSTR = "apiKey"; /* if the input link contains this substr, consider it */

export const LINKING_TYPES = {
  auth: "auth",
  website: "website",
  notifications: "notifications"
}

export const SPLASH_EXPO_DURATION = 1000;
export const SPLASH_LOADING_DURATION = 3000;
export const SPLASH_LOADING_DISAPPEAR_DURATION = 250;
/* after the main screen is visible to the user, after how long the update + network + linking + notifications modals can be shown */
export const MODALS_SHOW_DELAY = 2000; 
/* linking entity can be too quick to load, add an extra loading delay to let the user see the loading modal */
export const NAVIGATE_TO_LINKED_ENTITY_DELAY = 3000;

// ANALYTICS
export const ANALYTICS_MAX_STORED_ACTIONS = 10; /* sends actions to backend after N accumulated actions before sending to backend */
export const ANALYTICS_TYPES = {
  // Interaction
  userCompleteEntityAccess: 0,
  userPartialEntityAccess: 1,
  userReadsAllEntity: 2,
  userAddsEntityToFavourites: 3,
  userOpensEntityMultimediaContent: 4,
  userRemovesEntityFromFavourites: 5,
  //Preferences & Profile
  userUpdatesPreferences: 400,
  userUpdatesProfile: 401,
  userRemovesProfile: 402,
  //
  userSearches: 201,
  // Error
  errorTrace: 100,
  // GPS
  gpsTracking: 200,
}

// NAVIGATION
export const NAVIGATION = {
  NavDrawerNavigator: "RootNavigation",
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
  NavPlacesFiltersScreen: "PlacesFiltersScreen",
  NavMediaScreen: "MediaScreen",
  NavInspirerScreen: "InspirerScreen",
  NavExtrasScreen: "ExtrasScreen",
  NavExperiences: "Experiences",
  NavInspirers: "Inspirers",
  NavPreferencesStack: "PreferencesStackScreen",
  NavPreferencesScreen: "PreferencesScreen",
  NavTutorialScreen: "TutorialScreen",
  NavLoginScreen: "LoginScreen",
  NavLogoutScreen: "LogoutScreen",
  NavAuthScreen: "AuthScreen",
  NavGalleryMapScreen: "GalleryMapScreen",
  NavGalleryScreen: "GalleryScreen",
  NavGalleryStackScreen: "GalleryStackScreen",
  NavGalleryMapStackScreen: "NavGalleryMapStackScreen",
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
  NavFavouritesListScreen: "FavouritesListScreen",
  NavFavouritesStackScreen: "FavouritesStackScreen",
  NavEventsSubset: "EventsSubsetScreen",
  NavAccomodationsScreen: "AccomodationsScreen",
  NavAccomodationScreen: "AccomodationScreen",
  NavAccomodationsStackScreen: "AccomodationsStackScreen",
  NavFiltersScreen: "Filters",
  NavBoilerPlate: "Boilerplate",
}

/**
 * (backend) Categories of Nodes: 
 * Vocabulary ids used for queries
 */
export const VIDS = {
  events: 9, //was 4
  pois: 14,
  inspirersCategories: 46,
  poisCategories: 36,
  accomodations: 20,
}

/* (backend) Nodes types: used for queries */
export const NODE_TYPES = {
  places: "attrattore",
  inspirers: "ispiratore",
  itineraries: "itinerario",
  events: "evento",
  turisticLocation: "localit_turistica",
  accomodations: "strutture_ricettive",
}

/* (frontend) Node types: used for rendering */
export const ENTITY_TYPES = {
  places: "places",
  inspirers: "inspirers",
  itineraries: "itineraries",
  events: "events",
  accomodations: "accomodations",
}

/* SCREENS CONFIGURATIONS */
export const SCREENS = {
  maxRelatedNestingNavigation: 3,
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
          },
        }
      },
      //Today color
      todayMarkerDefaultConf: {
        marked: true, 
        customStyles: {
          container: {
            backgroundColor: Colors.red
          },
          text: {
            color: 'white',
          }
        }
      }
    },
  },
  extras: {
    defaultUuids: [
      "83650f2a-ccab-44bc-a938-2cdb5bb2f1e3", //Alghero
      "a149c57b-9973-4a2a-a5e9-2a9d95c3f676", //Porto Giunco
      "054cb368-6ddc-417f-bbda-bd5bd35b8f2e", //Supramonte
      "60910491-48ce-480d-9f3c-9ce08c086070", //Nuraghe Losa
      "fdabb67f-fc45-40fc-83da-ac3ab6f4672e", //Mamoiada
      "eae5bf1e-1358-49a4-8681-a82b824a031c", //Cittadella Dei Musei
    ]
  }
}

/* COMPONENTS CONFIGURATIONS */
export const COMPONENTS = {
  header: {
    height: 55,
    bottomLineHeight: 3
  }
}

/* PAGINATION */
export const PAGINATION = {
  poisLimit: 15,
  accomodationsLimit: 30,
  poisAccomodationsLimit: 8,
}

/* MAP CONSTANTS */
export const MAP = {
  //Sardinia
  defaultRegion: {
    longitude: 9.053451,
    latitude: 40,
    latitudeDelta: 2.5,
    longitudeDelta: 2.5
  },
  defaultRegionZoomed: {
    longitude: 8.97983092814684,
    latitude: 40.07828365560724,
    latitudeDelta: 2,
    longitudeDelta: 2,
    zoom: 8.3
  },
}

export const EMOTICONS = {
  dizzy: {
    id: "dizzy",
    iconId: "dizzy",
    activeColor: Colors.colorEventsScreen,
    clickableDefaultColor: Colors.lightGray,
    likenessRatio: 0.0,
  },
  meh: {
    id: "meh",
    iconId: "meh",
    activeColor: Colors.colorInspirersScreen,
    clickableDefaultColor: Colors.lightGray,
    likenessRatio: 0.33,
  },
  laughSquint: {
    id: "laughSquint",
    iconId: "laugh-squint",
    activeColor: Colors.colorPlacesScreen,
    clickableDefaultColor: Colors.lightGray,
    likenessRatio: 0.66,
  },
  grinHearts: {
    id: "grinHearts",
    iconId: "grin-hearts",
    activeColor: Colors.colorItinerariesScreen,
    clickableDefaultColor: Colors.lightGray,
    likenessRatio: 1.0,
  }
}

export const GEOLOCATION = {
  //background geolocation
  geolocationFenceTaskName: 'geofence-geolocation',
  geolocationBackgroundTaskName: 'background-geolocation',
  startLocationUpdatesAsyncOpts: {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 20000,
    distanceInterval: 50,
    // showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "Sardinia App Location",
      notificationBody: "Sardinia App is tracking your location",
      notificationColor: "#ffffff"
    },
    showsBackgroundLocationIndicator: true
  },
  //foreground geolocation
  watchPositionAsyncOpts: {
    accuracy: Location.Accuracy.Highest,
    timeInterval: 20000,
    distanceInterval: 50,
  },
  //one shot geolocation
  getCurrentPositionAsyncOpts: {
    accuracy: Location.Accuracy.Highest,
  },
  sources: {
    background: "startLocationUpdatesAsync",
    foregroundWatch: "watchPositionAsyncOpts",
    foregroundGetOnce: "getCurrentPositionAsyncOpts"
  }
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
    iconName: 'icon-place-map'
  },
  [VIDS.poisCategories]: {
    backgroundTopRightCorner: Colors.colorPlacesScreen,
    iconColor: Colors.colorPlacesScreen,
    iconName: 'icon-place-map'
  },
  [VIDS.inspirersCategories]: {
    backgroundTopRightCorner: Colors.colorInspirersScreen,
    iconColor: Colors.colorInspirersScreen,
    iconName: 'icon-inspirer-map'
  }, 
  [VIDS.events]: {
    backgroundTopRightCorner: Colors.colorEventsScreen,
    iconColor: Colors.colorEventsScreen,
    iconName: 'icon-event-map'
  },
  [VIDS.accomodations]: {
    backgroundTopRightCorner: Colors.colorAccomodationsScreen,
    iconColor: Colors.colorAccomodationsScreen, 
    iconName: 'icon-accomodation-map'
  },
  // Node types
  [NODE_TYPES.places]: {
    backgroundTopRightCorner: Colors.colorPlacesScreen,
    iconColor: Colors.colorPlacesScreen, 
    iconName: 'icon-place-map'
  },
  [NODE_TYPES.inspirers]: {
    backgroundTopRightCorner: Colors.colorInspirersScreen,
    iconColor: Colors.colorInspirersScreen,
    iconName: 'icon-inspirer-map'
  }, 
  [NODE_TYPES.itineraries]: {
    backgroundTopRightCorner: Colors.colorItinerariesScreen,
    iconColor: Colors.colorItinerariesScreen,
    iconName: 'icon-itinerary-map'
  },
  [NODE_TYPES.events]: {
    backgroundTopRightCorner: Colors.colorEventsScreen,
    iconColor: Colors.colorEventsScreen,
    iconName: 'icon-event-map'
  },
  [NODE_TYPES.turisticLocation]: {
    backgroundTopRightCorner: Colors.colorPlacesScreen,
    iconColor: Colors.colorPlacesScreen, 
    iconName: 'icon-place-map'
  },
  [NODE_TYPES.accomodations]: {
    backgroundTopRightCorner: Colors.colorAccomodationsScreen,
    iconColor: "white", 
    iconName: 'icon-accomodation-map'
  },
  //Entity types
  [ENTITY_TYPES.places]: {
    backgroundTopRightCorner: Colors.colorPlacesScreen,
    iconColor: "white",
    backgroundColor: Colors.colorPlacesScreen,
    backgroundTransparent: Colors.colorPlacesScreenTransparent,
    iconName: 'icon-place-map'
  },
  [ENTITY_TYPES.inspirers]: {
    backgroundTopRightCorner: Colors.colorInspirersScreen,
    iconColor: "white",
    backgroundColor: Colors.colorInspirersScreen,
    backgroundTransparent: Colors.colorInspirersScreen,
    iconName: 'icon-inspirer-map'
  }, 
  [ENTITY_TYPES.itineraries]: {
    backgroundTopRightCorner: Colors.colorItinerariesScreen,
    iconColor: "white",
    backgroundColor: Colors.colorItinerariesScreen,
    backgroundTransparent: Colors.colorItinerariesScreenTransparent,
    iconName: 'icon-itinerary-map'
  },
  [ENTITY_TYPES.events]: {
    backgroundTopRightCorner: Colors.colorEventsScreen,
    iconColor: "white",
    backgroundColor: Colors.colorEventsScreen,
    backgroundTransparent: Colors.colorEventsScreenTransparent,
    iconName: "icon-event-map"
  },
  [ENTITY_TYPES.accomodations]: {
    backgroundTopRightCorner: Colors.colorAccomodationsScreen,
    iconColor: "white", 
    backgroundColor: Colors.colorAccomodationsScreen,
    backgroundTransparent: Colors.colorAccomodationsScreenTransparent,
    iconName: 'icon-accomodation-map'
  },
}

export const FAVOURITES_MAX_ITEMS_IN_LIST = 6;

export const AnimationConfig = {
  imageAnimationDuration: 20000
}

/* PROFILE */
export const PROFILE = {
  MIN_AGE: 7,
  MAX_AGE: 101,
}

export const ACCOMODATIONS_DATA_DEFAULT = [
  {term: "categoria 1", title: "titolo 1", stars: 1, distance: 2, location: "città"},
  {term: "categoria 2", title: "titolo 2", stars: 2, distance: 3, location: "città"},
  {term: "categoria 3", title: "titolo 3", stars: 3, distance: 4, location: "città"},
  {term: "categoria 4", title: "titolo 4", stars: 4, distance: 5, location: "città"},
  {term: "categoria 5", title: "titolo 5", stars: 5, distance: 6, location: "città"}
]

export const SCROLLABLE_MODAL_STATES = { explore: 'explore', extraModal: 'extraModal', selectedEntity: 'selectedEntity' };

export const styles = {
  html: {
    shortText: "textAlign: center; color: #333333; font-family: montserrat-regular; font-size: 15; padding-left: 16px; padding-right: 16px;",
    shortTextSecondary: "textAlign: center; color: #333333; font-family: montserrat-regular; font-size: 15; padding-left: 16px; padding-right: 16px;",
    longText: "textAlign: justify; opacity: 1; font-family: montserrat-regular; font-size: 15; padding-left: 5px; padding-right: 5px;",
    longTextLeft: "textAlign: left; opacity: 1; font-family: montserrat-regular; font-size: 15;",
    longTextCenter: "textAlign: center; opacity: 1; font-family: montserrat-regular; font-size: 15;",
  },
  innerText: {
    paddingLeft: 10,
    paddingRight: 10
  },
  entityItemInModal: {
    titleFontSize: 13,
    termFontSize: 11,
    distanceFontSize: 11,
    textPadding: 8
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  calendarTheme: {
    backgroundColor: Colors.lightGray,
    calendarBackground: Colors.lightGray,
    agendaDayNumColor: "black",
    agendaTodayColor: "white",
    agendaDayTextColor: "black",
    arrowColor: 'black',
    selectedDayBackgroundColor: Colors.lightGray,
    selectedDayTextColor: 'black',
    dayTextColor: "black",
    monthTextColor: "black",
    color: "black",
    textSectionTitleColor: "black",
    textDayFontFamily: 'montserrat-regular',
    textMonthfontFamily: "montserrat-regular",
    textDayHeaderFontFamily: 'montserrat-bold',
    textDisabledColor: Colors.mediumGray,
    todayTextColor: "white",
    dotColor: Colors.lightGray,
    // selectedDotColor: 'white',
    // disabledDotColor: 'black',
    dotStyle: {marginTop: -2},
    textSectionTitleDisabledColor: '#d9e1e8',
    selectedDotColor: '#ffffff',
    disabledArrowColor: '#d9e1e8',
    indicatorColor: 'blue',
    textDayFontSize: 15,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 12,
    // textDayStyle: {marginTop: Platform.OS === 'android' ? 2 : 4},
    'stylesheet.calendar.header': {
      monthText: {
        fontSize: 16,
        color: "black",
        fontFamily: 'montserrat-bold',
      },
    },
    'stylesheet.expandable.main': {
      knobContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: Platform.OS == "ios" ? 30 : 24,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.lightGray
      },
      knob: {
        width: 40,
        height: 4,
        borderRadius: 3,
        backgroundColor: "#e8ecf0"
      }
    }
  }
}

