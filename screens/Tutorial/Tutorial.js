import React, { Component } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, TouchableOpacity, 
  StyleSheet, Animated } from "react-native";
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
import LoadingDots from "../../components/LoadingDots";
import { FontAwesome5 } from '@expo/vector-icons';
import tutorialSteps from "../../config/tutorial";
import Gallery from 'react-native-gallery-swiper-loader';
import { useSafeArea } from 'react-native-safe-area-context';
import HTML from 'react-native-render-html';

const USE_DR = false;
class TutorialScreen extends Component {

  constructor(props) {
    super(props);

    /* Get props from navigation */
    //let { someNavProps } = props.route.params; 
    this._refs = {};

    this.state = {
      render: USE_DR ? false : true,
      steps: tutorialSteps,
      stepIndex: 0,
      images: [],
      started: true,
      finished: false,
    };
   
    this._stepInterval = 0;
  }

  /********************* React.[Component|PureComponent] methods go down here *********************/

  /**
   * Use this function to perform data fetching
   * e.g. this.props.actions.getPois();
   */
  componentDidMount() {
    //Deferred rendering to make the page load faster and render right after
    {(USE_DR && setTimeout(() => (this.setState({ render: true })), 0))};
    this._parseSteps();
  }

  /**
   * Use this function to update state based on external props 
   * or to post-process data once it changes
   */
  componentDidUpdate(prevProps) {

  }

  /**
   * Use this function to unsubscribe or clear any event hooks
   */
  componentWillUnmount() {
  }

  /********************* Non React.[Component|PureComponent] methods go down here *********************/

  _parseSteps = () => {
    const {steps} = this.state;
    let images = [];
    steps.map( step => {
      let image = {
        source: step.image,
        dimensions: { width: 1080, height: 1920 }
      }
      images.push(image);
    })
    this.setState({images}, () => {
    })
  }

  _onFinished = () => {
    this.props.navigation.goBack();
  }

  _onPageChange = (page) => {
    if(this.state.stepIndex !== page){

    }
    this.setState({
        stepIndex: page,
    })

  }

  _skipTutorial = () => {

  }

  /********************* Render methods go down here *********************/

  _renderGalleryView = () => {
    const { images, steps, stepIndex, initialPage } = this.state
    const image = steps[stepIndex];
    const description = image.description;

    return (
      <View style={[styles.fill]}>
        <View style={[styles.fill, {position: "relative"}]}>
          <Gallery
              ref={(ref) => {this._refs["gallery"] = ref}}
              style={styles.gallery}
              images={images}
              initialPage={stepIndex}
              resizeMode="contain"
              useNativeDriver={true}
              onPageSelected={this._onPageChange}
              enableScale={false}
              enableTranslate={false}
              initialNumToRender = {images.length}
              flatListProps={{
                showsVerticalScrollIndicator: false,
                showsHorizontalScrollIndicator: false
              }}>
          </Gallery>
        </View>
        <HTML containerStyle={styles.entityDescription} html={"<font style=\"" + Constants.styles.html.longTextCenter + "\">" + description + "</font>"} />
      </View>
    );
  }


  _renderStepsBar = () => {
    return(
      <View style={[styles.stepsView, {marginBottom: Math.max(this.props.insets.bottom, 10)}]}>
        {this._renderSteps()}
      </View>
    )
  }

  _renderSteps = () => {
    const { steps } = this.state;

    return steps.map( (entity, index) => {
      // console.log("entity", index, entity)
      return this._renderStep(entity, index);
    })
  }

  _renderStep = (entity, index) => {
    const { stepIndex, steps } = this.state;
    let backgroundColor = Colors.lightGray;
    if(index < stepIndex)
      backgroundColor = Colors.mediumGray;

    // console.log("step index", stepIndex, index)
    return(
      <View style={{position: "relative"}}>
        <View style={[styles.step, {
          backgroundColor: backgroundColor,
          width: (Layout.window.width - 30 - 30) / steps.length
        }]}/>
        {stepIndex == index && 
          <Animated.View style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            backgroundColor: Colors.colorInspirersScreen,
            width: "100%",
          }}>
          </Animated.View>
        }
      </View>
    )
  }

  _renderNotStartedContent = () => {
    const { tutorialText1, tutorialText2, start } = this.props.locale.messages;

    return(
      <>
        <View style={styles.firstView}>
          <CustomText style={styles.text1}>{tutorialText1}</CustomText>
          <CustomText style={styles.text2}>{tutorialText2}</CustomText>
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
      </>
    )
  }

  _renderStartedContent = () => { 

    return(
      <>
        <View style={styles.startedContent}>
          {this._renderGalleryView()}
          {this._renderStepsBar()}
        </View>
      </>
    )
  }

  _renderContent = () => {
      const { started, finished, steps, stepIndex } = this.state;
      const image = steps[stepIndex];
      const title = image.title;
      const { tutorial } = this.props.locale.messages;
      return (
        <View style={styles.fill}>
          <CustomText style={styles.title}>{title}</CustomText>
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
        <ConnectedHeader/>
        {render && this._renderContent()}
      </View>
    )
  }
  
}


TutorialScreen.navigationOptions = {
  title: 'TutorialScreen',
};


const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: "white"
  },
  header: {
    backgroundColor: "white"
  },
  title: {
    textAlign: "center",
    paddingTop: 10,
    paddingBottom: 10,
    color: "#000000E6",
    backgroundColor: "#F2F2F2",
    fontSize: 15,
    fontFamily: "montserrat-bold",
    textTransform: "uppercase",
  },
  gallery: { 
    flex: 1
  },
  firstView: {
    flex: 1,
    paddingHorizontal: 55,
    flexDirection: "column",
    justifyContent: "space-around"
  },
  secondView: {
    flex: 1,
    paddingHorizontal: 55,
    flexDirection: "column",
    justifyContent: "space-around"
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
  },
  startButton: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    borderRadius: 4
  },
  startButtonText: {
    color: "white",
    textTransform: "uppercase",
    fontFamily: "montserrat-bold",
    fontSize: 14,
    textAlign: "center"
  },
  startedContent: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around"
  },
  startedContentText: {
    fontSize: 15,
    fontFamily: "montserrat-bold",
    color: "black",
    textAlign: "center",
  },
  stepsView: {
    maxHeight: 8,
    width: "100%",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 15
  },
  step: {
    width: "8%",
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
  },
  entityView: {
    width: "100%",
    height: 160,
  },
  entityTitle: {
    fontFamily: "montserrat-bold",
    textAlign: "center",
    marginTop: 52,
    fontSize: 20,
    textTransform: "uppercase",
    marginBottom: 8
  },
  entityDescription: {
    fontSize: 15,
    padding: 15,
    textAlign: "center"
  },
});


function TutorialScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();
  const insets = useSafeArea();

  return <TutorialScreen 
    {...props}
    navigation={navigation}
    route={route}
    store={store}
    insets={insets} />;
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
})(TutorialScreenContainer)