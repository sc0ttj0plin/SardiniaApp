export function name (value) {
    let pattern = null;
    pattern = new RegExp(VALIDATORS.name);
    let validation = pattern.exec(value);
    if(validation !== null){
        return true;
    }
    else
        return false
}

export function username (value) {
    let pattern = null;
    pattern = new RegExp(VALIDATORS.username);
    let validation = pattern.exec(value);
    if(validation !== null){
        return true;
    }
    else
        return false
}

export function email (value) {
    let pattern = null;
    pattern = new RegExp(VALIDATORS.email);
    let validation = pattern.exec(value);
    if(validation !== null){
        return true;
    }
    else
        return false
}

/* Regex for validation */
export const VALIDATORS = {
    email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    username: /^(?=[a-zA-Z0-9._ ]{3,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/,
    name: /^[A-Z, a-z]{4,30}$/,
  }