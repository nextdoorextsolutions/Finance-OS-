
import React, { useState, useEffect, useCallback } from 'react';
import { INITIAL_SCHEMA } from './constants';
import { Table, OutputFormat } from './types';
import SchemaCard from './components/SchemaCard';
import CodeViewer from './components/CodeViewer';
import { getArchitecturalAdvice, generateCode } from './services/geminiService';

const App: React.FC = () => {
  const [schema] = useState<Table[]>(INITIAL_SCHEMA);
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [format, setFormat] = useState<OutputFormat>(OutputFormat.DJANGO_MODELS);

  const fetchAdvice = useCallback(async () => {
    setLoading(true);
    try {
      const text = await getArchitecturalAdvice(JSON.stringify(schema));
      setAdvice(text || 'No insights available.');
    } catch (error) {
      console.error(error);
      setAdvice('AI analysis unavailable. Verify API Key.');
    } finally {
      setLoading(false);
    }
  }, [schema]);

  const handleGenerateCode = async (selectedFormat: OutputFormat) => {
    setFormat(selectedFormat);
    setLoading(true);
    try {
      const code = await generateCode(schema, selectedFormat);
      setGeneratedCode(code || '');
    } catch (error) {
      console.error(error);
      alert('Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [fetchAdvice]);

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-slate-300 font-sans">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-emerald-900/10 bg-[#050807] z-50 flex flex-col">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <span className="text-black font-bold text-xl">$</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">FinanceOS</h1>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {[
            { id: 'dash', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', active: true },
            { id: 'up', label: 'Upload', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
            { id: 'set', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
          ].map(item => (
            <button 
              key={item.id} 
              onClick={() => {if(item.id === 'dash') setGeneratedCode('')}}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${item.active && !generatedCode ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-emerald-900/10">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-1">Last synced</p>
          <p className="text-xs text-emerald-500/60 font-medium">2 minutes ago</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64">
        {/* Header */}
        <header className="px-10 py-8 flex justify-between items-center bg-[#0a0f0d]/80 backdrop-blur-md sticky top-0 z-40">
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h2 className="text-2xl font-bold text-white tracking-tight">Financial Overview</h2>
            </div>
            <p className="text-sm text-slate-500">Real-time insights and projections</p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Import
          </button>
        </header>

        <div className="px-10 pb-10 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Dashboard Metric Selectors */}
          <div className="lg:col-span-3 space-y-6">
            <section className="bg-[#0d1310] border border-white/5 rounded-2xl p-6 shadow-xl">
              <h3 className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-4">Architecture AI</h3>
              {loading && !advice ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-3 bg-white/5 rounded w-3/4"></div>
                  <div className="h-3 bg-white/5 rounded"></div>
                </div>
              ) : (
                <div className="text-sm leading-relaxed text-slate-400 italic font-medium">
                  "{advice}"
                </div>
              )}
            </section>

            <section className="bg-[#0d1310] border border-white/5 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-sm">Service Layer</h3>
                <span className="text-emerald-500 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 rounded">v1.3.1</span>
              </div>
              
              <div className="space-y-2">
                {Object.values(OutputFormat).map((f) => (
                  <button
                    key={f}
                    onClick={() => handleGenerateCode(f)}
                    className={`w-full p-4 text-left rounded-xl border transition-all flex items-center justify-between group ${
                      format === f && generatedCode
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                      : 'bg-[#0a0f0d] border-white/5 text-slate-500 hover:border-emerald-500/20 hover:text-slate-300'
                    }`}
                  >
                    <span className="font-bold text-xs">{f}</span>
                    <svg className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${format === f && generatedCode ? 'text-emerald-400' : 'text-slate-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Logic Area */}
          <div className="lg:col-span-9">
            {generatedCode ? (
              <CodeViewer title={`${format}`} code={generatedCode} />
            ) : (
              <div className="space-y-8 animate-in fade-in duration-700">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Metric Box */}
                  <div className="bg-[#0d1310] border border-white/5 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <svg className="w-32 h-32 text-emerald-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Current Standing</p>
                      <h4 className="text-xs font-semibold text-slate-400 mb-2">Safe to Spend</h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-emerald-500 opacity-50 tracking-tighter">$</span>
                        <h5 className="text-8xl font-black text-emerald-500 tracking-tighter drop-shadow-[0_0_40px_rgba(16,185,129,0.3)]">680</h5>
                      </div>
                    </div>
                    <div className="mt-8 flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40"></div>
                      </div>
                      <p className="text-xs font-bold text-emerald-500/80 uppercase tracking-widest">Healthy Balance</p>
                    </div>

                    <div className="mt-12 grid grid-cols-3 gap-8 pt-8 border-t border-white/5">
                      <div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">Total Balance</p>
                        <p className="text-lg font-bold text-white tracking-tight">$3,920</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">Pending Bills</p>
                        <p className="text-lg font-bold text-red-400 tracking-tight">-$2,360</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">Buffer</p>
                        <p className="text-lg font-bold text-amber-500 tracking-tight">-$880</p>
                      </div>
                    </div>
                  </div>

                  {/* Chart Mock */}
                  <div className="bg-[#0d1310] border border-white/5 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h4 className="text-lg font-bold text-white tracking-tight">Cashflow Runway</h4>
                        <p className="text-xs text-slate-500 mt-1">8-week balance projection</p>
                      </div>
                      <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/20">60 days</div>
                    </div>
                    <div className="h-64 flex items-end gap-1 px-2 relative">
                      <div className="absolute inset-0 flex flex-col justify-between py-2 text-[10px] text-slate-700 font-bold border-l border-white/5 pl-2">
                        <span>$3000</span>
                        <span>$2000</span>
                        <span>$1000</span>
                        <span>$0</span>
                        <span>-$1000</span>
                      </div>
                      {[...Array(24)].map((_, i) => (
                        <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-sm" style={{ height: `${30 + Math.sin(i * 0.4) * 50}%` }}></div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-between px-8 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                      <span>2023-10-08</span>
                      <span>2023-10-22</span>
                      <span>2023-11-05</span>
                      <span>2023-11-19</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="bg-[#0d1310] border border-white/5 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h4 className="text-lg font-bold text-white tracking-tight">Upcoming Bills</h4>
                        <p className="text-xs text-slate-500 mt-1">Next 30 days</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">1 Paid</span>
                        <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">2 Pending</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[
                        { name: 'Rent', date: '2023-10-10', amount: '$800.00', status: 'Paid', statusColor: 'bg-emerald-500/20 text-emerald-500' },
                        { name: 'Electricity', date: '2023-10-15', amount: '$200.00', status: 'Pending', statusColor: 'bg-amber-500/20 text-amber-500' },
                      ].map(bill => (
                        <div key={bill.name} className="flex items-center justify-between p-4 bg-[#0a0f0d] rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{bill.name}</p>
                              <p className="text-xs text-slate-500 font-medium">Due {bill.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-lg font-black text-white">{bill.amount}</span>
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-lg ${bill.statusColor}`}>{bill.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                      Core Schema Architect
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                      {schema.map(table => (
                        <SchemaCard key={table.name} table={table} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
