import React, { PureComponent } from "react";
import { Text, View } from "react-native";
import { Icon } from "react-native-elements";
import { connect, useStore } from 'react-redux';
import _ from 'lodash';
import CustomText from "./CustomText";

/**
 * Generic language-aware text component that re-renders when language changes
 */
class ConnectedText extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { languageKey, textStyle } = this.props;
    const label = this.props.locale.messages[languageKey];
    return <CustomText style={[textStyle]}>{label}</CustomText>;
  }
}

function ConnectedTextContainer(props) {
  const store = useStore();

  return <ConnectedText 
    {...props}
    store={store} />;
}

const mapStateToProps = state => ({ locale: state.localeState });
const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(ConnectedTextContainer)

