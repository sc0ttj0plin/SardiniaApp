import * as restActions from '../actions/rest';
import * as localeActions from '../actions/locale';

export const getEntities = (store, type) => {
    store.subscribe(function() {
        updateEntities(store)
    });
    store.dispatch(restActions.getEntities(type));
} 

const updateEntities = (store) => {
    var state = store.getState().restState;
    state.finished && Object.values(state.entities).forEach((entity) => {
        if(typeof entity.image ===  "undefined"){
            // console.log(entity.title);
            store.dispatch(restActions.getEntity(entity.uuid));
        }
    });
}

//use in this way ->  network.getEntities(this.props.store, "attrattore");