import React, { PureComponent } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import _ from 'lodash';
import PoiItem from '../components/PoiItem';
import Colors from '../constants/Colors';
import LLEntitiesFlatlist from "./loadingLayouts/LLEntitiesFlatlist"
import { AsyncOperationStatusIndicator } from "."
import CustomText from "./CustomText";
 
/**
 * PoiItemsList renders a set of PoiItem 
 */
export default class PoiItemsList extends PureComponent {

    constructor(props){
        super(props)

        this.state = {
          data: props.data ? props.data : []
        }
    }

    _renderPoiListItem = (item) => {
        const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
        const termName = item.term ? item.term.name : "";
        const {cornerIconName} = this.props
        return (
          <PoiItem 
            keyItem={item.nid}
            backgroundTopLeftCorner={this.props.cornerColor ? this.props.cornerColor: "white"}
            iconColor={this.props.cornerIconColor ? this.props.cornerIconColor : Colors.colorPlacesScreen}
            iconName={cornerIconName ? cornerIconName : ""}
            onPress={ () => this.props.onPressItem(item)}
            title={title}
            subtitle={termName}
            image={item.image}
            distance={this.state.isCordsInBound && item.distance}
          />
        )
    }

    render() {
        const { listTitle } = this.props; 
        return (
            <AsyncOperationStatusIndicator
              loading={true}
              success={this.state.data && this.state.data.length > 0}
              error={false}
              loadingLayout={<LLEntitiesFlatlist horizontal={true} style={this.props.contentContainerStyle} title={listTitle} titleStyle={this.props.listTitleStyle} error={false}/>}>
              <View style={{flex: 1}}>   
                <Text style={{...this.props.listTitleStyle}}>{listTitle}</Text>
                <FlatList 
                  horizontal={this.props.horizontal ? this.props.horizontal : false}
                  key={listTitle + "-1"}
                  extraData={this.props.extraData}
                  keyExtractor={item => item.nid.toString()}
                  data={this.state.data}
                  renderItem={({item, index}) => this._renderPoiListItem(item, index)}
                  style={styles.fill}
                  ItemSeparatorComponent={this.props.ItemSeparatorComponent ? this.props.ItemSeparatorComponent : null}
                  contentContainerStyle={this.props.contentContainerStyle ? this.props.contentContainerStyle : {}}
                  showsHorizontalScrollIndicator={this.props.showsHorizontalScrollIndicator ? this.props.showsHorizontalScrollIndicator : true}
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