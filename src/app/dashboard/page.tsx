'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import { Wallet, TrendingDown, Activity, Plus, LogOut, Trash2, Edit2, PlayCircle, RotateCcw, Film, Star, Play, CheckCircle2 } from 'lucide-react';
import { getCurrentUser, getUserSubscriptions, addSubscription, getUserAlerts, logUsage, updateSubscription, deleteSubscription, resetUsageLogs, getRecommendations, apiClient } from '@/lib/api';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#0ea5e9'];

// --- TRAKT CONFIGURATION ---
const TRAKT_CLIENT_ID = process.env.NEXT_PUBLIC_TRAKT_CLIENT_ID || ""; 
const REDIRECT_URI = "https://subsavvy-frontend-virid.vercel.app/dashboard";
const TRAKT_AUTH_URL = `https://trakt.tv/oauth/authorize?response_type=code&client_id=${TRAKT_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

// --- TYPESCRIPT INTERFACES ---
interface User {
  email?: string;
  taste_profile?: string[];
  trakt_access_token?: string;
}

interface Subscription {
  id: string;
  platform_name?: string;
  platform?: { name: string };
  cost: number;
  billing_cycle: string;
  next_billing_date: string;
}

interface Alert {
  type: string;
  platform: string;
  message: string;
  action_url?: string;
  action_text?: string;
}

interface Provider {
  name: string;
  logo: string;
}

interface Recommendation {
  id: string;
  title: string;
  image: string;
  match: string;
  genre: string;
  trailer?: string;
  watch_link?: string;
  providers?: Provider[];
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [aiAlerts, setAiAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecsLoading, setIsRecsLoading] = useState(true); // <-- NEW STATE FOR SPINNER
  const [error, setError] = useState('');

  const [activeTrailer, setActiveTrailer] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSub, setNewSub] = useState({ platform_name: '', cost: '', billing_cycle: 'monthly', next_billing_date: '' });

  const fetchDashboardData = useCallback(async () => {
    try {
      const [userData, subData, alertsData] = await Promise.all([
        getCurrentUser(),
        getUserSubscriptions(),
        getUserAlerts()
      ]);

      setUser(userData);
      setSubscriptions(subData);
      setAiAlerts(alertsData);
      setLoading(false);

      // --- FETCH RECOMMENDATIONS WITH LOADING STATE ---
      setIsRecsLoading(true);
      getRecommendations()
        .then(recData => {
          // Safeguard in case backend returns { recommendations: [] } instead of just []
          const data = recData?.recommendations || recData;
          setRecommendations(Array.isArray(data) ? data : []);
        })
        .catch(err => console.error("Recommendations fetch failed", err))
        .finally(() => setIsRecsLoading(false)); // Turn off spinner when done

    } catch (err: unknown) {
      const authError = err as { response?: { status?: number } };
      if (authError.response?.status === 401) {
        localStorage.removeItem('access_token');
        router.push('/login');
      } else {
        setError('Failed to load data. Please refresh.');
        setLoading(false);
      }
    }
  }, [router]);

  // HANDLE TRAKT CALLBACK (NO POPUPS)
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      apiClient.post('/auth/trakt/callback', { code })
        .then(() => {
          // Clean URL and refresh data to show "Connected" state
          router.replace('/dashboard'); 
          fetchDashboardData();
        })
        .catch(err => console.error("Trakt sync failed", err));
    }
  }, [searchParams, router, fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refreshFinancialsOnly = async () => {
    try {
      const [subData, alertsData] = await Promise.all([
        getUserSubscriptions(),
        getUserAlerts()
      ]);
      setSubscriptions(subData);
      setAiAlerts(alertsData);
    } catch(err) {
      console.error(err);
    }
  };

  // Calculations
  let totalMonthlySpend = 0;
  let yearlyProjection = 0;
  subscriptions.forEach(sub => {
    const isYearly = sub.billing_cycle?.toLowerCase() === 'yearly';
    if (isYearly) {
      yearlyProjection += sub.cost;
      totalMonthlySpend += (sub.cost / 12);
    } else {
      totalMonthlySpend += sub.cost;
      yearlyProjection += (sub.cost * 12);
    }
  });

  const chartData = subscriptions.map(sub => {
    const isYearly = sub.billing_cycle?.toLowerCase() === 'yearly';
    const normalizedMonthlyCost = isYearly ? (sub.cost / 12) : sub.cost;
    return {
      name: sub.platform_name || sub.platform?.name || 'Unknown',
      value: parseFloat(normalizedMonthlyCost.toFixed(2))
    };
  });

  const openAddModal = () => {
    setEditingId(null);
    setNewSub({ platform_name: '', cost: '', billing_cycle: 'monthly', next_billing_date: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subscription) => {
    setEditingId(sub.id);
    setNewSub({
      platform_name: sub.platform_name || sub.platform?.name || '',
      cost: sub.cost.toString(),
      billing_cycle: sub.billing_cycle.toLowerCase(),
      next_billing_date: sub.next_billing_date
    });
    setIsModalOpen(true);
  };

  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...newSub, cost: parseFloat(newSub.cost) || 0 };
      if (editingId) await updateSubscription(editingId, payload);
      else await addSubscription(payload);
      setIsModalOpen(false);
      await refreshFinancialsOnly();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId || !window.confirm(`Delete this subscription?`)) return;
    setIsSubmitting(true);
    try {
      await deleteSubscription(editingId);
      setIsModalOpen(false);
      await refreshFinancialsOnly();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateWatchTime = async (subscriptionId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await logUsage({ subscription_id: subscriptionId, date_logged: today, minutes_used: 300 });
      await refreshFinancialsOnly();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetTime = async (subscriptionId: string) => {
    try {
      await resetUsageLogs(subscriptionId);
      await refreshFinancialsOnly();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-gray-100 pb-16 relative font-sans overflow-hidden flex flex-col">

      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

      <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Activity className="text-white w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">SubSavvy<span className="text-indigo-500">.ai</span></h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <p className="text-xs font-medium text-gray-300">{user?.email || 'Loading...'}</p>
            </div>
            <button onClick={() => { localStorage.removeItem('access_token'); router.push('/login'); }} className="text-sm text-gray-400 hover:text-rose-400 font-medium transition-colors flex items-center space-x-1">
              <LogOut className="w-4 h-4" /> <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex-grow flex items-center justify-center relative z-10">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-medium tracking-widest uppercase text-sm animate-pulse">Initializing</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 mt-10 space-y-10 relative z-10 w-full">
          {error && <div className="bg-rose-500/10 text-rose-400 p-4 rounded-2xl border border-rose-500/20">{error}</div>}

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl"><Wallet className="w-6 h-6"/></div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Monthly Burn</p>
              </div>
              <h2 className="text-4xl font-black text-white">₹{totalMonthlySpend.toFixed(2)}</h2>
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-fuchsia-500/20 text-fuchsia-400 rounded-2xl"><TrendingDown className="w-6 h-6"/></div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Yearly Projection</p>
              </div>
              <h2 className="text-4xl font-black text-white">₹{yearlyProjection.toFixed(2)}</h2>
            </div>

            <div className="bg-gradient-to-br from-indigo-600/20 to-fuchsia-600/20 p-6 rounded-3xl border border-indigo-500/30">
               <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-white/10 text-white rounded-2xl"><Film className="w-6 h-6"/></div>
                <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Active Platforms</p>
              </div>
              <h2 className="text-4xl font-black text-white">{subscriptions.length}</h2>
            </div>
          </div>

          {/* Recommendations */}
          <section className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px]"></div>
            <div className="flex justify-between items-end mb-6 relative z-10">
              <div>
                <h2 className="text-2xl font-black text-white mb-2 flex items-center">
                  <Star className="w-6 h-6 text-yellow-400 mr-2" fill="currentColor" /> Top Picks For You
                </h2>
                <p className="text-gray-400 text-sm">AI Curated Streaming DNA</p>
              </div>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-6 pt-2 custom-scrollbar relative z-10 snap-x min-h-[320px]">
              {/* FIXED: Check loading state first, then check empty state */}
              {isRecsLoading ? (
                <div className="flex flex-col items-center justify-center w-full py-12 text-gray-400 bg-white/5 rounded-2xl border border-dashed border-white/20">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="italic text-sm">Building library...</p>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full py-16 text-gray-400 bg-white/5 rounded-2xl border border-dashed border-white/20">
                  <p className="text-lg font-bold text-white mb-2">Your streaming DNA is still evolving 🧬</p>
                  <p className="text-sm">Watch a few more shows for your AI engine to generate matches!</p>
                </div>
              ) : (
                recommendations.map((show) => (
                  <div key={show.id} className="min-w-[200px] md:min-w-[240px] group cursor-pointer snap-start relative">
                    <div className="h-[320px] rounded-2xl overflow-hidden relative shadow-lg shadow-black/50 border border-white/5 bg-gray-900">
                      <img src={show.image} alt={show.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                      
                      {show.providers && show.providers.length > 0 && (
                        <div className="absolute top-3 right-3 flex space-x-1.5 z-30">
                          {show.providers.map((prov, idx) => (
                            <img key={idx} src={prov.logo} alt={prov.name} className="w-7 h-7 rounded-lg shadow-md border border-white/20" />
                          ))}
                        </div>
                      )}

                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" onClick={() => show.trailer ? setActiveTrailer(show.trailer) : window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(show.title + ' trailer')}`, '_blank')}>
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full hover:bg-white/40 shadow-xl cursor-pointer">
                          <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 p-4 w-full z-20">
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 block">{show.match}</span>
                        <h3 className="font-bold text-lg text-white leading-tight mb-1">{show.title}</h3>
                        <span className="text-xs font-medium text-gray-300 bg-white/10 px-2 py-1 rounded-md backdrop-blur-md">{show.genre}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Insights & TV Integration */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl lg:col-span-1 flex flex-col h-[420px]">
              <h3 className="text-lg font-bold text-white mb-6">Spend Distribution</h3>
              {/* FIXED RECHARTS HEIGHT ERROR HERE */}
              <div className="flex-grow flex items-center justify-center relative w-full h-full min-h-[250px]">
                {subscriptions.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-gray-500 italic text-sm">No spend data</p>}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                  <span className="text-3xl font-black text-white">₹{totalMonthlySpend.toFixed(0)}</span>
                  <span className="text-xs text-gray-400 uppercase tracking-widest">/ month</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl lg:col-span-2 flex flex-col h-[420px]">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="bg-indigo-500/20 text-indigo-400 p-1.5 rounded-lg mr-3">✨</span> AI Financial Insights
              </h3>

              <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar min-h-0 mb-4 border-b border-white/10 pb-6">
                {aiAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 italic">
                    <p>Analyzing habits...</p>
                  </div>
                ) : (
                  aiAlerts.map((alert, index) => (
                    <div key={index} className={`p-4 border rounded-2xl backdrop-blur-md transition-all ${alert.type === 'alert' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-indigo-500/10 border-indigo-500/30'}`}>
                      <h4 className="font-bold text-sm mb-1 text-white">{alert.platform}</h4>
                      <p className="text-sm opacity-90 leading-relaxed">{alert.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* DNA & SMART TV TRACKING (REFINED UI) */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {user?.taste_profile?.map((genre, idx) => (
                    <span key={idx} className="text-[10px] font-black text-white bg-white/5 border border-white/10 px-3 py-1.5 rounded-full uppercase tracking-tighter">
                      {genre}
                    </span>
                  ))}
                </div>

                <div className="p-4 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center">
                      <PlayCircle className={`w-3.5 h-3.5 mr-2 ${user?.trakt_access_token ? 'text-emerald-400' : 'text-indigo-400'}`} />
                      Smart TV Sync
                    </h4>
                    <p className="text-[9px] text-gray-500 mt-0.5">
                      {user?.trakt_access_token ? "Auto-syncing your media library" : "Connect Trakt to automate tracking"}
                    </p>
                  </div>

                  {user?.trakt_access_token ? (
                    <div className="flex items-center space-x-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="text-[9px] font-black text-emerald-400 uppercase">Connected</span>
                    </div>
                  ) : (
                    <a href={TRAKT_AUTH_URL} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold rounded-lg transition-all">
                      Connect Now
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Section */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white">Your Portfolio</h2>
              <button onClick={openAddModal} className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-full text-sm font-bold transition-all shadow-xl flex items-center space-x-2">
                <Plus className="w-4 h-4" /> <span>Add Platform</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="bg-white/5 rounded-3xl border border-white/10 p-6 hover:border-indigo-500/40 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-black text-xl text-white tracking-tight">{sub.platform_name || sub.platform?.name}</h3>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-white/5 pb-4">
                      <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">{sub.billing_cycle}</span>
                      <span className="font-black text-xl text-white">₹{sub.cost}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 uppercase font-bold tracking-widest">Next Bill</span>
                      <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-md">{sub.next_billing_date}</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-3 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleSimulateWatchTime(sub.id)} className="p-2 bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-lg transition-colors flex justify-center"><PlayCircle className="w-4 h-4"/></button>
                    <button onClick={() => handleResetTime(sub.id)} className="p-2 bg-white/5 hover:bg-amber-500/10 hover:text-amber-400 rounded-lg transition-colors flex justify-center"><RotateCcw className="w-4 h-4"/></button>
                    <button onClick={() => openEditModal(sub)} className="p-2 bg-white/5 hover:bg-indigo-500/10 hover:text-indigo-400 rounded-lg transition-colors flex justify-center"><Edit2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Modals and Trailers (Logic remains standard) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-[100]">
          <div className="bg-[#18181b] border border-white/10 rounded-3xl max-w-md w-full p-8">
            <h2 className="text-xl font-black text-white mb-6">{editingId ? 'Edit Platform' : 'New Platform'}</h2>
            <form onSubmit={handleSaveSubscription} className="space-y-4">
              <input type="text" required placeholder="Platform Name" className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white" value={newSub.platform_name} onChange={e => setNewSub({...newSub, platform_name: e.target.value})} />
              <div className="flex space-x-2">
                <input type="number" step="0.01" required className="w-1/2 p-3 bg-black/40 border border-white/10 rounded-xl text-white" value={newSub.cost} onChange={e => setNewSub({...newSub, cost: e.target.value})} />
                <select className="w-1/2 p-3 bg-black/40 border border-white/10 rounded-xl text-white" value={newSub.billing_cycle} onChange={e => setNewSub({...newSub, billing_cycle: e.target.value})}>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <input type="date" required className="w-full p-3 bg-black/40 border border-white/10 rounded-xl text-white" value={newSub.next_billing_date} onChange={e => setNewSub({...newSub, next_billing_date: e.target.value})} />
              <div className="flex justify-end space-x-2 pt-4">
                {editingId && <button type="button" onClick={handleDelete} className="text-rose-400 mr-auto text-xs font-bold uppercase"><Trash2 className="w-4 h-4 inline mr-1"/> Delete</button>}
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-white text-black font-bold rounded-xl">{isSubmitting ? '...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTrailer && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200]">
          <button onClick={() => setActiveTrailer(null)} className="absolute top-8 right-8 bg-white/10 p-3 rounded-full text-white"><Plus className="rotate-45" /></button>
          <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10">
            <iframe src={activeTrailer} className="w-full h-full" allowFullScreen></iframe>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}} />
    </div>
  );
}

// WRAPPER FOR VERCEL
export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b] flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Environment...</div>}>
      <DashboardContent />
    </Suspense>
  );
}