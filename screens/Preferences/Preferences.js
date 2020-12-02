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


// 36 e86a70a8-38b8-43b2-bc64-98f3905e3d7d Natura
// 36 1df810c0-60ad-4d8d-b30c-a652713e3264 Mare
// 36 2c217b84-6ab6-4702-a88b-c560970f1d3d Archeologia e Arte
// 36 fa9a383b-5cb5-4944-9807-b96bec3dc113 Isole nell'isola
// 36 6e49ab39-1e7f-4695-b14c-cbcf00648c25 Città e Borghi
//    36 844ac546-4da8-406a-8258-8e5b96fc6f7f Musei e murales
//    36 db9db33b-df26-41b2-8a86-ceaf7c4e313e Architetture
//    36 1b3f8171-db41-4811-a824-3d9eb622e40a Archeologie
//    36 1a8de1f9-c101-406c-87c6-8561f52a3565 Miniere
//    36 c0d13b56-3bba-4e30-a4a4-8b85e922d9ae I borghi
//    36 0bd1e5a1-6bab-441e-9f65-28b82c8b42fb Le città
//    36 69d9bfcb-45ba-4d4d-99c2-822d8fad79ac Piccoli, grandi centri
//    36 3e8150dd-23b0-4e3a-9d9e-b31b52c503e7 Parchi e foreste
//    36 562b96e5-06f1-4ffa-ac3a-4043dec801da Aree protette
//    36 4e06d437-5a59-4bf9-a661-fc2262379b5c Fiumi, laghi e zone umide
//    36 11d7b6d8-23d4-44d4-bc02-73f55882c528 Alture, canyon e grotte
//    36 318cf9f1-2835-4307-b523-41fa780ecf40 Calette e Scogliere
//    36 93cb5320-a3b3-40a7-877e-f296a6e2381f Spiagge
//    36 94955bfb-af7b-4a62-b459-90864873bb02 I porti turistici
// 46 840bf9a4-f509-4774-9c93-6e1491604cfc Artigianato
// 46 1d6b513f-9c32-48c2-b8ea-5cfeda3cba25 Momenti Speciali
// 46 de89eb41-7597-45c1-a102-a5815ed459f3 Benessere
// 46 76c3cba9-dc17-45b4-bca5-e4b8fb33bec5 Attività all'aperto
// 46 306409ed-11ed-44d0-9376-697e051e5dd4 Tradizione e Gusto

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
      selectedColors: [],
      //categories parsed [{ name, image, uuid }]
      [Constants.VIDS.poisCategories]: [],
      [Constants.VIDS.inspirersCategories]: [],
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
    const { poisCategories, inspirersCategories } = Constants.VIDS;
    if (!this.props.categories.data[poisCategories])
      this.props.actions.getCategories({ vid: poisCategories });
    else 
      this._parseCategories(poisCategories);
    if (!this.props.categories.data[inspirersCategories])
      this.props.actions.getCategories({ vid: inspirersCategories });
    else
      this._parseCategories(inspirersCategories);
  }

  /**
   * Use this function to update state based on external props 
   * or to post-process data once it changes
   */
  componentDidUpdate(prevProps) {
    const { poisCategories, inspirersCategories } = Constants.VIDS;
    if(prevProps.categories.data[poisCategories] !== this.props.categories.data[poisCategories])
      this._parseCategories(poisCategories)
    if(prevProps.categories.data[inspirersCategories] !== this.props.categories.data[inspirersCategories])
      this._parseCategories(inspirersCategories)
  }

  /**
   * Use this function to unsubscribe or clear any event hooks
   */
  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  /**
   * Parses categories returning a simplified array of [{name, uuid, image}]
   */
  _parseCategories = (vid) => {
    this.setState({ [vid]: this.props.categories.data[vid].map(el => ({
      name: el.name,
      image: el.image,
      uuid: el.uuid,
    }))});
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

  _onFinished = () => {
    this.props.navigation.goBack();
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
        <CustomText style={styles.entityTerm}>{term}</CustomText>
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
          <CustomText style={styles.text1}>{preferencesText1}</CustomText>
          <CustomText style={styles.text2}>{preferencesText2}</CustomText>
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
                <CustomText style={styles.startButtonText}>{start}</CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </>
    )
  }

  _renderFinishedContent = () => {
    const { preferencesText3, thanks, okDoneSurvey } = this.props.locale.messages;

    return(
      <>
        <View style={styles.firstView}>
          <CustomText style={styles.text1}>{thanks}</CustomText>
          <CustomText style={styles.text2}>{preferencesText3}</CustomText>
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
              onPress={this._onFinished}>
                <CustomText style={styles.startButtonText}>{okDoneSurvey}</CustomText>
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
          <CustomText style={styles.startedContentText}>{doYouLikeIt}</CustomText>
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
          <CustomText style={styles.title}>{preferences}</CustomText>
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
    paddingTop: 50,
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
    paddingTop: 50
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
    //language
    locale: state.localeState,
    //graphql
    categories: state.categoriesState,
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