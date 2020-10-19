import React from 'react';
import { Platform } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TabBarIcon from '../components/TabBarIcon';
import PlacesScreen from '../screens/Places/Places';
import InspirersScreen from '../screens/Inspirers/Inspirers';
import EventsScreen from '../screens/Events/Events';
// import MapScreen from '../screens/Others/MapScreen';
// import ExploreScreen from '../screens/Others/ExploreScreen';
// import ExtrasScreen from '../screens/Others/ExtrasScreen';
// import ExtraScreen from '../screens/Others/Extra/ExtraScreen';
// import PlaceScreen from '../screens/Others/PlaceScreen';
// import InspirerScreen from '../screens/Others/InspirerScreen';
// import VideoScreen from '../screens/Others/VideoScreen';
// import FavouritesScreen from '../screens/Others/FavouritesScreen';
// import ExperiencesEventsScreen from '../screens/Others/ExperiencesEventsScreen';
// import ExperiencesItinerariesScreen from '../screens/Others/ExperiencesItinerariesScreen';
// import EventScreen from '../screens/Others/EventScreen';
// import ItineraryScreen from '../screens/Others/ItineraryScreen';
// import SearchScreen from '../screens/Others/SearchScreen';
import Boilerplate from '../screens/Boilerplates/Boilerplate';
import { ConnectedText, ConnectedLanguageList, TabBar } from '../components';
// import VirtualTourScreen from '../screens/Others/VirtualTourScreen';
import * as Constants from '../constants';
const {
  NavPlacesScreen, NavInspirersScreen ,NavMapScreen, 
  NavExperiencesItinerariesScreen, 
  NavItineraryScreen, NavEventsScreen, NavEventScreen, NavExploreScreen, 
  NavVirtualTourScreen, NavPlaceScreen, NavInspirerScreen,
  NavTrends, NavTabNavigator, NavSearchScreen, NavSearchStackScreen, 
  NavMainStackScreen, NavVideoScreen, NavFavouritesScreen, NavFavouritesStackScreen 
} = Constants.NAVIGATION;

import {FromTopTransition} from './transitions'
import Colors from '../constants/Colors'; 

/**
 * App navigation hyerarchy is as follows
 * 
 *  Drawer (drawer)
 *    Favourites (stack)
 *        Favourite (screen with fav categories list)
 *        Place (screen showing single poi)
 *        Event (screen showing single event)
 *        Itinerary (screen showing single itinerary)
 *    Explore (screen showing gallery)
 *    Search (stack)
 *        Search (screen showing the search results)
 *        Place (screen showing single poi)
 *        Event (screen showing single event)
 *        Virtualtour (screen showing virtual tour)
 *        Video (screen showing a video)
 *    Main (stack)
 *        BottomTabs (tabs)
 *          Places (screen showing pois list)
 *          Inspirers (screen showing article list grouped by category)
 *          Extra (stack - inspirers grouped by a category)
 *              Extras (screen showing inspirers categories that are considered of interest (subset of all inspirers))
 *              Extra (screen showing an inspirer with related poi, event and itinerary)
 *              Place (screen showing single poi)
 *          Itineraries (screen showing all the itineraries)
 *          Events (screen showing all the events)
 *        Map (screen with a single map, used by places screen and inspirers screen)
 *        Places (screen showing pois list)
 *        Place (screen showing single poi)
 *        Video (screen showing single video)
 *        VirtualTour (screen showing virtual tour)
 *        Inspirers (screen showing article list grouped by category)
 *        Inspirer (screen showing a single article)
 *        Itinerary (screen showing a single itinerary)
 *        Event (screen showing single event)
 */

 /**
  * Navigation Translations (mainly for BottomTabNavigator)
  */
var ConnectedTextPlaces = <ConnectedText languageKey="tabWhereToGo" />;
var ConnectedTextExperiences = <ConnectedText languageKey="tabWhatToDo"/>;
var ConnectedTextTrends = <ConnectedText languageKey="tabTrends" />;
var ConnectedTextItineraries = <ConnectedText languageKey="tabItineraries" />;
var ConnectedTextEvents = <ConnectedText languageKey="tabEvents"/>;

/**
 * Navigation options for bottom tab navigator rendering
 */

