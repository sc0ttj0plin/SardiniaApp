import React, { PureComponent } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from 'react-native';
import { Image } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import {distanceToString} from '../helpers/maps'
import CustomText from "./CustomText";
import ShimmerWrapper from "../components/ShimmerWrapper"

/**
 * Similar to PoiItemsList but with geographical information 
 */
class GeoRefHListItem extends PureComponent{ 
  constructor(props){
    super(props);
    this.state = {
      width: 160,
      height: 160
    }
  }
  renderDistanceRow(distance) {
    if(distance)
      return <CustomText numberOfLines={1} ellipsizeMode='tail' style={styles.distance}>{distance}</CustomText>
  }


  render() {
    const { distance = "", title = "", subtitle = "" } = this.props;
    return (
      <View style={[styles.container, this.props.style]}>
        <ShimmerWrapper shimmerStyle={styles.shimmer} />
        <Image source={{ uri: this.props.image }} style={styles.image}>
          <LinearGradient
          style={styles.textContainer}
          colors={['rgba(255,255,255,0.8)', 'rgba(240,240,240,1)']}
          >
            <CustomText
            numberOfLines={1}
            ellipsizeMode='tail'
            style={styles.title}>{title}
            </CustomText>
              <CustomText 
              numberOfLines={1}
              ellipsizeMode='tail'
              style={styles.place}>{subtitle}
              </CustomText>
             {this.renderDistanceRow(distance)}
          </LinearGradient>
        </Image>
      </View>
      );
    }
}

const styles = StyleSheet.create({  
    spinner: {
      marginBottom: 20
    },
    container: {
      backgroundColor: "white",
      alignItems: "flex-start",
      overflow: "hidden",
      borderRadius: 8
    },
    title: {
      fontSize: 12,
      fontFamily: "montserrat-bold",
    },
    place: {
      fontSize: 10
    },
    distance: {
      fontSize: 10,
      fontFamily: "montserrat-bold",
    },
    image: {
      flex: 1,
      resizeMode: "cover",
      backgroundColor: "transparent",
      width: "100%",
      height: "100%",
    },
    shimmer: {
      position: "absolute",
      width: "100%",
      height: "100%",
    },
    textContainer: {
      position: "absolute",
      bottom: 0,
      padding: 5,
      width: "100%",
      flex: 1
    }
});

export default GeoRefHListItem;