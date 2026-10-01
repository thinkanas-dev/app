export type Ayah = {
  surahNumber: number;
  surahName: string;
  surahEnglishName: string;
  numberInSurah: number;
  text: string;
  quarter: number;
};

type ApiAyah = {
  text: string;
  numberInSurah: number;
  hizbQuarter: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
  };
};

const API_BASE = "https://api.alquran.cloud/v1";

async function fetchQuarter(quarter: number): Promise<ApiAyah[]> {
  const res = await fetch(`${API_BASE}/hizbQuarter/${quarter}/quran-uthmani`);
  if (!res.ok) throw new Error("Impossible de charger ce passage");
  const json = await res.json();
  return json.data.ayahs;
}

export async function fetchHizb(n: number): Promise<Ayah[]> {
  const startQuarter = (n - 1) * 4 + 1;
  const quarters = await Promise.all(
    [0, 1, 2, 3].map((i) => fetchQuarter(startQuarter + i))
  );
  return quarters.flat().map((a) => ({
    surahNumber: a.surah.number,
    surahName: a.surah.name,
    surahEnglishName: a.surah.englishName,
    numberInSurah: a.numberInSurah,
    text: a.text,
    quarter: ((a.hizbQuarter - 1) % 4) + 1,
  }));
}
