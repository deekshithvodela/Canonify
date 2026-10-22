export type DocumentCategory =
  | 'Allotment'
  | 'MeritList'
  | 'SeatMatrix'
  | 'Analysis'
  | 'CounsellingNotice'
  | 'Info'
  | 'InformationBulletin'
  | 'Other';

export type CounsellingRound =
  | 'Round1'
  | 'Round2'
  | 'Round3'
  | 'Round4'
  | 'Round1_Round2'
  | 'Combined'
  | 'MopUp'
  | 'StrayVacancy'
  | 'SpecialStray'
  | 'SpotCounselling'
  | 'NotApplicable'
  | 'Unknown';

export interface AuthorityItem {
  name: string;
  url: string;
  role?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  academicYear: string;
  canonicalJurisdiction: string;
  jurisdictionName: string;
  jurisdictionSlug: string;
  jurisdictionType: 'All India' | 'State' | 'Union Territory';
  documentCategory: DocumentCategory;
  counsellingRound: CounsellingRound;
  quotaCategory: string | null;
  qualifier: string | null;
  filename: string;
  publicUrl: string;
  format: 'pdf' | 'csv' | 'xlsx' | 'json';
  fileSizeHuman: string;
  fileSizeBytes: number;
  pageCount: number | null;
  rowCount: number | null;
  sha256: string;
  previewable: boolean;
  companionPdfUrl: string | null;
  companionPdfSize: string | null;
  counsellingAuthority: string;
  officialWebsiteUrl: string;
  allOfficialLinks: string[];
  authorities?: AuthorityItem[];
}

export interface Jurisdiction {
  slug: string;
  name: string;
  canonical: string;
  type: 'All India' | 'State' | 'Union Territory';
  authorityName: string;
  officialWebsiteUrl: string;
  allOfficialLinks: string[];
  authorities?: AuthorityItem[];
  documentCount: number;
  totalSizeBytes: number;
  availableCategories: DocumentCategory[];
  roundsAvailable: string[];
  hasDocuments: boolean;
}

export interface CatalogData {
  academicYear: string;
  metadata: {
    title: string;
    description: string;
    generatedAt: string;
    totalDocuments: number;
    totalJurisdictions: number;
  };
  jurisdictions: Jurisdiction[];
  documents: DocumentItem[];
}
