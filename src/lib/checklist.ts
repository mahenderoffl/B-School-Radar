import { parseChecklist } from "@/lib/utils";

export type RoundInfo = {
  roundId: string;
  schoolId: string;
  schoolName: string;
  programName: string;
  roundNumber: number;
  checklist: { id: string; label: string; done: boolean }[];
};

export function toRoundInfo(rounds: {
  id: string;
  roundNumber: number;
  applicationStatus: { taskChecklist: string } | null;
  intake: { program: { name: string; school: { id: string; name: string } } };
}[]): RoundInfo[] {
  return rounds.map((r) => ({
    roundId: r.id,
    schoolId: r.intake.program.school.id,
    schoolName: r.intake.program.school.name,
    programName: r.intake.program.name,
    roundNumber: r.roundNumber,
    checklist: parseChecklist(r.applicationStatus?.taskChecklist ?? "[]"),
  }));
}
