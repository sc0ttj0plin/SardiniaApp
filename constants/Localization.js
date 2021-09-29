import { normalizeLanguage } from "../helpers/language";

const itKey = normalizeLanguage("it");
const enKey = normalizeLanguage("en-*");
const zhKey = normalizeLanguage("zh-*");
const frKey = normalizeLanguage("fr");
const deKey = normalizeLanguage("de");

const dict = {
  [itKey]: {
    //GENERIC
    man: "Uomo",
    woman: "Donna",
    sexNotDefined: "Preferisco non specificare",
    welcome: "Benvenuto",
    start: "Inizia",
    go: "VAI",
    openNavigator: "Vai al navigatore",
    openMap: "Apri la mappa",
    time: "Sono le",
    itineraries: "Itinerari",
    events: "Eventi",
    get_inspired: "Lasciati Inspirare",
    open: "Apri",
    filterBy: "Filtra per",
    description: "Descrizione",
    discoverMore: "Scopri di più",
    nearToYou: "Vicini a te",
    nearTo: "Vicini a",
    myPreferences: "I miei gusti",
    access: "ACCEDI",
    loginText:
      "Registrandoti vedrai contenuti personalizzati in base alle tue preferenze",
    skip: "SALTA",
    informations: "informazioni",
    ageText: "Anni: ",
    birthDate: "Data di nascita: DD-MM-YYYY",
    countryText: "Paese: ",
    sexText: "Sesso: ",
    exploreAccomodation: "Esplora le strutture ricettive",
    nearAccomodations: "Strutture ricettive nelle vicinanze",
    logout: "Disconnetti",
    login: "Accedi",
    completeAccess: "Completa Profilo",
    showMap: "MOSTRA MAPPA",
    whereToGo: "Esplora dove andare",
    exploreItineraries: "Esplora gli itinerari",
    exploreEvents: "Esplora gli eventi",
    exploreEventsOnMap: "Esplora gli eventi sulla mappa",
    filterEvents: "Flitra gli eventi",
    filter: "FILTRA",
    explore: "Esplora",
    startTrip: "Inizia il tuo viaggio",
    chooseAccomodation: "Scegli dove alloggiare",
    whatToSee: "Scegli cosa vedere",
    galleryMap: "Immagini",
    gallery: "Galleria",
    video: "Video",
    videoAnd3D: "Video e 3D",
    stages: "Le tappe",
    whyVisit: "Perchè visitarlo?",
    usefulInfo: "Info Utili",
    howToReach: "Arrivare in Sardegna",
    howToRoam: "Muoversi in Sardegna",
    craft: "Artigianato",
    centenarians: "Terra dei Centenari",
    culture: "Culture",
    myth: "Mito",
    pristineBlu: "Blu Incontaminato",
    tradition: "Tradizione",
    wildNature: "Natura",
    starredPlaces: "Luoghi del cuore",
    favouritesPlaces: "DOVE ANDARE",
    favouritesInspirers: "COSA FARE",
    favouritesEvents: "EVENTI",
    favouriteItineraries: "ITINERARI",
    favouriteAccomodations: "STRUTTURE RICETTIVE",
    noFavourites: "Nessun preferito",
    canBeOfInterest: "Potrebbe interessarti anche",
    extrasWildNature: "Natura",
    extrasMythIsland: "Mito",
    extrasTradition: "Tradizioni",
    extrasCentenaryLand: "Centenari",
    extrasLiveTheSea: "Mare",
    extrasStarredPlaces: "Luoghi del cuore",
    extrasCulture: "Cultura",
    findOutMore: "APPROFONDISCI",
    open3DModel: "Esplora la <br/>Realtà Virtuale",
    address: "Indirizzo",
    phone: "Telefono",
    website: "Sito Web",
    email: "Email",
    addressModalTitle: "Dove siamo",
    phoneModalTitle: "Chiama la struttura",
    websiteModalTitle: "Guarda il sito",
    emailModalTitle: "Manda una mail",
    addressOnPressAlert:
      "Guarda dove troverai la struttura e segui le indicazioni per trovarla.",
    phoneOnPressAlert:
      "Mettiti direttamente in contatto con la struttura per richiedere informazioni o fare una prenotazione.",
    websiteOnPressAlert:
      "Naviga la pagina web della struttura per avere maggiori informazioni.",
    emailOnPressAlert:
      "Mettiti direttamente in contatto con la struttura per richiedere informazioni o fare una prenotazione.",
    addressOnPressBtnTitle: "Naviga",
    phoneOnPressBtnTitle: "Chiama la struttura",
    websiteOnPressBtnTitle: "Vai",
    emailOnPressBtnTitle: "Scrivi",
    entityIsNotTranslated:
      "Questa entità non ha una traduzione per la lingua corrente",
    retry: "Riprova",
    cancel: "Annulla",
    //LOGIN
    possibleCauses: "Possibili cause:",
    reusedOldLink: "• È stato usato un link di login scaduto o già utilizzato",
    alreadyLoggedIn: "• Il login è stato già effettuato precedentemente",
    connectionIssues: "• La connessione ad internet è inattiva o intermittente",
    unsuccessfulLogin:
      "Il login non è andato a buon fine, si prega di riprovare.",
    //NAVIGATION
    tabWhatToDo: "Cosa fare",
    tabWhereToGo: "Dove andare",
    tabExtras: "Sardegna",
    tabItineraries: "Itinerari",
    tabEvents: "Eventi",
    drawerLanguage: "Lingue",
    drawerTab: "Schermata principale",
    drawerSearch: "Cerca",
    preferences: "I miei gusti",
    tutorial: "Guida",
    preferencesText1: "Basta un minuto!",
    preferencesText2: "Aiutaci a capire i tuoi gusti cliccando sulle emoticon.",
    preferencesText3: "Adesso conosciamo i tuoi gusti.",
    tutorialText1: "Tutorial",
    tutorialText2: "",
    back: "Indietro",
    okDoneSurvey: "OK, HAI FINITO!",
    thanks: "Grazie!",
    insertHere: "Cerca",
    favourites: "Preferiti",
    accomodations: "Strutture Ricettive",
    doYouLikeIt: "Ti piace questo tipo di contenuto?",
    setting: "Impostazioni",
    privacy: "Privacy",
    submit:"Invia",
    privacytext:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    notificationsetting: "Notifiche ed Eventi",
    info: "Info Utili",
    alert: "Notizie ed emergenze",
    //LANGUAGES
    lanItalian: "🇮🇹 Italiano",
    lanEnglish: "🇬🇧 Inglese",
    //AUTH
    profile: "Profilo",
    username: "Inserisci un nome",
    name: "Nome",
    surname: "Cognome",
    birth: "Data di nascita DD-MM-YYYY" ,
    country: "Paese",
    sex: "Sesso",
    age: "Età",
    confirm: "Conferma",
    register: "Registrati",
    signin:"ACCEDI",
    registeremail:"Registrati tramite email",
    logingoogle:"Accedi con Google",
    loginfacebook:"Accedi con Facebook",
    landingtextlogin:"Sei già registrato? Accedi\naltrimenti",
    resetpassword: "Reset Password",
    forgotpassword:"Hai dimenticato la password?",
    forgotpasswordtext:"Hai dimenticato la password? Conferma il tuo indirizzo email e ti invieremo un link per resecare la password.",
    next: "Avanti",
    sentLink: "Ti abbiamo mandato un link",
    checkInbox: "Controlla la tua mail",
    logoutMsg: "Vuoi disconnettere il tuo account?",
    logoutBtn: "Disconnetti",
    removeProfileMsg: "Vuoi rimuovere il tuo profilo?",
    removeProfileBtn: "Rimuovi Profilo",
    editProfileBtn: "Modifica Profilo",
    fillInformation: "Inserisci qui i tuoi dati",
    unsuccessfullLogin: "Siamo spiacenti ma il login è fallito",
    successfullLogin: "Autenticazione riuscita!",
    loggingIn: "Login in corso..",
    loginError: "Errore di login:",
    loginok: "Grazie per esserti loggato",
    gotohome: "Puoi Tornare alla Home",
    //Parks
    nearParks: "Parcheggi nelle vicinanze!",
    discoverParks:
      "Scopri i parcheggi liberi più vicini a te attraverso uno dei servizi convenzionati.",
    findParkBtn: "TROVA UN PARCHEGGIO",
    //Update
    updateInProgressTitle: "Aggiornamento in corso",
    updateInProgressDescription: "Attendere il riavvio dell'applicazione",
    //Networking
    disconnected: "Verificare la connessione",
    pleaseConnect:
      "Sembra che tu non abbia accesso ad internet. Verifica la connessione e riprova.",
    retry: "Riprova",
    cancel: "Cancel",
    //LINKING
    loadingLinkingContentTitle: "Caricamento del contenuto",
    loadingLinkingContentDescription: "Stiamo cercando il contenuto richiesto",
    loadingLinkingContentTitleError: "Errore nel caricamento del contenuto",
    loadingLinkingContentDescriptionError:
      "C'è stato un'errore nella ricerca del contenuto",
    //App Location Tracking background
    notificationTitle: "L'app Sardinia ti avvisa",
    notificationBody: "Sei vicino ad un punto di interesse!",
    //Redux error
    reduxErrorTitle: "Ops, qualcosa è andato storto",
    reduxErrorBody: "L'applicazione ha riscontrato un'errore.",
    //Generic Screen error
    screenErrorTitle: "Ops, qualcosa è andato storto",
    screenErrorBody: "L'applicazione ha riscontrato un'errore.",
    //Setting
    nearpoitext: "Vicinanza ad un punto di interesse",
    newelementadded: "Nuovo contenuto aggiunto",
    eventreminder: "Ricorda un evento",
    neweventweek: "Nuovo evento fra una settimana",
    alertemergency: "Emergenze ed allerte",
    newsfeed: "Notizie ed aggiornamenti",
    gpsauth: "LA MIA POSIZIONE GPS",
    gpsapp: "Durante l'uso dell'app",
    gpsbackground: "In backgroung",
    virtualenclosure: "Recinti Virtuali",
    //Privacy
    privacy: "Privacy",
    submit:"Submit",
    privacytext:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  [enKey]: {
    //GENERIC
    man: "Man",
    woman: "Woman",
    sexNotDefined: "I prefer not say",
    welcome: "Hello",
    go: "GO",
    start: "Start",
    openNavigator: "Open navigator",
    openMap: "Open map",
    time: 'It"s',
    itineraries: "Itineraries",
    events: "Events",
    get_inspired: "Get Inspired",
    open: "Open",
    filterBy: "Filter by",
    description: "Description",
    discoverMore: "Discover More",
    nearToYou: "Near to you",
    nearTo: "Near to",
    exploreAccomodation: "Explore accomodations",
    nearAccomodations: "Nearest accomodations",
    logout: "Logout",
    login: "Login",
    myPreferences: "My preferences",
    access: "REGISTER",
    signin:"SIGN IN",
    landingtextlogin:"If already registered? Log in\notherwise",
    resetpassword: "Reset Password",
    forgotpassword:"Did you forget your password?",
    forgotpasswordtext:"Did you forget your password? Confirm your email address and I'll send you\n a link to reset your password.",

    completeAccess: "Complete profile",
    loginText:
      "By registering you will be shown contents tailored to your preferences",
    skip: "SKIP",
    informations: "informations",
    ageText: "Age: ",
    birthDate: "Birth date: DD-MM-YYYY ",
    countryText: "Country: ",
    sexText: "Sex: ",
    exploreItineraries: "Explore itineraries",
    exploreEvents: "Explore events",
    exploreEventsOnMap: "Explore events on map",
    filterEvents: "Filter events",
    filter: "FILTER",
    showMap: "SHOW MAP",
    whereToGo: "Explore where to go",
    explore: "Explore",
    startTrip: "Start your trip",
    chooseAccomodation: "Choose where to stay",
    whatToSee: "Choose what to see",
    galleryMap: "Gallery",
    gallery: "Gallery",
    video: "Video",
    videoAnd3D: "Videos and 3D",
    stages: "Stages",
    whyVisit: "Why visit it?",
    usefulInfo: "Useful Info",
    howToReach: "Getting in Sardinia",
    howToRoam: "Moving in Sardinia",
    craft: "craft",
    centenarians: "centenarians",
    myth: "myth",
    culture: "culture",
    pristineBlu: "pristine blu",
    tradition: "tradition",
    wildNature: "nature",
    starredPlaces: "Places of the Hearth",
    favouritesPlaces: "PLACES",
    favouritesEvents: "EVENTS",
    favouriteItineraries: "ITINERARIES",
    favouriteAccomodations: "ACCOMODATIONS",
    noFavourites: "There are no favourites",
    canBeOfInterest: "You can be interested also to",
    extrasWildNature: "Nature",
    extrasMythIsland: "The Island of the Myth",
    extrasTradition: "Tradition",
    extrasCentenaryLand: "The Island of the Centenaries",
    extrasLiveTheSea: "Sea",
    extrasCulture: "Culture",
    extrasStarredPlaces: "Places of the Hearth",
    findOutMore: "FIND OUT MORE",
    open3DModel: "OPEN 3D MODEL",
    address: "Address",
    phone: "Phone",
    website: "Website",
    email: "Email",
    addressModalTitle: "Navigate to address",
    phoneModalTitle: "Call",
    websiteModalTitle: "Browse the website",
    emailModalTitle: "Send an email",
    addressOnPressAlert: "Do you want to open the navigator?",
    phoneOnPressAlert: "Do you want to call the host?",
    websiteOnPressAlert: "Do you want to navigate to the host's website?",
    emailOnPressAlert: "Do you want to open the email client?",
    addressOnPressBtnTitle: "Go!",
    phoneOnPressBtnTitle: "Call the host",
    websiteOnPressBtnTitle: "Open browser",
    emailOnPressBtnTitle: "Open email",
    entityIsNotTranslated:
      "This entity hasn't got a translation for the current language",
    retry: "Retry",
    cancel: "Cancel",
    //LOGIN
    possibleCauses: "Possible causes:",
    reusedOldLink: "• The login link has already been used or is expired",
    alreadyLoggedIn: "• Login was already performed",
    connectionIssues: "• Internet connection is inactive or poor",
    unsuccessfulLogin: "Login unsuccessful. Please retry",
    //NAVIGATION
    tabWhatToDo: "What to do",
    tabWhereToGo: "Where to go",
    tabExtras: "Sardinia",
    tabItineraries: "Itineraries",
    tabEvents: "Events",
    drawerLanguage: "Languages",
    drawerTab: "Main screen",
    preferences: "My preferences",
    tutorial: "Tutorial",
    preferencesText1: "It only takes a minute!",
    preferencesText2:
      "Help us understand your preferences by clicking on the emoticons.",
    preferencesText3: "Now we know your preferences.",
    tutorialText1: "Tutorial",
    tutorialText2: "",
    back: "Back",
    okDoneSurvey: "OK, YOU ARE DONE!",
    thanks: "Thanks!",
    drawerSearch: "Search",
    insertHere: "Search",
    favourites: "Favourites",
    accomodations: "Accomodations",
    doYouLikeIt: "Do you like this content",
    setting: "Settings",
    notificationsetting: "notifications and events",
    info: "Info",
    alert: "Emergency and News",
    //LANGUAGES
    lanItalian: "🇮🇹 Italian",
    lanEnglish: "🇬🇧 English",
    //AUTH
    profile: "Profile",
    username: "Username",
    name: "Name",
    surname: "Surname",
    birth: "Birth date DD-MM-YYYY",
    country: "Country",
    sex: "Sex",
    age: "Age",
    confirm: "Confirm",
    register: "Register",
    next: "Next",
    sentLink: "We've sent you a link",
    checkInbox: "Check your inbox",
    loginok: "Login Successful",
    gotohome: "You can go back to home",
    logoutMsg: "Do you want to logout from your account?",
    logoutBtn: "Logout",
    removeProfileMsg: "Do you want to delete your profile?",
    removeProfileBtn: "Delete Profile",
    editProfileBtn: "Edit Profile",
    fillInformation: "Fill in the personal data form",
    unsuccessfullLogin: "We are sorry but the login was unsuccessful",
    successfullLogin: "Authentication successful!",
    loggingIn: "Logging in..",
    loginError: "Error loggin in:",
    registeremail:"Register via email",
    logingoogle:"Sign in with Google",
    loginfacebook:"Sign in with Facebook",
    //Parks
    nearParks: "Nearest parkings!",
    discoverParks:
      "Discover the nearest free parkings provided by one of the affiliated services.",
    findParkBtn: "FIND A PARK",
    //Update
    updateInProgressTitle: "Update in progress",
    updateInProgressDescription: "Please wait, Sardinia app is restarting",
    //Networking
    disconnected: "Disconnected...",
    pleaseConnect:
      "Please turn on internet connection to access the app contents",
    retry: "Retry",
    cancel: "Cancel",
    //LINKING
    loadingLinkingContentTitle: "Loading content",
    loadingLinkingContentDescription:
      "We are searching for the requested content",
    loadingLinkingContentTitleError: "Loading content error",
    loadingLinkingContentDescriptionError:
      "We had troubles loading the linked content",
    //App Location Tracking background
    notificationTitle: "Sardinia App Location",
    notificationBody: "Sardinia App is tracking your location",
    //Redux error
    reduxErrorTitle: "Ops, something has gone wrong",
    reduxErrorBody: "The application has encountered an error.",
    //Generic Screen error
    screenErrorTitle: "Ops, something has gone wrong",
    screenErrorBody: "The application has encountered an error.",
    //Setting
    nearpoitext: "Proximity to a point of interest",
    newelementadded: "New content added",
    eventreminder: "Remember an event",
    neweventweek: "New event in a week",
    alertemergency: "Emergencies and alerts",
    newsfeed: "News and updates",
    gpsauth: "MY GPS LOCATION",
    gpsapp: "While using the app",
    gpsbackground: "In the background",
    virtualenclosure: "Virtual Fences",
    //Privacy
    privacy: "Privacy",
    privacytext:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  zhKey: {},
  frKey: {},
  deKey: {},
};

export default dict;
