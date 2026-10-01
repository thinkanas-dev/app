/*
 * Le moteur du feu d'artifice : fusées, bouquets, et dessin en lumière.
 *
 * Tout est peint sur une toile en mode additif (les couleurs s'ajoutent comme de
 * la lumière). Chaque bouquet a sa géométrie — pivoine, étoile de zellige à huit
 * branches, saule d'or, croissant, anneau en perspective, crépitant. Une fusée
 * peut porter une étiquette (le nom d'un module) et un nombre d'étoiles
 * maîtresses (ses séances). `ecrire`, `dessinerSvg` et `rassemblerJours`
 * guident des centaines de particules vers une forme — un mot, un pictogramme,
 * une étoile —, la tiennent en l'air, puis la laissent retomber en poussière.
 */

export type StyleBouquet = "pivoine" | "zellige" | "saule" | "croissant" | "anneau" | "crepitant";

export const PALETTES = {
  or: ["#fff4d6", "#ffd27a", "#f2b24d"],
  zellige: ["#2dd4a8", "#4f8cff", "#f2c14e", "#ffffff"],
  majorelle: ["#6b8cff", "#a5b8ff", "#fff27a"],
  braise: ["#ff8a5c", "#ffd0a8", "#ff5f6d"],
  argent: ["#ffffff", "#dfe8ff", "#b9c8ff"],
} as const;

type Palette = readonly string[];
type Point = [number, number];

type Cible = { x0: number; y0: number; x: number; y: number; depart: number; vol: number; relache: number };

type Particule = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  vie: number;
  vieMax: number;
  couleur: string;
  taille: number;
  frottement: number;
  gravite: number;
  traine: number[];
  longueurTraine: number;
  scintille: boolean;
  seBrise: boolean;
  cible: Cible | null;
};

type Fusee = {
  x: number;
  y: number;
  vy: number;
  style: StyleBouquet;
  palette: Palette;
  traine: number[];
  etiquette?: string;
  nombre?: number;
};

type Etiquette = { texte: string; x: number; y: number; vie: number; vieMax: number; couleur: string; taille: number };

const GRAVITE_FUSEE = 0.11;
const MAX_PARTICULES = 3600;

const au = <T,>(liste: readonly T[]) => liste[Math.floor(Math.random() * liste.length)];

function echantillonner(c: CanvasRenderingContext2D, largeur: number, hauteur: number, pas: number, max: number): Point[] {
  const donnees = c.getImageData(0, 0, largeur, hauteur).data;
  const points: Point[] = [];
  for (let y = 0; y < hauteur; y += pas) {
    for (let x = 0; x < largeur; x += pas) {
      if (donnees[(y * largeur + x) * 4 + 3] > 130) points.push([x, y]);
    }
  }
  if (points.length <= max) return points;
  const saut = Math.ceil(points.length / max);
  return points.filter((_, i) => i % saut === 0);
}

export class SonFeux {
  private contexte: AudioContext;
  private sortie: GainNode;
  private bruit: AudioBuffer;
  private muet = false;

  constructor() {
    this.contexte = new AudioContext();
    const compresseur = this.contexte.createDynamicsCompressor();
    this.sortie = this.contexte.createGain();
    this.sortie.gain.value = 0.55;
    this.sortie.connect(compresseur);
    compresseur.connect(this.contexte.destination);
    const duree = 2 * this.contexte.sampleRate;
    this.bruit = this.contexte.createBuffer(1, duree, this.contexte.sampleRate);
    const canal = this.bruit.getChannelData(0);
    for (let i = 0; i < duree; i++) canal[i] = Math.random() * 2 - 1;
  }

  get etat() {
    return this.contexte.state;
  }

  surChangement(rappel: () => void) {
    this.contexte.addEventListener("statechange", rappel);
    return () => this.contexte.removeEventListener("statechange", rappel);
  }

  reprendre() {
    return this.contexte.resume();
  }

