
import React, { useRefPureComponent, PureComponent } from 'react';
import { Dimensions, StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import Animated from 'react-native-reanimated';
const windowHeight = Dimensions.get('window').height;
const { Value, event, interpolate } = Animated;
import MapView from 'react-native-maps';

import {
 ClusteredMapViewTop
} from "."

const styles = {
  fill: {
    flex: 1,
  },
  dragHandler: {
    alignSelf: 'stretch',
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ccc'
  },
  contentContainerStyle: {
    padding: 16,
    backgroundColor: '#F3F4F9',
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  panelHandle: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4
  },
  item: {
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
    marginVertical: 10,
  },
}

export default class ScrollableComponent extends PureComponent {

  constructor(props){
    super(props);
    this.scrollable = null;
    this.flatlist = null;

    this._refs = {};
    this.map = null;
    this.translateAnim = new Value(0);
    this.translateAnimY = interpolate(this.translateAnim, {
      inputRange: [0, 1],
      outputRange: [0, -windowHeight/2],
    });
    this.state = {
        map: props.map ? props.map : null
    }
  }

  componentDidMount(){
    
  }

  _renderTopContent = () => {
    return (
    <ClusteredMapViewTop
        term={this.props.map.term}
        coords={this.props.map.coords}
        initRegion={this.props.map.region}
        pois={this.props.map.nearPois}
        clusters={this.props.clusters}
        uuids={this.props.map.uuids}
        onRegionChangeComplete={this.props._onRegionChangeComplete}
        style={{
            flex: 1,
        }}
        categoriesMap={this.props.map.categoriesMap}
        mapRef={ref => (this._refs["ClusteredMapViewTop"] = ref)}
        onPress={() => this.scrollable.snapTo(2)}
        onPanDrag={() => this.scrollable.snapTo(2)}
        onDoublePress={() => this.scrollable.snapTo(2)}
    />
    )
  }

  render() {
    // console.log("scrollable", this.scrollable, this.props.map)
    return (
      <View style={styles.fill}>
  
        <Animated.View 
            style={[styles.fill, {
              transform: [
                {
                  translateY: this.translateAnimY,
                },
              ],
            }]}
        >
          <MapView style={styles.fill} ref={map => { this.map = map }}
            onPress={() => this.scrollable.snapTo(2)}
            onPanDrag={() => this.scrollable.snapTo(2)}
            onDoublePress={() => this.scrollable.snapTo(2)}>
            
          </MapView>
          {/* { this.state.map &&
            this._renderTopContent()
            } */}
        </Animated.View>
        <ScrollBottomSheet // If you are using TS, that'll infer the renderItem `item` type
          componentType="FlatList"
          snapPoints={[0, '50%', windowHeight - 150]}
          initialSnapIndex={2}
          renderHandle={() => (
            <View style={styles.header}>
              <View style={styles.panelHandle} />
            </View>
          )}
          data={Array.from({ length: 200 }).map((_, i) => String(i))}
          keyExtractor={i => i}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text>{`Item ${item}`}</Text>
            </View>
          )}
          innerRef={(ref)=>this.flatlist = ref}
          ref={(ref)=>this.scrollable = ref}
          onSettle={(index) => {
            // console.log("onSettle", index);

            // if(this.flatlist) {
            //   // console.log("flatlist ref");
            //   if(this.flatlist){
            //     if(index != 0 && this.flatlist.getNode()){
            //         // console.log("scroll to")
            //         setTimeout( () => {
            //           this.flatlist.getNode().scrollToOffset(0)
            //         }, 1)
            //     }
            //     if(this.flatlist.getNode()){
            //       if(index == 0)
            //         this.flatlist.getNode().setNativeProps({ scrollEnabled: true})
            //       else
            //         this.flatlist.getNode().setNativeProps({ scrollEnabled: false})
            //     }
            //   }
            // }
          }}
          animatedPosition={this.translateAnim}
          contentContainerStyle={[styles.contentContainerStyle, this.props.contentContainerStyle]}
        >
          </ScrollBottomSheet>
      </View>
    );

  }
}