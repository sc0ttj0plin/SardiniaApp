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
      animatedStepWidth: 0
    };
   
    this._imagesLoaded = [];
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
        source: step.image
      }
      images.push(image);
    })
    this.setState({images}, () => {
      console.log("enter here ahaahh")
      // Animated.timing(this._animatedStepWidth , {
      //   toValue: 100,
      //   duration: 20
      // });
      this._startStepAnimation();
    })
  }

  _startStepAnimation = () => {
    const duration = 3000;
    const time = duration / 100;
    clearInterval(this._stepInterval);
    this.setState({
      animatedStepWidth: 0
    }, () => {
      this._stepInterval = setInterval( () => {
        // this._animatedStepWidth++;
        if(this.state.animatedStepWidth < 100){
          this.setState({
          animatedStepWidth: this.state.animatedStepWidth + 1
          })
        }
        else{
          clearInterval(this._stepInterval);
          if(this.state.stepIndex < (this.state.steps.length - 1)){
            console.log("step index", this.state.stepIndex)
            this.setState({
              stepIndex: this.state.stepIndex + 1,
              animatedStepWidth: 0
            }, () => {
              this._startStepAnimation();
            })
          }
        }
      }, time)
    })
  }

  _onFinished = () => {
    this.props.navigation.goBack();
  }

  _onPageChange = (page) => {
    if(this.state.stepIndex !== page)
      this._startStepAnimation();
      
    this.setState({
        stepIndex: page,
        loaded: this._imagesLoaded[page] == true
    })
  }

  _skipTutorial = () => {

  }

  /********************* Render methods go down here *********************/

  _renderGalleryView = () => {
    const { skip } = this.props.locale.messages;
    const { images, steps, stepIndex, initialPage, loaded } = this.state
    const image = steps[stepIndex];
    const title = image.title;
    const description = image.description;

    return (
      <View style={[styles.fill]}>
        <View style={[styles.fill, {position: "relative"}]}>
          <Gallery
              ref={(ref) => {this._refs["gallery"] = ref}}
              style={styles.gallery}
              images={images}
              initialPage={0}
              resizeMode="contain"
              useNativeDriver={true}
              onPageSelected={this._onPageChange}
              onLoad = {this._onImageLoad}
              initialNumToRender = {images.length}>
          </Gallery>
          {!loaded && 
            <View pointerEvents="none" 
              style={[styles.loadingDotsView1, {backgroundColor: "rgba(0,0,0,0.7)"}]}>
              <View style={[styles.loadingDotsView2]}>
                <LoadingDots isLoading={true}/>
              </View>
            </View>
          }
        </View>
        <CustomText style={styles.entityTitle}>{title}</CustomText>
        <CustomText style={styles.entityDescription}>{description}</CustomText>
        <View style={styles.skipBtnContainer}>
          <TouchableOpacity activeOpacity={0.7} style={[styles.skipBtn]} onPress={this._skipTutorial}>
            <CustomText style={[styles.skipBtnText]}>{skip}</CustomText>
          </TouchableOpacity>

        </View>
      </View>
    );
  }


  _renderStepsBar = () => {
    return(
      <View style={styles.stepsView}>
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
            backgroundColor: Colors.mediumGray,
            width: `${this.state.animatedStepWidth}%`
          }}>
          </Animated.View>
        }
      </View>
    )
  }

  // _renderEntity = (entity) => {
  //   const { lan } = this.props.locale;
  //   const title = entity.title;
  //   const image = entity.image;
  //   // console.log("entity", entity)
  //   return(
  //     <View style={styles.entityView}>
  //       <CustomText style={styles.entityTerm}>{title}</CustomText>
  //       <Image
  //         PlaceholderContent={<ActivityIndicator color="black"/>}
  //         source={{ uri: image }}
  //         style={styles.entityImage}/>
  //     </View>
  //   )
  // }

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
      const { started, finished } = this.state;
      const { tutorial } = this.props.locale.messages;
      return (
        <View style={styles.fill}>
          <CustomText style={styles.title}>{tutorial}</CustomText>
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
        {render && this._renderContent()}
      </View>
    )
  }
  
}


TutorialScreen.navigationOptions = {
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
    fontSize: 15,
    fontFamily: "montserrat-bold",
    textTransform: "uppercase",
    marginBottom: 20
  },
  gallery: { 
    flex: 1, 
    backgroundColor: Colors.lightGray 
  },
  loadingDotsView1: {
    position: "absolute",
    width: '100%',
    height: '100%',
    alignItems: "center",
    justifyContent: "center"
  },
  loadingDotsView2: {
    width: 100
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
    marginHorizontal: 15,
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
    marginBottom: 20
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
    marginBottom: 6.5,
    textAlign: "center"
  },
  skipBtn: {
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    display: "flex",
    paddingHorizontal: 27,
    paddingVertical: 9,
    marginBottom: 26.5,
    borderColor: "#F2F2F2",
    borderWidth: 2
  },
  skipBtnText: {
    color: Colors.mediumGray,
    fontFamily: "montserrat-bold",
    textAlign: "center",
    textTransform: "uppercase"
  },
  skipBtnContainer: {
    flexDirection: "row",
    justifyContent: "center"
  }
});


function TutorialScreenContainer(props) {
  const navigation = useNavigation();
  const route = useRoute();
  const store = useStore();

  return <TutorialScreen 
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
})(TutorialScreenContainer)