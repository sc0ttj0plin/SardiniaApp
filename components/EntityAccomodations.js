import React, { PureComponent } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import _ from 'lodash';
import { FlatList } from "react-native-gesture-handler"
import LLEntitiesFlatlist from "./loadingLayouts/LLEntitiesFlatlist"
import AccomodationItem from './AccomodationItem';
import AsyncOperationStatusIndicator from "./AsyncOperationStatusIndicator"
 
export default class EntityAccomodations extends PureComponent {

    constructor(props){
        super(props)

        this.state = {
            // data: props.data ? props.data : [],
            data: [
                {
                    term: "categoria 1",
                    title: "titolo 1",
                    stars: 1,
                    distance: 2,
                    location: "città"
                },
                {
                    term: "categoria 2",
                    title: "titolo 2",
                    stars: 2,
                    distance: 3,
                    location: "città"
                },
                {
                    term: "categoria 3",
                    title: "titolo 3",
                    stars: 3,
                    distance: 4,
                    location: "città"
                },
                {
                    term: "categoria 4",
                    title: "titolo 4",
                    stars: 4,
                    distance: 5,
                    location: "città"
                },
                {
                    term: "categoria 5",
                    title: "titolo 5",
                    stars: 5,
                    distance: 6,
                    location: "città"
                }
            ]
        }
    }
    
    _renderAccomodationItem = (item) => {
        return (
            <AccomodationItem 
                title={item.title}
                term={item.term}
                stars={item.stars}
                location={item.location}
                distance={item.distance}/>
        )
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
                            renderItem={({item, index}) => this._renderAccomodationItem(item, index)}
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

                <TouchableOpacity style={styles.showButton} activeOpacity={0.8}>
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