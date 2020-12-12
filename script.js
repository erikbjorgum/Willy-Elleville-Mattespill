window.onload = oppstart;
//variabler knyttet til bruker og lagring
let brukernavn = "";

//variabler til regnestykket
let tall1 = 0;
let tall2 = 0;
let fasit = 0;
let inputSvar = 0;
let regnestykke = "";

//variabler for føring av statistikk
let antallForsok = 0;
let poeng = 0;
let streak = 0;
let oppgavenummer = 0;
let feilSvar = [];
let rundeListe = [];

//variabler for lagring og highscore-tabell
let brukere = [];
let highscoretabellTekst = '<tr> <th colspan="3">HIGHSCORE</th> </tr><tr><th>Navn</th><th>Poeng</th></tr>';

//konstruktør for brukarar til highscore-liste
function Brukere(navn, poeng) {
  this.navn = navn;
  this.poeng = poeng;
}
//konstruktør for lagring av oppgåvestatistikk for runden
function Oppgave(oppgavenummer, regnestykke, fasit, feilSvar) { //Hege
  this.oppgavenummer = oppgavenummer;
  this.regnestykke = regnestykke;
  this.fasit = fasit;
  this.feilSvar = feilSvar;
}

//Aktiverer knappar, hentar brukarliste frå local storage og lagar highscore-tabellen. 
function oppstart() {
//Jarle. Gjer at ein kan nytte enter i staden for å trykke på knappen
let input = document.getElementById("brukerNavn");
input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      document.getElementById("btnLagreNavn").click();
    }
  });
  document.getElementById("btnLagreNavn").onclick = brukerNavn;
  document.getElementById("btnStart").onclick = startknapp;
  document.getElementById("btnStartmeny").onclick = startmeny;
  //Testar om det er lagra noko i local storage med keyen "Brukerliste". For at koden skal køyre før det er lagra noko. 
  if (localStorage.getItem("Brukerliste") === null) {
    document.getElementById("highscore").innerHTML = highscoretabellTekst;
  } else {
    brukere = JSON.parse(localStorage.getItem("Brukerliste"));
    lagHighscoretabell();
  }
}
//Hege og Erik. Lagar ein highscore-tabell med objekta som er lagra i brukarlista. 
function lagHighscoretabell() {
  //Hentar data frå local storage og sorterer brukerane etter høgast poengsum
  brukere.sort(function(a, b) {
    return b.poeng - a.poeng;
  });
  // Lagar ei ny tabellrad per objekt, og skriv ut namn og poeng i kvar si celle. 
  for (i = 0; i < brukere.length; i++) {
    highscoretabellTekst += "<tr> <td>" + brukere[i].navn + "</td><td>" + brukere[i].poeng + "</td> </tr>"
  }
  document.getElementById("highscore").innerHTML = highscoretabellTekst;
}

