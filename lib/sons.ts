import type { NatureMoment } from "./fil-du-jour";

/*
 * Signatures sonores du fil du jour : chaque nature de moment a sa propre
 * petite phrase, synthétisée à la volée — aucun fichier audio à charger.
 * Volume bas et notes courtes : un signal qui se reconnaît, pas une alarme.
 */

type Note = { freq: number; debut: number; duree: number; forme?: OscillatorType; volume?: number };

const SIGNATURES: Record<string, Note[]> = {
  // Une cloche grave qui résonne longtemps
  priere: [
    { freq: 220, debut: 0, duree: 2.6, forme: "sine", volume: 0.3 },
    { freq: 330, debut: 0, duree: 2.1, forme: "sine", volume: 0.1 },
    { freq: 440, debut: 0.02, duree: 1.6, forme: "sine", volume: 0.05 },
  ],
  // Trois notes qui montent : le jour s'ouvre
  rituel: [
    { freq: 523.25, debut: 0, duree: 0.5 },
    { freq: 659.25, debut: 0.16, duree: 0.5 },
    { freq: 783.99, debut: 0.32, duree: 0.9 },
  ],
  // Deux tics nets : on entre en cours
  seance: [
    { freq: 1318.5, debut: 0, duree: 0.08, forme: "square", volume: 0.04 },
    { freq: 1318.5, debut: 0.14, duree: 0.08, forme: "square", volume: 0.04 },
  ],
  // Un bourdon chaud qui s'installe
  hizb: [
    { freq: 196, debut: 0, duree: 1.8, forme: "sine", volume: 0.22 },
    { freq: 293.66, debut: 0.25, duree: 1.5, forme: "sine", volume: 0.1 },
  ],
  // Un aller-retour : on repasse sur ce qu'on a vu
  revision: [
    { freq: 659.25, debut: 0, duree: 0.3 },
    { freq: 587.33, debut: 0.18, duree: 0.3 },
    { freq: 659.25, debut: 0.36, duree: 0.5 },
  ],
  // Un arpège vif : on crée
  formation: [
    { freq: 392, debut: 0, duree: 0.2 },
    { freq: 493.88, debut: 0.1, duree: 0.2 },
    { freq: 587.33, debut: 0.2, duree: 0.2 },
    { freq: 783.99, debut: 0.3, duree: 0.6 },
  ],
  // Un accord posé : on fait les comptes
  bilan: [
    { freq: 523.25, debut: 0, duree: 1.1, volume: 0.08 },
    { freq: 659.25, debut: 0, duree: 1.1, volume: 0.08 },
    { freq: 783.99, debut: 0, duree: 1.1, volume: 0.08 },
  ],
  // Une note douce : on respire
  pause: [{ freq: 523.25, debut: 0, duree: 0.7, forme: "sine", volume: 0.18 }],
  // Deux notes qui descendent lentement : la journée s'éteint
  nuit: [
    { freq: 392, debut: 0, duree: 1, forme: "sine", volume: 0.16 },
    { freq: 261.63, debut: 0.5, duree: 1.5, forme: "sine", volume: 0.16 },
  ],
};

const FAMILLE: Partial<Record<NatureMoment, string>> = {
  repas: "pause",
  preparation: "pause",
  "temps-libre": "pause",
  libre: "pause",
  "a-confirmer": "seance",
};

export function jouerSignature(contexte: AudioContext, nature: NatureMoment) {
  const notes = SIGNATURES[FAMILLE[nature] ?? nature] ?? SIGNATURES.pause;
  const depart = contexte.currentTime + 0.02;

  for (const n of notes) {
    const oscillateur = contexte.createOscillator();
    const enveloppe = contexte.createGain();
    oscillateur.type = n.forme ?? "triangle";
    oscillateur.frequency.value = n.freq;

    const debut = depart + n.debut;
    const fin = debut + n.duree;
    enveloppe.gain.setValueAtTime(0.0001, debut);
    enveloppe.gain.exponentialRampToValueAtTime(n.volume ?? 0.13, debut + 0.015);
    enveloppe.gain.exponentialRampToValueAtTime(0.0001, fin);

    oscillateur.connect(enveloppe);
    enveloppe.connect(contexte.destination);
    oscillateur.start(debut);
    oscillateur.stop(fin + 0.05);
  }
}
