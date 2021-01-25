
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import ShimmerWrapper from "../ShimmerWrapper"
import Layout from "../../constants/Layout"

export default class LLEntitiesFlatlist extends PureComponent{

    constructor(props){
        super(props);
        
        this.state = {
            separatorSize: {
                width: props.separatorSize ? props.separatorSize.width : 10,
                height: props.separatorSize ? props.separatorSize.height : 10,
            }
        }
    }

    _renderHorizontalSeparator = () => {
        return (
          <View style={{width: this.state.separatorSize.width}}></View>
        )
    }

    _renderItem = ({ item, index }) => {
        const { size, horizontal, vertical, disableSeparator } = this.props;

        return(
            <>
            { horizontal===false &&
                <ShimmerWrapper 
                    style={[styles.item]} 
                    shimmerStyle={[styles.item, this.props.itemStyle, !disableSeparator && {
                        marginBottom: this.state.separatorSize.height, 
                    },
                    size && {
                    marginRight: size.marginRight,
                    marginLeft: size.marginLeft,
                    marginBottom: size.marginBottom, 
                    width: size.width,
                    height: size.height }]}/>
            }
            { horizontal || vertical &&
                <ShimmerWrapper 
                    style={[styles.item, this.props.itemStyle]} 
                    shimmerStyle={[styles.item, this.props.itemStyle]}/>
            }
            {!disableSeparator && this._renderHorizontalSeparator()}
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
                        bodyContainerStyle={this.props.bodyContainerStyle}
                        renderItem={this._renderItem}
                        showsHorizontalScrollIndicator={false}
                        style={this.props.style}
                        contentContainerStyle={[styles.container, this.props.contentContainerStyle]}
                        ItemSeparatorComponent={this.props.ItemSeparatorComponent}
                        >
                        
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
