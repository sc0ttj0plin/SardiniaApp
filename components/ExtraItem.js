import React, { PureComponent } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from 'react-native';
import { Image } from 'react-native-elements';
import ScrollableContainerTouchableOpacity from "./ScrollableContainerTouchableOpacity";
import _ from 'lodash';
import CustomText from "./CustomText";
import Layout from "../constants/Layout";
import ShimmerWrapper from "./ShimmerWrapper";
import AnimatedImage from "./AnimatedImage";

/**
 * ExtraItem is a list item component used in the Extra screen 
 */
class ExtraItem extends PureComponent{ 
  constructor(props) {
    super(props);
    this.state = {
      windowWidth: Layout.window.width,
    };
  }

  _onLayout = (event) => {
    this.setState({windowWidth: event.nativeEvent.layout.width});
  }
  
  render() {
    const { title, image, imageStyle, onPress, btnTitle } = this.props;
    return (
      <View style={styles.container} onLayout={this._onLayout}>
        <ShimmerWrapper
                shimmerStyle={[styles.shimmer]}>
        </ShimmerWrapper>
        <AnimatedImage 
          image={image}
          style={[styles.image, imageStyle, {width: this.state.windowWidth}]}
          animated={true}
          />
        <View style={styles.imageOverlay}>
          <CustomText style={styles.itemTitle}>
            {title || "text"}
          </CustomText>
            <ScrollableContainerTouchableOpacity
                activeOpacity={0.7}
                onPress={onPress ? onPress : () => {}}
                style={styles.itemButton}>
                    <CustomText style={styles.itemButtonText}>{btnTitle}</CustomText>
            </ScrollableContainerTouchableOpacity>
        </View>
        
      </View>
      );
    }
}

const styles = StyleSheet.create({ 
    container: {
      width: "100%",
      height: 450,
      alignItems: 'center',
      overflow: "hidden"
    },
    shimmer: {
      position: "absolute",
      width: "100%",
      height: "100%"
    },
    imageOverlay: {
      width: "100%",
      backgroundColor: "rgba(0,0,0,0.2)",
      justifyContent: "center",
      alignItems: "center",
      height: "100%"
    },
    itemTitle: {
      color: "white",
      textTransform: "uppercase",
      fontFamily: "montserrat-bold",
      fontSize: 28,
      lineHeight: 28,
      alignSelf: "center",
      width: 200,
      textAlign: "center",
      marginBottom: 30,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: {width: 1, height: 1},
      textShadowRadius: 1,
      marginBottom: 100
    },
    itemButton: {
      justifyContent: "center",
      alignSelf: "center",
      backgroundColor: "#00000055",
    },
    itemButtonText: {
      color: "white",
      borderColor: "white",
      borderWidth: 2,
      padding: 5,
      paddingHorizontal: 15,
      fontFamily: "montserrat-bold",
    },
    spinner: {
      marginTop: 40
    },
    titlePrefix: {
      fontSize: 15,
      color: "#ffffff",
      textShadowOffset: {width: -1, height: 1},
      textShadowRadius: 10,
      textAlign: "center",
    },
    title: {
      fontSize: 20,
      color: "#ffffff",
      textShadowOffset: {width: -1, height: 1},
      textShadowRadius: 10,
      padding: 10,
      textAlign: "center"
    },
    image: {
      position: "absolute",
      resizeMode: "cover",
      width: "100%",
      height: "100%",
      backgroundColor: "transparent",
    },
});

export default ExtraItem;