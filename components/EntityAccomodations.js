import React, { PureComponent } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import _ from 'lodash';
import { useNavigation } from '@react-navigation/native';
import { FlatList } from "react-native-gesture-handler"
import LLEntitiesFlatlist from "./loadingLayouts/LLEntitiesFlatlist"
import AccomodationItem from './AccomodationItem';
import AsyncOperationStatusIndicator from "./AsyncOperationStatusIndicator"
import * as Constants from "../constants"

class EntityAccomodations extends PureComponent {

    constructor(props){
        super(props)

        this.state = {
            // data: props.data ? props.data : [],
            data: props.data || Constants.ACCOMODATIONS_DATA_DEFAULT
        }
    }
    
    _renderAccomodationItem = (item, index, horizontal) => {
        return (
            <>
            <AccomodationItem 
                horizontal={horizontal}
                title={item.title}
                term={item.term}
                stars={item.stars}
                location={item.location}
                hideBorder
                distance={item.distance}/>
            <View style={{width: 5, flex: 1}}></View>
            
            </>
        )
    }

    _renderHorizontalSeparator = () => {
        return (
          <View style={{width: 5, flex: 1}}></View>
        )
    }

    _openMap = () => {
        this.props.navigation.navigate(Constants.NAVIGATION.NavAccomodationsScreen)
    }

    render() {
        const { listTitle } = this.props; 
        return (
            <View style={[styles.fill, styles.mainView]}>
                <Text style={styles.title}>Strutture ricettive nelle vicinanze</Text>
                <AsyncOperationStatusIndicator
                    loading={true}
                    success={this.state.data && this.state.data.length > 0}
                    error={false}
                    loadingLayout={<LLEntitiesFlatlist horizontal={true} style={styles.contentContainerStyle} title={listTitle} titleStyle={this.props.listTitleStyle} error={false}/>}>
                    <View style={{flex: 1}}>   
                        <Text style={{...this.props.listTitleStyle}}>{listTitle}</Text>
                        <FlatList 
                            horizontal={this.props.horizontal ? this.props.horizontal : false}
                            key={listTitle + "-1"}
                            extraData={this.props.extraData}
                            keyExtractor={item => item.title}
                            data={this.state.data}
                            renderItem={({item, index}) => this._renderAccomodationItem(item, index, true)}
                            style={[styles.fill, {}]}
                            // ItemSeparatorComponent={this.props.ItemSeparatorComponent || this._renderHorizontalSeparator}
                            // contentContainerStyle={this.props.contentContainerStyle ? this.props.contentContainerStyle : {}}
                            contentContainerStyle={{paddingLeft: 10}}
                            showsHorizontalScrollIndicator={this.props.showsHorizontalScrollIndicator ? this.props.showsHorizontalScrollIndicator : true}
                            initialNumToRender={2} // Reduce initial render amount
                            updateCellsBatchingPeriod={400} // Increase time between renders
                            windowSize={10} // Reduce the window size
                        />
                    </View>
                </AsyncOperationStatusIndicator>

                <TouchableOpacity style={styles.showButton} activeOpacity={0.8} onPress={this._openMap}>
                    <Text style={styles.showButtonText}>VEDI LA MAPPA</Text>
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
        paddingBottom: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "rgba(31, 203, 217, 0.3)",
        marginTop: 32,
    },
    title: {
        fontSize: 15,
        fontWeight: "bold",
        color: "black",
        marginBottom: 32
    },
    contentContainerStyle: {
        paddingLeft: 30
    },
    showButton: {
        marginTop: 32,
        backgroundColor: "white",
        width: 144,
        height: 36,
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
        fontWeight: "bold"
    }
});

function EntityAccomodationsContainer(props) {
    const navigation = useNavigation();
  
    return <EntityAccomodations 
      {...props}
      navigation={navigation}/>;
  }
  
  export default EntityAccomodationsContainer