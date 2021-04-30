import React, { PureComponent } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import ShimmerWrapper from "../loading/ShimmerWrapper"

export default class LoadingLayoutBoilerPlate extends PureComponent {

    constructor(props){
        super(props);
    }

    _renderItem = ({ item }) => {
        return(
            <ShimmerWrapper style={styles.item} shimmerStyle={[styles.item, this.props.itemStyle]}/>
        )
    }

    render(){

        return (
            <View style={{
                flex: 1,
                width: "100%"
            }}>
                <Text style={styles.sectionTitle}>{this.props.title}</Text>
                <FlatList
                    horizontal={false}
                    data={Array.from({ length: 5 }).map((_, i) => String(i))}
                    keyExtractor={i => i}
                    renderItem={this._renderItem}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[styles.container, this.props.style]}>
                </FlatList>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    item: {
    },
    container: {
        backgroundColor: "transparent",
    },
    sectionTitle: {
        fontSize: 16,
        color: 'white',
        fontFamily: "montserrat-bold",
        margin: 10
    }
});
