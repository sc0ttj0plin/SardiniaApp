import React from 'react';
import { Platform } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {useRoute} from '@react-navigation/native';

import TabBarIcon from '../components/TabBarIcon';
import PlacesScreen from '../screens/Places/Places';
import PlaceScreen from '../screens/Places/Place';
// import InspirersScreen from '../screens/Inspirers/Inspirers';
import EventsScreen from '../screens/Events/Events';
import EventScreen from '../screens/Events/Event';
import EventsMapScreen from '../screens/Events/Map';
import EventsSubset from '../screens/Events/EventsSubset';
import ItinerariesScreen from '../screens/Itineraries/Itineraries';
import ItineraryScreen from '../screens/Itineraries/Itinerary';
import ItineraryStagesMapScreen from '../screens/Itineraries/ItineraryStagesMap';
import InspirersScreen from '../screens/Inspirers/Inspirers';
import InspirerScreen from '../screens/Inspirers/Inspirer';
import AccomodationsScreen from '../screens/Accomodations/Accomodations';
import AccomodationScreen from '../screens/Accomodations/Accomodation';
import ExtrasScreen from '../screens/Extras/Extras';
import ExtraScreen from '../screens/Extras/Extra';
import SearchScreen from '../screens/Search/Search';
import MediaScreen from '../screens/Media/Media';
import FavouritesScreen from '../screens/Favourites/Favourites';
import FavouritesListScreen from '../screens/Favourites/FavouritesList';
import AuthScreen from '../screens/Auth/Auth';
import PreferencesScreen from "../screens/Preferences/Preferences"
import FiltersScreen from '../screens/Filters/Filters';
import GalleryScreen from '../screens/Gallery/Map';

import Boilerplate from '../screens/Boilerplates/Boilerplate';
import { ConnectedText, ConnectedLanguageList, TabBar, CustomDrawer, ConnectedAuthText } from '../components';
// import VirtualTourScreen from '../screens/Others/VirtualTourScreen';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import * as Constants from '../constants';
const {
  NavPlacesScreen, NavInspirersScreen ,NavMapScreen, NavLoadingScreen, NavLoginScreen, NavLogoutScreen, NavAuthScreen,
  NavItinerariesScreen, NavAccomodationsScreen, NavAccomodationScreen, NavAccomodationsStackScreen, NavGalleryStackScreen, NavGalleryScreen,
  NavItineraryScreen, NavEventsScreen, NavEventScreen, NavItineraryStagesMapScreen,NavEventsMapScreen, NavEventsSubset, NavExploreScreen, 
  NavVirtualTourScreen, NavPlaceScreen, NavInspirerScreen, NavPreferencesScreen,
  NavExtrasScreen, NavExtraScreen, NavTabNavigator, NavSearchScreen, NavSearchStackScreen, 
  NavMainStackScreen, NavMediaScreen, NavFavouritesScreen, NavFavouritesListScreen, NavFavouritesStackScreen, NavFiltersScreen 
} = Constants.NAVIGATION;

import {FromTopTransition} from './transitions'
import Login from '../screens/Auth/Auth';

 /**
  * Navigation Translations (mainly for BottomTabNavigator)
  */
let ConnectedTextPlaces = <ConnectedText languageKey="tabWhereToGo" />;
let ConnectedTextExperiences = <ConnectedText languageKey="tabWhatToDo"/>;
let ConnectedTextExtras = <ConnectedText languageKey="tabExtras" />;
let ConnectedTextItineraries = <ConnectedText languageKey="tabItineraries" />;
let ConnectedTextEvents = <ConnectedText languageKey="tabEvents"/>;


/**
 * Navigation options for bottom tab navigator rendering
 */

