import React, { Component } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, BackHandler, Platform, ScrollView, TouchableOpacityComponent, Image } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  AsyncOperationStatusIndicator, 
  ConnectedHeader, 
  ConnectedAuthHandler,
  CustomText
 } from "../../components";
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Layout from '../../constants/Layout';
import { greedyArrayFinder, getEntityInfo, getCoordinates, getSampleVideoIndex, getGalleryImages } from '../../helpers/utils';
import { apolloQuery } from '../../apollo/queries';
import actions from '../../actions';
import * as Constants from '../../constants';
import Colors from '../../constants/Colors';
import { LLEntitiesFlatlist } from "../../components/loadingLayouts";
import { FontAwesome5 } from '@expo/vector-icons';

/* Deferred rendering to speedup page inital load: 
   deferred rendering delays the rendering reducing the initial 
   number of components loaded when the page initially mounts.
   Other components are loaded right after the mount */
const USE_DR = false;
class PreferencesScreen extends Component {

  constructor(props) {
    super(props);

    /* Get props from navigation */
    //let { someNavProps } = props.route.params; 

    this.state = {
      render: USE_DR ? false : true,
      entities: new Array(5).fill(0),
      entityIndex: 0,
      selectedIconName: null,
      started: false,
      finished: false,
      selectedColors: []
    };
      
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * Use this function to perform data fetching
   * e.g. this.props.actions.getPois();
   */
  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    this._fetchEntities()
  }

  /**
   * Use this function to update state based on external props 
   * or to post-process data once it changes
   */
  componentDidUpdate(prevProps) {
    /**
     * Is the former props different from the newly propagated prop (redux)? perform some action
     * if(prevProps.xxx !== this.props.xxx)
     *  doStuff();
     */
  }

  /**
   * Use this function to unsubscribe or clear any event hooks
   */
  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  /**
   * If the reducer embeds a single data type then e.g. only pois:
   *    Data is stored in this.props.pois.data
   *    Success state is stored in this.props.pois.success
   *    Loading state is stored in this.props.pois.loading
   *    Error state is stored in this.props.pois.error
   * If the reducer embeds multiple data types then (e.g. search + autocomplete):
   *    Data is stored in this.props.searchAutocomplete.search
   *    Success state is stored in this.props.searchAutocomplete.searchSuccess
   *    Loading state is stored in this.props.searchAutocomplete.searchLoading
   *    Error state is stored in this.props.searchAutocomplete.searchError
   */
  _isSuccessData  = () => false;    /* e.g. this.props.pois.success; */
  _isLoadingData  = () => true;   /* e.g. this.props.pois.loading; */
  _isErrorData    = () => null;    /* e.g. this.props.pois.error; */


  _fetchEntities = async () => {
    try {
      const place1 = await apolloQuery(actions.getNodes({ type: Constants.NODE_TYPES.places, offset: Math.ceil(Math.random()*50), limit: 1}))
      const itinerary = await apolloQuery(actions.getNodes({ type: Constants.NODE_TYPES.itineraries, offset: 0, limit: 1}))
      const place2 = await apolloQuery(actions.getNodes({ type: Constants.NODE_TYPES.places, offset: Math.ceil(Math.random()*50), limit: 1}))
      const event = await apolloQuery(actions.getNodes({ type: Constants.NODE_TYPES.events, offset: Math.ceil(Math.random()*50), limit: 1}))
      const inspirer = await apolloQuery(actions.getNodes({ type: Constants.NODE_TYPES.inspirers, offset: 0, limit: 1}))
      const entities = [place1[0], itinerary[0], place2[0], event[0], inspirer[0]];
      console.log("entities", entities.length)
      this.setState({entities: entities})
    } catch(error){
      console.log(error)
    }
  }

  _selectActiveIcon = (iconName) => {
    this.setState({
      selectedIconName: iconName
    }, () => {
      const { entityIndex, selectedColors } = this.state;
      const color = Constants.EMOTICONS[iconName].color;
      const newColors = [...selectedColors, color];
      if(entityIndex < 5){
        let timeout = setTimeout(() => {
          const finished = (entityIndex + 1) < 5 ? false : true;
          this.setState({
            entityIndex: entityIndex + 1,
            selectedColors: newColors,
            selectedIconName: null,
            finished
          })
        }, 300)
      }
      else{
        this.setState({
          finished: true,
          selectedIconName: null
        })
      }
    })
  }

