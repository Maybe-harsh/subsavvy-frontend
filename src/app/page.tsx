'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, TrendingDown, Shield, Zap, ChevronRight, PlayCircle, BarChart3, CheckCircle2, Download, Settings, Puzzle, X } from 'lucide-react';

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownload = () => {
    // 1. Trigger the file download programmatically
    const link = document.createElement('a');
    link.href = '/subsavvy-extension.zip';
    link.download = 'subsavvy-extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 2. Open the instruction modal
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      
      {/* ANIMATED BACKGROUND ORBS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen animate-pulse duration-[3000ms]"></div>
      <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>

      {/* NAVBAR */}
      <nav className="border-b border-white/5 bg-black/10 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Activity className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">SubSavvy<span className="text-indigo-500">.ai</span></span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors">
              Dashboard Login
            </Link>
            <button onClick={handleDownload} className="text-sm font-bold bg-white text-black px-5 py-2 rounded-full hover:bg-gray-200 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105 transform flex items-center gap-2">
              <Download className="w-4 h-4" /> Download Beta
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">SubTracker AI Beta is Live</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-white mb-8 leading-[1.1]">
            Stop Wasting Money on <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">
              Unwatched Subscriptions.
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
            The intelligent Chrome extension that silently tracks your watch time across Netflix, Prime, and Hotstar, 
            identifies your streaming DNA, and tells you exactly which platforms to cancel.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
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

      {/* SOCIAL PROOF / STATS */}
      <section className="border-y border-white/5 bg-black/20 backdrop-blur-md py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
          <div>
            <h3 className="text-3xl font-black text-white mb-1">₹4,200+</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Avg. Yearly Savings</p>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white mb-1">8+</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Platforms Supported</p>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white mb-1">100%</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Automated Tracking</p>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white mb-1">AI</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Powered Insights</p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 relative z-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">Your Streaming Financial Advisor</h2>
            <p className="text-gray-400 max-w-2xl mx-auto font-medium">We don't just track your money; we analyze your watching habits to ensure you get the most value per minute.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group">
              <div className="bg-indigo-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">Silent Background Tracking</h3>
              <p className="text-gray-400 leading-relaxed text-sm">Our Chrome extension sits quietly in the background. The moment you hit play on Netflix or Prime, we start the clock. No manual entry required.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group">
              <div className="bg-fuchsia-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-fuchsia-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">AI Value Calculations</h3>
              <p className="text-gray-400 leading-relaxed text-sm">We calculate your exact "cost per minute" watched. If you're paying ₹299 for a platform but only watching 10 minutes a month, we alert you to cancel.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group">
              <div className="bg-emerald-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">Streaming DNA Matching</h3>
              <p className="text-gray-400 leading-relaxed text-sm">We analyze the genres you actually watch to build your Streaming DNA. We then recommend cheaper platforms that perfectly match your specific tastes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-24 relative z-10 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-900/40 to-fuchsia-900/40 border border-indigo-500/30 rounded-[3rem] p-12 md:p-20 text-center backdrop-blur-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[100px]"></div>
          
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 relative z-10 tracking-tight">Ready to take control of your subscriptions?</h2>
          <p className="text-lg text-indigo-200 mb-10 max-w-xl mx-auto relative z-10">Join today and let our AI instantly curate your portfolio and recommend the best shows available on your active platforms.</p>
          
          <div className="flex flex-col items-center justify-center relative z-10">
            <Link href="/signup" className="bg-white text-black px-10 py-5 rounded-full font-black text-lg transition-all hover:bg-gray-200 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transform mb-6">
              Create Your Free Account
            </Link>
            <div className="flex items-center space-x-6 text-sm font-medium text-gray-400">
              <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> No credit card required</span>
              <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> Set up in 2 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-black/40 pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <Activity className="text-indigo-500 w-6 h-6" />
            <span className="text-xl font-black tracking-tight text-white">SubSavvy<span className="text-indigo-500">.ai</span></span>
          </div>
          <p className="text-gray-500 text-sm font-medium">© {new Date().getFullYear()} SubSavvy AI. Built for the modern streamer.</p>
        </div>
      </footer>

      {/* INSTALLATION INSTRUCTIONS MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#18181b] border border-white/10 rounded-3xl max-w-lg w-full p-8 relative shadow-[0_0_50px_rgba(99,102,241,0.2)] animate-in fade-in zoom-in duration-200">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-2 rounded-xl">
                <CheckCircle2 className="text-white w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Download Started!</h3>
            </div>
            
            <p className="text-gray-400 mb-8">Because SubSavvy is currently in closed Beta, you will need to load it directly into Chrome. It takes 30 seconds:</p>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-white/10 p-3 rounded-lg flex-shrink-0">
                  <Settings className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">1. Open Extensions</h4>
                  <p className="text-sm text-gray-500">Open a new tab and go to <code className="bg-black px-2 py-1 rounded text-indigo-300">chrome://extensions</code></p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/10 p-3 rounded-lg flex-shrink-0">
                  <Zap className="w-5 h-5 text-fuchsia-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">2. Enable Developer Mode</h4>
                  <p className="text-sm text-gray-500">Toggle the <strong>Developer mode</strong> switch in the top right corner.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-white/10 p-3 rounded-lg flex-shrink-0">
                  <Puzzle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">3. Drag & Drop</h4>
                  <p className="text-sm text-gray-500">Drag the <strong>subsavvy-extension.zip</strong> file you just downloaded straight into that window.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
              <p className="text-xs text-gray-500">Need an account to log in?</p>
              <Link href="/signup" className="text-sm font-bold text-indigo-400 hover:text-indigo-300">
                Create Account &rarr;
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}