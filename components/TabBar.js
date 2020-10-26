import React, { PureComponent } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import ConnectedText from './ConnectedText';
import TabBarIcon from './TabBarIcon';
import posed from 'react-native-pose';
import Layout from '../constants/Layout';
import { Colors } from 'react-native/Libraries/NewAppScreen';

// define click zoom
const Scaler = posed.View({ 
  active: { scale: 1 },
  inactive: { scale: 0.9 }
})
 
// define click zoom
const CenterScaler = posed.View({ 
    active: { scale: 0.6 },
    inactive: { scale: 0.5 } 
})

var insets = Layout.insets ? Layout.insets : {bottom: 0};

/**
 * TabBar is the bottom tab bar used in tab navigation screens.
 * Includes an animated component that scales up on focus
 */
export default class TabBar extends PureComponent{

  constructor(props){
    super(props)

    this.state = {
      routes: null,
      activeRouteIndex: null
    }
  }

  componentDidMount(){

    const { routes, index } = this.props.state
    let activeRouteIndex = index;
    let descriptors = this.props.descriptors ? this.props.descriptors : []
    let newRoutes = []
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
    }
    
    this.setState({
      routes: newRoutes,
      activeRouteIndex
    })
  }

  componentDidUpdate(prevProps){
    console.log("screen ", this.props.state.routeNames[this.props.state.index])
    if(prevProps.state.index != this.props.state.index){
      this.setState({
        activeRouteIndex: this.props.state.index
      })
    }
  }

  onTabPress = (screen) => {
    this.props.navigation.navigate(screen);

  }

  render(){
    return (
      <>
        {this.state.routes && 
          <Scaler style={[Styles.container, {height: 63+insets.bottom, paddingBottom: insets.bottom}]}>
            {this.state.routes.map((route, routeIndex) => {
              const isRouteActive = routeIndex === this.state.activeRouteIndex
              return (
                <TouchableOpacity
                  key={routeIndex}
                  activeOpacity={0.7}
                  style={[Styles.tabButton, {
                      backgroundColor: isRouteActive && route.backgroundActiveColor ? route.backgroundActiveColor : "white" 
                  }]}
                  onPress={ () => this.onTabPress(route.name)}>
                      {route.name == 'Trends' ? ( // Special handling of special icons
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
                              <TabBarIcon focused={isRouteActive} name={route.icon} tintColor={isRouteActive ? "white" : Colors.tintColor} iconSourceDefault={route.iconSourceDefault} iconSourceActive={route.iconSourceActive}/>
                          </View>
                        }
                          <ConnectedText textStyle={[Styles.iconText, {
                              color: isRouteActive ? "white" : "#A7A7A7"
                          }]} languageKey={route.languageKey}>
      
                          </ConnectedText>
                    </Scaler>
                  )}
                </TouchableOpacity>
              )
            })}
          </Scaler>
        }
      </>
    )
  }
}
 
const Styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    shadowOffset: { width: 5, height: 10 },
    shadowOpacity: 0.75,
    elevation: 1,
    width: "100%",
    backgroundColor: "white",
    justifyContent: "center"
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
    alignItems: "flex-start",
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
    paddingBottom: 10
  },
  iconContainer: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent"
  }
})
 
