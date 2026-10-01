/*
 * think.anas — l'app de bureau.
 *
 * Une seule fenêtre : l'interface de l'app (servie par Next sur localhost) et,
 * posés par-dessus dans la zone que l'interface réserve, les onglets du
 * navigateur à intention. Chaque onglet est une vraie vue Chromium
 * (WebContentsView) : YouTube, sites avec connexion, lecture du texte pour l'IA.
 *
 * Deux règles sont appliquées ici, dans le processus principal, parce qu'une
 * page ne peut pas les contourner : l'étagère de cinq onglets, et le garde-fou
 * qui met en pause les sites hors intention pendant les cours.
 */

import { app, BaseWindow, BrowserWindow, WebContentsView, ipcMain, dialog, nativeImage, Tray, Menu } from "electron";
import { spawn, execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.THINK_ANAS_PORT ?? 3100);
// Peut changer au démarrage : si un serveur de ce projet tourne déjà sur un autre port, on s'y branche
let ORIGINE = `http://localhost:${PORT}`;
const MAX_ONGLETS = 5;
const ICONE_FENETRE = path.join(RACINE, "desktop", "think-anas-sahara.png");
const LANCEUR = path.join(RACINE, "desktop", "think.anas.exe");
const ICONE_EPINGLE = LANCEUR;
const IDENTITE_WINDOWS = "com.thinkanas.desktop";

// À définir avant la création de toute fenêtre pour que Windows ne regroupe pas
// l'application sous l'identité et l'icône génériques d'Electron.
app.name = "think.anas";
if (process.platform === "win32") app.setAppUserModelId(IDENTITE_WINDOWS);

let fenetre = null;
let interfaceVue = null;
let serveur = null;
const onglets = new Map();
let actif = null;
let zone = null;
let regle = { actif: false, domainesAutorises: [], raison: "" };
let compteur = 0;
let iconeZoneNotification = null;
let fermetureDemandee = false;

// ——— Le serveur de l'app ———

function serveurRepond() {
  return new Promise((resoudre) => {
    const requete = http.get(ORIGINE, (reponse) => {
      reponse.resume();
      resoudre(true);
    });
    requete.on("error", () => resoudre(false));
    requete.setTimeout(2000, () => {
      requete.destroy();
      resoudre(false);
    });
  });
}