const eventsNavigationOptions = {
  languageKey: "tabEvents",
  name: NavEventsScreen,
  backgroundActiveColor: Colors.colorEventsScreen, 
  icon: Platform.OS === 'ios' ? 'calendar' : 'calendar',
  iconSourceDefault: require("../assets/icons/events_default.png"),
  iconSourceActive: require("../assets/icons/events_active.png"),
  tabBarLabel: ConnectedTextEvents,
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-calendar' : 'md-calendar'} />
  ),
};

const itinerariesNavigationOptions = {
  languageKey: "tabItineraries",
  name: NavItinerariesScreen, 
  backgroundActiveColor: Colors.colorItinerariesScreen,
  icon: Platform.OS === 'ios' ? 'compass': 'compass',
  iconSourceDefault: require("../assets/icons/itineraries_default.png"),
  iconSourceActive: require("../assets/icons/itineraries_active.png"), 
  tabBarLabel: ConnectedTextItineraries,
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'md-analytics': 'md-analytics'} />
  ),
};

const extrasNavigationOptions = {
  languageKey: "tabExtras",
  name: NavExtrasScreen, 
  backgroundActiveColor: Colors.colorExtrasScreen, 
  icon: Platform.OS === 'ios' ? 'ios-star' : 'ios-star',
  iconSourceDefault: require("../assets/icons/central_icon.png"),
  tabBarLabel: ConnectedTextExtras,
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-star' : 'ios-star'} />
  ),
};

const inspirersNavigationOptions = {
  languageKey: "tabWhatToDo",
  name: NavInspirersScreen, 
  backgroundActiveColor: Colors.colorInspirersScreen, 
  icon: Platform.OS === 'ios' ? 'flag' : 'flag',
  iconSourceDefault: require("../assets/icons/whatToDo_default.png"),
  iconSourceActive: require("../assets/icons/whatToDo_active.png"),
  tabBarLabel: ConnectedTextExperiences,
  tabBarIcon: ({ focused }) => (
    <>
    <TabBarIcon focused={focused} name={ Platform.OS === 'ios' ? 'ios-compass' : 'md-compass' }/>
    </>
  ),
};

const placesNavigationOptions = {
  languageKey: "tabWhereToGo",
  name: NavPlacesScreen, 
  backgroundActiveColor: Colors.colorPlacesScreen, 
  icon: Platform.OS === 'ios' ? 'map' : 'map',
  iconSourceDefault: require("../assets/icons/whereToGo_default.png"),
  iconSourceActive: require("../assets/icons/whereToGo_active.png"),
  tabBarLabel: ConnectedTextPlaces,
  tabBarIcon: ({ focused }) => (
    <>
    <TabBarIcon focused={focused} name={ Platform.OS === 'ios' ? 'ios-map' : 'md-map' }  />
    </>
  ),
};



/**
 * Tab navigator (level: 2, parent: MainStack)
 * To prevent Tabs from showing on level 2 onwards we decouple them from their stacks and place on the same level of MainStack
 */
const BottomTabNavigator = createBottomTabNavigator();
 
function TabNavigator() {
  return (
    <BottomTabNavigator.Navigator 
      lazy={true}
      barStyle={{backgroundColor: Colors.tabBar}}
      activeColor={Colors.tintColor}
      tabBarPosition="bottom" 
      swipeEnabled={false}
      tabBar={props => <TabBar {...props} navOptions={[placesNavigationOptions, inspirersNavigationOptions, extrasNavigationOptions, itinerariesNavigationOptions, eventsNavigationOptions]}/>}
      animationEnabled={true}>
      <BottomTabNavigator.Screen name={NavPlacesScreen} component={PlacesScreen} options={placesNavigationOptions}/>
      <BottomTabNavigator.Screen name={NavInspirersScreen} component={InspirersScreen} options={inspirersNavigationOptions} />
      <BottomTabNavigator.Screen name={NavExtrasScreen} component={ExtrasScreen} options={extrasNavigationOptions}/>
      <BottomTabNavigator.Screen name={NavItinerariesScreen} component={ItinerariesScreen} options={itinerariesNavigationOptions} />
      <BottomTabNavigator.Screen name={NavEventsScreen} component={EventsScreen} options={eventsNavigationOptions}/>
    </BottomTabNavigator.Navigator>
  );
}

