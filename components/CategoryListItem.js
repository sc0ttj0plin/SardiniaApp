import React, { PureComponent } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { ActivityIndicator } from 'react-native';
import { Image } from 'react-native-elements';
import BoxWithText from "./BoxWithText"; 


/**
 * List item element that represents a category
 */
class CategoryListItem extends PureComponent { 
  constructor(props) {
    super(props);
    this.state = {
      width: 0
    };
  }
  

  render() { 
    var image = this.props.image ? this.props.image : "https://via.placeholder.com/300x150";
    return (
      <View style={styles.container} onLayout={(event) => { this.setState({ width: event.nativeEvent.layout.width }); }} > 
       <TouchableOpacity onPress={this.props.onPress} activeOpacity={0.7}>
        <Image 
            source={{ uri: image }} 
            style={[styles.image, { width: this.state.width, height: this.state.height }, this.props.imageStyle]} 
            PlaceholderContent={<ActivityIndicator style={styles.spinner} color={"white"} />}
            >
            <BoxWithText
              visibleBoxes
              extraStyle={{}}
              title={this.props.title} 
              opacityBackground={0.8}/>
          </Image>
        </TouchableOpacity>
      </View>
      );
    }
}

const styles = StyleSheet.create({ 
    spinner: {
      marginTop: 40
    },
    container: {
      flex: 1,
      borderRadius: 10,
      overflow: "hidden",
      height: 240,
      marginBottom: 8,
      flexDirection: "column",
      justifyContent: 'center',
      alignItems: 'center',
      position: "relative",
      textAlignVertical: "center",
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
      resizeMode: "cover",
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    },
    titleContainer: {
      width: "100%",
      height: "100%",
      alignSelf: "flex-end",
      justifyContent: "flex-end",
      alignItems: "flex-end"
    },
    titleContainerBackground:  {
      width: 200,
      backgroundColor: "rgba(60,66,72, 0.8)",
      paddingVertical: 25,
      paddingHorizontal: 15
    }

});

export default CategoryListItem;