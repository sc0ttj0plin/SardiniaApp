import React, { PureComponent } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import _ from 'lodash';
import LLEntitiesFlatlist from "./loadingLayouts/LLEntitiesFlatlist"
import EntityItem from './EntityItem';
import AsyncOperationStatusIndicator from "./AsyncOperationStatusIndicator"
 
export default class EntityRelatedList extends PureComponent {

    constructor(props){
        super(props)

        this.state = {
            data: props.data || []
        }
    }

    componentDidUpdate(prevProps){
        if(prevProps.data !== this.props.data){
            console.log("loaded", this.props.listTitle, this.props.data.length)
            this.setState({data: this.props.data})
        }
    }

    _renderPoiListItem = (item, index) => {
        const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
        const {listType} = this.props
        let place = item && item.term ? item.term.name : "";
        return (
            <EntityItem 
                index={index}
                keyItem={item.nid}
                listType={listType}
                onPress={ () => this.props.onPressItem(item, listType)}
                title={`${title}`}
                place={`${place}`}
                image={`${item.image}`}
                distance={this.state.isCordsInBound && item.distance}
                style={this.props.itemStyle}
                horizontal={this.props.horizontal}
                sideMargins={this.props.sideMargins}
            />
        )
    }

    _renderHorizontalSeparator = () => {
        return (
          <View style={{width: 5, flex: 1}}></View>
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
            <AsyncOperationStatusIndicator
                loading={true}
                success={data && data.length > 0}
                error={false}
                loadingLayout={
                    <LLEntitiesFlatlist 
                        itemStyle={itemStyle} 
                        numColumns={numColumns} 
                        sideMargins={sideMargins} 
                        horizontal={horizontal} 
                        style={[styles.fill, this.props.style]} 
                        contentContainerStyle={contentContainerStyle} 
                        title={listTitle} 
                        titleStyle={listTitleStyle} 
                        error={false}/>
                }>
                <View style={{flex: 1}}>   
                    <Text style={listTitleStyle}>{listTitle}</Text>
                    <FlatList 
                        {...this.props} 
                        horizontal={horizontal || false}
                        key={listTitle + "-1"}
                        extraData={extraData}
                        keyExtractor={item => item.uuid}
                        data={data}
                        ItemSeparatorComponent={this._renderHorizontalSeparator}
                        renderItem={({item, index}) => this._renderPoiListItem(item, index)}
                        style={[styles.fill, this.props.style]}
                        contentContainerStyle={contentContainerStyle}
                        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator || true}
                        initialNumToRender={2} // Reduce initial render amount
                        updateCellsBatchingPeriod={400} // Increase time between renders
                        windowSize={10} // Reduce the window size
                    />
                </View>
            </AsyncOperationStatusIndicator>
        )
    }
}

const styles = StyleSheet.create({
    fill: {
        flex: 1
    }
});