/**
 * Main Navigator (level: 1, parent: DrawerNavigator)
 */
var MainStack = createStackNavigator();

function MainStackScreen() {
  return (
    <>
    <MainStack.Navigator headerMode="none" initialRouteName={TabNavigator}>
      {/* Loading */}
      {/* <MainStack.Screen name={NavLoadingScreen} component={LoadingScreen} /> */}
      {/* TabNavigator */}
      <MainStack.Screen name={NavTabNavigator} component={TabNavigator} />
      {/* Inner screens */}
      {/* Places */}
      <MainStack.Screen name={NavPlaceScreen} component={PlaceScreen}/>
      {/* Events */}
      <MainStack.Screen name={NavEventScreen} component={EventScreen} />
      <MainStack.Screen name={NavEventsSubset} component={EventsSubset} />
      <MainStack.Screen name={NavEventsMapScreen} component={EventsMapScreen} /*options={{...FromTopTransition}}*/ />
      <MainStack.Screen name={NavFiltersScreen} component={FiltersScreen}/>
      {/* Extra */}
      <MainStack.Screen name={NavExtraScreen} component={ExtraScreen} />
      {/* Itineraries */}
      <MainStack.Screen name={NavItineraryScreen} component={ItineraryScreen}  />
      <MainStack.Screen name={NavItineraryStagesMapScreen} component={ItineraryStagesMapScreen}  />
      {/* Inspirers */}
      <MainStack.Screen name={NavInspirerScreen} component={InspirerScreen}/>
      {/* Media */}
      <MainStack.Screen name={NavMediaScreen} component={MediaScreen}/>
      {/* Accomodation */}
      <MainStack.Screen name={NavAccomodationsScreen} component={AccomodationsScreen}/>
      <MainStack.Screen name={NavAccomodationScreen} component={AccomodationScreen}/>

    </MainStack.Navigator>
    </>
  );
}

/**
 * Favourites stack (level: 1, parent: DrawerNavigator)
 */

var FavouritesStack = createStackNavigator();

function FavouritesStackScreen() {
  return (
    <FavouritesStack.Navigator headerMode="none" initialRouteName={NavFavouritesScreen}>
      <FavouritesStack.Screen name={NavFavouritesScreen} component={FavouritesScreen} />
      <FavouritesStack.Screen name={NavFavouritesListScreen} component={FavouritesListScreen} />
      {/* Places */}
      <FavouritesStack.Screen name={NavPlaceScreen} component={PlaceScreen}/>
      {/* Events */}
      <FavouritesStack.Screen name={NavEventScreen} component={EventScreen} />
      <FavouritesStack.Screen name={NavEventsSubset} component={EventsSubset} />
      <FavouritesStack.Screen name={NavEventsMapScreen} component={EventsMapScreen} />
      <FavouritesStack.Screen name={NavFiltersScreen} component={FiltersScreen}/>
      {/* Extra */}
      <FavouritesStack.Screen name={NavExtraScreen} component={ExtraScreen} />
      {/* Itineraries */}
      <FavouritesStack.Screen name={NavItineraryScreen} component={ItineraryScreen}  />
      <FavouritesStack.Screen name={NavItineraryStagesMapScreen} component={ItineraryStagesMapScreen}  />
      {/* Inspirers */}
      <FavouritesStack.Screen name={NavInspirerScreen} component={InspirerScreen}/>
      {/* Media */}
      <FavouritesStack.Screen name={NavMediaScreen} component={MediaScreen}/>
      {/* Accomodation */}
      <FavouritesStack.Screen name={NavAccomodationsScreen} component={AccomodationsScreen}/>
      <FavouritesStack.Screen name={NavAccomodationScreen} component={AccomodationScreen}/>
    </FavouritesStack.Navigator>
  )
}


