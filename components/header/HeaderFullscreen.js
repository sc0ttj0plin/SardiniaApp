import React, {PureComponent} from 'react';
import {Text, View, FlatList, StatusBar, StyleSheet, Dimensions} from 'react-native';
import { Button } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import Layout from '../../constants/Layout'
import Colors from '../../constants/Colors';
import * as Constants from "../../constants"
import _ from 'lodash';
import CustomText from "../others/CustomText";
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Header used in full screen components (video, virtual tour, gallery) that only shows a back button controller
 */
class HeaderFullscreen extends PureComponent {  

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    StatusBar.setBarStyle("light-content");
  }

  componentWillUnmount() {
    StatusBar.setBarStyle("dark-content");
  }

  _renderFullscreen() {
    const {text, paddingTop} = this.props;

    return (
        <View style={[styles.header, {marginTop: paddingTop, alignItems: "flex-start", justifyContent: "flex-start", width: 50}]}>
            <View style={[styles.container]}>
                <View style={[styles.leftButtonContainer]}>
                    <Button
                        type="clear"
                        containerStyle={[styles.buttonContainer, {backgroundColor: "rgba(0,0,0,0.8)"}]}
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
        </View>

    );
  }

  render() {
    if(this.props.hideBar)
        return this._renderFullscreen();

    const {text, paddingTop} = this.props;

    return (
        <View style={[styles.header]}>
            <LinearGradient style={[styles.lineargradient, {paddingTop: paddingTop}]}
                    colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.4)']}>
                <View style={[styles.container]}>
                    
                    {text && 
                    <CustomText style={styles.pageIndex}>{text}</CustomText>
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
            </LinearGradient>
        </View>

    );
  }
}

const styles = StyleSheet.create({
    header: {
        zIndex: 999,
        position: "absolute",
        top: 0,
        left: 0,
        flexDirection: "row",
        width: "100%",
        backgroundColor: 'transparent',
        alignItems: "center",
        justifyContent: "center",
    },
    lineargradient: {
        width: "100%"
    },
    container: {
        flexDirection: "row",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        height: Constants.COMPONENTS.header.height,
        maxHeight: Constants.COMPONENTS.header.height,
        minHeight: Constants.COMPONENTS.header.height,
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
        fontSize: 14,
        textAlign: 'center',
        padding: 10,
        borderRadius: 20
    },
    buttonContainer: {
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