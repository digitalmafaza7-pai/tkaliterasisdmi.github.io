export type AccessState = 'demo' | 'premium';

export interface LicenseInfo {
  licenseKey: string;
  installationId: string;
  activatedAt: string;
  status: 'active' | 'revoked' | 'invalid';
  type: 'permanent';
  note?: string;
  signature?: string;
}

export interface ActivationCodeRecord {
  code: string;
  createdAt: string;
  maxUsage: number;
  usageCount: number;
  status: 'active' | 'revoked';
  note?: string;
  activations: {
    installationId: string;
    activatedAt: string;
    clientName?: string;
  }[];
}

export type FeatureKey =
  | 'dashboard'
  | 'previewContent'
  | 'samplePractice'
  | 'viewCurriculum'
  | 'viewSeedBank'
  | 'kisiKisiPreview'
  | 'aiStimulusGenerator'
  | 'aiQuestionGenerator'
  | 'fullSimulation'
  | 'documentExport'
  | 'teacherCustomBank';

export interface AccessConfig {
  demoEnabled: boolean;
  demoFeatures: Record<FeatureKey, boolean>;
  premiumEnabled: boolean;
  activationType: 'permanent';
}

export const ACCESS_CONFIG: AccessConfig = {
  demoEnabled: true,
  demoFeatures: {
    dashboard: true,
    previewContent: true,
    samplePractice: true,      // Pengguna demo dapat mencoba latihan paket demo
    viewCurriculum: true,      // Melihat kerangka 3 kompetensi & 10 indikator
    viewSeedBank: true,        // Membaca stimulus dan butir soal contoh
    kisiKisiPreview: true,     // Melihat tabel matriks kisi-kisi
    aiStimulusGenerator: false,// Fitur premium: generate stimulus baru dengan AI
    aiQuestionGenerator: false,// Fitur premium: generate butir soal baru dengan AI
    fullSimulation: false,     // Fitur premium: simulasi ujian berbatas waktu paket lengkap
    documentExport: false,     // Fitur premium: unduh naskah soal Word, kunci guru, CSV
    teacherCustomBank: false,  // Fitur premium: kelola paket kustom guru
  },
  premiumEnabled: true,
  activationType: 'permanent',
};

export function canAccessFeature(featureKey: FeatureKey, isPremium: boolean): boolean {
  if (isPremium) return true;
  return Boolean(ACCESS_CONFIG.demoFeatures[featureKey]);
}
