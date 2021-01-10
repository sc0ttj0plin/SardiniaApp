import React, { useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PixelRatio
} from 'react-native'
import ConnectedText from './ConnectedText';
import TabBarIcon from './TabBarIcon';
import posed from 'react-native-pose';
import Layout from '../constants/Layout';
import Colors from "../constants/Colors"
import { useSafeArea } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import CustomText from "./CustomText";

// define click zoom
const Scaler = posed.View({ 
  active: { scale: 1 },
  inactive: { scale: 1 }
})
 
// define click zoom
const CenterScaler = posed.View({ 
    active: { scale: 0.56 },
    inactive: { scale: 0.45 } 
})

// define click zoom
const TextScaler = posed.View({ 
  active: { scale: 1 },
  inactive: { scale: 0 } 
})

/**
 * TabBar is the bottom tab bar used in tab navigation screens.
 * Includes an animated component that scales up on focus
 */
const TabBar = props => {
  var insets = useSafeArea();
  const fontScale = PixelRatio.getFontScale();
  const {
      navigation
  } = props
  const { routes, index } = props.state
  let activeRouteIndex = index;
  let descriptors = props.descriptors ? props.descriptors : []
  let newRoutes = []
  let activeRoute = null;
  let count = 0;
  for(let key in descriptors){
      let descriptor = descriptors[key];
      let route = {
          name: descriptor.options.name,
          languageKey: descriptor.options.languageKey,
          backgroundActiveColor: descriptor.options.backgroundActiveColor,
          icon: descriptor.options.icon,
          iconSourceDefault: descriptor.options.iconSourceDefault,
          iconSourceActive: descriptor.options.iconSourceActive
      }
      newRoutes.push(route)
      if(activeRouteIndex == count)
        activeRoute = route
      count++;
  }

  const onTabPress = (screen) => {
      navigation.navigate(screen);
  }

  const renderBottomLine = (activeRoute) => {
    return(
      <View style={[Styles.bottomLine, { 
        backgroundColor: activeRoute ? activeRoute.backgroundActiveColor : "white",
      }]}></View>
    )
  }

  const renderMixedBottomLine = () => {
    return(
      <View style={[Styles.mixedBottomLine]}>
        <View style={[Styles.mixedBottomLineItem, {backgroundColor: Colors.colorPlacesScreen}]}/>
        <View style={[Styles.mixedBottomLineItem, {backgroundColor: Colors.colorInspirersScreen}]}/>
        <View style={[Styles.mixedBottomLineItem, {backgroundColor: Colors.colorItinerariesScreen}]}/>
        <View style={[Styles.mixedBottomLineItem, {backgroundColor: Colors.colorEventsScreen}]}/>
      </View>
    )
  }

  return (
    <>
    {activeRoute && activeRoute.name == 'Extras' ? renderMixedBottomLine() : renderBottomLine(activeRoute)}
    <View style={[Styles.container, {height: 60 + insets.bottom, paddingBottom: insets.bottom}]}>
      {newRoutes.map((route, routeIndex) => {
        const isRouteActive = routeIndex === activeRouteIndex
        return (
          <TouchableOpacity
            key={routeIndex}
            activeOpacity={0.7}
            style={[Styles.tabButton, {
                backgroundColor: "white" 
            }]}
            onPress={ () => onTabPress(route.name)}>
                {route.name == 'Extras' ? ( // Special handling of special icons
                <CenterScaler
                    style={[Styles.scalerOnline, {
                        backgroundColor: isRouteActive ? "white" : "white",
                        marginBottom: isRouteActive ? 15 : 0
                    }]}
                    pose={isRouteActive ? 'active' : 'inactive'}>
                        { route.icon &&
                            <View style={[Styles.iconContainer]}>
                                <TabBarIcon focused={isRouteActive} name={route.icon} iconSourceDefault={route.iconSourceDefault} />
                            </View>
                        }
                </CenterScaler>
            ) : ( // normal icon normal processing
              <Scaler
                style={Styles.scaler}
                pose={isRouteActive ? 'active' : 'inactive'} 
              >
                  { route.icon &&
                    <View style={Styles.iconContainer}>
                        <TabBarIcon focused={isRouteActive} name={route.icon} activeColor={activeRoute.backgroundActiveColor} iconSourceDefault={route.iconSourceDefault} iconSourceActive={route.iconSourceActive}/>
                    </View>
                  }
                  <TextScaler
                    style={[Styles.scaler, {
                      height: isRouteActive ? 22 : 0,
                      display: isRouteActive ? 'flex' : 'none'
                    }]}
                    pose={isRouteActive ? 'active' : 'inactive'}>
                    <Animated.View style={{
                      display: 'flex',
                      overflow: 'hidden',
                      height: 22,
                    }}>
                      <ConnectedText textStyle={[ {
                          color: route.backgroundActiveColor,
                          fontFamily: "montserrat-bold",
                          textAlign: "center",
                          fontSize: 11 / fontScale,
                          lineHeight: 20 / fontScale
                      }]} languageKey={route.languageKey}/>
                    </Animated.View>
                  </TextScaler>
              </Scaler>
            )}
          </TouchableOpacity>
        )
      })}
    </View>
    </>
  )
}
 
const Styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    shadowOffset: { width: 5, height: 10 },
    shadowOpacity: 0.75,
    elevation: 1,
    width: "100%",
    backgroundColor: "white",
    justifyContent: "center",
  },
  mixedBottomLine: {
    width: Layout.window.width,
    height: 2,
    display: "flex",
    flexDirection: "row",
  },
  bottomLine: {
    width: Layout.window.width,
    height: 3,
  },
  mixedBottomLineItem: {
    flex: 1
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spotLight: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  spotLightInner: {
    width: 48,
    height: 48,
    backgroundColor: '#ee0000',
    borderRadius: 24
  },
  scaler: { 
    width: Layout.window.width/5,
    height: "100%",
    alignItems: "center",
    justifyContent:"flex-end"
  },
  scalerOnline: {
    width: Layout.window.width/5,
    height: "100%",
    alignItems: "center",
    justifyContent:"flex-end",
    backgroundColor: "white",
    borderRadius: 50
  },
  iconText: {
    fontSize: 11,
    width: "100%",
    backgroundColor: "transparent",
    textAlign: "right",
    alignSelf: "center",
    textAlign: "center",
  },
  iconContainer: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent"
  }
})
 
export default TabBar
