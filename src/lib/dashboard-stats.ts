export function courseProgress(lessonIds: string[], completedIds: string[]) {
  const completed = new Set(completedIds);
  return lessonIds.length ? Math.round(lessonIds.filter(id => completed.has(id)).length / lessonIds.length * 100) : 0;
}
export function averageScore(attempts: Array<{score:number;total_questions:number}>) {
  const scored = attempts.filter(a => a.total_questions > 0);
  return scored.length ? Math.round(scored.reduce((sum,a) => sum + a.score/a.total_questions*100,0)/scored.length) : null;
}