/**
 * Search stack (level: 1, parent: DrawerNavigator)
 */

var SearchStack = createStackNavigator();

function SearchStackScreen() {
  return (
    <SearchStack.Navigator headerMode="none" initialRouteName={NavPlacesScreen}>
      <SearchStack.Screen name={NavSearchScreen} component={SearchScreen} />
      {/* Places */}
      <SearchStack.Screen name={NavPlaceScreen} component={PlaceScreen}/>
      {/* Events */}
      <SearchStack.Screen name={NavEventScreen} component={EventScreen} />
      <SearchStack.Screen name={NavEventsSubset} component={EventsSubset} />
      <SearchStack.Screen name={NavEventsMapScreen} component={EventsMapScreen} />
      <SearchStack.Screen name={NavFiltersScreen} component={FiltersScreen}/>
      {/* Extra */}
      <SearchStack.Screen name={NavExtraScreen} component={ExtraScreen} />
      {/* Itineraries */}
      <SearchStack.Screen name={NavItineraryScreen} component={ItineraryScreen}  />
      <SearchStack.Screen name={NavItineraryStagesMapScreen} component={ItineraryStagesMapScreen}  />
      {/* Inspirers */}
      <SearchStack.Screen name={NavInspirerScreen} component={InspirerScreen}/>
      {/* Media */}
      <SearchStack.Screen name={NavMediaScreen} component={MediaScreen}/>
      {/* Accomodation */}
      <SearchStack.Screen name={NavAccomodationsScreen} component={AccomodationsScreen}/>
      <SearchStack.Screen name={NavAccomodationScreen} component={AccomodationScreen}/>
    </SearchStack.Navigator>
  );
}


/**
 * Accomodation Stack (level: 1, parent DrawerNavigator)
 */
var AccomodationStack = createStackNavigator();

function AccomodationStackScreen() {
  return (
    <AccomodationStack.Navigator headerMode="none" initialRouteName={NavAccomodationsScreen}>
      <AccomodationStack.Screen name={NavAccomodationsScreen} component={AccomodationsScreen} />
      <AccomodationStack.Screen name={NavAccomodationScreen} component={AccomodationScreen}/>
    </AccomodationStack.Navigator>
  );
}

/**
 * Accomodation Stack (level: 1, parent DrawerNavigator)
 */
var GalleryStack = createStackNavigator();

function GalleryStackScreen() {
  return (
    <GalleryStack.Navigator headerMode="none" initialRouteName={NavGalleryScreen}>
      <GalleryStack.Screen name={NavGalleryScreen} component={GalleryScreen} />
      {/* Places */}
      <GalleryStack.Screen name={NavPlaceScreen} component={PlaceScreen}/>
      {/* Media */}
      <GalleryStack.Screen name={NavMediaScreen} component={MediaScreen}/>
      {/* Accomodation */}
      <GalleryStack.Screen name={NavAccomodationsScreen} component={AccomodationsScreen}/>
      <GalleryStack.Screen name={NavAccomodationScreen} component={AccomodationScreen}/>
    </GalleryStack.Navigator>
  );
}


let ConnectedTextTabName = () => <ConnectedText languageKey="drawerTab" textStyle={{ color: "black" }}/>;
let ConnectedTextSearch = () => <ConnectedText languageKey="drawerSearch" textStyle={{ color: "black" }} />;
let ConnectedTextFavourites = () => <ConnectedText languageKey="favourites" textStyle={{ color: "black" }} />;
let ConnectedTextAccomodations = () => <ConnectedText languageKey="accomodations" textStyle={{ color: "black" }} />;
let ConnectedTextPreferences = () => <ConnectedText languageKey="preferences" textStyle={{ color: "black" }} />;
let ConnectedTextGallery = () => <ConnectedText languageKey="gallery" textStyle={{ color: "black" }} />;
let ConnectedTextLoginLogout = () => <ConnectedAuthText textStyle={{ color: "black" }} />;

