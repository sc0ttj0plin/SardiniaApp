import React, {PureComponent} from 'react';
import {Text, View, FlatList, ScrollView, StyleSheet, Dimensions} from 'react-native';
import { Button } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import Layout from '../constants/Layout'
import Colors from '../constants/Colors';
import _ from 'lodash';

/**
 * Header used in full screen components (video, virtual tour, gallery) that only shows a back button controller
 */
class HeaderFullscreen extends PureComponent {  

  constructor(props) {
    super(props);
  }

  render() {
    const text = this.props.text;

    return (
        <View style={[styles.buttonTopHeader, {top: Layout.statusbarHeight, height: Layout.header.height}]}>
            {text && 
            <View style={[styles.centerButtonContainer]}>
                <Text style={styles.pageIndex}>{text}</Text>
            </View>
            }
            <View style={[styles.leftButtonContainer]}>
                <Button
                    type="clear"
                    containerStyle={[styles.buttonContainer]}
                    buttonStyle={styles.button}
                    onPress={this.props.goBackPressed}
                    icon={
                    <Ionicons
                        name={Platform.OS === 'ios' ? 'ios-arrow-back' : 'md-arrow-back'}
                        size={30}
                        color={Colors.tintColor}
                    />
                    }
                />
            </View>
        </View>

    );
  }
}

const styles = StyleSheet.create({
    buttonTopHeader: {
        width: "100%",
        position: 'absolute',
        top: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    centerButtonContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        top: 0,
        height: '100%',
    },
    leftButtonContainer: {
        position: 'absolute',
        height: '100%',
        top: 0,
        left: 0,
        padding: 5,
        justifyContent: 'center'
    },
    rightButtonContainer: {
        position: 'absolute',
        height: '100%',
        top: 0,
        right: 0,
        padding: 5,
        justifyContent: 'center'
    },
    pageIndex: {
        color: 'white',
        backgroundColor: "rgba(0,0,0,0.5)",
        fontSize: 14,
        textAlign: 'center',
        padding: 10,
        borderRadius: 20
    },
    buttonContainer: {
        backgroundColor: "rgba(0,0,0,0.5)",
        borderRadius: 50,
        height: 50,
    },
    button: {
        height: 50,
        width: 50
    },
    fill: {
        flex: 1
    },
    headerContainer: {
        padding: 10,
        backgroundColor: "white"
    },
});

export default HeaderFullscreen;