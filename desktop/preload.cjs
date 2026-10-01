/*
 * Le pont entre l'interface de think.anas et le navigateur de l'app de bureau.
 *
 * Exposé sous window.thinkAnas, uniquement dans la vue de l'interface : les
 * pages ouvertes dans les onglets n'y ont pas accès. Absent dans un navigateur
 * ordinaire — c'est ainsi que l'app sait si elle tourne en version bureau.
 */

const { contextBridge, ipcRenderer } = require("electron");

const appel = (canal, ...args) => ipcRenderer.invoke(`navigateur:${canal}`, ...args);
const appelDonnees = (canal, ...args) => ipcRenderer.invoke(`donnees:${canal}`, ...args);

function ecouter(canal, rappel) {
  const auditeur = (_evenement, ...args) => rappel(...args);
  ipcRenderer.on(canal, auditeur);
  return () => ipcRenderer.removeListener(canal, auditeur);
}

contextBridge.exposeInMainWorld("thinkAnas", {
  version: "1",
  navigateur: {
    etat: () => appel("etat"),
    ouvrir: (url) => appel("ouvrir", url),
    fermer: (id) => appel("fermer", id),
    activer: (id) => appel("activer", id),
    aller: (id, url) => appel("aller", id, url),
    reculer: (id) => appel("reculer", id),
    avancer: (id) => appel("avancer", id),
    recharger: (id) => appel("recharger", id),
    zone: (bornes) => appel("zone", bornes),
    lireTexte: (id) => appel("lire", id),
    gardeFou: (regle) => appel("garde-fou", regle),
    surOnglets: (rappel) => ecouter("navigateur:onglets", rappel),
    surBlocage: (rappel) => ecouter("navigateur:blocage", rappel),
  },
  donnees: {
    sauvegarder: (etat) => appelDonnees("sauvegarder", etat),
    charger: () => appelDonnees("charger"),
  },
});
