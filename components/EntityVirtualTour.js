import React, {PureComponent} from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import Colors from '../constants/Colors';
import { Fontisto } from '@expo/vector-icons';

export default class EntityHeader extends PureComponent {  
  
  constructor(props) {
    super(props);
    this.state = {
      rotation: props.rotation
    };
  }

  componentDidUpdate(prevProps){
    if(prevProps.rotation !== this.props.rotation)
      this.state.rotation = this.props.rotation
  }
  render() {
    const { link } = this.props;

    return (
      <>
        {/* { link &&( */}
          <TouchableOpacity style={styles.virtualLink} activeOpacity={0.8}>
            <Animated.View style={{
              transform: [{rotate: this.state.rotation}]
            }}>
              <Fontisto name="unity" size={50} color="white" />
            </Animated.View>
            <Text style={styles.text}>Apri modello 3D</Text>
          </TouchableOpacity>
        
      </>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1
  },
  virtualLink: {
    flex: 1, 
    height: 200, 
    marginTop: 20, 
    marginBottom: 10, 
    backgroundColor: Colors.black, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  text: {
    color: "white",
    marginTop: 10,
    textTransform: "uppercase",
    fontWeight: "bold"
  }
});