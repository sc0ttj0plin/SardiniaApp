import React, { PureComponent } from "react";
import { Text, View } from "react-native";
import { Icon } from "react-native-elements";
import { connect, useStore } from 'react-redux';
import _ from 'lodash';

/**
 * Generic language-aware text component that re-renders when language changes
 */
class ConnectedAuthText extends PureComponent {

  constructor(props) {
    super(props);
  }

  render() {
    const { textStyle, auth } = this.props;
    const loginLabel = this.props.locale.messages.login;
    const logoutLabel = this.props.locale.messages.logout;

    return auth.user ? <Text style={[textStyle]}>{logoutLabel}</Text> : <Text style={[textStyle]}>{loginLabel}</Text>;
  }
}

function ConnectedAuthTextContainer(props) {
  const store = useStore();

  return <ConnectedAuthText 
    {...props}
    store={store} />;
}

const mapStateToProps = state => ({ locale: state.localeState, auth: state.authState });
const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, props) => {
  return {
    ...stateProps,
    actions: dispatchProps,
    ...props
  }
})(ConnectedAuthTextContainer)

