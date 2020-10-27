import React, {PureComponent} from 'react';
import { View, StyleSheet, Text } from 'react-native';

export default class EntityHeader extends PureComponent {  
  
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  
  render() {
    const { term, title } = this.props;
    return (
      <>
        <View style={styles.topLineContainer}>
          <View style={styles.topLine}/>  
        </View>
        { term != "" && term &&(
          <View style={[styles.categoryContainer]}>
            <Text style={[styles.category]}>{term}</Text>
            <View style={styles.borderLine}></View>
          </View>
        )}
        <Text style={[styles.title]}>{title}</Text>
      </>
    );
  }
}

const styles = StyleSheet.create({
  fill: {
    flex: 1
  },
  categoryContainer: {
    flexDirection: "column",
    justifyContent: "center"
  },
  borderLine: {
    backgroundColor: "#174A7C",
    height: 4,
    width: 61,
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 16
  },
  category: {
    fontSize: 15,
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    opacity: 0.8,
    color: "#666666"
  },
  title: {
    fontSize: 20,
    flex: 1,
    textAlign: "center",
    color: "#000000E6",
    fontWeight: "bold"
  },
  topLineContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  topLine: {
    width: 32,
    height: 4,
    backgroundColor: "#0000001A",
    borderRadius: 2,
    marginTop: 20,
    marginBottom: 16
  }
});