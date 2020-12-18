import React, {PureComponent} from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Image } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';
import ShimmerWrapper from "./ShimmerWrapper"
import * as Constants from "../constants"
class TopMedia extends PureComponent {  
  
  constructor(props) {
    super(props);
    this.state = {
      loadedImage: false
    };
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    this.state = {
      loadedImage: false
    };
  }

  _renderVideoPlayer = () => {
    const { urlVideo } = this.props;
    return (
      <View style={[styles.fill, styles.videoPlayerView]}>
        <TouchableOpacity
          style={styles.playButton}
          activeOpacity={0.7}
          onPress={ () => this.props.navigation.navigate(Constants.NAVIGATION.NavMediaScreen, { source: urlVideo, type: "video" })}>
            <ImageBackground source={require("../assets/icons/play_bg.png")} style={styles.backgroundPlayImage}>
              <Image 
                source={require("../assets/icons/play.png")} style={styles.playImage}>  
              </Image>
            </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  }


  
  render() {
    const { urlImage } = this.props;
    return (
      <View style={{
        position: "relative"
      }}>
        <ShimmerWrapper shimmerStyle={styles.shimmer} />
        <ImageBackground style={[styles.image, styles.imageBackground]}
          source={{uri: urlImage}}
          onLoad={() => setTimeout(() => {this.setState({loadedImage: true})}, 5000)}
        >
          { this.props.urlVideo != "" && this.props.urlVideo&&
            this._renderVideoPlayer()
          }
        </ImageBackground>
        
      </View>
    );
  }
} 

const styles = StyleSheet.create({
  fill: {
    flex: 1
  },
  shimmer: {
    position: "absolute",
    maxHeight: 300,
    height: 300,
    width: "100%",
  },
  image: {
    maxHeight: 300,
    height: 300,
    resizeMode: "cover"
  },
  imageBackground: {
    backgroundColor: "transparent",
    alignItems: "flex-start"
  },
  playImage: {
    width: 28,
    height: 32,
  },
  backgroundPlayImage: {
    width: 84,
    height: 84,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 7
  },
  playButton: {
    width: 84,
    height: 84,
    backgroundColor: "transparent",
    padding: 10,
    zIndex: 99,
    justifyContent: "center",
    alignItems: "center"
  },
  videoPlayerView: {
    width: "100%",
    maxHeight: 300 - 20,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center"}
});


export default (props) => {
  const navigation = useNavigation();
  const route = useRoute();

  return <TopMedia
    {...props}
    navigation={navigation}
    route={route}/>;
}