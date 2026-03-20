'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, Shield, Zap, ChevronRight, BarChart3, CheckCircle2, Download, Settings, Puzzle, X, Menu, Play } from 'lucide-react';

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleDownload = () => {
    // In a real build, ensure this file exists in your /public folder
    const link = document.createElement('a');
    link.href = '/subsavvy-extension.zip';
    link.download = 'subsavvy-extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  return (
    // FIX 1: overflow-x-hidden on the wrapper prevents orbs from breaking the width
    <div className="bg-[#09090b] text-gray-100 font-sans selection:bg-indigo-500/30 relative min-h-screen flex flex-col overflow-x-hidden">

      {/* ANIMATED BACKGROUND ORBS - Wrapped in a container to prevent scroll bleed */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] bg-indigo-600/20 rounded-full blur-[120px] md:blur-[150px] animate-pulse duration-[3000ms]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[60vw] h-[60vw] md:w-[50vw] md:h-[50vw] bg-fuchsia-600/10 rounded-full blur-[120px] md:blur-[150px]"></div>
        <div className="absolute bottom-[-5%] left-[20%] w-[70vw] h-[70vw] md:w-[60vw] md:h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] md:blur-[150px]"></div>
      </div>

      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Activity className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">SubSavvy<span className="text-indigo-500">.ai</span></span>
          </div>

          <div className="hidden sm:flex items-center space-x-6">
            <Link href="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
              Dashboard Login
            </Link>
            <button onClick={handleDownload} className="text-sm font-bold bg-white text-black px-5 py-2 rounded-full hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105 transform flex items-center gap-2">
              <Download className="w-4 h-4" /> Download Beta
            </button>
          </div>

          <button className="sm:hidden text-gray-300 hover:text-white transition-colors p-1" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-white/5 bg-black/90 backdrop-blur-md px-4 py-4 flex flex-col space-y-3">
            <Link href="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>
              Dashboard Login
            </Link>
            <button onClick={handleDownload} className="text-sm font-bold bg-white text-black px-5 py-3 rounded-full flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Download Beta
            </button>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 pt-32 pb-16 md:pt-48 md:pb-32 px-4 flex-grow">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">SubTracker AI Beta is Live</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-[1.1]">
            Stop Wasting Money on{' '}
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">
              Unwatched Subscriptions.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            The intelligent Chrome extension that silently tracks your watch time across Netflix, Prime, and Hotstar, 
            identifies your streaming DNA, and tells you exactly which platforms to cancel.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={handleDownload} className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-8 py-4 rounded-full font-black text-lg transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:scale-105 transform">
              <Download className="w-5 h-5" />
              <span>Download Extension Free</span>
            </button>
            <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors backdrop-blur-md">
              <span>Create Web Account</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>

      {/* STATS */}
      <section className="border-y border-white/5 bg-black/20 backdrop-blur-md py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><h3 className="text-3xl font-black text-white mb-1">₹4,200+</h3><p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Avg. Yearly Savings</p></div>
          <div className="border-l border-white/5"><h3 className="text-3xl font-black text-white mb-1">8+</h3><p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Platforms Supported</p></div>
          <div className="border-l border-white/5"><h3 className="text-3xl font-black text-white mb-1">100%</h3><p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Automated Tracking</p></div>
          <div className="border-l border-white/5"><h3 className="text-3xl font-black text-white mb-1">AI</h3><p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Powered Insights</p></div>
        </div>
      </section>

      {/* AI BRAIN SECTION (Merged from previous version) */}
      <section id="ai" className="py-24 max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">The <span className="text-indigo-500">DNA Brain</span></h2>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              SubSavvy doesn't just ask what you like. It watches what you do. 
              Our TMDB-linked AI builds a Streaming DNA profile of your tastes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["Passive Genre Mapping", "Cross-Platform Discovery", "Usage ROI Analysis", "Smart Bill Alerts"].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-200 font-bold bg-white/5 p-3 rounded-xl border border-white/5">
                  <CheckCircle2 className="text-emerald-500 w-5 h-5" /> {item}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full aspect-video rounded-3xl bg-gradient-to-tr from-indigo-900/40 to-fuchsia-900/40 border border-white/10 flex flex-col items-center justify-center shadow-2xl relative group overflow-hidden">
             <div className="text-3xl font-black mb-2 animate-pulse tracking-tighter uppercase text-white">AI Pulse Active</div>
             <div className="text-indigo-300 font-mono text-sm uppercase">Syncing TMDB Metadata...</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-white/5 bg-black/40 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3 text-white">
            <Activity className="text-indigo-500 w-6 h-6" />
            <span className="text-xl font-black tracking-tight">SubSavvy<span className="text-indigo-500">.ai</span></span>
          </div>
          <p className="text-gray-500 text-sm font-medium">© {new Date().getFullYear()} SubSavvy AI. Built for the modern streamer.</p>
        </div>
      </footer>

      {/* MODAL (Unchanged Logic) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-white/10 rounded-3xl max-w-lg w-full p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-white"><X /></button>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-emerald-500 p-2 rounded-xl"><CheckCircle2 className="text-white" /></div>
              <h3 className="text-2xl font-black text-white">Download Started!</h3>
            </div>
            <p className="text-gray-400 mb-8">Follow these 30-second steps to load the Beta extension:</p>
            <div className="space-y-6">
               <div className="flex gap-4"><Settings className="text-indigo-400" /><div><h4 className="text-white font-bold">1. chrome://extensions</h4><p className="text-sm text-gray-500">Open this in a new tab.</p></div></div>
               <div className="flex gap-4"><Zap className="text-fuchsia-400" /><div><h4 className="text-white font-bold">2. Developer Mode</h4><p className="text-sm text-gray-500">Toggle the switch in the top right.</p></div></div>
               <div className="flex gap-4"><Puzzle className="text-emerald-400" /><div><h4 className="text-white font-bold">3. Drag & Drop</h4><p className="text-sm text-gray-500">Drop the downloaded .zip into Chrome.</p></div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}