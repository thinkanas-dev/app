"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/*
 * La dictée : la reconnaissance vocale du navigateur, en français.
 *
 * Chrome et Edge la proposent (le son part vers leur service en ligne) ;
 * Firefox et l'app de bureau Electron non. Le hook le dit honnêtement au lieu
 * de faire semblant : `disponible` est faux, ou `erreur` explique la panne.
 */

type AlternativeReco = { transcript: string };
type ResultatReco = { isFinal: boolean; length: number; [index: number]: AlternativeReco };
type EvenementReco = { resultIndex: number; results: { length: number; [index: number]: ResultatReco } };
type Reconnaissance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: EvenementReco) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type ConstructeurReco = new () => Reconnaissance;

function constructeur(): ConstructeurReco | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: ConstructeurReco; webkitSpeechRecognition?: ConstructeurReco };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const sansAbonnement = () => () => {};

const MESSAGES: Record<string, string> = {
  "not-allowed": "Micro refusé : autorisez-le pour cette page.",
  "service-not-allowed": "La reconnaissance vocale est bloquée dans ce navigateur.",
  network: "La transcription passe par un service en ligne, injoignable ici (c’est le cas dans l’app de bureau).",
  "audio-capture": "Aucun micro détecté.",
};

export function useDictee(onPhrase: (phrase: string) => void) {
  const disponible = useSyncExternalStore(sansAbonnement, () => constructeur() !== null, () => false);
  const [actif, setActif] = useState(false);
  const [provisoire, setProvisoire] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const reco = useRef<Reconnaissance | null>(null);
  const voulu = useRef(false);
  const rappel = useRef(onPhrase);

  useEffect(() => {
    rappel.current = onPhrase;
  });

  useEffect(() => {
    return () => {
      voulu.current = false;
      reco.current?.abort();
    };
  }, []);

  const arreter = useCallback(() => {
    voulu.current = false;
    reco.current?.stop();
    setActif(false);
    setProvisoire("");
  }, []);

  const demarrer = useCallback(() => {
    const Ctor = constructeur();
    if (!Ctor) return;
    setErreur(null);
    const r = new Ctor();
    r.lang = "fr-FR";
    r.continuous = true;
    r.interimResults = true;
    r.onresult = (e) => {
      let enAttente = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const resultat = e.results[i];
        const texte = resultat[0].transcript;
        if (resultat.isFinal) {
          const propre = texte.trim();
          if (propre) rappel.current(propre.charAt(0).toUpperCase() + propre.slice(1));
        } else {
          enAttente += texte;
        }
      }
      setProvisoire(enAttente);
    };
    r.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      voulu.current = false;
      setErreur(MESSAGES[e.error] ?? `Transcription interrompue (${e.error}).`);
    };
    // Chrome coupe l'écoute après un silence : on la relance tant qu'elle est voulue
    r.onend = () => {
      if (voulu.current) {
        try {
          r.start();
          return;
        } catch {
          voulu.current = false;
        }
      }
      setActif(false);
      setProvisoire("");
    };
    reco.current = r;
    voulu.current = true;
    try {
      r.start();
      setActif(true);
    } catch {
      voulu.current = false;
      setErreur("Impossible de démarrer la transcription.");
    }
  }, []);

  return { disponible, actif, provisoire, erreur, demarrer, arreter };
}
