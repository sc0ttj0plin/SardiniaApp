
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import ShimmerWrapper from "../ShimmerWrapper"
import Layout from "../../constants/Layout"

export default class LLEntitiesFlatlist extends PureComponent{

    constructor(props){
        super(props);
    }

    _renderItem = ({ item, index }) => {
        const { size, horizontal, vertical } = this.props;

        var itemSize = null;

        if(size){
            itemSize = {...this.props.size};
            itemSize.marginLeft = (horizontal==false && index%2 != 0) ? itemSize.space : 0;
        }

        return(
            <>
            { horizontal===false &&
                <ShimmerWrapper 
                    style={[styles.item]} 
                    shimmerStyle={[styles.item, this.props.itemStyle,  
                        size && {
                        marginRight: itemSize.marginRight,
                        marginLeft: itemSize.marginLeft,
                        marginBottom: itemSize.marginBottom, 
                        width: itemSize.width,
                        height: itemSize.height }]}/>
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
        width: '100%',
        height: '100%',
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
