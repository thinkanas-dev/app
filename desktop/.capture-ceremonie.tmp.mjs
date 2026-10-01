// Capture hors écran de la cérémonie : la veille, puis le spectacle acte par acte
import { app, BrowserWindow } from "electron";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const DOSSIER = process.env.CAPTURE_DOSSIER;
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

async function capturer(fenetre, nom) {
  const image = await fenetre.webContents.capturePage();
  await writeFile(path.join(DOSSIER, `ceremonie-${nom}.png`), image.resize({ width: 800 }).toPNG());
  console.log("capture", nom);
}

app.whenReady().then(async () => {
  const fenetre = new BrowserWindow({ width: 1280, height: 800, show: false, webPreferences: { offscreen: true } });
  fenetre.webContents.setFrameRate(30);
  try {
    // 1. La vraie veille, telle qu'elle s'ouvre en entrant dans l'app
    await fenetre.loadURL("http://localhost:3100/objectifs");
    await attendre(9000);
    await capturer(fenetre, "0-veille");

    // 2. Une niyya scellée, puis la répétition : départ dans 3 secondes
    await fenetre.webContents.executeJavaScript(
      `localStorage.setItem("think-anas-niyya", JSON.stringify({ texte: "Devenir rigoureux, apprendre chaque jour, rester fidèle à Fajr.", scelleLe: new Date().toISOString() })); true`
    );
    await fenetre.loadURL("http://localhost:3100/objectifs?ceremonie=dans-3");
    await attendre(8000);
    await capturer(fenetre, "1-allumage");

    await fenetre.webContents.executeJavaScript(
      `document.querySelector(".allumeur")?.dispatchEvent(new AnimationEvent("animationend", { animationName: "allumeur-charge", bubbles: true })); true`
    );
    const reperes = [
      [4500, "2-modules"],
      [13600, "3-coran"],
      [17600, "4-berline"],
      [21800, "5-tour"],
      [34600, "6-basmala"],
      [43000, "7-niyya"],
      [50600, "8-jours"],
      [61000, "9-finale"],
    ];
    let ecoule = 0;
    for (const [instant, nom] of reperes) {
      await attendre(instant - ecoule);
      ecoule = instant;
      await capturer(fenetre, nom);
    }
    await fenetre.webContents.executeJavaScript(`localStorage.removeItem("think-anas-niyya"); true`);
  } catch (e) {
    console.log("ERREUR", e instanceof Error ? e.message : String(e));
  }
  app.quit();
});
