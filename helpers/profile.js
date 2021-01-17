

export const ageToString = (age, min, max) => {
    if(!age)
        return "";
    if(age <= min)
        return "< " + (min+1);
    else if(age >= max)
        return "> " + (max-1);
    else
        return "" + age;
}

export const populateAges = (min, max) => {
    var ages = [];
    for(var age = min; age <= max; age++) {
      ages.push({
        value: age,
        label: ageToString(age, min, max)
      });
    }
    return ages;
}

export const SEX = {
    MAN: 1,
    WOMAN: 2,
    NOT_DEFINED: 3,
}