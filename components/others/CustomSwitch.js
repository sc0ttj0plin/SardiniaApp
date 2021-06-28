import React from 'react';
import { Text, StyleSheet,View } from "react-native";
import ToggleSwitch from 'toggle-switch-react-native'
import { ConnectedText, ConnectedLanguageList, TabBar, CustomDrawer, ConnectedAuthText, TabBarIcon } from '../../components';
export default function CustomSwitch(props) {
  return (
    <View style={{
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent :"center",
        flexWrap :"nowrap",
            
        
    }}>
        <View style={{
            flex: 1,
            flexDirection: 'column',
           
            alignItems: 'flex-start',
            paddingTop:0,
            paddingStart:16,paddingBottom:8
           
        }}>
            <ConnectedText languageKey={props.text} textStyle={styles.element} /></View>
        <View style={{
        flex: 0,
        flexDirection: 'column',
        paddingTop:10,
        alignItems: 'flex-end',
        paddingEnd:16
           
      }}>
        <ToggleSwitch {...props}
          
          onColor="black"
          //size="default"
          isOn={props.state.nearpoi}
          onToggle={nearpoi => {
            props.state.nearpoi.setState({ nearpoi });
            console.log(
             nearpoi )
          }}
        />

      </View>

    </View>
  )
}


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  header: {
    backgroundColor: "white"
  },
  container: {
    paddingTop: 0,
    paddingBottom:0,
  },
  title: {
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
    color: "#000000E6",
    backgroundColor: "#F2F2F2",
    fontSize: 15,
    fontFamily: "montserrat-bold",
    textTransform: "uppercase"
  },
  element: {
    textAlign: "left",
    paddingTop: 10,
    paddingBottom: 10,
    color: "black",
    //backgroundColor: "#F2F2F2",
    fontSize: 15,
    fontFamily: "montserrat-regular",
    //textTransform: "uppercase"
    
  },
});