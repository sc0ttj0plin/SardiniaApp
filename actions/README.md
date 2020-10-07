# Rules for actions:

- All CRUD actions for a single endpoint must be inside the same action file.
- If the action encompasses a single data type then e.g. only pois its name must consist of one word (e.g. pois.js)
- If the action encompasses multiple data types then its name must encompass both data types (e.g. search + autocomplete: reducer name must be searchAutocomplete.js)