async function assurerServeur() {
  if (await serveurRepond()) return;
  // Aucun serveur lancé : on démarre celui du projet, et on l'arrêtera en partant.
  // Electron sait jouer le rôle de Node : ni npm ni Node installés ne sont nécessaires,
  // et un double-clic sur le lanceur suffit.
  serveur = spawn(process.execPath, [path.join(RACINE, "node_modules", "next", "dist", "bin", "next"), "dev", "-p", String(PORT)], {
    cwd: RACINE,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  // On écoute le serveur : Next refuse un second serveur de développement pour le même
  // projet et indique l'adresse du premier — on s'y branche au lieu d'attendre en vain.
  let sortie = "";
  let arrete = false;
  const lire = (morceau) => {
    sortie = (sortie + morceau.toString()).slice(-4000);
    const existant = sortie.match(/already running[\s\S]*?Local:\s*(http:\/\/localhost:\d+)/i);
    if (existant) ORIGINE = existant[1];
  };
  serveur.stdout.on("data", lire);
  serveur.stderr.on("data", lire);
  serveur.on("exit", () => {
    arrete = true;
    serveur = null;
  });

  for (let i = 0; i < 180; i++) {
    if (await serveurRepond()) return;
    if (arrete && !/already running/i.test(sortie)) {
      throw new Error(`Le serveur de l'app s'est arrêté au démarrage.\n\n${sortie.slice(-800)}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Le serveur de l'app ne répond pas sur ${ORIGINE}.`);
}

function arreterServeur() {
  if (!serveur?.pid) return;
  if (process.platform === "win32") execFile("taskkill", ["/pid", String(serveur.pid), "/T", "/F"]);
  else serveur.kill("SIGTERM");
  serveur = null;
}

// ——— L'écran d'attente ———

// Au double-clic, quelque chose doit apparaître tout de suite, même si le serveur met
// quelques secondes à répondre : un petit écran au logo, fermé dès que l'app est prête.
let ecranDAttente = null;

function pageDAttente() {
  let logo = "";
  try {
    logo = readFileSync(path.join(RACINE, "app", "icon.svg"), "utf8");
  } catch {
    // sans logo, l'écran reste lisible
  }
  return `<!doctype html><meta charset="utf-8"><title>think.anas</title><style>
    html, body { margin: 0; height: 100%; background: #050a1f; color: #e8ecff; font-family: "Segoe UI", system-ui, sans-serif; user-select: none; -webkit-app-region: drag }
    body { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px }
    .logo svg { width: 64px; height: 64px; display: block }
    h1 { margin: 0; font-size: 17px; font-weight: 600 }
    p { margin: 0; font-size: 12px; color: #8e9ac2 }
    .barre { width: 180px; height: 3px; border-radius: 3px; background: #16204a; overflow: hidden }
    .barre i { display: block; width: 40%; height: 100%; border-radius: 3px; background: linear-gradient(90deg, #12d6ff, #1d4ff2); animation: va 1.3s ease-in-out infinite }
    @keyframes va { from { transform: translateX(-100%) } to { transform: translateX(260%) } }
  </style><div class="logo">${logo}</div><h1>think.anas démarre…</h1><div class="barre"><i></i></div><p>L’app se prépare, quelques secondes.</p>`;
}

function ouvrirEcranDAttente() {
  ecranDAttente = new BrowserWindow({
    width: 420,
    height: 260,
    frame: false,
    resizable: false,
    center: true,
    backgroundColor: "#050a1f",
    icon: nativeImage.createFromPath(ICONE_FENETRE),
    webPreferences: { sandbox: true, contextIsolation: true },
  });
  ecranDAttente.on("closed", () => {
    ecranDAttente = null;
  });
  void ecranDAttente.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(pageDAttente())}`);
}

function fermerEcranDAttente() {
  if (ecranDAttente && !ecranDAttente.isDestroyed()) ecranDAttente.destroy();
  ecranDAttente = null;
}

// ——— Les onglets ———

/** Une adresse, un domaine nu, ou une recherche */
function versUrl(saisie) {
  const s = String(saisie ?? "").trim();
  if (!s) return "about:blank";
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/.test(s)) return `https://${s}`;
  return `https://www.google.com/search?q=${encodeURIComponent(s)}`;
}

function domaine(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function autorise(url) {
  if (!regle.actif || url === "about:blank") return true;
  const d = domaine(url);
  return regle.domainesAutorises.some((a) => d === a || d.endsWith(`.${a}`));
}

function signaler(canal, ...args) {
  interfaceVue?.webContents.send(canal, ...args);
}

function bloquer(url, raison) {
  signaler("navigateur:blocage", { url, raison });
}

function infosOnglets() {
  return [...onglets.entries()].map(([id, vue]) => {
    const wc = vue.webContents;
    const historique = wc.navigationHistory;
    return {
      id,
      url: wc.getURL(),
      titre: wc.getTitle() || domaine(wc.getURL()) || "Nouvel onglet",
      chargement: wc.isLoading(),
      peutReculer: historique?.canGoBack() ?? false,
      peutAvancer: historique?.canGoForward() ?? false,
    };
  });
}

function diffuser() {
  signaler("navigateur:onglets", infosOnglets(), actif);
}

/** Seul l'onglet actif est visible, dans la zone réservée par l'interface */
function placer() {
  for (const [id, vue] of onglets) {
    const visible = id === actif && zone !== null && zone.width > 0 && zone.height > 0;
    vue.setVisible(visible);
    if (visible) vue.setBounds(zone);
  }
}

function brancher(vue) {
  const wc = vue.webContents;
  const garde = (evenement, url) => {
    const cible = url ?? evenement.url;
    if (!autorise(cible)) {
      evenement.preventDefault();
      bloquer(cible, regle.raison);
    }
  };
  wc.on("will-navigate", garde);
  wc.on("will-redirect", garde);
  // Un lien « nouvel onglet » passe par l'étagère, et donc par sa limite
  wc.setWindowOpenHandler(({ url }) => {
    try {
      ouvrirOnglet(url);
    } catch (e) {
      bloquer(url, e.message);
    }
    return { action: "deny" };
  });
  for (const evenement of ["page-title-updated", "did-start-loading", "did-stop-loading", "did-navigate", "did-navigate-in-page"]) {
    wc.on(evenement, diffuser);
  }
}

function ouvrirOnglet(saisie) {
  if (onglets.size >= MAX_ONGLETS) {
    throw new Error("L'étagère est pleine : retenez l'essentiel d'un onglet et fermez-le avant d'en ouvrir un autre.");
  }
  const url = versUrl(saisie);
  const id = `onglet-${++compteur}`;
  const vue = new WebContentsView({
    // Session persistante : vos connexions (YouTube, etc.) survivent au redémarrage
    webPreferences: { partition: "persist:navigateur", sandbox: true, contextIsolation: true },
  });
  vue.setBackgroundColor("#ffffff");
  fenetre.contentView.addChildView(vue);
  brancher(vue);
  onglets.set(id, vue);
  actif = id;
  if (autorise(url)) void vue.webContents.loadURL(url);
  else bloquer(url, regle.raison);
  placer();
  diffuser();
  return id;
}

function fermerOnglet(id) {
  const vue = onglets.get(id);
  if (!vue) return;
  fenetre.contentView.removeChildView(vue);
  vue.webContents.close();
  onglets.delete(id);
  if (actif === id) actif = [...onglets.keys()].at(-1) ?? null;
  placer();
  diffuser();
}

// ——— Le pont avec l'interface ———

/** Seule l'interface de l'app peut piloter le navigateur, jamais une page ouverte dans un onglet */
function gerer(canal, traitement) {
  ipcMain.handle(`navigateur:${canal}`, (evenement, ...args) => {
    if (evenement.sender !== interfaceVue?.webContents) throw new Error("Expéditeur non autorisé");
    return traitement(...args);
  });
}

function gererDonnees(canal, traitement) {
  ipcMain.handle(`donnees:${canal}`, (evenement, ...args) => {
    if (evenement.sender !== interfaceVue?.webContents) throw new Error("Expéditeur non autorisé");
    return traitement(...args);
  });
}

function cheminEtat() {
  return path.join(app.getPath("userData"), "donnees", "etat.json");
}

gererDonnees("sauvegarder", async (etat) => {
  const cible = cheminEtat();
  const temporaire = `${cible}.tmp`;
  await mkdir(path.dirname(cible), { recursive: true });
  await writeFile(temporaire, JSON.stringify(etat), "utf8");
  await rename(temporaire, cible);
});

gererDonnees("charger", async () => {
  try {
    return JSON.parse(await readFile(cheminEtat(), "utf8"));
  } catch (erreur) {
    if (erreur?.code === "ENOENT") return null;
    throw erreur;
  }
});

gerer("etat", () => ({ onglets: infosOnglets(), actif, max: MAX_ONGLETS }));
gerer("ouvrir", (url) => ouvrirOnglet(url));
gerer("fermer", (id) => fermerOnglet(id));
gerer("activer", (id) => {
  if (!onglets.has(id)) return;
  actif = id;
  placer();
  diffuser();
});
gerer("aller", (id, saisie) => {
  const vue = onglets.get(id);
  if (!vue) return;
  const url = versUrl(saisie);
  if (!autorise(url)) return bloquer(url, regle.raison);
  void vue.webContents.loadURL(url);
});
gerer("reculer", (id) => onglets.get(id)?.webContents.navigationHistory.goBack());
gerer("avancer", (id) => onglets.get(id)?.webContents.navigationHistory.goForward());
gerer("recharger", (id) => onglets.get(id)?.webContents.reload());
gerer("zone", (b) => {
  zone = b
    ? {
        x: Math.round(b.x),
        y: Math.round(b.y),
        width: Math.max(0, Math.round(b.width)),
        height: Math.max(0, Math.round(b.height)),
      }
    : null;
  placer();
});
gerer("lire", async (id) => {
  const wc = onglets.get(id)?.webContents;
  if (!wc) throw new Error("Onglet introuvable");
  const texte = await wc.executeJavaScript(
    `(() => {
      const racine = document.querySelector("article, main, [role=main]") || document.body;
      return (racine ? racine.innerText : "").replace(/\\n{3,}/g, "\\n\\n").slice(0, 60000);
    })()`,
    true
  );
  return { titre: wc.getTitle(), url: wc.getURL(), texte };
});
gerer("garde-fou", (r) => {
  regle = {
    actif: Boolean(r?.actif),
    domainesAutorises: Array.isArray(r?.domainesAutorises) ? r.domainesAutorises.map(String) : [],
    raison: String(r?.raison ?? ""),
  };
});

// ——— La fenêtre ———

async function creerFenetre() {
  fenetre = new BaseWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: "think.anas",
    icon: nativeImage.createFromPath(ICONE_FENETRE),
    backgroundColor: "#ffffff",
    autoHideMenuBar: true,
    show: false,
  });

  interfaceVue = new WebContentsView({
    webPreferences: {
      preload: path.join(RACINE, "desktop", "preload.cjs"),
      sandbox: true,
      contextIsolation: true,
      backgroundThrottling: false,
    },
  });
  fenetre.contentView.addChildView(interfaceVue);
  fenetre.setIcon(nativeImage.createFromPath(ICONE_FENETRE));
  if (process.platform === "win32") {
    fenetre.setAppDetails({
      appId: IDENTITE_WINDOWS,
      appIconPath: ICONE_EPINGLE,
      appIconIndex: 0,
      relaunchCommand: `"${LANCEUR}"`,
      relaunchDisplayName: "think.anas",
    });
  }

  const ajuster = () => {
    const { width, height } = fenetre.getContentBounds();
    interfaceVue.setBounds({ x: 0, y: 0, width, height });
    placer();
  };
  fenetre.on("resize", ajuster);
  ajuster();

  const wc = interfaceVue.webContents;
  // Un lien externe cliqué dans l'app s'ouvre dans l'étagère, pas dans un autre navigateur
  const versEtagere = (url) => {
    try {
      ouvrirOnglet(url);
    } catch (e) {
      bloquer(url, e.message);
    }
  };
  wc.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(ORIGINE)) versEtagere(url);
    return { action: "deny" };
  });
  wc.on("will-navigate", (evenement, url) => {
    const cible = url ?? evenement.url;
    if (!cible.startsWith(ORIGINE)) {
      evenement.preventDefault();
      versEtagere(cible);
    }
  });

  fenetre.on("closed", () => {
    fenetre = null;
    interfaceVue = null;
    onglets.clear();
  });
  fenetre.on("close", (evenement) => {
    if (fermetureDemandee || process.env.THINK_ANAS_ESSAI) return;
    evenement.preventDefault();
    fenetre.hide();
  });

  await wc.loadURL(`${ORIGINE}/objectifs/navigateur`);
  // La fenêtre n'apparaît qu'une fois l'interface chargée : pas d'écran blanc entre les deux
  fenetre.show();
  fermerEcranDAttente();

  if (process.env.THINK_ANAS_ESSAI) void essaiAutomatique(process.env.THINK_ANAS_ESSAI);
}