  /********************* Render methods go down here *********************/

  _renderIcon = (name, iconColor, clickable) => {
    const { selectedIconName } = this.state;
    const color = selectedIconName == name ? Constants.EMOTICONS[name].color : iconColor;
    return(
      <TouchableOpacity
        style={styles.iconButton}
        activeOpacity={clickable ? 0.7 : 1}
        onPress={clickable ? () => this._selectActiveIcon(name) : null}>
          <FontAwesome5 
            name={name}
            color={color}
            size={42}
            style={styles.icon}
          />
      </TouchableOpacity>
    )
  }

  _renderBottomSteps = () => {
    return(
      <View style={styles.bottomView}>
        <View style={styles.stepsView}>
          {this._renderSteps()}
        </View>
      </View>
    )
  }

  _renderSteps = () => {
    return this.state.entities.map( (entity, index) => {
      return this._renderStep(entity, index);
    })
  }

  _renderStep = (entity, index) => {
    const { entityIndex, selectedColors } = this.state;
    let backgroundColor = Colors.lightGray;
    if(entityIndex == index)
      backgroundColor = Colors.mediumGray;
    else if(selectedColors[index])
      backgroundColor = selectedColors[index]
    return(
      <View style={[styles.step, {
        backgroundColor: backgroundColor
      }]}/>
    )
  }

  _renderEntity = (entity) => {
    const { lan } = this.props.locale;
    const term = _.get(entity, ["nodes_terms", 0, "term","name"], "");
    const image = entity.image;
    // console.log("entity", entity)
    return(
      <View style={styles.entityView}>
        <Text style={styles.entityTerm}>{term}</Text>
        <Image
          PlaceholderContent={<ActivityIndicator color="black"/>}
          source={{ uri: image }}
          style={styles.entityImage}/>
      </View>
    )
  }

  _renderNotStartedContent = () => {
    const { preferencesText1, preferencesText2, start } = this.props.locale.messages;

    return(
      <>
        <View style={styles.firstView}>
          <Text style={styles.text1}>{preferencesText1}</Text>
          <Text style={styles.text2}>{preferencesText2}</Text>
        </View>
        <View style={styles.secondView}>
          <View style={styles.icons}>
            {this._renderIcon("dizzy", Colors.colorEventsScreen, false)}
            {this._renderIcon("meh", Colors.colorInspirersScreen, false)}
            {this._renderIcon("laugh-squint", Colors.colorPlacesScreen, false)}
            {this._renderIcon("grin-hearts", Colors.colorItinerariesScreen, false)}
          </View>
          <View style={styles.startButtonView}>
            <TouchableOpacity
              style={styles.startButton}
              activeOpacity={0.7}
              onPress={() => this.setState({started: true})}>
                <Text style={styles.startButtonText}>{start}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    )
  }

  _renderFinishedContent = () => {
    const { preferencesText3, thanks, back } = this.props.locale.messages;

    return(
      <>
        <View style={styles.firstView}>
          <Text style={styles.text1}>{thanks}</Text>
          <Text style={styles.text2}>{preferencesText3}</Text>
        </View>
        <View style={styles.secondView}>
          <View style={styles.icons}>
            {this._renderIcon("dizzy", Colors.colorEventsScreen, false)}
            {this._renderIcon("meh", Colors.colorInspirersScreen, false)}
            {this._renderIcon("laugh-squint", Colors.colorPlacesScreen, false)}
            {this._renderIcon("grin-hearts", Colors.colorItinerariesScreen, false)}
          </View>
          <View style={styles.startButtonView}>
            <TouchableOpacity
              style={styles.startButton}
              activeOpacity={0.7}
              onPress={() => this.setState({finished: false, started: false})}>
                <Text style={styles.startButtonText}>{back}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    )
  }

