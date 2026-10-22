import { DocumentItem } from '../types';

/**
 * Canonical Document Sorting Comparator:
 * 1. Category: Allotments first (1), Merit Lists next (2), Seat Matrices last (3), Notices (4), Bulletins (5), Other (6)
 * 2. Round: Round 1 (1) -> Round 2 (2) -> Round 3 (3) -> Round 4 (4) -> Combined (5) -> Mop-Up (6) -> Stray (7) -> Special Stray (8) -> Spot (9) -> Not Applicable (10)
 * 3. Quota: State/CQ/Govt/General (1-2) -> Management (3) -> NRI (4) -> Special Quotas (5)
 * 4. Title / Filename alphabetical tie-breaker
 */
export function compareDocuments(a: DocumentItem, b: DocumentItem): number {
  // 1. Primary Sort: Document Category
  const categoryRank: Record<string, number> = {
    Allotment: 1,
    MeritList: 2,
    SeatMatrix: 3,
    Analysis: 4,
    CounsellingNotice: 5,
    Info: 6,
    InformationBulletin: 7,
    Other: 8
  };
  const catA = categoryRank[a.documentCategory] || 99;
  const catB = categoryRank[b.documentCategory] || 99;
  if (catA !== catB) return catA - catB;

  // 2. Secondary Sort: Counselling Round
  const roundRank: Record<string, number> = {
    Round1: 1,
    Round2: 2,
    Round3: 3,
    Round4: 4,
    Round1_Round2: 5,
    Combined: 6,
    MopUp: 7,
    StrayVacancy: 8,
    SpecialStray: 9,
    SpotCounselling: 10,
    NotApplicable: 11
  };
  const roundA = roundRank[a.counsellingRound] || 99;
  const roundB = roundRank[b.counsellingRound] || 99;
  if (roundA !== roundB) return roundA - roundB;

  // 3. Tertiary Sort: Quota Preference
  const quotaRank = (q: string | null): number => {
    if (!q) return 1;
    if (/CompetentAuthority|Government|General|AUArea|SVUArea|StateWide/i.test(q)) return 2;
    if (/Management/i.test(q)) return 3;
    if (/NRI/i.test(q)) return 4;
    return 5;
  };
  const qA = quotaRank(a.quotaCategory);
  const qB = quotaRank(b.quotaCategory);
  if (qA !== qB) return qA - qB;

  // 4. Alphabetical title / filename tie-break
  return (a.title || a.filename).localeCompare(b.title || b.filename);
}
