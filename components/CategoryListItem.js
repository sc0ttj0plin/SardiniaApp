import React, { PureComponent } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import ScrollableContainerTouchableOpacity from "../components/ScrollableContainerTouchableOpacity";
import { Image } from 'react-native-elements';
import CustomText from "./CustomText";

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

  _renderBottomBox = (title, showBoxes, opacityBackground, bgColor) => {
    let backgroundColor = (`rgba(255, 255, 255, 0.7)`);

    return (
      <View style={[styles.titleContainer]}>
          <View style={[styles.titleContainerBackground, {
            backgroundColor: backgroundColor
            }]}>
              <Text style={[styles.title]}>
                  {title}
              </Text>
              {/* {
                showBoxes &&
                <View style={styles.boxes}>
                    <View style={styles.box1}></View>
                    <View style={styles.box2}></View>
                    <View style={styles.box3}></View>
                    <View style={styles.box4}></View>
                </View>
              } */}
          </View>
      </View>
    );
  }

  render() { 
    var image = this.props.image ? this.props.image : "https://via.placeholder.com/300x150";
    return (
      <ScrollableContainerTouchableOpacity onPress={this.props.onPress} activeOpacity={0.7} style={[styles.container, this.props.style]} onLayout={(event) => { this.setState({ width: event.nativeEvent.layout.width }); }} > 
       <View style={{flex: 1}}>
        <Image 
            source={{ uri: image }} 
            style={[styles.image, { width: this.state.width, height: this.state.height }, this.props.imageStyle]} 
            PlaceholderContent={<ActivityIndicator style={styles.spinner} color={"white"} />}
            >
            {this._renderBottomBox(this.props.title, true, 0.8)}
          </Image>
        </View>
      </ScrollableContainerTouchableOpacity>
      );
    }
}

const styles = StyleSheet.create({ 
    spinner: {
      marginTop: 40
    },
    container: {
      flex: 1,
      borderRadius: 8,
      overflow: "hidden",
      height: 160,
      marginTop: 10,
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
      fontSize: 18,
      color: "black",
      fontFamily: "montserrat-bold",
      padding: 10,
      textAlign: "center",
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
      minHeight: 60,
      justifyContent: "center",
      alignItems: "center"
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