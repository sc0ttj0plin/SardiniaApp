# Rules for reducers:

- If the reducer embeds a single data type then e.g. only pois its name must consist of one word and the props are organized as follows:
   - __Data__ is stored in this.props.pois.data
   - __Success__ state is stored in this.props.pois.success
   - __Loading__ state is stored in this.props.pois.loading
   - __Error__ state is stored in this.props.pois.error
- If the reducer embeds multiple data types then its name must encompass both data types (e.g. search + autocomplete: reducer name must be searchAutocomplete):
   - __Data__ is stored in this.props.searchAutocomplete.search
   - __Success__ state is stored in this.props.searchAutocomplete.searchSuccess
   - __Loading__ state is stored in this.props.searchAutocomplete.searchLoading
   - __Error__ state is stored in this.props.searchAutocomplete.searchError

- All CRUD reducer's states (get, post, put, ...) must be inside the same reducer file. Then append the HTTP verb after state name e.g.
Note: GET doesn't require any suffix.
  - For POST requests
     - __Data__ is stored in this.props.pois.dataPost
     - __Success__ state is stored in this.props.pois.successPost
     - __Loading__ state is stored in this.props.pois.loadingPost
     - __Error__ state is stored in this.props.pois.errorPost
  
- When possible use objects rather than arrays (this is not the case for search and autocomplete results for instance)