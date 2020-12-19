import React, { PureComponent } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import GeoRefHListItem from "./GeoRefHListItem";
import ScrollableContainerTouchableOpacity from "./ScrollableContainerTouchableOpacity";
import { Ionicons } from '@expo/vector-icons';
import * as Constants from '../constants';
import Layout from "../constants/Layout";
import CustomText from "./CustomText";
import ShimmerWrapper from "./ShimmerWrapper";
import LLEntityTextWidget from './loadingLayouts/LLEntityTextWidget';
import AsyncOperationStatusIndicator from '../components/AsyncOperationStatusIndicator'

export default class EntityItemInModal extends PureComponent {
  constructor(props){
    super(props)
    // console.log("props", props)
  }

  render() {
    const { onPress, keyItem, title, subtitle, image, distance, horizontal, extraStyle } = this.props;

    return (
        <ScrollableContainerTouchableOpacity 
            key={keyItem}  
            onPress={onPress}
            activeOpacity={0.7}
            style={[styles.fill, extraStyle]}
        >
            <>
                <View style={[styles.imageContainer, {height: Layout.window.height / 3.5}]}>
                    <ShimmerWrapper shimmerStyle={styles.shimmer} />
                    <Image source={{ uri: image}} style={styles.image} />
                </View>
                <AsyncOperationStatusIndicator
                    loading={true}
                    success={title && title != "null"}
                    loadingLayout={<LLEntityTextWidget />}
                    >
                    <View style={styles.textContainer}>
                        <CustomText
                        numberOfLines={1}
                        ellipsizeMode='tail'
                        style={styles.title}>{title}
                        </CustomText>
                        <View>
                            <CustomText 
                            numberOfLines={1}
                            ellipsizeMode='tail'
                            style={styles.place}>{subtitle}
                            </CustomText>
                            <CustomText 
                            numberOfLines={1}
                            ellipsizeMode='tail'
                            style={styles.distance}>{distance}
                            </CustomText>
                        </View>
                    </View>
                </AsyncOperationStatusIndicator>
            </>
      </ScrollableContainerTouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  imageContainer:{
    width: "100%",
    height: 220
  },
  image: {
    resizeMode: "cover",
    backgroundColor: "transparent",
    width: "100%",
    height: "100%",
  },
  shimmer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  textContainer: {
    padding: 8,
    width: "100%",
  },
  title: {
    fontSize: 15,
    fontFamily: "montserrat-bold",
  },
  place: {
    fontSize: 13
  },
  distance: {
    fontSize: 13,
    fontFamily: "montserrat-bold",
  },
})