import React, { PureComponent } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import GeoRefHListItem from "./GeoRefHListItem";
import ScrollableContainerTouchableOpacity from "./ScrollableContainerTouchableOpacity";
import CustomIcon from './CustomIcon';
import * as Constants from '../constants';
import Layout from "../constants/Layout";

export default class EntityItemInGrid extends PureComponent {
  constructor(props){
    super(props)

    this.state = {
        itemSize: props.itemSize,
        items: props.items,
        mainItemIndex: props.items.length === 3 ? props.mainItemIndex : -1,
        padding: props.padding
    }
  }

  render() {
      const {items, mainItemIndex, itemSize, padding} = this.state;
      if(items.length == 3) {
        const columnSize = {
            width: itemSize.width,
            height: itemSize.height * 2 + padding
        }
        if(mainItemIndex === 0) {
            return (
                <View style={{flexDirection: "row", width: itemSize.width*2, height: columnSize.height, marginBottom: padding}}>
                    {
                    this.renderItem(columnSize, items[0])
                    }
                    <View style={[styles.column, columnSize, {marginLeft: padding}]}>
                        {
                            this.renderItem(itemSize, items[1])
                        }
                        {
                            this.renderItem(itemSize, items[2], {marginTop: padding})
                        }
                    </View>
                </View>
            )
        } else {
            return (
                <View style={{flexDirection: "row", width: itemSize.width*2, height: columnSize.height, marginBottom: padding}}>
                    <View style={[styles.column, columnSize, {marginRight: padding}]}>
                        {
                            this.renderItem(itemSize, items[0])
                        }
                        {
                            this.renderItem(itemSize, items[1], {marginTop: padding})
                        }
                    </View>
                    {
                    this.renderItem(columnSize, items[2])
                    }
                </View>
            )
        }
      }
      else {
        return (
            <View style={{flexDirection: "row", width: itemSize.width*2, height: itemSize.height, marginBottom: padding}}>
                {
                    this.renderItem(itemSize, items[0])
                }
                {
                    items[1] && this.renderItem(itemSize, items[1], {marginLeft: padding})
                }
            </View>
        );
      }
  }
  
  renderItem(size, item, extraStyle) {
    const { keyItem, title, subtitle, image, distance, animated = false, mediaType} = item;
    return (
        <ScrollableContainerTouchableOpacity 
            key={keyItem}  
            onPress={ () => this.props.onPressItem(item)}
            onLayout={this._onLayout}
            activeOpacity={0.7}
            style={[styles.item, size && {
              width: size.width,
              height: size.height,
            }, extraStyle, /*styles.shadow*/]}
        >
            <GeoRefHListItem
                title={title}
                subtitle={subtitle}
                image={image}
                distance={distance}
                style={[styles.fill, {borderRadius: 0}]}
                animated={animated}
                mediaType={mediaType} />
            
      </ScrollableContainerTouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  item: {
    width: 160,
    height: 160,
    borderRadius: 0
  },
  column: {
    flexDirection: "column",
  }
})