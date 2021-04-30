import React, { PureComponent } from 'react';
import { View, FlatList, ActivityIndicator } from 'react-native';
import { Image } from 'react-native-elements';
import GridGalleryImage from './GridGalleryImage';
import Layout from '../../constants/Layout';
import ScrollableContainerTouchableOpacity from '../map/ScrollableContainerTouchableOpacity';

/**
 * Grid gallery wrapper, used in Extra, Inspirers and Place screen to show related gallery
 */
export default class Gallery extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      numColumns: typeof props.numColumns !== "undefined" ? props.numColumns : 3,
      windowWidth: Layout.window.width,
      height: 80
    };
  }
  
  render() {
    const { images, useFlatList = true } = this.props;
    const cellWidth = this.state.windowWidth / this.state.numColumns - 1;
    var cellHeight = cellWidth / 16 * 9;
    
    return (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
        onLayout={(event) => { 
          this.setState({ windowWidth: event.nativeEvent.layout.width });
          }}
      >
        { useFlatList ? 
          <FlatList 
            data={images}
            renderItem={({item, idx}) => 
              <ScrollableContainerTouchableOpacity 
              onPress={() => this.props.onPress(idx)}>
                <Image
                  source={ item.source }
                  PlaceholderContent={<ActivityIndicator />}
                  style={[{
                      height: this.state.height,
                      resizeMode: 'cover',
                      width: cellWidth
                  }]}
                />
              </ScrollableContainerTouchableOpacity>
            }
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
              style={{width: cellWidth, height: cellHeight}}
            />)
        }
        
      </View>
    );
  }
}