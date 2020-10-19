import React, { useRef } from 'react';
import { Dimensions, StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';
import Animated from 'react-native-reanimated';
import MapView from 'react-native-maps';
const windowHeight = Dimensions.get('window').height;

import { call, useCode, useAnimatedStyle, useSharedValue} from 'react-native-reanimated'
import { PanGestureHandler, State } from "react-native-gesture-handler";
const { Value, event, interpolate } = Animated;

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

export default function ScrollableContainer (props) {
  let scrollable = {}
  scrollable = useRef();
  dragX = new Value(0);
  dragY = new Value(0);
  gestureState = new Value(-1);
  onGestureEvent = Animated.event([
    {
      nativeEvent: {
        translationX: dragX,
        translationY: dragY,
        state: gestureState,
      },
    },
  ]);

  translateAnim = new Value(0);
  translateAnimY = interpolate(translateAnim, {
    inputRange: [0, 1],
    outputRange: [0, -windowHeight/2],
  });

  useCode(() => {
    return call([dragX], (translateAnim) => {
      console.log(translateAnim[0])
    })
  }, [dragX]);


return (
        <View style={styles.fill}>

        <Animated.View style={[styles.fill, {
            transform: [
            {
                translateY: translateAnimY,
            },
            ],
        }]}>
            <MapView style={styles.fill} ref={map => { map = map }}
            onPress={() => scrollable.snapTo(3)}
            onPanDrag={() => scrollable.snapTo(3)}
            onDoublePress={() => scrollable.snapTo(3)}>
            
            </MapView>
        </Animated.View>
        <ScrollBottomSheet // If you are using TS, that'll infer the renderItem `item` type
            componentType="FlatList"
            snapPoints={[30, '50%', windowHeight - 200, windowHeight - 60]}
            initialSnapIndex={2}
            renderHandle={() => (
            <View style={styles.header}>
                <View style={styles.panelHandle} />
            </View>
            )}
            data={props.data ? props.data : []}
            keyExtractor={props.keyExtractor}
            renderItem={props.renderItem}
            ref={(ref)=>scrollable = ref}
            ListHeaderComponent={props.ListHeaderComponent ? props.ListHeaderComponent : <></>}
            onSettle={(index) => {
            console.log("onSettle", index);
            }}
            animatedPosition={translateAnim}
            contentContainerStyle={styles.contentContainerStyle}
        >
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            <Text>contentContainerStyle</Text>
            </ScrollBottomSheet>
        </View>
    );
}