const eventsNavigationOptions = {
  languageKey: "tabEvents",
  name: NavEventsScreen,
  backgroundActiveColor: Colors.colorScreen5, 
  icon: Platform.OS === 'ios' ? 'ios-calendar' : 'md-calendar',
  iconSourceDefault: require("../assets/icons/events_default.png"),
  iconSourceActive: require("../assets/icons/events_active.png"),
  tabBarLabel: ConnectedTextEvents,
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-calendar' : 'md-calendar'} />
  ),
};

const itinerariesNavigationOptions = {
  languageKey: "tabItineraries",
  name: NavExperiencesItinerariesScreen, 
  backgroundActiveColor: Colors.colorScreen4,
  icon: Platform.OS === 'ios' ? 'md-analytics': 'md-analytics',
  iconSourceDefault: require("../assets/icons/itineraries_default.png"),
  iconSourceActive: require("../assets/icons/itineraries_active.png"), 
  tabBarLabel: ConnectedTextItineraries,
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'md-analytics': 'md-analytics'} />
  ),
};

const trendsNavigationOptions = {
  languageKey: "tabTrends",
  name: NavTrends, 
  backgroundActiveColor: Colors.colorScreen3, 
  icon: Platform.OS === 'ios' ? 'ios-star' : 'ios-star',
  iconSourceDefault: require("../assets/icons/central_icon.png"),
  tabBarLabel: ConnectedTextTrends,
  tabBarIcon: ({ focused }) => (
    <TabBarIcon focused={focused} name={Platform.OS === 'ios' ? 'ios-star' : 'ios-star'} />
  ),
};

const inspirersNavigationOptions = {
  languageKey: "tabWhatToDo",
  name: NavInspirersScreen, 
  backgroundActiveColor: Colors.colorScreen2, 
  icon: Platform.OS === 'ios' ? 'ios-compass' : 'md-compass',
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
  backgroundActiveColor: Colors.colorScreen1, 
  icon: Platform.OS === 'ios' ? 'ios-map' : 'md-map',
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
 * Extras Stack (level: 3, parent: BottomTabNavigator)
 * Extras are inspirers with predetermined categories
 */
var ExtraStack = createStackNavigator();

function ExtraStackScreen() {
  return (
    <ExtraStack.Navigator headerMode="none">
      {/* <ExtraStack.Screen name={NavExtrasScreen} component={ExtrasScreen} /> */}
      {/* <ExtraStack.Screen name={NavExtraScreen} component={ExtraScreen} /> */}
      {/* <ExtraStack.Screen name={NavPlaceScreen} component={PlaceScreen} /> */}
    </ExtraStack.Navigator>
  );
}

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
      tabBar={props => <TabBar {...props} navOptions={[placesNavigationOptions, inspirersNavigationOptions, trendsNavigationOptions, itinerariesNavigationOptions, eventsNavigationOptions]}/>}
      animationEnabled={true}>
      {/* <BottomTabNavigator.Screen name={"Boilerplate"} component={Boilerplate} options={placesNavigationOptions} label="Boilerplate"/> */}
      <BottomTabNavigator.Screen name={NavPlacesScreen} component={PlacesScreen} options={placesNavigationOptions}/>
      {/* <BottomTabNavigator.Screen name={NavInspirersScreen} component={InspirersScreen} options={inspirersNavigationOptions} /> */}
      {/* <BottomTabNavigator.Screen name={NavTrends} component={ExtraStackScreen} options={trendsNavigationOptions} /> */}
      {/* <BottomTabNavigator.Screen name={NavExperiencesItinerariesScreen} component={ExperiencesItinerariesScreen} options={itinerariesNavigationOptions} /> */}
      <BottomTabNavigator.Screen name={NavEventsScreen} component={EventsScreen} options={eventsNavigationOptions}/>
    </BottomTabNavigator.Navigator>
  );
}


/**
 * Main Navigator (level: 1, parent: DrawerNavigator)
 */
