import * as categoriesActions from './categories';
import * as eventsActions from './events';
import * as favouritesActions from './favourites';
import * as inspirersActions from './inspirers';
import * as itinerariesActions from './itineraries';
import * as localeActions from './locale';
import * as nodesActions from './nodes';
import * as othersActions from './others';
import * as poisActions from './pois';
import * as restActions from './rest';
import * as accomodationsActions from './accomodations';
import * as searchAutocompleteActions from './searchAutocomplete';

const allActions = { 
   ...categoriesActions,
   ...eventsActions,
   ...favouritesActions,
   ...inspirersActions,
   ...itinerariesActions,
   ...localeActions,
   ...nodesActions,
   ...othersActions,
   ...poisActions,
   ...restActions,
   ...accomodationsActions,
   ...searchAutocompleteActions,
 }
export default allActions;