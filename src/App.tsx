import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { PracticeListView } from './components/practice/PracticeListView';
import { PracticeSession } from './components/practice/PracticeSession';
import { SimulationModal } from './components/practice/SimulationModal';
import { QuestionGenerator } from './components/generator/QuestionGenerator';
import { QuestionValidator } from './components/validator/QuestionValidator';
import { KisiKisiView } from './components/kisi/KisiKisiView';
import { BankStimulusView } from './components/bank/BankStimulusView';
import { BankSoalView } from './components/bank/BankSoalView';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { ResultAnalysisView } from './components/results/ResultAnalysisView';
import {
  ButirSoal,
  HasilPengerjaan,
  KelasSD,
  PaketLatihan,
  StimulusBacaan,
} from './types/assessment';
import { storageService } from './services/storageService';
import { apiService } from './services/apiService';
import { accessService } from './services/accessService';
import { ActivationModal } from './components/access/ActivationModal';
import { OwnerPanelModal } from './components/access/OwnerPanelModal';
import { BookOpen, Sparkles, Heart } from 'lucide-react';

export default function App() {
  const initialSettings = storageService.getSettings();
  const [activeTab, setActiveTab] = useState<NavTab>('beranda');
  const [currentKelas, setCurrentKelas] = useState<KelasSD>(initialSettings.kelasAktif || 5);
  const [userRole, setUserRole] = useState<'siswa' | 'guru'>(initialSettings.peran || 'siswa');

  // License & Access State
  const [isPremium, setIsPremium] = useState<boolean>(accessService.isPremium());
  const [isActivationOpen, setIsActivationOpen] = useState(false);
  const [isOwnerOpen, setIsOwnerOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = accessService.subscribe((premiumStatus) => {
      setIsPremium(premiumStatus);
    });
    accessService.init();
    return () => unsubscribe();
  }, []);

  // Active Testing Session State
  const [activeSession, setActiveSession] = useState<{
    paket: PaketLatihan;
    mode: 'belajar' | 'ujian';
  } | null>(null);

  // Simulation Modal
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);

  // Result state
  const [activeResult, setActiveResult] = useState<HasilPengerjaan | null>(null);

  // Cross-component item passing (e.g. from Generator to Validator)
  const [validatorTarget, setValidatorTarget] = useState<{
    soal: ButirSoal | null;
    stimulus: StimulusBacaan | null;
  }>({ soal: null, stimulus: null });

  // Sync settings when class or role changes
  const handleKelasChange = (newKelas: KelasSD) => {
    setCurrentKelas(newKelas);
    storageService.saveSettings({
      ...storageService.getSettings(),
      kelasAktif: newKelas,
    });
  };

  const handleRoleChange = (newRole: 'siswa' | 'guru') => {
    setUserRole(newRole);
    storageService.saveSettings({
      ...storageService.getSettings(),
      peran: newRole,
    });
  };

  // Reset to seeds
  const handleResetData = () => {
    if (
      confirm(
        'Kembalikan seluruh bank soal, stimulus, dan paket latihan ke data awal baku? Riwayat pengerjaan lokal akan dibersihkan.'
      )
    ) {
      storageService.resetAllData();
      alert('Data berhasil di-reset ke versi bawaan awal!');
      window.location.reload();
    }
  };

  // Launch Practice
  const handleStartPractice = (paket: PaketLatihan, mode: 'belajar' | 'ujian') => {
    setActiveSession({ paket, mode });
  };

  // Launch Simulation from Modal
  const handleStartSimulation = (
    paket: PaketLatihan,
    config: { acakSoal: boolean; durasiMenit: number }
  ) => {
    setIsSimulationOpen(false);
    const preparedQuestions = config.acakSoal
      ? [...paket.soalList].sort(() => Math.random() - 0.5)
      : [...paket.soalList];

    const customizedPaket: PaketLatihan = {
      ...paket,
      durasiMenit: config.durasiMenit,
      soalList: preparedQuestions,
    };

    setActiveSession({
      paket: customizedPaket,
      mode: 'ujian',
    });
  };

  // Handle Exam Completion
  const handleFinishExam = (hasil: HasilPengerjaan) => {
    setActiveResult(hasil);
    setActiveSession(null);
    setActiveTab('hasil');
  };

  // Navigate to Validator with selected question
  const handleNavigateToValidator = (soal: ButirSoal, stimulus?: StimulusBacaan) => {
    const stim = stimulus || storageService.getStimulusById(soal.stimulusId) || null;
    setValidatorTarget({ soal, stimulus: stim });
    setActiveTab('validator');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveSession(null);
          setActiveTab(tab);
        }}
        currentKelas={currentKelas}
        setCurrentKelas={handleKelasChange}
        userRole={userRole}
        setUserRole={handleRoleChange}
        isPremium={isPremium}
        onOpenActivation={() => setIsActivationOpen(true)}
        onOpenOwnerPanel={() => setIsOwnerOpen(true)}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {/* If user is inside an active practice session */}
        {activeSession ? (
          <PracticeSession
            paket={activeSession.paket}
            modePengerjaan={activeSession.mode}
            onFinishSession={handleFinishExam}
            onExit={() => setActiveSession(null)}
          />
        ) : (
          <>
            {activeTab === 'beranda' && (
              <LandingPage
                currentKelas={currentKelas}
                setCurrentKelas={handleKelasChange}
                setActiveTab={setActiveTab}
                onStartSimulation={() => setIsSimulationOpen(true)}
              />
            )}

            {activeTab === 'latihan' && (
              <PracticeListView
                currentKelas={currentKelas}
                isPremium={isPremium}
                onOpenActivation={() => setIsActivationOpen(true)}
                onSelectPaket={handleStartPractice}
                onOpenSimulation={() => setIsSimulationOpen(true)}
              />
            )}

            {activeTab === 'simulasi' && (
              <div className="space-y-6">
                <PracticeListView
                  currentKelas={currentKelas}
                  isPremium={isPremium}
                  onOpenActivation={() => setIsActivationOpen(true)}
                  onSelectPaket={handleStartPractice}
                  onOpenSimulation={() => setIsSimulationOpen(true)}
                />
              </div>
            )}

            {activeTab === 'generator' && (
              <QuestionGenerator
                currentKelas={currentKelas}
                isPremium={isPremium}
                onOpenActivation={() => setIsActivationOpen(true)}
                onQuestionsSaved={() => setActiveTab('bank-soal')}
                onNavigateToValidator={handleNavigateToValidator}
              />
            )}

            {activeTab === 'validator' && (
              <QuestionValidator
                initialSoal={validatorTarget.soal}
                initialStimulus={validatorTarget.stimulus}
                onValidationUpdated={() => {}}
              />
            )}

            {activeTab === 'kisi-kisi' && (
              <KisiKisiView
                currentKelas={currentKelas}
                isPremium={isPremium}
                onOpenActivation={() => setIsActivationOpen(true)}
              />
            )}

            {activeTab === 'bank-soal' && (
              <BankSoalView
                currentKelas={currentKelas}
                onNavigateToValidator={handleNavigateToValidator}
                onNavigateToGenerator={() => setActiveTab('generator')}
              />
            )}

            {activeTab === 'bank-stimulus' && (
              <BankStimulusView
                currentKelas={currentKelas}
                onOpenCreateStimulus={() => setActiveTab('generator')}
              />
            )}

            {activeTab === 'dashboard-guru' && (
              <TeacherDashboard
                currentKelas={currentKelas}
                isPremium={isPremium}
                onOpenActivation={() => setIsActivationOpen(true)}
                onNavigateToGenerator={() => setActiveTab('generator')}
              />
            )}

            {activeTab === 'hasil' && activeResult && (
              <ResultAnalysisView
                hasil={activeResult}
                onRetry={() => {
                  const paket = storageService.getPaketById(activeResult.paketId);
                  if (paket) handleStartPractice(paket, activeResult.mode);
                }}
                onBackToHome={() => setActiveTab('beranda')}
              />
            )}

            {activeTab === 'hasil' && !activeResult && (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
                <h3 className="font-bold text-base text-slate-900">Belum Ada Hasil Ujian Aktif</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Selesaikan salah satu paket latihan mandiri atau simulasi TKA untuk melihat analisis diagnostik kompetensi dan indikator.
                </p>
                <button
                  onClick={() => setActiveTab('latihan')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-xs transition"
                >
                  Mulai Latihan Sekarang
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Global Simulation Modal */}
      <SimulationModal
        currentKelas={currentKelas}
        isOpen={isSimulationOpen}
        isPremium={isPremium}
        onOpenActivation={() => {
          setIsSimulationOpen(false);
          setIsActivationOpen(true);
        }}
        onClose={() => setIsSimulationOpen(false)}
        onStart={handleStartSimulation}
      />

      {/* Activation Modal Dialog */}
      <ActivationModal
        isOpen={isActivationOpen}
        onClose={() => setIsActivationOpen(false)}
        onSuccess={() => setIsActivationOpen(false)}
      />

      {/* Owner License Management Modal */}
      <OwnerPanelModal
        isOpen={isOwnerOpen}
        onClose={() => setIsOwnerOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">TKA LITERASI SMART PRO SD/MI</span>
            <span>—</span>
            <span className="italic text-indigo-700 font-medium">
              "Latihan Cerdas, Pahami Bacaan, Siap Hadapi TKA!"
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>10 Indikator Asesmen (SD-T01 s.d. SD-E03)</span>
            <span>•</span>
            <span>Kelas 4, 5, 6 SD/MI</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              Didukung AI Gemini 3.8 Flash
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