var MainStack = createStackNavigator();
function MainStackScreen() {
  const isDrawerOpen = useIsDrawerOpen();
  return (
    <>
    <MainStack.Navigator headerMode="none" initialRouteName={NavTabNavigator}>
      {/* TabNavigator */}
      <MainStack.Screen name={NavTabNavigator} component={TabNavigator} />
      {/* Places */}
      {/* <MainStack.Screen name={NavMapScreen} component={MapScreen} options={{...FromTopTransition}} /> */}
      <MainStack.Screen name={NavPlacesScreen} component={PlacesScreen}/>
      {/* <MainStack.Screen name={NavPlaceScreen} component={PlaceScreen}/> */}
      {/* <MainStack.Screen name={NavVideoScreen} component={VideoScreen}/> */}
      {/* <MainStack.Screen name={NavVirtualTourScreen} component={VirtualTourScreen}/> */}
      {/* <MainStack.Screen name={NavInspirersScreen} component={InspirersScreen}/> */}
      {/* <MainStack.Screen name={NavInspirerScreen} component={InspirerScreen}/> */}
      {/* Itineraries */}
      {/* <MainStack.Screen name={NavItineraryScreen} component={ItineraryScreen}  /> */}
      {/* Events */}
      {/* <MainStack.Screen name={NavEventScreen} component={EventScreen} /> */}
    </MainStack.Navigator>
    { isDrawerOpen &&
      <></>
    }
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
      {/* <FavouritesStack.Screen name={NavFavouritesScreen} component={FavouritesScreen} /> */}
      {/* <FavouritesStack.Screen name={NavPlaceScreen} component={PlaceScreen}/> */}
      {/* <FavouritesStack.Screen name={NavEventScreen} component={EventScreen}/> */}
      {/* <FavouritesStack.Screen name={NavItineraryScreen} component={ItineraryScreen}/> */}
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
      {/* <SearchStack.Screen name={NavSearchScreen} component={SearchScreen} /> */}
      {/* <SearchStack.Screen name={NavPlaceScreen} component={PlaceScreen}/> */}
      {/* <SearchStack.Screen name={NavVideoScreen} component={VideoScreen}/> */}
      {/* <SearchStack.Screen name={NavVirtualTourScreen} component={VirtualTourScreen}/> */}
      {/* <SearchStack.Screen name={NavEventScreen} component={EventScreen} /> */}
    </SearchStack.Navigator>
  );
}


var ConnectedTextTabName = () => <ConnectedText languageKey="drawerTab" textStyle={{ color: "white" }}/>;
var ConnectedTextSearch = () => <ConnectedText languageKey="drawerSearch" textStyle={{ color: "white" }} />;
var ConnectedTextGallery = () => <ConnectedText languageKey="gallery" textStyle={{ color: "white" }} />;
var ConnectedFavourites = () => <ConnectedText languageKey="favourites" textStyle={{ color: "white" }} />;

/**
 * Drawer navigator (level: 0)
 */

const Drawer = createDrawerNavigator();
function CustomDrawerContent(props) {
  const { state, ...rest } = props;
  const newState = { ...state};
  const excludedScreens = ['SearchStackScreen'];
  newState.routes = newState.routes.filter(item => excludedScreens.indexOf(item.name) < 0);

  return (
    <DrawerContentScrollView {...props}>
      {/* <DrawerItemList state={newState} {...rest} /> */}
      {/* <ConnectedLanguageList /> */}
    </DrawerContentScrollView>
  );
}

function DrawerNavigator() {
  const drawerContentOptions = {
    inactiveTintColor: "white",
    activeTintColor: "white",
    labelStyle: {
      color: "white"
    }
  }

  return (
    <Drawer.Navigator
      drawerStyle={{
        backgroundColor: Colors.blueTransparent,
        paddingTop: 50,
        paddingLeft: 30,
      }}
      drawerContentOptions={drawerContentOptions}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name={NavMainStackScreen} component={MainStackScreen} options={{ drawerLabel: ConnectedTextTabName }} />
      {/* <Drawer.Screen name={NavSearchStackScreen} component={SearchStackScreen} options={{ drawerLabel: ConnectedTextSearch }} /> */}
      {/* <Drawer.Screen name={NavExploreScreen} component={ExploreScreen} options={{ drawerLabel: ConnectedTextGallery }} /> */}
      {/* <Drawer.Screen name={NavFavouritesStackScreen} component={FavouritesStackScreen} options={{ drawerLabel: ConnectedFavourites }} /> */}
    </Drawer.Navigator>
  );
}



export default DrawerNavigator;
