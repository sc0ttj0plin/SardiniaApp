import React, { PureComponent } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import _ from 'lodash';
import { useNavigation } from '@react-navigation/native';
import { FlatList } from "react-native-gesture-handler"
import LoadingLayoutEntitiesFlatlist from "../layouts/LoadingLayoutEntitiesFlatlist";
import AccomodationItem from '../items/AccomodationItem';
import AsyncOperationStatusIndicator from "../loading/AsyncOperationStatusIndicator";
import * as Constants from "../../constants";
import Colors from '../../constants/Colors';
import CustomText from "../others/CustomText";

class EntityAccomodations extends PureComponent {

    constructor(props){
        super(props)

    }

    _onAccomodationPress = (item) => this.props.navigation.navigate(Constants.NAVIGATION.NavAccomodationScreen, { item, mustFetch: true })
    
    _renderAccomodationItem = (item, index, horizontal) => {
      const title = _.get(item.title, [this.props.locale.lan, 0, "value"], null);
      const termName = _.get(item, "term.name", "")
      return (
        <>
          <AccomodationItem 
            index={index}
            keyItem={item.nid}
            extraStyle={ horizontal ? {} : {width: '100%'}}
            horizontal={horizontal}
            sizeMargins={20}
            title={title}
            term={termName}
            stars={item.stars}
            location={item.location}
            distance={item.distanceStr}
            onPress={() => this._onAccomodationPress(item)}
          />
          <View style={{width: 10, flex: 1}}></View>
        </>
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
          showMapBtnText = "", 
          data, 
          listTitleStyle, 
          horizontal, 
          showsHorizontalScrollIndicator, 
          extraData,
          openMap,
        } = this.props; 
        const { nearAccomodations } = this.props.locale.messages;

        return (
            <View style={[styles.fill, styles.mainView]}>
                <CustomText style={styles.title}>{nearAccomodations}</CustomText>
                <AsyncOperationStatusIndicator
                    loading={true}
                    success={data && data.length > 0}
                    error={false}
                    loadingLayout={<LoadingLayoutEntitiesFlatlist horizontal={true} style={styles.contentContainerStyle} title={listTitle} titleStyle={this.props.listTitleStyle} error={false}/>}>
                    <View style={{flex: 1}}>   
                        <FlatList 
                            horizontal={horizontal ? horizontal : false}
                            key={listTitle + "-1"}
                            extraData={extraData}
                            keyExtractor={(item, index) => index}
                            data={data || []}
                            renderItem={({item, index}) => this._renderAccomodationItem(item, index, true)}
                            style={[styles.fill, {}]}
                            // ItemSeparatorComponent={ItemSeparatorComponent || this._renderHorizontalSeparator}
                            // contentContainerStyle={contentContainerStyle ? contentContainerStyle : {}}
                            contentContainerStyle={{paddingLeft: 10}}
                            showsHorizontalScrollIndicator={showsHorizontalScrollIndicator ? showsHorizontalScrollIndicator : true}
                            initialNumToRender={6} // Reduce initial render amount
                            updateCellsBatchingPeriod={400} // Increase time between renders
                            windowSize={10} // Reduce the window size
                        />
                    </View>
                </AsyncOperationStatusIndicator>

                <TouchableOpacity style={styles.showButton} activeOpacity={0.8} onPress={openMap}>
                    <CustomText style={styles.showButtonText}>{showMapBtnText}</CustomText>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    fill: {
        flex: 1
    },
    mainView: {
        paddingTop: 32,
        paddingBottom: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: Colors.entityAccomodations,
        marginTop: 32,
    },
    title: {
        fontSize: 15,
        fontFamily: "montserrat-bold",
        color: "black",
        marginBottom: 0,
        textAlign: 'center',
        paddingBottom: 10
    },
    contentContainerStyle: {
        paddingLeft: 30
    },
    showButton: {
        marginTop: 20,
        backgroundColor: "white",
        padding: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 4,
        shadowColor: "#000",
        shadowOffset: {
        width: 0,
        height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    showButtonText: {
        fontSize: 14,
        fontFamily: "montserrat-bold",
    }
});

function EntityAccomodationsContainer(props) {
    const navigation = useNavigation();
  
    return <EntityAccomodations 
      {...props}
      navigation={navigation}/>;
  }
  
  export default EntityAccomodationsContainer