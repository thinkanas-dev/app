import type { Prieres } from "@/content/emploi-du-temps";

/**
 * Horaires de prière calculés sur place, pour n'importe quelle date : une
 * semaine importée n'a pas de tableau d'horaires tout fait.
 *
 * Calcul astronomique classique (position du soleil, formules NOAA) pour
 * Casablanca, avec les angles de référence au Maroc : Fajr 19°, Isha 17°, Asr
 * à une longueur d'ombre. Les marges fixes ont été calées sur namazvakti
 * (Bourgogne) du 13 au 19 septembre 2026, puis vérifiées sur les 23 autres
 * jours du mois : écart maximal d'une minute, celui de l'arrondi.
 *
 * Limites connues : vérifié sur septembre seulement — la durée de l'aube change
 * avec les saisons, à recontrôler en hiver. Le passage du Maroc à UTC+0 pendant
 * le ramadan n'est pas pris en compte.
 */

const LATITUDE = 33.596;
const LONGITUDE = -7.638;
/** Maroc : UTC+1 toute l'année, hors ramadan */
const FUSEAU_MINUTES = 60;

const ANGLE_FAJR = 19;
const ANGLE_ISHA = 17;
const HORIZON = 0.833;

/** Marges constantes observées sur la source, en minutes */
const MARGES: Record<keyof Prieres, number> = {
  fajr: 6.55,
  shuruq: -4.65,
  dhuhr: 8.47,
  asr: 7.69,
  maghrib: 4.88,
  isha: 6.4,
};

const RAD = Math.PI / 180;

function positionDuSoleil(date: Date) {
  const debutAnnee = new Date(date.getFullYear(), 0, 1).getTime();
  const ceJour = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  // Arrondi : absorbe une éventuelle heure d'été du fuseau du navigateur
  const jour = Math.round((ceJour - debutAnnee) / 86_400_000);
  const g = ((2 * Math.PI) / 365) * jour;

  const equationDuTemps =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.040849 * Math.sin(2 * g));

  const declinaison =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);

  return { equationDuTemps, declinaison };
}

function enHHMM(minutes: number): string {
  const t = Math.round(minutes);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

export function horairesPriere(date: Date): Prieres {
  const { equationDuTemps, declinaison } = positionDuSoleil(date);
  const phi = LATITUDE * RAD;
  const midiSolaire = 720 - 4 * LONGITUDE - equationDuTemps + FUSEAU_MINUTES;

  /** Minutes entre le midi solaire et le moment où le soleil passe à cette altitude */
  const ecart = (altitude: number) => {
    const c =
      (Math.sin(altitude * RAD) - Math.sin(phi) * Math.sin(declinaison)) /
      (Math.cos(phi) * Math.cos(declinaison));
    return (Math.acos(Math.max(-1, Math.min(1, c))) / RAD) * 4;
  };

  const altitudeAsr = Math.atan(1 / (1 + Math.tan(Math.abs(phi - declinaison)))) / RAD;

  const brut: Record<keyof Prieres, number> = {
    fajr: midiSolaire - ecart(-ANGLE_FAJR),
    shuruq: midiSolaire - ecart(-HORIZON),
    dhuhr: midiSolaire,
    asr: midiSolaire + ecart(altitudeAsr),
    maghrib: midiSolaire + ecart(-HORIZON),
    isha: midiSolaire + ecart(-ANGLE_ISHA),
  };

  return {
    fajr: enHHMM(brut.fajr + MARGES.fajr),
    shuruq: enHHMM(brut.shuruq + MARGES.shuruq),
    dhuhr: enHHMM(brut.dhuhr + MARGES.dhuhr),
    asr: enHHMM(brut.asr + MARGES.asr),
    maghrib: enHHMM(brut.maghrib + MARGES.maghrib),
    isha: enHHMM(brut.isha + MARGES.isha),
  };
}
