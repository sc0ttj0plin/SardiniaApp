import React, {PureComponent} from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, StyleSheet, Text } from 'react-native';
import { GridGallery } from './GridGallery';
import * as Constants from '../constants';

class EntityMedia extends PureComponent {  
  
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  
  render() {
    const { title, images } = this.props;
    return (
      <View style={styles.mainView}>
        <Text style={[styles.sectionTitle]}>{title}</Text>
        <View style={styles.borderLine}></View>
        <GridGallery images={images} onPress={(index) => {
            this.props.navigation.navigate(Constants.NAVIGATION.NavGalleryScreen, {
              images: images,
              initialPage: index
            })
        }}/>
    </View>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1
  },
  mainView: {
    marginBottom: 10, 
    flexDirection: "column"
  },
  borderLine: {
    height: 7,
    width: 100,
    alignSelf: "center",
    backgroundColor: "#F59F1C", 
    width: 60, 
    marginTop: -5, 
    marginBottom: 25
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
});


export default (props) => {
  const navigation = useNavigation();
  const route = useRoute();

  return <EntityMedia
    {...props}
    navigation={navigation}
    route={route}/>;
}