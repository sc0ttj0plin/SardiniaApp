import React, {PureComponent} from 'react';
import { View, StyleSheet, Text, Platform, Linking, TouchableOpacity, FlatList, Image } from 'react-native';
import * as Constants from '../constants';
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import Layout from '../constants/Layout';
import { useNavigation } from '@react-navigation/native';
// import { TouchableOpacity } from 'react-native-gesture-handler';

class EntityStages extends PureComponent {  
  
  constructor(props) {
    super(props);
    this.state = {
      stages: props.stages || []
    };
  }

  componentDidUpdate(prevProps){
    if(prevProps.stages !== this.props.stages){
      this.setState({stages: this.props.stages})
    }
  }

  _openPoi = (uuid) => {
    // console.log("uuid poi", uuid)
    this.props.navigation.push(Constants.NAVIGATION.NavPlaceScreen, { item: {uuid} });
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
    const { title, body } = stage
    const { uuid } = stage.poi || null;
    // console.log("stage", stage)
    return(
      <View style={styles.itemContainer}>
        <View style={styles.topLine}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.index}>{index + 1}</Text>
        </View>
        <View style={styles.imageCircle}>
          <Image style={{flex: 1, borderRadius: 50}} source={{ uri: stage.poi.image }}/>
        </View>
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{body}</Text>
        </View>
        <View style={styles.bottomView}>
          <TouchableOpacity
            style={styles.bottomButton}
            activeOpacity={0.7} onPress={() => this._openPoi(uuid)}>
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
        keyExtractor={item => item.poi.nid}
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
    alignItems: "center",
    paddingVertical: 20
  },
  title: {
    color: "white",
    fontSize: 13,
    textTransform: "capitalize",
    paddingVertical: Platform.OS === "ios" ? 0 : 5,
    flex: 4
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
    paddingRight: 30
  },
  description: {
    fontSize: 12,
    fontWeight: "normal",
    textAlign: "justify"
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
    marginBottom: 40,
    marginTop: 20
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
    alignItems: "center",
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
  },
  bottomButton: {
    backgroundColor: "transparent",
    width: 70,
    height: 25,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end"
  },
  eventContainer: {
  }
});


function EntityStagesContainer(props) {
  const navigation = useNavigation();

  return <EntityStages 
    {...props}
    navigation={navigation}/>;
}

export default EntityStagesContainer