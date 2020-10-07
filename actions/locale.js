import * as Constants from '../constants';

export function changeLocale(payload, props) {
  return {
    type: Constants.CHANGE_LOCALE,
    payload,
    ...props
  };
}
