export type ReliableRecord<T> = { status: 'available'; value: T } | { status: 'unavailable'; reason: string };
export function certificateTotal(count: number | null, error: unknown): ReliableRecord<number> {
 if (error || count === null || !Number.isInteger(count) || count < 0) return {status:'unavailable',reason:'Certificate records unavailable'};
 return {status:'available',value:count};
}
export const missingExamDates = {status:'unavailable',reason:'No verified exam schedule is connected. Your target year is a study goal, not an official exam date.'} as const;
export const missingStudentVerification = {status:'unavailable',reason:'Student verification unavailable — no verified student record is connected.'} as const;