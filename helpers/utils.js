export let searchParser = (queryStr) => {
  return queryStr.replace(/ /g, " & ");
}