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
    const { onPress, keyItem, title, subtitle, image, distance, coords, horizontal, extraStyle } = this.props;

    return (
        <ScrollableContainerTouchableOpacity 
            key={keyItem}  
            onPress={onPress}
            activeOpacity={0.7}
            style={[styles.fill, extraStyle]}
        >
            <>
                <View style={[styles.imageContainer, {height: Layout.window.height / 4}]}>
                    <ShimmerWrapper shimmerStyle={styles.shimmer} />
                    <Image source={{ uri: image}} style={styles.image} />
                </View>
                <AsyncOperationStatusIndicator
                    loading={true}
                    success={title && title != "null"}
                    loadingLayout={<LLEntityTextWidget coords={coords} />}
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
                            style={styles.term}>{subtitle}
                            </CustomText>
                            {distance && <CustomText 
                            numberOfLines={1}
                            ellipsizeMode='tail'
                            style={styles.distance}>{distance}
                            </CustomText>}
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
    height: 160
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
    padding: Constants.styles.entityItemInModal.textPadding,
    width: "100%",
  },
  title: {
    fontSize: Constants.styles.entityItemInModal.titleFontSize,
    fontFamily: "montserrat-bold",
  },
  term: {
    fontSize: Constants.styles.entityItemInModal.termFontSize,
  },
  distance: {
    fontSize: Constants.styles.entityItemInModal.distanceFontSize,
    fontFamily: "montserrat-bold",
  },
})