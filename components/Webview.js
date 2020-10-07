import React, { useState } from 'react';
import { Text, ScrollView, Image, View, StyleSheet, Share } from 'react-native';
import { Button, Icon } from "react-native-elements";
import Layout from '../constants/Layout';
import * as Constants from '../constants';
import HTML from 'react-native-render-html';

export default Webview = (props) => {
  const { lan, title, description, image, category, abstract, showAll = true } = props;
  const isFavourite = props.isFavourite;
  
  let _onShare = async (link) => {
    try {
      const result = await Share.share({
        message: link,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  let _getUrlAlias = (url_alias, lan) => {
    for(var i = 0; i < url_alias.length; i++) {
      var alias = url_alias[i];
      if(alias.language == lan)
        return alias.alias;
    }
    return "";
  }

  const socialUrl = "https://www.sardegnaturismo.it/" + _getUrlAlias(props.urlAlias, lan);

  return (
    <View style={[styles.fill]}>
            
            {/* NOTE: for the video player to show we had to move it out the ScrollView */}
            <ScrollView style={styles.fill}>
            <Image 
              style={[styles.image]}
              source={{uri: image}}
              resizeMode='cover'
              imageStyle={[styles.image]}
            />
            <View style={[styles.headerContainer]}>
              {category && (
                <View style={[styles.categoryContainer]}>
                  <Text style={[styles.category]}>{category}</Text>
                  <View style={[styles.borderLine, {backgroundColor: props.categoryColor}]}></View>
                </View>
              )}
              <Text style={[styles.title]}>{title}</Text>
              
            </View>
            <View style={styles.view1}>
              <Button
                buttonStyle={styles.fabStyle1, { backgroundColor: props.categoryColor }}
                containerStyle={styles.fabContainerFav}
                onPress={props.toggleFavourite}
                icon={<Icon name={isFavourite ? "heart" : "heart-o"} size={20} type="font-awesome" color="white"/>}>
              </Button>
              <Button
                buttonStyle={styles.fabStyle2, { backgroundColor: props.categoryColor }}
                containerStyle={styles.fabContainerFav}
                onPress={() => _onShare(socialUrl)}
                icon={<Icon name={"share"} size={20} type="font-awesome" color="white" />}>
              </Button>
            </View>
            <View style={[styles.container]}>
              {abstract && (
                <HTML containerStyle={[Constants.styles.innerText]} html={"<font style=\"" + Constants.styles.html.shortText + "\">" + abstract + "</font>"} />
              )}

              {description && (
                <View style={[Constants.styles.innerText, styles.descriptionView]}>
                  <Text style={styles.sectionTitle}>Descrizione</Text>
                  <View style={styles.borderLine}></View>
                  <HTML html={"<font style=\"" + Constants.styles.html.longTextLeft + "\">" + description + "</font>"} />
                </View>
              )}
          </View>
          </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "white",
  },
  headerContainer: {
    padding: 10,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20, 
    marginTop: -10
  },
  fabStyle1: {
    position: "absolute", 
    top: 5, 
    left: 10, 
    borderRadius: 50,
  },
  fabStyle2: {
    position: "absolute", 
    top: 5, 
    left: Layout.window.width - 45, 
    borderRadius: 50, 
  },
  image: {
    maxHeight: 210,
    height: 210,
    resizeMode: "cover",
    backgroundColor: "#cccccc"
  },
  descriptionView: {
    flexDirection: "column", 
    marginBottom: 30
  },
  header: {
    backgroundColor: "white"
  },
  view1: {
    width: "100%", 
    height: 30, 
    position: "absolute", 
    left: 0, 
    top: 200
  },
  title: {
    fontSize: 16,
    flex: 1,
    textAlign: "center",
    opacity: 0.6,
    color: "black",
    fontWeight: "bold"
  },
  sectionTitle: {
    flex: 1,
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
    opacity: 0.6,
    color: "black",
    fontWeight: "bold"
  },
  showMoreButton: {
      marginBottom: 10
  },
  borderLine: {
    backgroundColor: "#24467C",
    height: 7,
    width: 100,
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 10,
    backgroundColor: "#F59F1C", 
    width: 60, 
    marginTop: -5, 
    marginBottom: 25
  },
  categoryContainer: {
    flexDirection: "column",
    justifyContent: "center"
  },
  category: {
    fontSize: 12,
    flex: 1,
    opacity: 0.6,
    textAlign: "center",
    color: "black"
},
});