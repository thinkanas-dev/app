/**
 * Lecture d'un PDF d'emploi du temps : chaque ligne de texte avec sa position,
 * et les rectangles colorés de la grille.
 *
 * pdf.js est passé en paramètre plutôt qu'importé ici : le navigateur charge sa
 * version (avec worker) à la demande, les tests Node la version « legacy », et
 * c'est exactement ce code de lecture qui tourne des deux côtés.
 *
 * Coordonnées : origine en haut à gauche, en points PDF. Pour un texte, `y` est
 * la ligne de base. Les transformations imbriquées (rares dans ces exports de
 * tableur) ne sont pas appliquées aux rectangles.
 */

export type ElementTexte = {
  texte: string;
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
};

export type RectangleRempli = {
  /** Couleur de remplissage, « #rrggbb » */
  couleur: string;
  gauche: number;
  haut: number;
  droite: number;
  bas: number;
};

export type PagePdf = {
  largeur: number;
  hauteur: number;
  nombrePages: number;
  textes: ElementTexte[];
  rectangles: RectangleRempli[];
};

type ItemTexte = { str?: string; transform?: number[]; width?: number; height?: number };

type PagePdfjs = {
  getViewport(options: { scale: number }): { width: number; height: number };
  getTextContent(): Promise<{ items: ItemTexte[] }>;
  getOperatorList(): Promise<{ fnArray: number[]; argsArray: unknown[] }>;
};

/** Le strict nécessaire de pdf.js, pour ne dépendre d'aucune de ses versions de types */
export type PdfjsMinimal = {
  OPS: Record<string, number>;
  getDocument(source: { data: Uint8Array; isEvalSupported?: boolean }): {
    promise: Promise<{ numPages: number; getPage(numero: number): Promise<PagePdfjs> }>;
  };
};

export async function lirePremierePage(pdfjs: PdfjsMinimal, data: Uint8Array): Promise<PagePdf> {
  const document = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;
  const page = await document.getPage(1);
  const { width, height } = page.getViewport({ scale: 1 });

  const contenu = await page.getTextContent();
  const textes: ElementTexte[] = [];
  for (const item of contenu.items) {
    if (!item.str || !item.transform || !item.str.trim()) continue;
    textes.push({
      texte: item.str,
      x: item.transform[4],
      y: height - item.transform[5],
      largeur: item.width ?? 0,
      hauteur: item.height ?? 0,
    });
  }

  // Les rectangles pleins : pdf.js v6 les émet en constructPath dont le premier
  // argument est l'opération de peinture, et le troisième la boîte englobante.
  const operateurs = await page.getOperatorList();
  const { OPS } = pdfjs;
  const rectangles: RectangleRempli[] = [];
  let couleur = "#000000";

  for (let i = 0; i < operateurs.fnArray.length; i++) {
    const fn = operateurs.fnArray[i];
    const args = operateurs.argsArray[i] as unknown[] | null;

    if (fn === OPS.setFillRGBColor && typeof args?.[0] === "string") {
      couleur = args[0].toLowerCase();
    }

    if (fn === OPS.constructPath && (args?.[0] === OPS.fill || args?.[0] === OPS.eoFill)) {
      const boite = args[2] as ArrayLike<number> | undefined;
      if (!boite || boite.length < 4) continue;
      rectangles.push({
        couleur,
        gauche: boite[0],
        haut: height - boite[3],
        droite: boite[2],
        bas: height - boite[1],
      });
    }
  }

  return { largeur: width, hauteur: height, nombrePages: document.numPages, textes, rectangles };
}
