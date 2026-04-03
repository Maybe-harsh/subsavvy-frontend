'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';
import { Wallet, TrendingDown, Activity, Plus, LogOut, Trash2, Edit2, PlayCircle, RotateCcw, Film, Star, Play } from 'lucide-react';
import { getCurrentUser, getUserSubscriptions, addSubscription, getUserAlerts, logUsage, updateSubscription, deleteSubscription, resetUsageLogs, getRecommendations, apiClient } from '@/lib/api';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#0ea5e9'];

// --- TRAKT CONFIGURATION ---
const TRAKT_CLIENT_ID = "YOUR_PASTED_CLIENT_ID"; // Replace with your real Client ID
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

// 1. WE RENAMED THIS FROM 'Dashboard' TO 'DashboardContent'
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [aiAlerts, setAiAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
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

      getRecommendations()
        .then(recData => setRecommendations(recData))
        .catch(err => console.error("Recommendations fetch failed", err));

    } catch (err: unknown) {
      const authError = err as { response?: { status?: number } };
      if (authError.response?.status === 401) {
        localStorage.removeItem('access_token');
        router.push('/login');
      } else {
        setError('Failed to load your data. Please try refreshing.');
        setLoading(false);
      }
    }
  }, [router]);

  // Handle Trakt OAuth Callback
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      apiClient.post('/auth/trakt/callback', { code })
        .then(() => {
          alert("✅ Successfully connected to Trakt.tv!");
          router.replace('/dashboard'); 
          fetchDashboardData();
        })
        .catch(err => console.error("Trakt connection failed", err));
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
      console.error("Failed to refresh financials", err);
    }
  };

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
      alert("Failed to save subscription.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    if (!window.confirm(`Are you sure you want to delete this subscription?`)) return;
    setIsSubmitting(true);
    try {
      await deleteSubscription(editingId);
      setIsModalOpen(false);
      await refreshFinancialsOnly();
    } catch (err) {
      console.error(err);
      alert("Failed to delete subscription.");
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
      alert("Failed to log time.");
    }
  };

  const handleResetTime = async (subscriptionId: string) => {
    try {
      await resetUsageLogs(subscriptionId);
      await refreshFinancialsOnly();
    } catch (err) {
      console.error(err);
      alert("Failed to reset time.");
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
            <p className="text-gray-400 font-medium tracking-widest uppercase text-sm animate-pulse">Loading Dashboard</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 mt-10 space-y-10 relative z-10 w-full">
          {error && <div className="bg-rose-500/10 text-rose-400 p-4 rounded-2xl border border-rose-500/20 backdrop-blur-md">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl"><Wallet className="w-6 h-6"/></div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Monthly Burn</p>
              </div>
              <h2 className="text-4xl font-black text-white">₹{totalMonthlySpend.toFixed(2)}</h2>
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-fuchsia-500/20 text-fuchsia-400 rounded-2xl"><TrendingDown className="w-6 h-6"/></div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Yearly Projection</p>
              </div>
              <h2 className="text-4xl font-black text-white">₹{yearlyProjection.toFixed(2)}</h2>
            </div>

            <div className="bg-gradient-to-br from-indigo-600/20 to-fuchsia-600/20 p-6 rounded-3xl border border-indigo-500/30 backdrop-blur-xl">
               <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-white/10 text-white rounded-2xl"><Film className="w-6 h-6"/></div>
                <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Active Platforms</p>
              </div>
              <h2 className="text-4xl font-black text-white">{subscriptions.length}</h2>
            </div>
          </div>

          <section className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[80px]"></div>
            <div className="flex justify-between items-end mb-6 relative z-10">
              <div>
                <h2 className="text-2xl font-black text-white mb-2 flex items-center">
                  <Star className="w-6 h-6 text-yellow-400 mr-2" fill="currentColor" /> Top Picks For You
                </h2>
                <p className="text-gray-400 text-sm">Based on your Streaming DNA across all platforms.</p>
              </div>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-6 pt-2 custom-scrollbar relative z-10 snap-x min-h-[320px]">
              {recommendations.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full py-12 text-gray-400 bg-white/5 rounded-2xl border border-dashed border-white/20">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="italic text-sm">Curating your personalized library...</p>
                </div>
              ) : (
                recommendations.map((show) => (
                  <div key={show.id} className="min-w-[200px] md:min-w-[240px] group cursor-pointer snap-start relative">
                    <div className="h-[320px] rounded-2xl overflow-hidden relative shadow-lg shadow-black/50 border border-white/5 bg-gray-900">
                      <img src={show.image} alt={show.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                      {show.providers && show.providers.length > 0 && (
                        <div className="absolute top-3 right-3 flex space-x-1.5 z-30">
                          {show.providers.map((prov: Provider, idx: number) => (
                            <a
                              key={idx}
                              href={show.watch_link || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="transition-transform hover:scale-110 block"
                            >
                              <img
                                src={prov.logo}
                                alt={prov.name}
                                title={`Watch on ${prov.name}`}
                                className="w-7 h-7 rounded-lg shadow-md border border-white/20"
                              />
                            </a>
                          ))}
                        </div>
                      )}

                      <div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                        onClick={() =>
                          show.trailer
                            ? setActiveTrailer(show.trailer)
                            : window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(show.title + ' official trailer')}`, '_blank')
                        }
                      >
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full hover:bg-white/40 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.3)] cursor-pointer">
                          <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 p-4 w-full z-20 pointer-events-none">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl lg:col-span-1 flex flex-col h-[420px]">
              <h3 className="text-lg font-bold text-white mb-6">Spend Distribution</h3>
              {subscriptions.length > 0 ? (
                <div className="flex-grow flex items-center justify-center min-h-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value: number | undefined) => `₹${value ?? 0}`}
                        contentStyle={{ backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                    <span className="text-3xl font-black text-white">₹{totalMonthlySpend.toFixed(0)}</span>
                    <span className="text-xs text-gray-400 uppercase tracking-widest">/ month</span>
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center text-gray-500 text-sm italic">No data to chart yet.</div>
              )}
            </div>

            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-xl lg:col-span-2 flex flex-col h-[420px]">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="bg-indigo-500/20 text-indigo-400 p-1.5 rounded-lg mr-3">✨</span> AI Financial Insights
              </h3>

              <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar min-h-0 mb-4 border-b border-white/10 pb-6">
                {aiAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                    <Activity className="w-8 h-8 opacity-50" />
                    <p className="italic">Analyzing your watch habits...</p>
                  </div>
                ) : (
                  aiAlerts.map((alert, index) => {
                    let styles = "border-indigo-500/30 bg-indigo-500/10 text-indigo-100";
                    let btnStyles = "bg-indigo-500 text-white hover:bg-indigo-600 border-none";
                    if (alert.type === 'warning') {
                      styles = "border-amber-500/30 bg-amber-500/10 text-amber-100";
                      btnStyles = "bg-amber-500 text-white hover:bg-amber-600 border-none";
                    }
                    if (alert.type === 'alert') {
                      styles = "border-rose-500/30 bg-rose-500/10 text-rose-100";
                      btnStyles = "bg-rose-500 text-white hover:bg-rose-600 border-none";
                    }
                    if (alert.type === 'success') {
                      styles = "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";
                    }

                    return (
                      <div key={index} className={`p-4 border rounded-2xl backdrop-blur-md shrink-0 transition-transform hover:-translate-y-1 duration-300 ${styles}`}>
                        <h4 className="font-bold text-sm mb-1 text-white">{alert.platform}</h4>
                        <p className="text-sm opacity-90 leading-relaxed mb-3">{alert.message}</p>

                        {alert.action_url && (
                          <a href={alert.action_url} target="_blank" rel="noopener noreferrer" className={`inline-block px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition-colors ${btnStyles}`}>
                            {alert.action_text}
                          </a>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Your Streaming DNA</h4>
                <div className="flex flex-wrap gap-2 mb-6">
                  {(!user?.taste_profile || user.taste_profile.length === 0) ? (
                    <span className="text-sm text-gray-500 italic bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                      Watch more shows to build your profile...
                    </span>
                  ) : (
                    user.taste_profile.map((genre: string, index: number) => (
                      <span
                        key={index}
                        className="text-xs font-bold text-white bg-gradient-to-r from-indigo-500/20 to-fuchsia-500/20 border border-white/10 px-4 py-2 rounded-full shadow-lg"
                      >
                        {genre}
                      </span>
                    ))
                  )}
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center">
                        <PlayCircle className="w-4 h-4 mr-2 text-indigo-500" /> 
                        Smart TV Tracking
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1">Connect Trakt.tv to sync living room watch time.</p>
                    </div>
                    <a 
                      href={TRAKT_AUTH_URL}
                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                    >
                      {user?.trakt_access_token ? 'Re-connect' : 'Connect Now'}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white">Your Portfolio</h2>
              <button onClick={openAddModal} className="flex items-center space-x-2 bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-full text-sm font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transform">
                <Plus className="w-4 h-4" /> <span>Add Platform</span>
              </button>
            </div>

            {subscriptions.length === 0 ? (
               <div className="bg-white/5 p-16 rounded-3xl border border-dashed border-white/20 text-center backdrop-blur-sm">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6"><Plus className="w-10 h-10 text-gray-400"/></div>
                <h3 className="text-xl font-bold text-white mb-2">No subscriptions yet</h3>
                <p className="text-gray-400 max-w-sm mx-auto">Track your first platform to let SubSavvy start saving you money.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptions.map((sub: Subscription) => {
                  const isYearly = sub.billing_cycle?.toLowerCase() === 'yearly';

                  return (
                    <div key={sub.id} className="bg-white/5 rounded-3xl border border-white/10 hover:border-indigo-500/50 transition-all duration-300 flex flex-col overflow-hidden group relative backdrop-blur-xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      <div className="p-6 flex-grow relative z-10">
                        <div className="flex justify-between items-start mb-6">
                          <h3 className="font-black text-2xl text-white tracking-tight">{sub.platform_name || sub.platform?.name}</h3>
                          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                        </div>
                        <div className="space-y-5">
                          <div className="flex justify-between items-end border-b border-white/10 pb-4">
                            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">{isYearly ? 'Yearly' : 'Monthly'}</span>
                            <span className="font-black text-white text-2xl">
                              ₹{sub.cost}<span className="text-sm font-normal text-gray-500 ml-1">{isYearly ? '/yr' : '/mo'}</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Next Bill</span>
                            <span className="font-bold text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">{sub.next_billing_date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/10 bg-black/40 p-2 grid grid-cols-3 gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity relative z-10">
                        <button onClick={() => handleSimulateWatchTime(sub.id)} className="flex items-center justify-center space-x-1.5 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-gray-300 py-3 rounded-xl text-xs font-bold transition-colors">
                          <PlayCircle className="w-4 h-4" /> <span>Add</span>
                        </button>
                        <button onClick={() => handleResetTime(sub.id)} className="flex items-center justify-center space-x-1.5 bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-gray-300 py-3 rounded-xl text-xs font-bold transition-colors">
                          <RotateCcw className="w-4 h-4" /> <span>Reset</span>
                        </button>
                        <button onClick={() => openEditModal(sub)} className="flex items-center justify-center space-x-1.5 bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-400 text-gray-300 py-3 rounded-xl text-xs font-bold transition-colors">
                          <Edit2 className="w-4 h-4" /> <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-[100]">
          <div className="bg-[#18181b] border border-white/10 rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all">
            <h2 className="text-2xl font-black text-white mb-6">{editingId ? 'Edit Subscription' : 'Add Platform'}</h2>

            <form onSubmit={handleSaveSubscription} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Platform Name</label>
                <input type="text" required placeholder="e.g. Netflix, Spotify" className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-600 outline-none transition-all" value={newSub.platform_name} onChange={e => setNewSub({...newSub, platform_name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cost (₹)</label>
                  <input type="number" step="0.01" required placeholder="0.00" className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-600 outline-none transition-all" value={newSub.cost} onChange={e => setNewSub({...newSub, cost: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cycle</label>
                  <select className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white outline-none transition-all appearance-none" value={newSub.billing_cycle} onChange={e => setNewSub({...newSub, billing_cycle: e.target.value})}>
                    <option value="monthly" className="bg-[#18181b]">Monthly</option>
                    <option value="yearly" className="bg-[#18181b]">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Next Billing Date</label>
                <input type="date" required className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white outline-none transition-all [color-scheme:dark]" value={newSub.next_billing_date} onChange={e => setNewSub({...newSub, next_billing_date: e.target.value})} />
              </div>

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
                {editingId ? (
                  <button type="button" onClick={handleDelete} disabled={isSubmitting} className="flex items-center space-x-1.5 px-4 py-2.5 text-sm font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4"/> <span>Delete</span>
                  </button>
                ) : <div></div>}

                <div className="flex space-x-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-black bg-white hover:bg-gray-200 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)] disabled:opacity-70 transition-all">
                    {isSubmitting ? 'Saving...' : 'Save Data'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTrailer && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 z-[200]">
          <button
            onClick={() => setActiveTrailer(null)}
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md"
          >
            <Plus className="w-6 h-6 rotate-45" />
          </button>

          <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)] border border-white/10 bg-black relative">
             <div className="absolute inset-0 flex items-center justify-center -z-10">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
            <iframe
              src={activeTrailer}
              className="w-full h-full relative z-10"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
      `}} />
    </div>
  );
}

// 2. THIS IS THE BRAND NEW SUSPENSE WRAPPER FOR VERCEL
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-medium tracking-widest uppercase text-sm animate-pulse">Loading Application...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}