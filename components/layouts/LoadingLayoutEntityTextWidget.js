
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet, View, Text, PixelRatio, Platform } from 'react-native';
import ShimmerWrapper from "../loading/ShimmerWrapper";
import  * as Constants from "../../constants";


export default class LoadingLayoutEntityTextWidget extends PureComponent {

    constructor(props){
        super(props);
        this._fontScale = PixelRatio.getFontScale();
    }

    render(){
        return (
            <View style={styles.textContainer}>
                <ShimmerWrapper
                shimmerStyle={[styles.title, {height: this._fontScale * Constants.styles.entityItemInModal.titleFontSize}]}>
                </ShimmerWrapper>
                <View>
                    <ShimmerWrapper 
                    shimmerStyle={[styles.place, {height: this._fontScale * Constants.styles.entityItemInModal.titleFontSize, marginTop: Platform.OS == "ios" ? this._fontScale * 3 : this._fontScale * 6 }]}>
                    </ShimmerWrapper>
                    {this.props.coords && this.props.coords.latitude && <ShimmerWrapper 
                    shimmerStyle={[styles.distance, {height: this._fontScale * Constants.styles.entityItemInModal.distanceFontSize, marginTop: Platform.OS == "ios" ? this._fontScale * 3 : this._fontScale * 4}]}>
                    </ShimmerWrapper>}
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
      textContainer: {
        padding: Constants.styles.entityItemInModal.textPadding,
        width: "100%",
      },
      title: {
        width: 200,
        borderRadius: 8,
      },
      place: {
        width: 120,
        borderRadius: 8
      },
      distance: {
        width: 70,
        borderRadius: 8
      },
});
