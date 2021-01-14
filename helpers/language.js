
/**
 * normalizeLanguage Normalizes language in input (single strings, object or arrays (TBI))
 * Since Android and Ios can result in different language return strings
 * this method maps them to a common unified version used throughout the app
 * @param input the input language (e.g. en or en-gb)
 */
export const normalizeLanguage = (input) => {
    if (typeof(input) === 'string')
    return input.split('-')[0];
    else if (typeof(input) === 'object') {
      // console.log("Available languages:", Object.keys(input).join(", "))
      for (const lanKey in input) {
        const newLanKey = lanKey.split('-')[0];
        if (newLanKey !== lanKey) {
          input[newLanKey] = input[lanKey];
          delete input[lanKey];
        }
      }
      // console.log("Available languages (after transform):", Object.keys(input).join(", "))
    }
  }