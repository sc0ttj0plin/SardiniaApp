# Sardinia App

## Nomenclatura
* __Vocabolari__: Definiscono gruppi di categorie
  * E.g. categoria "cosa fare" ha id 4, "dove andare": 14
* __Attrattore__: Definisce un punto di interesse (poi) opzionalmente geolocalizzato
* __Ispiratori__: Definiscono articoli, testi che hanno lo scopo di ispirare il pubblico, possono contenere riferimenti ad attrattori, eventi o itinerari
* __Eventi__: Eventi folkloristici definiti da data luogo ed informazioni
* __Itinerari__: Insieme di punti di interesse 
* __Nodi__: Termine generico per indicare: Attrattori, Ispiratori, Eventi ed Itinerari (li differenzia il "tipo")

## Quando si crea un nuovo schermo:
1. Copiare contentuto BoilerplateScreen.js
2. Rinominare il componente
3. Creare in Constants.NAVIGATION lo screen name corrispondente
4. Se lo screen usa ConnectedHeader aggiungere la configurazione dei pulsanti in ConnectedHeader.js
5. Creare le azioni/riduttori corrispondenti
6. Creare il bind nello store di redux
7. Creare la localization in Localization.js e usare ConnectedText con la prop languageKey per settare il nome schermo a rendering

## Login
Il login è di tipo passwordless.

Il linking ed il login viene gestito da App.js in modo che in ogni stato: app aperta o chiusa, il comportamento sia predicibile.
Infatti nel processo di login, quando l'utente riceve la mail ed esegue lo switch, il SO potrebbe terminare il processo dell'app smontando uno schermo X ipotetico il quale gestisce la callback del linking. 
Pertanto la cattura del link deve essere fatta a livello principale.

Inoltre è stato creato un componente che, se importato e renderizzato in uno schermo generico, permette di verificare lo stato di autenticazione corrente e mostrare il messaggio di richiesta di login. Questo ha il vantaggio di disaccoppiare gli schermi navigabili dall'autenticazione. Può essere inserito in uno schermo ed impedirne la navigazione se l'utente non è registrato.
Il popup rimanda allo stack di Login quando l'utente decide di registrarsi.




