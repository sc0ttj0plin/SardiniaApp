
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import ShimmerWrapper from "../ShimmerWrapper"
import Layout from "../../constants/Layout"

export default class LLEntitiesFlatlist extends PureComponent{

    constructor(props){
        super(props);
    }

    _renderItem = ({ item, index }) => {
        const { sideMargins, horizontal, vertical } = this.props;
        let margins = sideMargins || 20
        let itemWidth = ((Layout.window.width - (margins*2))/2) - 5;
        let width = horizontal===false ? itemWidth : "100%";
        let height = width;
        let space = (Layout.window.width - (margins*2) - (width*2))/ 2;
        const marginRight = 0;
        const marginLeft = horizontal===false && index && index%2 != 0 ? space*2 : 0;
        const marginBottom = horizontal===false ? 16 : 0
        return(
            <>
            { horizontal===false &&
                <ShimmerWrapper 
                    style={[styles.item]} 
                    shimmerStyle={[styles.item, this.props.itemStyle,  { marginRight, marginLeft, marginBottom, width, height }]}/>
            }
            { horizontal || vertical &&
                <ShimmerWrapper 
                    style={[styles.item, this.props.itemStyle]} 
                    shimmerStyle={[styles.item, this.props.itemStyle]}/>
            }
            </>
        )
    }

    render(){

        let listTitle = this.props.title ? this.props.title : null;
        return (
            <> 
                { listTitle &&
                    <Text style={[styles.sectionTitle, this.props.titleStyle]}>{listTitle}</Text>
                }
                { !this.props.error &&
                    <FlatList 
                        horizontal={this.props.horizontal ? this.props.horizontal : false}
                        data={Array.from({ length: 5 }).map((_, i) => String(i))}
                        keyExtractor={i => i}
                        numColumns={this.props.numColumns ? this.props.numColumns : 1}
                        bodyContainerStyle={this.props.bodyContainerStyle ? this.props.bodyContainerStyle : 1}
                        renderItem={this._renderItem}
                        showsHorizontalScrollIndicator={false}
                        style={this.props.style}
                        contentContainerStyle={[styles.container]}>
                    </FlatList>
                }
            </>
        )
    }
}

const styles = StyleSheet.create({
    item: {
        width: 160,
        height: 160,
        marginRight: 5,
        borderRadius: 10,
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
