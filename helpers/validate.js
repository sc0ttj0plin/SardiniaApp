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

export function password (value) {
    let pattern = null;
    pattern = new RegExp(VALIDATORS.password);
    let validation = pattern.exec(value);
    if(validation !== null){
        return true;
    }
    else
        return false
}

export function date (value) {
    let pattern = null;
    pattern = new RegExp(VALIDATORS.date);
    let validation = pattern.exec(value);
    if(validation !== null){
        return true;//no age check
    }
    else
        return false
}


/* Regex for validation */
export const VALIDATORS = {
    email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    username: /^(?=[a-zA-Z0-9._ ]{3,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/,
    name: /^[A-Z, a-z]{4,30}$/,
    password: /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
    date: /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/
  }