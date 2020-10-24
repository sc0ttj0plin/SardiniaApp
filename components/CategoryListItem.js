import React, { PureComponent } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { ActivityIndicator } from 'react-native';
import { Image } from 'react-native-elements';
// import BoxWithText from "./BoxWithText"; 
// import { TouchableOpacity } from "react-native-gesture-handler"

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

  // hexToRgb = (hex, opacity) => {
  //   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  //   let r =  parseInt(result[1], 16);
  //   let g = parseInt(result[2], 16);
  //   let b = parseInt(result[3], 16);

  //   let color;
  //   if(opacity >= 0 && opacity <= 1)
  //     color = `rgba(${r}, ${g}, ${b}, ${opacity})}`;
  //   else 
  //     color = `rgb(${r}, ${g}, ${b})}`;
  //   return color;
  // }
  
  
  _renderBoxWithText = (title, showBoxes, opacityBackground, bgColor) => {
    let backgroundColor = opacityBackground ? (`rgba(60, 66, 72, ${opacityBackground})`) : (`rgba(60, 66, 72, 0.8)`);

    return (
      <View style={[styles.titleContainer]}>
          <View style={[styles.titleContainerBackground, {
            backgroundColor: backgroundColor
            }]}>
              <Text style={[styles.title]}>
                  {title}
              </Text>
              {
                showBoxes &&
                <View style={styles.boxes}>
                    <View style={styles.box1}></View>
                    <View style={styles.box2}></View>
                    <View style={styles.box3}></View>
                    <View style={styles.box4}></View>
                </View>
              }
          </View>
      </View>
    );
  }

  render() { 
    var image = this.props.image ? this.props.image : "https://via.placeholder.com/300x150";
    return (
      <View style={styles.container} onLayout={(event) => { this.setState({ width: event.nativeEvent.layout.width }); }} > 
       <TouchableOpacity onPress={this.props.onPress} activeOpacity={0.7} style={{flex: 1}}>
        <Image 
            source={{ uri: image }} 
            style={[styles.image, { width: this.state.width, height: this.state.height }, this.props.imageStyle]} 
            PlaceholderContent={<ActivityIndicator style={styles.spinner} color={"white"} />}
            >
            {this._renderBoxWithText(this.props.title, true, 0.8)}
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
    image: {
      resizeMode: "cover",
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
    },
    title: {
      fontSize: 16,
      color: "#ffffff",
      padding: 10,
      textAlign: "center",
      fontWeight: "300"
    },
    titleContainer: {
      width: "100%",
      height: "60%",
      alignSelf: "flex-end",
      justifyContent: "flex-end",
      alignItems: "flex-end"
    },
    titleContainerBackground:  {
      width: "100%",
      backgroundColor: "rgba(60,66,72, 0.8)"
    },
    boxes: {
        position: "absolute",
        width: "117%",
        alignSelf: "center",
        height: 10,
        backgroundColor: "white",
        flexDirection: "row",
        marginTop: -10
    },
    box1: {
        backgroundColor: "#154A7D",
        flex: 1
    },
    box2: {
        backgroundColor: "#F59F1C",
        flex: 1
    },
    box3: {
        backgroundColor: "#50712A",
        flex: 1
    },
    box4: {
        backgroundColor: "#D95620",
        flex: 1
    }

});

export default CategoryListItem;