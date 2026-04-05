"use client";
import { useState } from "react";
import {
  User,
  LogOut,
  Moon,
  Sun,
  LayoutGrid,
  Calendar,
  Check,
  ChevronRight,
  Mail,
  ShieldCheck
} from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { useThemeStore } from "../../../store/themeStore";

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const [syncing, setSyncing] = useState(false);

  const handleCalendarSync = () => {
    setSyncing(true);
    // Simulate API call
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* HEADER SECTION */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-black text-main-pure tracking-tighter mb-4 capitalize">
          Settings<span className="text-indigo-600">.</span>
        </h1>
        <p className="text-muted-pure font-bold text-lg tracking-tight">Personalize your travel ecosystem.</p>
      </div>

      <div className="space-y-8">
        
        {/* 1. PROFILE PROFILE SECTION */}
        <div className="card-pure p-10 rounded-[40px] border border-pure shadow-xl dark:shadow-indigo-500/5 relative overflow-hidden group">
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <User className="w-32 h-32" />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 overflow-hidden border-4 border-pure">
                {user?.picture ? (
                  <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black text-white">{user?.full_name?.charAt(0) || "T"}</span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-8 h-8 rounded-xl flex items-center justify-center border-4 border-pure text-white shadow-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-pure mb-1 block">Full Identity</label>
                <h2 className="text-3xl font-black text-main-pure tracking-tight">{user?.full_name || "Traveler Name"}</h2>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-pure mb-1 block">Communication Backbone</label>
                <div className="flex items-center justify-center md:justify-start gap-2 text-muted-pure font-bold tracking-tight">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email || "traveler@tripsetgo.com"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. ACTION CONTROLS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleDarkMode}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 card-pure rounded-[32px] border border-pure shadow-sm hover:border-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-300"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${darkMode ? "bg-indigo-600 text-white rotate-[360deg]" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </div>
            <div className="text-center">
              <h4 className="font-black text-main-pure text-lg">Visual Theme</h4>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-pure opacity-60">
                Current: {darkMode ? "Dark Universe" : "Light Spectrum"}
              </p>
            </div>
          </button>

          {/* Sync Calendar Button */}
          <button 
            onClick={handleCalendarSync}
            disabled={syncing}
            className="group relative flex flex-col items-center justify-center gap-4 p-8 card-pure rounded-[32px] border border-pure shadow-sm hover:border-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${syncing ? "bg-emerald-500 text-white animate-spin" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"}`}>
              <Calendar className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="font-black text-main-pure text-lg">{syncing ? "Synchronizing..." : "Sync Calendar"}</h4>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-pure opacity-60">Google Worksuite</p>
            </div>
          </button>

        </div>

        {/* 3. SIGN OUT ACTION (FULL WIDTH) */}
        <button 
          onClick={logout}
          className="w-full flex items-center justify-between p-8 card-pure rounded-[32px] border border-pure shadow-sm group hover:border-rose-500/20 active:scale-[0.99] transition-all duration-300 group overflow-hidden"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2x bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-12">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h4 className="text-xl font-black text-rose-500 tracking-tight">Close Session</h4>
              <p className="text-muted-pure text-xs font-bold">Securely log out of TripSetGo</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border border-pure flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-all">
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>

      </div>

      {/* FOOTER METADATA */}
      <div className="mt-20 text-center opacity-30 select-none">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-pure">
          TripSetGo Core v2.4.0 — Premium Build
        </p>
      </div>

    </div>
  );
}
