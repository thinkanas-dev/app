import type { ModuleAssessmentGrades } from "./objectifs-store";

const weights = { cc: 20, tp: 20, exam: 60 } as const;

/** Moyenne pondérée des évaluations déjà saisies, ramenée sur 20. */
export function calculateModuleGrade(notes?: ModuleAssessmentGrades): number | null {
  if (!notes) return null;
  const components = (Object.keys(weights) as (keyof typeof weights)[]).filter(
    (key) => typeof notes[key] === "number"
  );
  if (components.length === 0) return null;
  const totalWeight = components.reduce((sum, key) => sum + weights[key], 0);
  const weightedTotal = components.reduce(
    (sum, key) => sum + notes[key]! * weights[key],
    0
  );
  return weightedTotal / totalWeight;
}

export function moduleGradesWithAssessments(
  moduleGrades: Record<string, number>,
  assessments: Record<string, ModuleAssessmentGrades>
) {
  const grades = { ...moduleGrades };
  for (const [moduleId, notes] of Object.entries(assessments)) {
    const grade = calculateModuleGrade(notes);
    if (grade !== null) grades[moduleId] = grade;
  }
  return grades;
}
