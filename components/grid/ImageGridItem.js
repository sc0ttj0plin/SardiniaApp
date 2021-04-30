import React, { PureComponent } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from 'react-native';
import { Image } from 'react-native-elements';
import Layout from '../../constants/Layout'
import CustomText from "../others/CustomText";

/**
 * Simple image item for grid, used in gallery screen
 */
class ImageGridItem extends PureComponent{ 
  constructor(props){
    super(props);
    this.state = {
      width: Layout.window.width / 2,
      height: 160
    }
  }
  render() { 
    return (
      <View style={[styles.container, this.props.style]} onLayout={(event) => { 
        const width = event.nativeEvent.layout.width / 3;
        var height = width / 16 * 9;
        this.setState({ width, height });
        }}>
          <Image source={{ uri: this.props.image }} style={styles.image, {width: this.state.width, height: this.state.height}} PlaceholderContent={<ActivityIndicator />}>
            <View style={styles.textContainer}>
              <Text
              numberOfLines={1}
              ellipsizeMode='tail'
              style={styles.title}>{this.props.title}
              </Text>
            </View>
          </Image>
      </View>
      );
    }
}

const styles = StyleSheet.create({  
    container: {
      backgroundColor: "#F5FCFF",
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
      resizeMode: "cover",
      width: 160,
      height: 160
    },
    textContainer: {
      position: "absolute",
      bottom: 0,
      backgroundColor: "rgba(255,255,255,0.7)",
      padding: 5,
      width: "100%",
      alignItems: "center"
    }
});

export default ImageGridItem;