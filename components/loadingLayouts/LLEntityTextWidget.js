
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet, View, Text, PixelRatio, Platform } from 'react-native';
import ShimmerWrapper from "../ShimmerWrapper";


export default class LLEntityTextWidget extends PureComponent {

    constructor(props){
        super(props);
        this._fontScale = PixelRatio.getFontScale();
        console.log("fontScale", this._fontScale);
    }

    render(){

        return (
            <View style={styles.textContainer}>
                <ShimmerWrapper
                shimmerStyle={[styles.title, {height: this._fontScale * 15, marginBottom: Platform.OS == "ios" ? this._fontScale * 5 : this._fontScale * 8 }]}>
                </ShimmerWrapper>
                <View>
                    <ShimmerWrapper 
                    shimmerStyle={[styles.place, {height: this._fontScale * 13, marginBottom: Platform.OS == "ios" ? this._fontScale * 5 : this._fontScale * 7}]}>
                    </ShimmerWrapper>
                    <ShimmerWrapper 
                    shimmerStyle={[styles.distance, {height: this._fontScale * 13}]}>
                    </ShimmerWrapper>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
      textContainer: {
        padding: 8,
        width: "100%",
      },
      title: {
        width: 200,
        marginBottom: 8,
        borderRadius: 8
      },
      place: {
        width: 120,
        marginBottom: 8,
        borderRadius: 8
      },
      distance: {
        width: 70,
        borderRadius: 8
      },
});
