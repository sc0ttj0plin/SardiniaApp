import React, { PureComponent } from 'react';
import { View, Platform, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Image } from 'react-native-elements';
import { TouchableOpacity } from "react-native-gesture-handler"
import Colors from '../constants/Colors';

/**
 * EventListItem
 */
export default class EventListItem extends PureComponent {
  render() {
    const { title, term, image, date } = this.props

    return (
      <TouchableOpacity style={styles.listItemButton} activeOpacity={0.7} onPress={this.props.onPress}>
        <View style={styles.listItem}>
          <View style={styles.imageView}>
            <Image
              style={styles.imageView} 
              source={{uri: image}}
              resizeMode="cover"
              PlaceholderContent={<ActivityIndicator style={styles.spinner} color={"white"}/>}/>
          </View>
          <View style={styles.itemDescView}>
              <Text style={styles.listItemTitle}>{title}</Text>
              <Text style={styles.listItemTitle}>{date}</Text>
              <Text style={styles.listItemTerm}>{term}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  listItemButton: {
    width: "100%",
    minHeight: 78,
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingLeft: 1
  },
  listItem: {
    minHeight: 78,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 13,
    marginTop: 3,
    borderRadius: 5,
    width: "99%",
    display: "flex",
    flexDirection: "row"
  },
  imageView: {
    width: 78,
    height: 78,
    borderRadius: 5,
    borderRightColor: "#F2F2F2",
    borderRightWidth: 1
  },
  itemDescView: {
    paddingTop: 14,
    paddingLeft: 10
  },
  listItemImage: {
    width: "100%", 
    height: "100%",
    zIndex: -1
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: "bold"
  },
  listItemTerm: {
    fontSize: 13
  }
});