  _renderStartedContent = () => { 
    const { doYouLikeIt } = this.props.locale.messages;
    const { entityIndex, entities } = this.state;
    const entity = entities[entityIndex] || null;
    return(
      <>
        <View style={styles.startedContent}>
          <Text style={styles.startedContentText}>{doYouLikeIt}</Text>
          {entity && this._renderEntity(entity)}
          <View style={[styles.icons, {marginTop: 70, paddingHorizontal: 50}]}>
            {this._renderIcon("dizzy", Colors.lightGray, true)}
            {this._renderIcon("meh", Colors.lightGray, true)}
            {this._renderIcon("laugh-squint", Colors.lightGray, true)}
            {this._renderIcon("grin-hearts", Colors.lightGray, true)}
          </View>
        </View>
        {this._renderBottomSteps()}
      </>
    )
  }

  _renderContent = () => {
      const { started, finished } = this.state;
      const { preferences } = this.props.locale.messages;
      return (
        <View style={styles.fill}>
          <Text style={styles.title}>{preferences}</Text>
          {!started && this._renderNotStartedContent()}
          {started && !finished && this._renderStartedContent()}
          {finished && this._renderFinishedContent()}
        </View>
      )
  }


  render() {
    const { render } = this.state;
    return (
      <View style={[styles.fill, {paddingTop: Layout.statusbarHeight}]}>
        <ConnectedHeader />
        <ConnectedAuthHandler loginOptional={false} />
        {render && this._renderContent()}
      </View>
    )
  }
  
}


PreferencesScreen.navigationOptions = {
  title: 'Boilerplate',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  header: {
    backgroundColor: "white"
  },
  container: {
    padding: 10,
  },
  title: {
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
    color: "#000000E6",
    backgroundColor: "#F2F2F2",
    height: 40,
    fontSize: 15,
    fontFamily: "montserrat-bold",
    textTransform: "uppercase"
  },
  firstView: {
    flex: 1,
    paddingTop: 153,
    paddingHorizontal: 55,
    paddingBottom: 0
  },
  secondView: {
    flex: 1,
    paddingHorizontal: 55,
  },
  icons: {
    flexDirection: "row",
    justifyContent: "space-between"
  },  
  text1: {
    fontSize: 20,
    fontFamily: "montserrat-bold",
    color: "black",
    textAlign: "center"
  },
  text2: {
    fontSize: 20,
    color: "black",
    textAlign: "center",
  },
  icon: {

  },
  iconButton: {
    width: 42,
    height: 42
  },
  startButtonView: {
    width: "100%",
    alignItems: "center",
    marginTop: 63
  },
  startButton: {
    width: 203,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    borderRadius: 4
  },
  startButtonText: {
    color: "white",
    textTransform: "uppercase",
    fontFamily: "montserrat-bold",
    fontSize: 14
  },
  startedContent: {
    paddingHorizontal: 15,
    flex: 1,
    paddingTop: 100
  },
  startedContentText: {
    fontSize: 15,
    fontFamily: "montserrat-bold",
    color: "black",
    textAlign: "center"
  },
  bottomView: {
    position: "absolute",
    bottom: 32,
    left: 0,
    width: "100%",
    height: 8,
    paddingHorizontal: 15
  },
  stepsView: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  step: {
    width: 61,
    height: 8
  },
  entityImage: {
    flex: 1,
    resizeMode: "cover",
    backgroundColor: "white",
    width: "100%",
    minHeight: 160,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.lightGray
  },
  entityTerm: {
    textAlign: "center",
    fontSize: 20,
    fontFamily: "montserrat-bold",
    marginTop: 32
  },
  entityView: {
    width: "100%",
    height: 160,
    marginBottom: 73
  }
});


function PreferencesScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <PreferencesScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store} />;
}


const mapStateToProps = state => {
  return {
    restState: state.restState,
    //mixed state
    others: state.othersState,
    //language
    locale: state.localeState,
    //favourites
    favourites: state.favouritesState,
    //graphql
    categories: state.categoriesState,
    events: state.eventsState,
    inspirers: state.inspirersState,
    itineraries: state.itinerariesState,
    nodes: state.nodesState,
    pois: state.poisState,
    searchAutocomplete: state.searchAutocompleteState,
  };
};


const mapDispatchToProps = dispatch => {
  return {...bindActionCreators({ ...actions }, dispatch)};
};


export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(PreferencesScreenContainer)