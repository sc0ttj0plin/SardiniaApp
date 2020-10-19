import React, {PureComponent} from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Image } from 'react-native-elements';
import { useNavigation, useRoute } from '@react-navigation/native';

class TopMedia extends PureComponent {  
  
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    
  }

  _renderVideoPlayer = () => {
    const { urlVideo } = this.props;
    return (
      <View style={[styles.fill, styles.videoPlayerView]}>
        <TouchableOpacity
          style={styles.playButton}
          activeOpacity={0.7}
          onPress={ () => this.props.navigation.navigate("VideoScreen", { source: urlVideo })}>
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
        <ImageBackground style={[styles.image, styles.imageBackground]}
          source={{uri: urlImage}}
        >
          { this.props.urlVideo &&
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
  image: {
    maxHeight: 200,
    height: 200,
    resizeMode: "cover"
  },
  imageBackground: {
    backgroundColor: "#aaaaaa",
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
    maxHeight: 200 - 20,
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