//Hege, Erik og Jarle. Hentar inn brukarnam, sender brukaren vidare til hovudmenyen, sørger for at brukarnamnet blir skrive med stor(e) forbokstav(ar). 
function brukerNavn() {
  brukernavn = document.getElementById("brukerNavn").value;
  //Jarle og Erik - input-feltet blir rosa viss ein prøver å gå vidare utan å skrive inn brukarnamn
  if (brukernavn.length == 0) {
    document.getElementById("brukerNavn").style.backgroundColor = "pink";
    //Erik - valg av regneart, vanskelighetsgrad og startknapp blir synlig først når brukernavn er lagt inn.
  } else {
    document.getElementById("brukervalg").style.display = "inline";
    document.getElementById("btnStart").style.display = "inline";
    //Hege - gjer at namnet får stor forbokstav, tek høgde for doble namn med mellomrom og bindestrek. 
    brukernavn = brukernavn.toLowerCase();
    brukernavn = brukernavn.charAt(0).toUpperCase() + brukernavn.slice(1); //Gjer første bokstaven stor
    //Hege - Sjekkar alle teikna i brukarnamnet for å finne eventuelle mellomrom eller bindestrekar. Viss den finn eit mellomrom eller ein bindestrek, gjerast teiknet på neste indeks stort.
    for (i = 0; i < brukernavn.length; i++) {
      if (brukernavn.charAt(i) == " " || brukernavn.charAt(i) == "-") {
        brukernavn = brukernavn.slice(0, i + 1) + brukernavn.charAt(i + 1).toUpperCase() + brukernavn.slice(i + 2);
      }
    }
    document.getElementById("velkomstsetning").innerHTML = "Velkommen, " + brukernavn + ".";
    document.getElementById("brukerinnlogging").style.display = "none";
  }
}
//Hege. Skjuler startmenyen, viser spelet, nullstiller dei relevante statistikkvariablane og aktiverer knappar. 
function startknapp() {
  document.getElementById("startmeny").style.display = "none"; //Skjuler startmenyen 
  document.getElementById("spill").style.display = "inline"; //Viser spelet
  antallForsok = 0;
  poeng = 0;
  streak = 0;
  oppgavenummer = 0;
  rundeListe = [];
  lagRegnestykke(); //kallar funksjonen som lagar reknestykket og viser det
  document.getElementById("btnSendInnSvar").onclick = sjekkSvar; //aktiverer svarknappen
  document.getElementById("btnFriminutt").onclick = friminutt;
  document.getElementById("btnHjelp").onclick = hjelpesetning;
  document.getElementById("btnStartmeny").style.display = "inline";
  document.getElementById("hjelpetekst").style.display = "none";

  let input = document.getElementById("svar");

  //la inn kode for å kunne trykke enterknapp i svar (Jarle)
  input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      document.getElementById("btnSendInnSvar").click();
    }
  });
}
//Skjuler og viser dei relevante elementa
function startmeny() {
  document.getElementById("startmeny").style.display = "inline";
  document.getElementById("btnStartmeny").style.display = "none";
  document.getElementById("spill").style.display = "none";
  document.getElementById("hjelpetekst").style.display = "none";
  document.getElementById("sluttskjerm").style.display = "none";
}
//Eirin. Lagar reknestykket basert på kva nivå og rekneart som er valgt, og viser det på nettsida. 
function lagRegnestykke() {
  let nivaa = document.getElementById("vanskelighetsgrad").value; //henter valgt vanskelighetsgrad fra HTML-dokumentet, tilordner verdien til ny variabel "nivaa"

  if (nivaa == "Lett") { //om valgt vanskelighetsgrad er lik lett, settes tall1 og tall2 til randomiserte tall mellom 0 og 10
    tall1 = Math.floor(Math.random() * 11);
    tall2 = Math.floor(Math.random() * 11)
  }
  if (nivaa == "Middels") {
    tall1 = Math.floor(Math.random() * 101); //tall1 og tall2 settes lik randomiserte tall mellom 0 og 100
    tall2 = Math.floor(Math.random() * 101);
  }
  if (nivaa == "Krevende") {
    tall1 = Math.floor(Math.random() * 1001);
    tall2 = Math.floor(Math.random() * 1001);
  }
  if (nivaa == "Umulig") {
    tall1 = Math.floor(Math.random() * 10001);
    tall2 = Math.floor(Math.random() * 10001);
  }

  let valgtRegneart = document.getElementById("regnearter").value; //henter informasjon om hvilken regneart brukeren valgt

  if (valgtRegneart == "Addisjon") { //dersom bruker har valgt addisjon som regneart
    addisjonsStykke(tall1, tall2); //kaller funksjonen addisjonsStykke med argumentene tall1 og tall2
  }
  if (valgtRegneart == "Subtraksjon") {
    subtraksjonsStykke(tall1, tall2);
  }
  if (valgtRegneart == "Multiplikasjon") {
    multiplikasjonsStykke(tall1, tall2);
  }
  if (valgtRegneart == "Divisjon") {
    divisjonsStykke(tall1, tall2);
  }
  document.getElementById("regnestykke").innerHTML = regnestykke; //viser regnestykket 

  function addisjonsStykke(tall1, tall2) {
    regnestykke = tall1 + " + " + tall2 + " = "; //lager tekstvariabel som viser regnestykket
    fasit = tall1 + tall2 //tilordner verdi til fasiten
  }
  function subtraksjonsStykke(tall1, tall2) {
    regnestykke = tall1 + " - " + tall2 + " = ";
    fasit = tall1 - tall2
  }
  function multiplikasjonsStykke(tall1, tall2) {
    regnestykke = tall1 + " * " + tall2 + " = ";
    fasit = tall1 * tall2
  }
  function divisjonsStykke(tall1, tall2) {
    regnestykke = tall1 + " / " + tall2 + " = ";
    fasit = tall1 / tall2
  }
}
//Samskrive. Hentar inn svaret frå brukaren og sjekkar det opp mot fasit.
function sjekkSvar() {
  inputSvar = document.getElementById("svar").value;
  //Hentar inn svar frå input-feltet og gjer det om til eit tal. 
  inputSvar = parseInt(inputSvar);
  //Fjerner hjelpetekst før ny oppgave - Jarle 
  document.getElementById("hjelpetekst").style.display = "none";
  // Gir tilbakemelding viss brukarsvaret ikkje er eit tal
  if (isNaN(inputSvar) == true) {
    document.getElementById("tilbakemelding").innerHTML = "Det du svarte var ikke et tall. Hvis du prøver å skrive negative tall må du ikke ha mellomrom mellom fortegn og tall!";
  } else if (inputSvar != fasit) {
    document.getElementById("tilbakemelding").innerHTML =
      "Du svarte: " + inputSvar + ". Prøv igjen, " + brukernavn + "!";
    document.getElementById("svar").value = "";
    antallForsok++;
    streak = 0;
    feilSvar.push(inputSvar);
    if (antallForsok == 2) {
      document.getElementById("tilbakemelding").innerHTML = "Trenger du hjelp? Trykk på \"Jeg trenger hjelp!\"";
    }
    if (antallForsok > 3) {
      velkomstsetning.innerHTML = "Hva med å prøve en annen regneart, " + brukernavn + "?";
    }
  } else if (inputSvar == fasit) {
    document.getElementById("tilbakemelding").innerHTML =
      inputSvar + " var riktig! Bra jobbet, " + brukernavn + "!";
    document.getElementById("svar").value = "";
    streak++;
    poeng = poeng + streak;
    feilSvar = [];
    sjekkStatus();
    lagRegnestykke();
    document.getElementById("svar").focus();
  }
  //Brukerens streak
  tekstfeltStreak.innerHTML = "Du har " + poeng + "poeng. <br>Din streak: " + streak + ".";
}
//Jarle. Gir brukaren forskjellige hjelpesetningar, basert på kva rekneart som er valt. 
function hjelpesetning() {
  document.getElementById("btnHjelp").onclick = hjelpesetning;
  document.getElementById("hjelpetekst").style.display = "inline";
  let valgtRegneart = document.getElementById("regnearter").value;

  if (valgtRegneart == "Addisjon") {
    btnHjelpetekst.innerHTML = "Skriv ned regnestykket for hånd";
  }
  if (valgtRegneart == "Subtraksjon") {
    btnHjelpetekst.innerHTML = "Tenk plassverdi!";
  }
  if (valgtRegneart == "Divisjon") {
    btnHjelpetekst.innerHTML = "Ta deg litt bedre tid!";
  }
  if (valgtRegneart == "Multiplikasjon") {
    btnHjelpetekst.innerHTML = "Gjør et overslag først";
  }

}
//Samskrive. Lagrar oppgåvestatistikken i eit objekt, som leggjast til ei liste over alle oppgåvene i runden. 
function sjekkStatus() {
  oppgavenummer++;
  let denneOppgaven = new Oppgave(oppgavenummer, regnestykke, fasit, feilSvar);
  rundeListe.push(denneOppgaven);
  if (oppgavenummer == 10) {
    sluttskjerm();
  }
  //Viser oppgavenummeret 
  tekstfeltOppgavenummer.innerHTML = "Oppgave " + (oppgavenummer + 1) + " av 10.";
}
//Hege. Gratulasjonsmelding kjem opp, og tabellen med rundestatistikk blir laga. 
function sluttskjerm() {
  document.getElementById("spill").style.display = "none";
  document.getElementById("sluttskjerm").style.display = "inline";

  document.getElementById("gratulasjon").innerHTML = "Gratulerer, " + brukernavn + ", du klarte det! <br> Du fikk " + poeng + " poeng!<br> Her er oppgavene du har løst denne runden:";
  let resultattabellDiv = document.getElementById('resultattabell') //Viser kvar resultattabellen skal skrivast i HTML-dokumentet
  lagRundetabell(rundeListe, resultattabellDiv); //Kallar funksjonen lagRundetabell, med lista over oppgåveobjekta og plasseringa for tabellen som argument. 
  let nyBruker = new Brukere(brukernavn, poeng);
  brukere.push(nyBruker);
  let brukereStringify = JSON.stringify(brukere);
  localStorage.setItem("Brukerliste", brukereStringify);
  document.getElementById("btnStartmeny").style.display = "inline";
}
//Hege. Funksjonen skriv ein tabell inn i HTML-dokumentet, med informasjon frå lista med objekt med oppgåvestatistikk. 
function lagRundetabell(data, plassering_i_HTMLdokumentet) { //Hege og google
  // lagar ei rad med data tilsvarande verdiane lagra i det korresponderande objektet. Lagrast som ein strengvariabel.  
  function lagRad(radNummer) {
    return `<tr><td>${radNummer.oppgavenummer}</td><td>${radNummer.regnestykke}</td><td>${radNummer.fasit}</td><td>${radNummer.feilSvar}</td></tr>`;
  }
  //Set saman dei individuelle rad-strengane til ein lang rad-streng. 
  let rader = rundeListe.reduce(function(rader, rad) {
    return rader + lagRad(rad);
  }, '');
  // set saman tabellen med headerar for dei forskjellige kategoriane, og radene som er generert gjennom lagRad-funksjonen. 
  resultattabell.innerHTML = `<table><thead><tr><td>Nr.</td><td>Oppgave</td><td>Fasit</td><td>Feil svar</td></tr></thead><tbody>${rader}</tbody>`;
}

//Eirin. Vel ei tilfeldig nettside (av de valgte) å sende eleven til.  ** OPPDATERT!!!!!! 
function friminutt() {
  let friminuttRandom = Math.floor(Math.random() * 3); //Gir brukeren en tilfeldig valgt nettside av fire nettsider. 

  if (friminuttRandom == 0) {
    window.open("https://youtu.be/FOgcrNrtfpo", '_blank'); //fra w3schools. Åpner URL i ny fane. Dette er en såkalt "Brain Break" på Youtube.  
  }
  if (friminuttRandom == 1) {
    window.open("https://donothingfor2minutes.com", '_blank'); //Nettside som ber bruker om å ikke gjøre noe i 2 minutter, viser klokke med nedtelling
  }
  if (friminuttRandom == 2) {
    window.open("https://youtu.be/dnwHDN6Dw7Q", '_blank'); // "Brain Break" på Youtube med bevegelser. 
  }
  if (friminuttRandom == 3) {
    window.open("https://youtu.be/cWUfgj9QkZY", 'blank'); //BliMe-dansen 2020. 
  }
}
