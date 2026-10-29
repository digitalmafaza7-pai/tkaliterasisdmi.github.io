import React from 'react';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  TableProperties,
  Database,
  LayoutDashboard,
  Clock,
  User,
  ShieldCheck,
  RotateCcw,
  KeyRound,
  Lock,
  Crown,
} from 'lucide-react';
import { KelasSD } from '../types/assessment';

export type NavTab =
  | 'beranda'
  | 'latihan'
  | 'simulasi'
  | 'generator'
  | 'validator'
  | 'kisi-kisi'
  | 'bank-soal'
  | 'bank-stimulus'
  | 'dashboard-guru'
  | 'hasil';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentKelas: KelasSD;
  setCurrentKelas: (kelas: KelasSD) => void;
  userRole: 'siswa' | 'guru';
  setUserRole: (role: 'siswa' | 'guru') => void;
  isPremium: boolean;
  onOpenActivation: () => void;
  onOpenOwnerPanel: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentKelas,
  setCurrentKelas,
  userRole,
  setUserRole,
  isPremium,
  onOpenActivation,
  onOpenOwnerPanel,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner / Utility Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-emerald-600 text-white text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.5 rounded-sm text-[10px] tracking-wide">
              SD / MI
            </span>
            <span className="hidden sm:inline">TKA LITERASI SMART PRO: "Latihan Cerdas, Pahami Bacaan, Siap Hadapi TKA!"</span>
            <span className="sm:hidden font-bold">TKA LITERASI SMART PRO</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Demo vs Premium Status Badge */}
            {isPremium ? (
              <div className="flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide">
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>PREMIUM AKTIF — AKSES LENGKAP</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="bg-white/15 border border-white/20 text-white font-bold px-2 py-0.5 rounded-full text-[10px] tracking-wide">
                  MODE DEMO — AKSES TERBATAS
                </span>
                <button
                  onClick={onOpenActivation}
                  className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-[11px] shadow-xs transition animate-pulse"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>AKTIVASI PREMIUM</span>
                </button>
              </div>
            )}

            {/* Mode / Role Switcher */}
            <div className="flex items-center bg-black/20 rounded-full p-0.5 border border-white/20">
              <button
                onClick={() => setUserRole('siswa')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition ${
                  userRole === 'siswa'
                    ? 'bg-white text-blue-800 shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Siswa
              </button>
              <button
                onClick={() => setUserRole('guru')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition ${
                  userRole === 'guru'
                    ? 'bg-amber-400 text-slate-900 shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Guru
              </button>
            </div>

            {/* Owner License Portal Button */}
            <button
              onClick={onOpenOwnerPanel}
              title="Panel Lisensi Administrator / Owner"
              className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded transition flex items-center gap-1 text-[11px] font-semibold border border-white/20 px-2"
            >
              <KeyRound className="w-3 h-3 text-amber-300" />
              <span className="hidden md:inline">Owner Lisensi</span>
            </button>

            {/* Quick Reset Data */}
            <button
              onClick={onResetData}
              title="Reset data ke bank soal asli (Seed)"
              className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Branding */}
          <div
            onClick={() => setActiveTab('beranda')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight leading-tight flex items-center gap-1.5">
                TKA LITERASI <span className="text-blue-600">SMART PRO</span>
              </div>
              <div className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Asesmen Membaca Bahasa Indonesia SD/MI
              </div>
            </div>
          </div>

          {/* Active Class Selector Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 px-2 hidden md:inline">Kelas:</span>
            {([4, 5, 6] as KelasSD[]).map((k) => (
              <button
                key={k}
                onClick={() => setCurrentKelas(k)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  currentKelas === k
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Kelas {k}
              </button>
            ))}
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('beranda')}
              className={`px-3 py-2 rounded-lg transition ${
                activeTab === 'beranda'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Beranda
            </button>

            <button
              onClick={() => setActiveTab('latihan')}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'latihan'
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              Latihan
            </button>

            <button
              onClick={() => setActiveTab('simulasi')}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'simulasi'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Simulasi TKA</span>
              {!isPremium && <Lock className="w-3 h-3 text-amber-500" />}
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'generator'
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Generator AI</span>
              {!isPremium && <Lock className="w-3 h-3 text-amber-500" />}
            </button>

            <button
              onClick={() => setActiveTab('validator')}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'validator'
                  ? 'bg-purple-50 text-purple-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              Validasi AI
            </button>

            <button
              onClick={() => setActiveTab('kisi-kisi')}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'kisi-kisi'
                  ? 'bg-amber-50 text-amber-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TableProperties className="w-4 h-4 text-amber-600" />
              Kisi-Kisi
            </button>

            <button
              onClick={() => setActiveTab('bank-soal')}
              className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'bank-soal' || activeTab === 'bank-stimulus'
                  ? 'bg-slate-100 text-slate-800 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Database className="w-4 h-4 text-slate-500" />
              Bank Data
            </button>

            {userRole === 'guru' && (
              <button
                onClick={() => setActiveTab('dashboard-guru')}
                className={`px-3 py-2 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'dashboard-guru'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-blue-700 bg-blue-50/70 hover:bg-blue-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Panel Guru
              </button>
            )}
          </nav>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-100 gap-2 no-scrollbar text-xs font-semibold">
          <button
            onClick={() => setActiveTab('beranda')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${
              activeTab === 'beranda' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Beranda
          </button>
          <button
            onClick={() => setActiveTab('latihan')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${
              activeTab === 'latihan' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Latihan
          </button>
          <button
            onClick={() => setActiveTab('simulasi')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${
              activeTab === 'simulasi' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Simulasi
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${
              activeTab === 'generator' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Generator AI
          </button>
          <button
            onClick={() => setActiveTab('validator')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${
              activeTab === 'validator' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Validasi
          </button>
          <button
            onClick={() => setActiveTab('kisi-kisi')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${
              activeTab === 'kisi-kisi' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Kisi-Kisi
          </button>
          <button
            onClick={() => setActiveTab('bank-soal')}
            className={`px-2.5 py-1 rounded-md shrink-0 ${
              activeTab === 'bank-soal' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Bank Soal
          </button>
          {userRole === 'guru' && (
            <button
              onClick={() => setActiveTab('dashboard-guru')}
              className={`px-2.5 py-1 rounded-md shrink-0 ${
                activeTab === 'dashboard-guru' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700'
              }`}
            >
              Panel Guru
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