/**
 * Drawer navigator (level: 0)
 */

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  // const { state, ...rest } = props;
  // const newState = { ...state};
  // const excludedScreens = ['SearchStackScreen'];
  // newState.routes = newState.routes.filter(item => excludedScreens.indexOf(item.name) < 0);
  return (
    <DrawerContentScrollView {...props}>
      {/* <DrawerItemList state={newState} {...rest}/> */}
      <CustomDrawer.Header />
      <CustomDrawer.Line />
      <CustomDrawer.Item {...props} routeIndex={0} label={ConnectedTextTabName} screenName={Constants.NAVIGATION.NavMainStackScreen} iconOpts={{name: 'home', size: 20, color: Colors.mediumGray}} />
      <CustomDrawer.Item {...props} routeIndex={1} label={ConnectedTextSearch} screenName={Constants.NAVIGATION.NavSearchStackScreen} iconOpts={{name: 'search', size: 20, color: Colors.mediumGray}} />
      <CustomDrawer.Item {...props} routeIndex={2} label={ConnectedTextAccomodations} screenName={Constants.NAVIGATION.NavAccomodationsStackScreen} iconOpts={{name: 'suitcase', size: 20, color: Colors.mediumGray}} />
      <CustomDrawer.Item {...props} routeIndex={3} label={ConnectedTextPreferences} screenName={Constants.NAVIGATION.NavPreferencesScreen} iconOpts={{name: 'user', size: 20, color: Colors.mediumGray}} />
      <CustomDrawer.Separator />
      <CustomDrawer.Item {...props} routeIndex={4} label={ConnectedTextFavourites} screenName={Constants.NAVIGATION.NavFavouritesStackScreen} iconOpts={{name: 'heart', size: 20, color: Colors.mediumGray}} />
      <CustomDrawer.Item {...props} routeIndex={5} label={ConnectedTextGallery} screenName={Constants.NAVIGATION.NavGalleryStackScreen} iconOpts={{name: 'image', size: 20, color: Colors.mediumGray}} />
      <CustomDrawer.Separator />
      <CustomDrawer.Item {...props} routeIndex={6} label={ConnectedTextLoginLogout} screenName={Constants.NAVIGATION.NavAuthScreen} iconOpts={{name: 'key', size: 20, color: Colors.mediumGray}} />
      <ConnectedLanguageList />
    </DrawerContentScrollView>
  );
}

function DrawerNavigator() {

  const drawerContentOptions = {
    inactiveTintColor: "black",
    activeTintColor: "black",
    labelStyle: {
      color: "black",
      backgroundColor: "blue"
    }
  }

  return (
    <Drawer.Navigator
      drawerStyle={{
        backgroundColor: Colors.white,
        paddingTop: 50,
        height: '100%'
      }}
      openByDefault={false}
      drawerContentOptions={drawerContentOptions}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      {/* IMPORTANT: unmountOnBlur unmounts the component on blur (unfocus) thus preventing memory usage and login issues */}
      <Drawer.Screen name={NavMainStackScreen} component={MainStackScreen} />
      <Drawer.Screen name={NavAccomodationsStackScreen} component={AccomodationStackScreen} options={{unmountOnBlur:true}} />
      <Drawer.Screen name={NavSearchStackScreen} component={SearchStackScreen} />
      <Drawer.Screen name={NavFavouritesStackScreen} component={FavouritesStackScreen} options={{unmountOnBlur:true}} />
      <Drawer.Screen name={NavGalleryStackScreen} component={GalleryStackScreen} options={{unmountOnBlur:true}} />
      <Drawer.Screen name={NavPreferencesScreen} component={PreferencesScreen} options={{unmountOnBlur:true}} />
      {/* The login screen is not shown in the navigation */}
      <Drawer.Screen name={NavAuthScreen} component={AuthScreen} options={{unmountOnBlur:true}} />
    </Drawer.Navigator>
  );
}


export default DrawerNavigator;
