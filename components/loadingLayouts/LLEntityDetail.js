
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet, View, Text, PixelRatio, Platform } from 'react-native';
import ShimmerWrapper from "../ShimmerWrapper";
import  * as Constants from "../../constants";


export default class LLEntityTextWidget extends PureComponent {

    constructor(props){
        super(props);
        this._fontScale = PixelRatio.getFontScale();
    }

    render(){
        return (
            <View style={styles.textContainer}>
                <ShimmerWrapper  shimmerStyle={[styles.textRow, {height: this._fontScale * Constants.styles.entityItemInModal.titleFontSize, marginBottom: this._fontScale * 5}]} />
                <ShimmerWrapper  shimmerStyle={[styles.textRow, styles.textOdd, {height: this._fontScale * Constants.styles.entityItemInModal.titleFontSize, marginBottom: this._fontScale * 5}]} />
                <ShimmerWrapper  shimmerStyle={[styles.textRow, {height: this._fontScale * Constants.styles.entityItemInModal.titleFontSize, marginBottom: this._fontScale * 5}]} />
                <ShimmerWrapper  shimmerStyle={[styles.textRow, styles.textOdd, {height: this._fontScale * Constants.styles.entityItemInModal.titleFontSize, marginBottom: this._fontScale * 5}]} />
                <ShimmerWrapper  shimmerStyle={[styles.textRow, {height: this._fontScale * Constants.styles.entityItemInModal.titleFontSize, marginBottom: this._fontScale * 5}]} />
                <ShimmerWrapper  shimmerStyle={[styles.textRow, styles.textOdd, {height: this._fontScale * Constants.styles.entityItemInModal.titleFontSize, marginBottom: this._fontScale * 5}]} />
                <ShimmerWrapper  shimmerStyle={[styles.textRow, {height: this._fontScale * Constants.styles.entityItemInModal.titleFontSize, marginBottom: this._fontScale * 5}]} />
                
            </View>
        )
    }
}

const styles = StyleSheet.create({
      textContainer: {
        marginTop: 20,
        padding: 10,
        width: "100%",
        flex: 1,
        alignItems: "center"
      },
      textRow: {
        width: "85%",
        borderRadius: 8,
      },
      textOdd: {
        width: "75%"
      }
});
