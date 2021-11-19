import React from 'react';
import { Text, StyleSheet, AppState, useState,useEffect,setInterval,Alert } from "react-native";
import * as Location from "expo-location";







export default function LocationCheck(props) {
    useEffect(() => {
        const interval = setInterval(() => {
          (async () => {
              const res = await Location.hasServicesEnabledAsync();
              if(!res) Alert.alert("No location")
              else console.log("location")
            }
          )();
        }, 5000);
        return () => clearInterval(interval);
      }, []);
    

  return (
      console.log('renderizzato')
  )
}

const styles = StyleSheet.create({
    default: {
        fontFamily: "montserrat-regular"
    }
})
