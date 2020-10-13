
import React, { PureComponent } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import ShimmerWrapper from "../ShimmerWrapper"
import { connect, useStore } from 'react-redux';
import { bindActionCreators } from 'redux';
class LLVerticalItemsFlatlist extends PureComponent {

    constructor(props){
        super(props);
    }

    _renderItem = ({ item }) => {
        return(
            <ShimmerWrapper style={styles.item} shimmerStyle={[styles.item, this.props.itemStyle]}/>
        )
    }

    render(){
        const { whereToGo } = this.props.locale.messages;

        return (
            <View style={{
                flex: 1,
                width: "100%"
            }}>
                <Text style={styles.sectionTitle}>{nearToYou}</Text>
                <FlatList
                    horizontal={false}
                    data={Array.from({ length: 5 }).map((_, i) => String(i))}
                    keyExtractor={i => i}
                    renderItem={this._renderItem}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[styles.container, this.props.style]}>
                </FlatList>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    item: {
        // width: 160,
        // height: 160,
        // marginRight: 5,
        // borderRadius: 10,
    },
    container: {
        backgroundColor: "transparent",
    },
    sectionTitle: {
        fontSize: 16,
        color: 'white',
        fontWeight: "bold",
        margin: 10
    }
  });


  
function LLVerticalItemsFlatlistContainer(props) {
    const store = useStore();
    return <LLVerticalItemsFlatlist {...props} store={store} />;
}

const mapStateToProps = state => {
    return {
        locale: state.localeState,
    };
};

const mapDispatchToProps = dispatch => {
return {...bindActionCreators({}, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
return {
    ...stateProps,
    actions: dispatchProps,
    ...props
}
})(LLVerticalItemsFlatlistContainer)