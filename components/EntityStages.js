import React, {PureComponent} from 'react';
import { View, StyleSheet, Text, Platform, Linking, TouchableOpacity, FlatList } from 'react-native';
import * as Constants from '../constants';
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import Layout from '../constants/Layout';
// import { TouchableOpacity } from 'react-native-gesture-handler';

export default class EntityStages extends PureComponent {  
  
  constructor(props) {
    super(props);
    this.state = {
      stages: [
        {
          title: "tappa1",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          src: ""
        },
        {
          title: "tappa2",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          src: ""
        },
        {
          title: "tappa3",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          src: ""
        }
      ],
      eventStages: [
        {
          title: "tappa1",
          src: "",
          location: "Cagliari",
          date: "30 e 31 novembre"
        },
        {
          title: "tappa2",
          src: "",
          location: "Cagliari",
          date: "30 e 31 novembre"
        },
        {
          title: "tappa3",
          src: "",
          location: "Cagliari",
          date: "30 e 31 novembre"
        }
      ]
    };
  }

  _renderEventStage = (item, index) => {
    return(
      <View style={styles.eventStageView}>
        { index != 0 &&
          <View style={styles.stageVerticalLine}></View>
        }
        <View style={styles.eventStageNumberView}>
          <Text style={styles.eventStageNumber}>{index + 1}</Text>
        </View>
        <Text style={styles.eventStageLocation}>{item.location}</Text>
        <Text style={styles.eventStageDate}>{item.date}</Text>
      </View>
    )
  }

  _renderEventStages = () => {
    return(
      <View style={styles.eventStagesView}>
        <Text style={styles.eventStagesTitle}>Le tappe</Text>
        <FlatList 
          key={"itinerary-stages"}
          keyExtractor={item => item.name}
          data={this.state.eventStages}
          renderItem={({item, index}) => this._renderEventStage(item, index)}
          style={styles.eventContainer}
          contentContainerStyle={styles.eventContentContainer}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={2} // Reduce initial render amount
          updateCellsBatchingPeriod={400} // Increase time between renders
          windowSize={10} // Reduce the window size
        />
      </View>
    )
  }

  _renderItineraryStage = (stage, index) => {
    const { title, description } = stage
    return(
      <View style={styles.itemContainer}>
        <View style={styles.topLine}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.index}>{index + 1}</Text>
        </View>
        <View style={styles.imageCircle}></View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{description}</Text>
        </View>
        <View style={styles.bottomView}>
          <TouchableOpacity
            style={styles.bottomButton}
            activeOpacity={0.7}>
              <Text style={styles.bottomButtonText}>ESPLORA</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  _renderItineraryStages = () => {
    return(
      <FlatList 
        key={"itinerary-stages"}
        keyExtractor={item => item.name}
        data={this.state.stages}
        renderItem={({item, index}) => this._renderItineraryStage(item, index)}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsHorizontalScrollIndicator={false}
        initialNumToRender={2} // Reduce initial render amount
        updateCellsBatchingPeriod={400} // Increase time between renders
        windowSize={10} // Reduce the window size
      />
    )
  }
  _renderContent = () => {
    const { type } = this.props;
    if(type == "itinerary")
      return this._renderItineraryStages()
    else
      return this._renderEventStages();
  }
  
  render() {
    return (
      <>
        {this._renderContent()}
      </>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    position: "relative"
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  contentContainer: {
    paddingTop: 10,
    marginBottom: 20
  },
  itemContainer: {
    paddingTop: 30,
    // minHeight: 191,
    width: "100%",
    position: "relative",
    backgroundColor: "white",
    marginBottom: 5
  },
  topLine: {
    height: 36,
    backgroundColor: "#5D7F20",
    paddingLeft: 70,
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  title: {
    color: "white",
    fontSize: 15,
    textTransform: "capitalize"
  },
  index: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
    flex: 1,
    textAlign: "right",
    paddingRight: 30
  },
  descriptionContainer: {
    paddingLeft: 70,
    paddingTop: 21,
    paddingRight: 15
  },
  description: {
    fontSize: 12,
    fontWeight: "normal"
  },
  imageCircle: {
    width: 51,
    height: 51,
    borderRadius: 50,
    position: "absolute",
    top: 23,
    left: 10,
    backgroundColor: "grey",
  },
  bottomView: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    height: 36,
    paddingRight: 15,
    paddingTop: 15
  },
  bottomButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#5D7F20"
  },
  eventStagesView: {
    paddingVertical: 50,
    backgroundColor: "#F2F2F2",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 40
  },
  eventStagesTitle: {
    fontSize: 19,
    color: "#D9531E",
    fontWeight: "bold",
    marginBottom: 16
  },
  eventStageView: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  stageVerticalLine: {
    width: 2,
    height: 32,
    backgroundColor: "#666666",
    marginVertical: 8.5
  },
  eventStageNumberView: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D9531E",
    width: 38,
    height: 38,
    borderRadius: 50,
    marginBottom: 8
  },
  eventStageNumber: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold"
  },
  eventStageLocation: {
    fontSize: 17,
    fontWeight: "bold"
  },
  eventStageDate: {
    fontSize: 16,
  }
});