import React, { PureComponent } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import CustomText from "../others/CustomText";
import ShimmerWrapper from "../loading/ShimmerWrapper";
import AnimatedImage from "../others/AnimatedImage";

/**
 * Similar to PoiItemsList but with geographical information 
 */
class GeoRefHListItem extends PureComponent{ 
  constructor(props){
    super(props);
  }
  renderDistanceRow(distance) {
    if(distance)
      return <CustomText numberOfLines={1} ellipsizeMode='tail' style={styles.distance}>{distance}</CustomText>
  }


  render() {
    const { distance = "", title = "", subtitle = "", animated, mediaType, borderRadius = 8} = this.props;
    return (
      <View style={[styles.container, this.props.style, {borderRadius: borderRadius}]}>
        <ShimmerWrapper shimmerStyle={styles.shimmer} />
        <View style={[styles.image]}>
          <AnimatedImage animated={animated} image={this.props.image} style={[styles.image]} />
          {mediaType === "virtualTour" && 
          (<View style={styles.mediaOverlay}>
            <CustomText style={styles.mediaOverlayText}>3D</CustomText>
          </View>)
          }
        </View>
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
      </View>
      );
    }
}

const styles = StyleSheet.create({  
    container: {
      backgroundColor: "white",
      alignItems: "flex-start",
      overflow: "hidden"
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
    },
    mediaOverlay: {
      position: "absolute",
      alignItems: "center",
      alignContent: "center",
      backgroundColor: "rgba(0,0,0,0.8)",
      width: "100%",
      height: "100%",
      paddingBottom: 30,
      justifyContent: 'center'
    },
    mediaOverlayText: {
      fontSize: 40,
      fontFamily: "montserrat-bold",
      color: "white"
    }
});

export default GeoRefHListItem;