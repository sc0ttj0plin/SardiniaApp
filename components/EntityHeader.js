import React, {PureComponent} from 'react';
import { View, StyleSheet, Text, PixelRatio, Platform } from 'react-native';
import Colors from '../constants/Colors';
import CustomText from "./CustomText";
import AsyncOperationStatusIndicator from './AsyncOperationStatusIndicator'; 
import ShimmerWrapper from './ShimmerWrapper'; 

export default class EntityHeader extends PureComponent {  
  
  constructor(props) {
    super(props);
    this.state = {
    };
    this._fontScale = PixelRatio.getFontScale();
  }

  renderLL() {
    const { borderColor } = this.props;
    return (
      <View style={styles.shimmerContainer}>
        <View style={[styles.categoryContainer]}>
            <ShimmerWrapper shimmerStyle={[styles.shimmer, {marginVertical: (Platform.OS == "ios" ? 2 : 3) * this._fontScale, width: 80 * this._fontScale, height: 15 * this._fontScale}]}></ShimmerWrapper>
            <View style={[styles.borderLine, {backgroundColor: borderColor || Colors.blue}]}></View>
        </View>
        <ShimmerWrapper shimmerStyle={[styles.shimmer, {marginVertical: (Platform.OS == "ios" ? 2 : 3) * this._fontScale, width: 100 * this._fontScale, height: 20 * this._fontScale}]}></ShimmerWrapper>
      </View>
    );
  }
  
  render() {
    const { term, title, borderColor } = this.props;
    return (
      <>
          <View style={styles.topLineContainer}>
            <View style={styles.topLine}/>  
          </View>
          <AsyncOperationStatusIndicator
                    loading={true}
                    success={title}
                    error={false}
                    loadingLayout={this.renderLL()}>
        
            { term != "" && term &&(
              <View style={[styles.categoryContainer]}>
                <CustomText style={[styles.category]}>{term}</CustomText>
                <View style={[styles.borderLine, {backgroundColor: borderColor || Colors.blue}]}></View>
              </View>
            )}
            <CustomText style={[styles.title]}>{title}</CustomText>
          </AsyncOperationStatusIndicator>
        </>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1
  },
  categoryContainer: {
    flexDirection: "column",
    justifyContent: "center"
  },
  borderLine: {
    height: 4,
    width: 61,
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 16
  },
  category: {
    fontSize: 15,
    flex: 1,
    textAlign: "center",
    fontFamily: "montserrat-bold",
    opacity: 0.8,
    color: "#666666"
  },
  title: {
    fontSize: 20,
    flex: 1,
    textAlign: "center",
    color: "#000000E6",
    fontFamily: "montserrat-bold",
    paddingHorizontal: 30
  },
  shimmerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center"
  },
  shimmer: {
    borderRadius: 8
  },
  topLineContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  topLine: {
    width: 32,
    height: 4,
    backgroundColor: "#0000001A",
    borderRadius: 2,
    marginTop: 20,
    marginBottom: 16
  }
});