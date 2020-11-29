import React, { PureComponent } from 'react';
import { View, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Image } from 'react-native-elements';
import GridGalleryImage from './GridGalleryImage';
import CustomText from "./CustomText";

/**
 * Grid gallery wrapper, used in Extra, Inspirers and Place screen to show related gallery
 */
export default class Gallery extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      numColumns: typeof props.numColumns !== "undefined" ? props.numColumns : 3,
      width: 100,
      height: 80
    };
  }
  
  render() {
    const { images, useFlatList = true } = this.props;
    const cellWidth = this.state.width / this.state.numColumns - 1;
    return (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
        onLayout={(event) => { this.setState({ width: event.nativeEvent.layout.width})}}
      >
        { useFlatList ? 
          <FlatList 
            data={images}
            renderItem={({item, idx}) => (
              <TouchableOpacity 
              onPress={() => this.props.onPress(idx)}>
                <Image
                  source={ item.source }
                  PlaceholderContent={<ActivityIndicator />}
                  style={[{
                      height: 80,
                      resizeMode: 'cover',
                      width: cellWidth
                  }]}
                />
              </TouchableOpacity>
            )}
            numColumns={this.state.numColumns}
            keyExtractor={(item, index) => index}
          /> 
          :
          images.map((image, idx) =>
            <GridGalleryImage
              index={idx}
              key={idx}
              onPress={() => this.props.onPress(idx)}
              source={image.source}
              style={{width: cellWidth}}
            />)
        }
        
      </View>
    );
  }
}