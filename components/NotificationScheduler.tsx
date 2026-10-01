"use client";

import { useEffect } from "react";
import { useObjectifsState } from "@/lib/objectifs-store";
import { dateLocale, nouvelId } from "@/lib/atelier";

const CLE = "think-anas-notifications-v1";

function dejaEnvoyees() {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(CLE) ?? "[]"));
  } catch {
    return new Set<string>();
  }
}

function memoriser(keys: Set<string>) {
  try {
    localStorage.setItem(CLE, JSON.stringify([...keys].slice(-500)));
  } catch {
    // Une notification manquée ne doit jamais bloquer l'application.
  }
}

export function NotificationScheduler() {
  const { state, ajouterAtelier, modifierAtelier } = useObjectifsState();

  useEffect(() => {
    function verifier() {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      const maintenant = new Date();
      const date = dateLocale(maintenant);
      const heure = `${String(maintenant.getHours()).padStart(2, "0")}:${String(maintenant.getMinutes()).padStart(2, "0")}`;
      const envoyees = dejaEnvoyees();
      const notifier = (key: string, titre: string, body: string) => {
        if (envoyees.has(key)) return;
        new Notification(titre, { body, icon: "/logo.png" });
        envoyees.add(key);
      };

      for (const tache of state.atelier.taches) {
        if (!tache.terminee && tache.echeance === date && tache.heure === heure) {
          notifier(`tache:${tache.id}:${date}:${heure}`, "Tâche think.anas", tache.titre);
        }
      }
      for (const evenement of state.atelier.evenements) {
        if (evenement.date === date && evenement.debut === heure) {
          notifier(`evenement:${evenement.id}:${date}:${heure}`, evenement.titre, evenement.lieu || "L’événement commence maintenant.");
        }
      }
      for (const automation of state.atelier.automatisations) {
        if (!automation.active || automation.heure !== heure) continue;
        const correspond = automation.declencheur === "quotidien" || (automation.declencheur === "hebdomadaire" && automation.jourSemaine === maintenant.getDay());
        if (!correspond) continue;
        const key = `automation:${automation.id}:${date}:${heure}`;
        if (envoyees.has(key)) continue;
        if (automation.action === "notification") {
          notifier(key, automation.nom, automation.message);
        } else {
          ajouterAtelier("taches", {
            id: nouvelId("tache-auto"),
            titre: automation.message,
            notes: `Créée par l’automatisation « ${automation.nom} »`,
            projet: "Automatisation",
            echeance: date,
            heure: "",
            priorite: "normale",
            repetition: "aucune",
            terminee: false,
            creeLe: new Date().toISOString(),
          });
          envoyees.add(key);
        }
        modifierAtelier("automatisations", automation.id, { derniereExecution: new Date().toISOString() });
      }
      memoriser(envoyees);
    }

    verifier();
    const interval = window.setInterval(verifier, 30_000);
    return () => window.clearInterval(interval);
  }, [state.atelier.taches, state.atelier.evenements, state.atelier.automatisations, ajouterAtelier, modifierAtelier]);

  return null;
}
