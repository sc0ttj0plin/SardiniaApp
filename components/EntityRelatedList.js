import React, { PureComponent } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import _ from 'lodash';
import {LLEntitiesFlatlist, LLHorizontalItemsFlatlist} from "./loadingLayouts/"
import EntityItem from './EntityItem';
import AsyncOperationStatusIndicator from "./AsyncOperationStatusIndicator"
import CustomText from "./CustomText";
import * as Constants from "../constants";
import Layout from "../constants/Layout";
export default class EntityRelatedList extends PureComponent {

    constructor(props){
        super(props)

        this.space = 10;
        var itemSizeProperties = this._getItemSizeProperties(Layout.window.width);

        this.state = {
            data: props.data || [],
            windowWidth: Layout.window.width,
            itemSizeProperties: itemSizeProperties,
        }
    }

    componentDidUpdate(prevProps){
        if(prevProps.data !== this.props.data){
            this.setState({data: this.props.data})
        }
    }

    _onLayout = (event) => { 
        var itemSizeProperties = this._getItemSizeProperties(event.nativeEvent.layout.width);
        this.setState({itemSizeProperties: itemSizeProperties});
    }

    _getItemSizeProperties = (windowWidth) => {
        const { horizontal, index, sideMargins } = this.props;
        const margins = sideMargins || 20
        const itemWidth = ((windowWidth - (margins*2))/2) - this.space / 2;
        const width = horizontal==false ? itemWidth : 160;
        const height = width;
        const marginRight = 0;
        const marginBottom = horizontal===true ? 10 : 0
        return { width, height, marginRight, marginBottom, space: this.space};
    }

    _renderPoiListItem = (item, index) => {
        const {listType, listTitle, horizontal, itemStyle, disableSeparator} = this.props
        const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);

        var itemSizeProperties = {...this.state.itemSizeProperties};
        itemSizeProperties.marginLeft = (horizontal==false && index%2 != 0) ? this.space : 0;

        if(this.props.renderListItem) {
            return this.props.renderListItem(item, index, itemSizeProperties);
        }
        
        
        let place = item && item.term ? item.term.name : "";

        return (
            <>
            <EntityItem 
                index={index}
                keyItem={item.nid}
                listType={listType}
                listTitle={listTitle}
                onPress={ () => this.props.onPressItem(item, listType)}
                title={title}
                subtitle={place}
                image={item.image}
                distance={item.distanceStr}
                style={itemStyle}
                size={itemSizeProperties}
                horizontal={horizontal}
            />
            {!disableSeparator && this._renderHorizontalSeparator()}
            </>
        )
    }

    _renderHorizontalSeparator = () => {
        return (
          <View style={{width: 10}}></View>
        )
    }

    _renderLoadingLayout = () => {
        const { 
            listTitle, 
            contentContainerStyle, 
            listTitleStyle, 
            horizontal, 
            extraData,
            showsHorizontalScrollIndicator,
            numColumns,
            sideMargins,
            itemStyle
        } = this.props; 

        return(
            <>
                {!horizontal && 
                    <LLEntitiesFlatlist 
                        itemStyle={itemStyle} 
                        numColumns={numColumns} 
                        sideMargins={sideMargins} 
                        horizontal={horizontal} 
                        style={[styles.fill, this.props.style]} 
                        contentContainerStyle={contentContainerStyle}
                        size={this.state.itemSizeProperties}
                        error={false}/>
                }
                {horizontal &&
                    <LLHorizontalItemsFlatlist 
                        horizontal={true} 
                        style={[styles.fill, this.props.style]}
                        contentContainerStyle={contentContainerStyle} 
                    />
                }
            </>
        )
    }
      
    render() {
        const { 
            listTitle, 
            contentContainerStyle, 
            listTitleStyle, 
            horizontal, 
            extraData,
            showsHorizontalScrollIndicator,
            numColumns,
            sideMargins,
            itemStyle
        } = this.props; 
        const {data} = this.state
        return (
           
            <View style={{flex: 1}} onLayout={this._onLayout}>   
                <CustomText style={[listTitleStyle]}>{listTitle}</CustomText>
                    <AsyncOperationStatusIndicator
                        loading={true}
                        success={data && data.length > 0}
                        error={false}
                        loadingLayout={this._renderLoadingLayout()}>
                    <FlatList 
                        {...this.props} 
                        horizontal={horizontal || false}
                        key={listTitle + "-1"}
                        extraData={extraData}
                        keyExtractor={item => item.uuid.toString()}
                        data={data}
                        renderItem={({item, index}) => this._renderPoiListItem(item, index)}
                        style={[styles.fill, this.props.style]}
                        contentContainerStyle={contentContainerStyle}
                        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator || true}
                        initialNumToRender={6} // Reduce initial render amount
                        updateCellsBatchingPeriod={400} // Increase time between renders
                        windowSize={10} // Reduce the window size
                        ItemSeparatorComponent={() => <View style={{height: 10}}></View>}
                    />
                    </AsyncOperationStatusIndicator>
                </View>
            
        )
    }
}

const styles = StyleSheet.create({
    fill: {
        flex: 1
    }
});