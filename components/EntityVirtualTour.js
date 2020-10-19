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
        { term &&(
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
    backgroundColor: "#24467C",
    height: 7,
    width: 100,
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 10
  },
  category: {
    fontSize: 12,
    flex: 1,
    opacity: 0.6,
    textAlign: "center",
    color: "black"
  },
  title: {
    fontSize: 16,
    flex: 1,
    textAlign: "center",
    opacity: 0.6,
    color: "black",
    fontWeight: "bold"
  }
});