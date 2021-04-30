import React, { PureComponent } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import _ from 'lodash';
import {LoadingLayoutEntitiesFlatlist, LoadingLayoutHorizontalItemsFlatlist} from "../layouts"
import EntityItem from '../entity/EntityItem';
import AsyncOperationStatusIndicator from "../loading/AsyncOperationStatusIndicator"
import CustomText from "../others/CustomText";
import * as Constants from "../../constants";
import Layout from "../../constants/Layout";
import AccomodationItem from "../items/AccomodationItem";
export default class EntityRelatedList extends PureComponent {

    constructor(props){
        super(props)

        this.itemWidth = this.props.itemWidth ? this.props.itemWidth : 220;
    
        var numColumns = this.props.numColumns ? this.props.numColumns : this._numColumns(Layout.window.width);
        var itemSizeProperties = this._getItemSizeProperties(Layout.window.width, numColumns);

        this.state = {
            numColumns,
            data: props.data || [],
            windowWidth: Layout.window.width,
            itemSizeProperties: itemSizeProperties,
            separatorSize: {
                width: props.separatorSize ? props.separatorSize.width : 10,
                height: props.separatorSize ? props.separatorSize.height : 10,
            }
        }
    }

    componentDidUpdate(prevProps){
        if(prevProps.data !== this.props.data){
            this.setState({data: this.props.data})
        }
    }

    _numColumns = (windowWidth) => {
        return Math.ceil(windowWidth / this.itemWidth);
    }

    _onLayout = (event) => {
        var numColumns = this._numColumns(event.nativeEvent.layout.width);
        var itemSizeProperties = this._getItemSizeProperties(event.nativeEvent.layout.width, numColumns);
        this.setState({itemSizeProperties: itemSizeProperties, windowWidth: event.nativeEvent.layout.width, numColumns});
    }

    _getItemSizeProperties = (windowWidth, numColumns = 1) => {
        const { horizontal, index, sideMargins } = this.props;
        const margins = sideMargins || 20
        const horizontalSeparatorSize = this.props.separatorSize ? this.props.separatorSize.width : 10;
        const itemWidth = (windowWidth - horizontalSeparatorSize*(numColumns-1) - margins)/numColumns;
        const width = horizontal==false ? itemWidth : 160;
        const height = width;
        const marginRight = 0;
        const marginBottom = horizontal===true ? horizontalSeparatorSize : 0
        return { width, height, marginRight, marginBottom};
    }

    _renderAccomodationListItem = (item, index, size) => {
        const {listType, disableSeparator } = this.props;
        const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
        const termName = _.get(item, "term.name", "")
        return (
          <>
          <AccomodationItem 
            index={index}
            keyItem={item.nid}
            horizontal={false}
            sideMargins={20}
            title={title}
            term={termName}
            stars={item.stars}
            onPress={() => this.props.onPressItem(item, listType)}
            location={item.location}
            distance={item.distanceStr}
            extraStyle={styles.accomodationListItem}
            size={size}
          />
          {!disableSeparator && this._renderHorizontalSeparator()}
          </>
      )}

    _renderEntityListItem = (item, index) => {
        const {listType, listTitle, horizontal, itemStyle, disableSeparator, itemBorderRadius} = this.props

        if(this.props.renderListItem) {
            return this.props.renderListItem(item, index, this.state.itemSizeProperties);
        }

        if(listType == Constants.ENTITY_TYPES.accomodations) {
            return this._renderAccomodationListItem(item, index, this.state.itemSizeProperties);
        }
        
        const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
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
                size={this.state.itemSizeProperties}
                horizontal={horizontal}
                mediaType={item.mediaType}
                borderRadius={itemBorderRadius}
            />
            {!disableSeparator && this._renderHorizontalSeparator()}
            </>
        )
    }

    _renderHorizontalSeparator = () => {
        return (
          <View style={{width: this.state.separatorSize.width}}></View>
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
            sideMargins,
            itemStyle,
            disableSeparator
        } = this.props; 

        const {
            numColumns, itemSizeProperties, separatorSize
        } = this.state;

        return(
            <>
                {!horizontal && 
                    <LoadingLayoutEntitiesFlatlist 
                        itemStyle={itemStyle} 
                        numColumns={numColumns} 
                        sideMargins={sideMargins} 
                        horizontal={horizontal} 
                        style={[styles.fill, this.props.style]} 
                        contentContainerStyle={contentContainerStyle}
                        size={itemSizeProperties}
                        error={false}
                        disableSeparator={disableSeparator}
                        ItemSeparatorComponent={() => <View style={{height: this.state.separatorSize.height}}></View>}
                        separatorSize={separatorSize}
                        />
                }
                {horizontal &&
                    <LoadingLayoutHorizontalItemsFlatlist 
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
            sideMargins,
            itemStyle,
            keyExtractor
        } = this.props; 
        const {data, numColumns} = this.state;

        return (
            
           
            <View style={{flex: 1}} onLayout={this._onLayout}>   
                <CustomText style={[listTitleStyle]}>{listTitle}</CustomText>
                    <AsyncOperationStatusIndicator
                        loading={true}
                        success={data && data.length > 0}
                        error={false}
                        loadingLayout={this._renderLoadingLayout()}>
                    <FlatList 
                        horizontal={horizontal || false}
                        numColumns={horizontal || numColumns}
                        key={listTitle + "-" + numColumns}
                        extraData={extraData}
                        keyExtractor={keyExtractor ? keyExtractor : item => item.uuid.toString()}
                        data={data}
                        renderItem={({item, index}) => this._renderEntityListItem(item, index)}
                        style={[styles.fill, this.props.style]}
                        contentContainerStyle={contentContainerStyle}
                        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator || true}
                        initialNumToRender={6} // Reduce initial render amount
                        updateCellsBatchingPeriod={400} // Increase time between renders
                        windowSize={10} // Reduce the window size
                        ItemSeparatorComponent={() => <View style={{height: this.state.separatorSize.width}}></View>}
                    />
                    </AsyncOperationStatusIndicator>
                </View>
            
        )
    }
}

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    accomodationListItem: {
        backgroundColor: "rgb(250,250,250)"
    }
});