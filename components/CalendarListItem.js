import React, { PureComponent } from "react";
import { StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Image } from "react-native-elements";
import BoxWithText from "../components/BoxWithText";
import Colors from "../constants/Colors";

/**
 * List item elements in the Events screen
 */
class CalendarListItem extends PureComponent { 
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { item, title, termName, image, onPress, lan } = this.props;
    return (
      <TouchableOpacity    
        onPress={() => onPress(item)}
        activeOpacity={0.7}
        style={[styles.container, this.props.style]}>
        <Image
          style={styles.cardImage} 
          source={{uri: image}}
          PlaceholderContent={<ActivityIndicator />}>
          <BoxWithText 
            extraStyle={{color: Colors.colorEventsScreen}}
            title={title}
            opacityBackground={0.98}
            backgroundColor={"#ffffff"}
            titleStyle={{color: Colors.colorEventsScreen}}/>
        </Image>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    marginBottom: 5,
    marginRight: 20,
    borderRadius: 5,
    overflow: "hidden",
    position: "relative",
  },
  titleContainer: {
    position: "absolute",
    width: "70%",
    height: "100%",
    zIndex: 999,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center"
  },
  titleContainerBg: {
    width: 200,
    minHeight: 50,
    paddingVertical: 15,
    paddingHorizontal: 15,
    textAlignVertical: "center",
    backgroundColor: "rgba(211, 100, 77, 0.9)", 
    borderRadius: 8
  },
  title: {
    fontSize: 16,
    fontWeight: "300",
    color: "white",
    textAlign: "center",
    textAlignVertical: "center"
  },  
  category: {
    fontSize: 12,
    fontStyle: "italic"
  },
  header: {
    backgroundColor: "#ffffff",
    alignItems: 'center',
    padding: 5
  },
  text: {
    marginLeft: 5, 
    alignSelf: 'center'
  },
  cardImage: {
    height: 200,
    width: "100%",
    borderRadius: 5,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  }
});

////////////////////////////////////////
export default CalendarListItem;