  couper(muet: boolean) {
    this.muet = muet;
    this.sortie.gain.setTargetAtTime(muet ? 0 : 0.55, this.contexte.currentTime, 0.05);
  }

  private disponible() {
    return this.contexte.state === "running" && !this.muet;
  }

  private bruitFiltre(type: BiquadFilterType, frequence: number, debut: number, duree: number, volume: number) {
    const source = this.contexte.createBufferSource();
    source.buffer = this.bruit;
    const filtre = this.contexte.createBiquadFilter();
    filtre.type = type;
    filtre.frequency.value = frequence;
    const gain = this.contexte.createGain();
    gain.gain.setValueAtTime(volume, debut);
    gain.gain.exponentialRampToValueAtTime(0.0001, debut + duree);
    source.connect(filtre).connect(gain).connect(this.sortie);
    source.start(debut, Math.random() * 1.5);
    source.stop(debut + duree + 0.02);
    return filtre;
  }

  sifflet() {
    if (!this.disponible()) return;
    const t = this.contexte.currentTime;
    const osc = this.contexte.createOscillator();
    const gain = this.contexte.createGain();
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(1500 + Math.random() * 400, t + 1);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.03, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.05);
    osc.connect(gain).connect(this.sortie);
    osc.start(t);
    osc.stop(t + 1.1);
  }

  boom(force = 1) {
    if (!this.disponible()) return;
    const t = this.contexte.currentTime;
    const filtre = this.bruitFiltre("lowpass", 1100, t, 1.5, 0.9 * force);
    filtre.frequency.setValueAtTime(1100, t);
    filtre.frequency.exponentialRampToValueAtTime(140, t + 1.2);
    const grave = this.contexte.createOscillator();
    const gainGrave = this.contexte.createGain();
    grave.frequency.setValueAtTime(62, t);
    grave.frequency.exponentialRampToValueAtTime(34, t + 0.6);
    gainGrave.gain.setValueAtTime(0.55 * force, t);
    gainGrave.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    grave.connect(gainGrave).connect(this.sortie);
    grave.start(t);
    grave.stop(t + 0.75);
  }

  crepitement(intensite = 26) {
    if (!this.disponible()) return;
    const t0 = this.contexte.currentTime + 0.2;
    for (let i = 0; i < intensite; i++) this.bruitFiltre("highpass", 2600, t0 + Math.random() * 0.9, 0.03, 0.22);
  }

  /** La mèche qui grésille : quelques craquements discrets */
  meche() {
    if (!this.disponible()) return;
    const t0 = this.contexte.currentTime;
    for (let i = 0; i < 6; i++) this.bruitFiltre("bandpass", 3800, t0 + Math.random() * 0.9, 0.02, 0.08);
  }

  tic(fort: boolean) {
    if (!this.disponible()) return;
    const t = this.contexte.currentTime;
    const osc = this.contexte.createOscillator();
    const gain = this.contexte.createGain();
    osc.frequency.value = fort ? 1320 : 880;
    gain.gain.setValueAtTime(fort ? 0.16 : 0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    osc.connect(gain).connect(this.sortie);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  fermer() {
    void this.contexte.close().catch(() => undefined);
  }
}

export class Feux {
  private ctx: CanvasRenderingContext2D;
  private particules: Particule[] = [];
  private fusees: Fusee[] = [];
  private etiquettes: Etiquette[] = [];
  private largeur = 0;
  private hauteur = 0;
  private image = 0;
  private dernier = 0;
  private detruit = false;

  constructor(
    private toile: HTMLCanvasElement,
    private son: SonFeux | null,
    private police: string
  ) {
    const ctx = toile.getContext("2d");
    if (!ctx) throw new Error("toile indisponible");
    this.ctx = ctx;
    this.ajuster();
    window.addEventListener("resize", this.ajuster);
    this.dernier = performance.now();
    this.image = requestAnimationFrame(this.boucle);
  }

  get dimensions() {
    return { largeur: this.largeur, hauteur: this.hauteur };
  }

  detruire() {
    this.detruit = true;
    cancelAnimationFrame(this.image);
    window.removeEventListener("resize", this.ajuster);
    this.particules = [];
    this.fusees = [];
    this.etiquettes = [];
  }

  private ajuster = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    this.largeur = this.toile.clientWidth;
    this.hauteur = this.toile.clientHeight;
    this.toile.width = Math.round(this.largeur * dpr);
    this.toile.height = Math.round(this.hauteur * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  /** Une fusée monte depuis le bas et éclate à la hauteur demandée (proportions de l'écran) */
  tirer(style: StyleBouquet, xr: number, yr: number, palette: Palette, options: { etiquette?: string; nombre?: number } = {}) {
    const distance = this.hauteur + 10 - yr * this.hauteur;
    this.fusees.push({
      x: xr * this.largeur + (Math.random() - 0.5) * 24,
      y: this.hauteur + 10,
      vy: -Math.sqrt(2 * GRAVITE_FUSEE * distance),
      style,
      palette,
      traine: [],
      ...options,
    });
    this.son?.sifflet();
  }

  private ajouter(p: Omit<Particule, "traine" | "cible" | "seBrise" | "scintille" | "longueurTraine"> & Partial<Particule>) {
    if (this.particules.length >= MAX_PARTICULES) return;
    this.particules.push({ traine: [], cible: null, seBrise: false, scintille: false, longueurTraine: 5, ...p });
  }

  private eclater(f: Fusee) {
    const { x, y, style, palette } = f;
    const echelle = Math.min(1.25, Math.max(0.7, this.largeur / 1200));
    this.son?.boom(style === "saule" ? 0.7 : 1);

    if (style === "pivoine") {
      for (let i = 0; i < 110; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = (0.55 + Math.random() * 0.45) * 4.4 * echelle;
        this.ajouter({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vie: 1500 + Math.random() * 500, vieMax: 1900, couleur: au(palette), taille: 2, frottement: 0.984, gravite: 0.045 });
      }
    } else if (style === "zellige") {
      const rotation = Math.random() * Math.PI;
      const sommets = Array.from({ length: 16 }, (_, k) => {
        const r = k % 2 === 0 ? 1 : 0.42;
        const a = (k * Math.PI) / 8 + rotation;
        return [Math.cos(a) * r, Math.sin(a) * r];
      });
      for (let k = 0; k < 16; k++) {
        const [ax, ay] = sommets[k];
        const [bx, by] = sommets[(k + 1) % 16];
        const couleur = palette[Math.floor(k / 2) % palette.length];
        for (let s = 0; s < 11; s++) {
          const t = s / 11;
          const v = 5 * echelle;
          this.ajouter({ x, y, vx: (ax + (bx - ax) * t) * v, vy: (ay + (by - ay) * t) * v, vie: 1700, vieMax: 1700, couleur, taille: 1.9, frottement: 0.972, gravite: 0.018 });
        }
      }
    } else if (style === "saule") {
      for (let i = 0; i < 80; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = (1.4 + Math.random() * 1.3) * echelle;
        this.ajouter({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.6, vie: 3000 + Math.random() * 800, vieMax: 3800, couleur: au(PALETTES.or), taille: 1.5, frottement: 0.991, gravite: 0.028, longueurTraine: 16, scintille: true });
      }
    } else if (style === "croissant") {
      let places = 0;
      for (let essai = 0; essai < 600 && places < 170; essai++) {
        const a = Math.random() * Math.PI * 2;
        const r = 0.82 + Math.random() * 0.18;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if ((px - 0.42) ** 2 + (py + 0.12) ** 2 < 0.78) continue;
        const v = 4.4 * echelle;
        this.ajouter({ x, y, vx: px * v, vy: py * v, vie: 1800, vieMax: 1800, couleur: au(palette), taille: 1.9, frottement: 0.974, gravite: 0.016 });
        places++;
      }
    } else if (style === "anneau") {
      for (let i = 0; i < 96; i++) {
        const a = (i / 96) * Math.PI * 2;
        const v = 4.6 * echelle;
        this.ajouter({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v * 0.55, vie: 1600, vieMax: 1600, couleur: palette[0], taille: 2, frottement: 0.978, gravite: 0.025 });
      }
    } else {
      for (let i = 0; i < 70; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = (0.5 + Math.random() * 0.5) * 3.8 * echelle;
        this.ajouter({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vie: 900 + Math.random() * 300, vieMax: 1200, couleur: au(palette), taille: 2, frottement: 0.98, gravite: 0.04, seBrise: true });
      }
      this.son?.crepitement();
    }

    // Les étoiles maîtresses : une par séance du module
    if (f.nombre) {
      for (let i = 0; i < f.nombre; i++) {
        const a = (i / f.nombre) * Math.PI * 2;
        const v = 3.3 * echelle;
        this.ajouter({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, vie: 2300, vieMax: 2300, couleur: "#ffffff", taille: 3, frottement: 0.978, gravite: 0.022, longueurTraine: 8 });
      }
    }
    if (f.etiquette) {
      this.etiquettes.push({ texte: f.etiquette, x, y: y + 34, vie: 2200, vieMax: 2200, couleur: palette[0], taille: 15 });
    }
  }

  /** Guide des particules vers des points de l'écran, les tient, puis les relâche */
  private dessinerPoints(points: Point[], o: { cx: number; cy: number; palette: Palette; tenue: number; origine: "centre" | "sol" }) {
    const maintenant = performance.now();
    for (const [px, py] of points) {
      const depart = maintenant + Math.random() * (o.origine === "sol" ? 900 : 350);
      const vol = o.origine === "sol" ? 1700 + Math.random() * 500 : 1100;
      const x0 = o.origine === "sol" ? Math.random() * this.largeur : o.cx;
      const y0 = o.origine === "sol" ? this.hauteur + 20 : o.cy + 60;
      this.ajouter({
        x: x0,
        y: y0,
        vx: 0,
        vy: 0,
        vie: 1,
        vieMax: 1,
        couleur: au(o.palette),
        taille: 1.7,
        frottement: 0.985,
        gravite: 0.03,
        scintille: true,
        longueurTraine: o.origine === "sol" ? 7 : 4,
        cible: { x0, y0, x: px, y: py, depart, vol, relache: depart + vol + o.tenue },
      });
    }
  }

  ecrire(texte: string, o: { police: string; taille: number; palette: Palette; xr: number; yr: number; tenue: number; largeurMax?: number; graisse?: number }) {
    const graisse = o.graisse ?? 700;
    const police = `${graisse} ${o.taille}px ${o.police}`;
    const mesure = document.createElement("canvas").getContext("2d");
    if (!mesure) return;
    mesure.font = police;

    const lignes: string[] = [];
    if (o.largeurMax) {
      let courante = "";
      for (const mot of texte.split(/\s+/)) {
        const essai = courante ? `${courante} ${mot}` : mot;
        if (courante && mesure.measureText(essai).width > o.largeurMax) {
          lignes.push(courante);
          courante = mot;
        } else courante = essai;
      }
      if (courante) lignes.push(courante);
    } else lignes.push(texte);

    const interligne = o.taille * 1.3;
    const largeur = Math.ceil(Math.max(...lignes.map((l) => mesure.measureText(l).width))) + 24;
    const hauteur = Math.ceil(lignes.length * interligne + o.taille * 0.4);
    const hors = document.createElement("canvas");
    hors.width = largeur;
    hors.height = hauteur;
    const c = hors.getContext("2d");
    if (!c) return;
    c.font = police;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#fff";
    lignes.forEach((l, i) => c.fillText(l, largeur / 2, o.taille * 0.2 + interligne * (i + 0.5)));

    const cx = o.xr * this.largeur;
    const cy = o.yr * this.hauteur;
    const points = echantillonner(c, largeur, hauteur, Math.max(3, Math.round(o.taille / 26)), 1200).map(
      ([px, py]): Point => [cx + px - largeur / 2, cy + py - hauteur / 2]
    );
    this.son?.boom(1.1);
    this.dessinerPoints(points, { cx, cy: cy + hauteur / 2, palette: o.palette, tenue: o.tenue, origine: "centre" });
  }

  async dessinerSvg(svg: string, o: { taille: number; palette: Palette; xr: number; yr: number; tenue: number; legende?: string }) {
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    try {
      await image.decode();
    } catch {
      return;
    }
    if (this.detruit) return;
    const cote = Math.round(o.taille);
    const hors = document.createElement("canvas");
    hors.width = cote;
    hors.height = cote;
    const c = hors.getContext("2d");
    if (!c) return;
    c.drawImage(image, 0, 0, cote, cote);
    const cx = o.xr * this.largeur;
    const cy = o.yr * this.hauteur;
    const points = echantillonner(c, cote, cote, 4, 1000).map(([px, py]): Point => [cx + px - cote / 2, cy + py - cote / 2]);
    this.son?.boom(1);
    this.dessinerPoints(points, { cx, cy, palette: o.palette, tenue: o.tenue, origine: "centre" });
    if (o.legende) {
      this.etiquettes.push({ texte: o.legende, x: cx, y: cy + cote / 2 + 30, vie: o.tenue + 2400, vieMax: o.tenue + 2400, couleur: o.palette[0], taille: 17 });
    }
  }

  /** Les jours du plan montent du sol et forment l'étoile de zellige */
  rassemblerJours(nombre: number, palette: Palette, tenue: number) {
    const rayon = Math.min(this.largeur, this.hauteur) * 0.3;
    const cx = this.largeur / 2;
    const cy = this.hauteur * 0.42;
    const sommets = (decalage: number) =>
      Array.from({ length: 16 }, (_, k): Point => {
        const r = k % 2 ? rayon * 0.7654 : rayon;
        const a = ((k * 22.5 + decalage - 90) * Math.PI) / 180;
        return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
      });
    const points: Point[] = [];
    [0, 22.5].forEach((decalage, etoile) => {
      const s = sommets(decalage);
      const part = etoile === 0 ? Math.ceil(nombre / 2) : Math.floor(nombre / 2);
      for (let i = 0; i < part; i++) {
        const t = (i / part) * 16;
        const k = Math.floor(t);
        const f = t - k;
        const [ax, ay] = s[k];
        const [bx, by] = s[(k + 1) % 16];
        points.push([ax + (bx - ax) * f, ay + (by - ay) * f]);
      }
    });
    this.dessinerPoints(points, { cx, cy, palette, tenue, origine: "sol" });
  }

  private boucle = (instant: number) => {
    const ecoule = Math.min(50, instant - this.dernier);
    this.dernier = instant;
    const dt = ecoule / 16.67;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.largeur, this.hauteur);
    ctx.globalCompositeOperation = "lighter";

    for (let i = this.fusees.length - 1; i >= 0; i--) {
      const f = this.fusees[i];
      f.traine.push(f.x, f.y);
      if (f.traine.length > 24) f.traine.splice(0, 2);
      f.vy += GRAVITE_FUSEE * dt;
      f.y += f.vy * dt;
      f.x += Math.sin(instant / 90 + i) * 0.25 * dt;
      ctx.strokeStyle = "rgba(255, 220, 160, 0.55)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(f.traine[0], f.traine[1]);
      for (let k = 2; k < f.traine.length; k += 2) ctx.lineTo(f.traine[k], f.traine[k + 1]);
      ctx.stroke();
      ctx.fillStyle = "#fff6e0";
      ctx.beginPath();
      ctx.arc(f.x, f.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      if (f.vy >= -0.4) {
        this.fusees.splice(i, 1);
        this.eclater(f);
      }
    }

    const nouvelles: Particule[] = [];
    for (let i = this.particules.length - 1; i >= 0; i--) {
      const p = this.particules[i];
      if (p.cible) {
        const c = p.cible;
        if (instant < c.depart) continue;
        if (instant < c.depart + c.vol) {
          const t = (instant - c.depart) / c.vol;
          const e = 1 - (1 - t) ** 3;
          p.traine.push(p.x, p.y);
          p.x = c.x0 + (c.x - c.x0) * e;
          p.y = c.y0 + (c.y - c.y0) * e;
        } else if (instant < c.relache) {
          p.traine.length = 0;
          p.x = c.x + (Math.random() - 0.5) * 0.6;
          p.y = c.y + (Math.random() - 0.5) * 0.6;
        } else {
          p.cible = null;
          p.vie = 1800;
          p.vieMax = 1800;
          p.vx = (Math.random() - 0.5) * 0.5;
          p.vy = Math.random() * 0.3;
        }
      } else {
        const f = p.frottement ** dt;
        p.vx *= f;
        p.vy = p.vy * f + p.gravite * dt;
        p.traine.push(p.x, p.y);
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vie -= ecoule;
      }
      if (p.traine.length > p.longueurTraine * 2) p.traine.splice(0, p.traine.length - p.longueurTraine * 2);

      if (p.vie <= 0) {
        if (p.seBrise) {
          for (let k = 0; k < 3; k++) {
            const a = Math.random() * Math.PI * 2;
            nouvelles.push({ x: p.x, y: p.y, vx: Math.cos(a) * 1.4, vy: Math.sin(a) * 1.4, vie: 320, vieMax: 320, couleur: "#ffffff", taille: 1.3, frottement: 0.95, gravite: 0.02, traine: [], longueurTraine: 2, scintille: true, seBrise: false, cible: null });
          }
        }
        this.particules.splice(i, 1);
        continue;
      }

      const fondu = p.cible ? 1 : Math.min(1, p.vie / (p.vieMax * 0.45));
      const alpha = p.scintille ? fondu * (0.55 + Math.random() * 0.45) : fondu;
      ctx.globalAlpha = alpha * 0.5;
      ctx.strokeStyle = p.couleur;
      ctx.lineWidth = p.taille * 0.7;
      if (p.traine.length >= 4) {
        ctx.beginPath();
        ctx.moveTo(p.traine[0], p.traine[1]);
        for (let k = 2; k < p.traine.length; k += 2) ctx.lineTo(p.traine[k], p.traine[k + 1]);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.couleur;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.taille, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const n of nouvelles) if (this.particules.length < MAX_PARTICULES) this.particules.push(n);

    // Les étiquettes : le nom des modules sous leurs fusées, les légendes des dessins
    ctx.globalCompositeOperation = "source-over";
    ctx.textAlign = "center";
    for (const f of this.fusees) {
      if (!f.etiquette) continue;
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = f.palette[0];
      ctx.font = `600 13px ${this.police}`;
      ctx.fillText(f.etiquette, f.x, f.y + 26);
    }
    for (let i = this.etiquettes.length - 1; i >= 0; i--) {
      const e = this.etiquettes[i];
      e.vie -= ecoule;
      if (e.vie <= 0) {
        this.etiquettes.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.min(1, e.vie / 700, (e.vieMax - e.vie) / 300);
      ctx.fillStyle = e.couleur;
      ctx.font = `600 ${e.taille}px ${this.police}`;
      ctx.fillText(e.texte, e.x, e.y);
    }
    ctx.globalAlpha = 1;

    this.image = requestAnimationFrame(this.boucle);
  };
}