function creerZoneNotification() {
  if (iconeZoneNotification) return;
  iconeZoneNotification = new Tray(nativeImage.createFromPath(ICONE_FENETRE));
  iconeZoneNotification.setToolTip("think.anas — votre tableau de bord quotidien");
  const afficher = () => {
    if (!fenetre) return;
    fenetre.show();
    fenetre.focus();
  };
  iconeZoneNotification.on("click", afficher);
  iconeZoneNotification.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Ouvrir think.anas", click: afficher },
      { type: "separator" },
      {
        label: "Quitter",
        click: () => {
          fermetureDemandee = true;
          app.quit();
        },
      },
    ])
  );
}

/**
 * Essai de bout en bout, sans intervention : ouvre un onglet, lit son texte,
 * capture l'interface et l'onglet dans le dossier indiqué, puis quitte.
 * THINK_ANAS_ESSAI=<dossier> npm run desktop
 */
async function essaiAutomatique(dossier) {
  const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
  const rapport = { etapes: [] };
  try {
    await attendre(5000);
    zone = { x: 320, y: 180, width: 820, height: 560 };
    const id = ouvrirOnglet("https://example.com");
    rapport.etapes.push("onglet ouvert");
    await attendre(6000);
    const vue = onglets.get(id);
    rapport.texte = await vue.webContents.executeJavaScript("document.body.innerText.slice(0, 160)", true);
    rapport.onglets = infosOnglets();
    for (let i = 0; i < MAX_ONGLETS; i++) {
      try {
        ouvrirOnglet("about:blank");
      } catch (e) {
        rapport.etagere = e.message;
        break;
      }
    }
    rapport.nombreOnglets = onglets.size;
    regle = { actif: true, domainesAutorises: ["example.com"], raison: "Cours en cours" };
    rapport.gardeFouAutoriseExample = autorise("https://example.com/page");
    rapport.gardeFouBloqueYoutube = !autorise("https://www.youtube.com/");
    await writeFile(path.join(dossier, "desktop-interface.png"), (await interfaceVue.webContents.capturePage()).toPNG());
    await writeFile(path.join(dossier, "desktop-onglet.png"), (await vue.webContents.capturePage()).toPNG());
    rapport.etapes.push("captures écrites");
  } catch (e) {
    rapport.erreur = e instanceof Error ? e.message : String(e);
  }
  console.log(`ESSAI_THINK_ANAS ${JSON.stringify(rapport)}`);
  arreterServeur();
  app.quit();
}

// ——— Le cycle de vie ———

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!fenetre) return;
    if (fenetre.isMinimized()) fenetre.restore();
    fenetre.show();
    fenetre.focus();
  });

  app.whenReady().then(async () => {
    // Regroupe les fenêtres sous l'icône de think.anas dans la barre des tâches
    ouvrirEcranDAttente();
    try {
      await assurerServeur();
      await creerFenetre();
      creerZoneNotification();
    } catch (e) {
      fermerEcranDAttente();
      dialog.showErrorBox("think.anas", e instanceof Error ? e.message : String(e));
      arreterServeur();
      app.quit();
    }
  });

  app.on("window-all-closed", () => {
    // Fermer l'écran d'attente pour laisser place à la fenêtre ne doit pas quitter l'app
    if (fenetre) return;
    arreterServeur();
    app.quit();
  });

  app.on("before-quit", () => {
    fermetureDemandee = true;
    arreterServeur();
  });
}
