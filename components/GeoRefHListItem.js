import React, { PureComponent } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from 'react-native';
import { Image } from 'react-native-elements';
import {distanceToString} from '../helpers/maps'

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
  render() {
    const { distance = 0 } = this.props;
    return (
      <View style={[styles.container, this.props.style]} onLayout={(event) => { this.setState({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height }) }}>
          <Image source={{ uri: this.props.image }} style={styles.image, {width: this.state.width, height: this.state.height}} PlaceholderContent={<ActivityIndicator />}>
            <View style={styles.textContainer}>
              <Text
              numberOfLines={1}
              ellipsizeMode='tail'
              style={styles.title}>{this.props.title}
              </Text>
              { this.props.place != null && this.props.place != "" &&
                <Text 
                numberOfLines={1}
                ellipsizeMode='tail'
                style={styles.place}>{this.props.place}
                </Text>
              }
              { this.props.distance != "" && this.props.distance != undefined &&
                (
                  <Text numberOfLines={1}ellipsizeMode='tail'style={styles.distance}>{distance}</Text>
                )
              }
            </View>
          </Image>
      </View>
      );
    }
}

const styles = StyleSheet.create({  
    container: {
      backgroundColor: "white",
      alignItems: "flex-start",
      borderRadius: 10,
      overflow: "hidden"
    },
    title: {
      fontSize: 12,
      fontWeight: "bold"
    },
    place: {
      fontSize: 10
    },
    distance: {
      fontSize: 10,
      fontWeight: "bold",
    },
    image: {
      flex: 1,
      resizeMode: "cover",
      backgroundColor: "white"
    },
    textContainer: {
      position: "absolute",
      bottom: 0,
      backgroundColor: "rgba(255,255,255, 0.7)",
      padding: 5,
      width: "100%",
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10
    }
});

export default GeoRefHListItem;