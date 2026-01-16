
import React, { useState } from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';

const CookiePolicy = () => {
    // Mock state for the interactive visual
    const [toggles, setToggles] = useState({
        essential: true,
        performance: false,
        functional: true,
        marketing: false
    });

    const handleToggle = (key) => {
        if (key === 'essential') return; // Essential always on
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <UserHeader />

            {/* Dark Premium Hero */}
            <div className="bg-[#0f172a] text-white pt-20 pb-32 relative overflow-hidden">
                {/* Abstract "Network" Background */}
                <div className="absolute inset-0 opacity-20">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="none" stroke="url(#grad1)" strokeWidth="0.5" />
                        <path d="M0 100 C 50 0 80 0 100 100 Z" fill="none" stroke="url(#grad2)" strokeWidth="0.5" />
                        <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                            </linearGradient>
                            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                    <div className="inline-block p-4 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-8 animate-fade-in-up">
                        <Icon name="cog" className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
                        Transparency in <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">every byte.</span>
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        We believe you should control your digital footprint. This dashboard explains exactly what cookies we use and gives you the knowledge to manage them.
                    </p>
                </div>
            </div>

            {/* Main Content - Overlapping Card Design */}
            <div className="relative z-20 max-w-5xl mx-auto px-4 -mt-20 pb-24">

                {/* The "Control Panel" Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                    {/* Header of Panel */}
                    <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Cookie Configuration</div>
                    </div>

                    {/* List Rows */}
                    <div className="divide-y divide-slate-100">

                        {/* Row 1: Essential */}
                        <div className="p-8 hover:bg-slate-50 transition-colors group">
                            <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-slate-900">Essential Cookies</h3>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase">Required</span>
                                    </div>
                                    <p className="text-slate-600 mb-3">
                                        Strictly necessary for the site to function (e.g., login status, security keys). You cannot opt-out of these.
                                    </p>
                                    <div className="text-xs font-mono text-slate-400 bg-slate-100 inline-block px-2 py-1 rounded">
                                        ID: Session_Auth_v2
                                    </div>
                                </div>

                                {/* Fake Toggle (Locked) */}
                                <div className="opacity-50 cursor-not-allowed">
                                    <div className="w-14 h-8 bg-blue-600 rounded-full p-1 flex justify-end">
                                        <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Performance */}
                        <div className="p-8 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleToggle('performance')}>
                            <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-slate-900">Analytics & Performance</h3>
                                    </div>
                                    <p className="text-slate-600 mb-3">
                                        Helps us understand how you use the site so we can make it better. Data is anonymous and aggregated.
                                    </p>
                                    <div className="flex gap-2">
                                        <div className="text-xs font-mono text-slate-400 bg-slate-100 inline-block px-2 py-1 rounded">
                                            ID: _ga_tracking
                                        </div>
                                    </div>
                                </div>

                                {/* Interactive Toggle Visual */}
                                <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${toggles.performance ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${toggles.performance ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Marketing */}
                        <div className="p-8 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleToggle('marketing')}>
                            <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-slate-900">Marketing & Ads</h3>
                                    </div>
                                    <p className="text-slate-600 mb-3">
                                        Used by third-parties to serve relevant ads to you on other platforms. If disabled, ads will be less relevant.
                                    </p>
                                    <div className="flex gap-2">
                                        <div className="text-xs font-mono text-slate-400 bg-slate-100 inline-block px-2 py-1 rounded">
                                            ID: ad_personalization
                                        </div>
                                    </div>
                                </div>

                                {/* Interactive Toggle Visual */}
                                <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${toggles.marketing ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${toggles.marketing ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer of Panel */}
                    <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 text-center">
                        <p className="text-sm text-slate-500 mb-0">
                            * This is a visual guide. To actually change your preferences, please check your browser settings or the popup consent manager.
                        </p>
                    </div>
                </div>

                {/* Detailed FAQ Section */}
                <div className="mt-20 max-w-3xl mx-auto space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 border-l-4 border-blue-500 pl-4">How to manage cookies?</h2>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Most web browsers allow you to control cookies through their settings preferences. You can switch off cookies at any time, but remember that this may disable some features of our website.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-4">
                            <a href="https://support.google.com/chrome/answer/95647" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 transition-colors">
                                <Icon name="globe-alt" className="w-5 h-5 text-gray-400" />
                                Chrome Guide
                            </a>
                            <a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 transition-colors">
                                <Icon name="globe-alt" className="w-5 h-5 text-gray-400" />
                                Safari Guide
                            </a>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                                <Icon name="clock" className="w-5 h-5 text-orange-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">Duration</h3>
                            <p className="text-slate-600 text-sm">
                                Some cookies are "session cookies" which are deleted when you close your browser. Others are "persistent" and stay until they expire or you delete them.
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <Icon name="share" className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">Third Parties</h3>
                            <p className="text-slate-600 text-sm">
                                We may use trusted third-party services (like Google Analytics) which may also set cookies on your device during your visit.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="relative z-10 bg-white">
                <UserFooter />
            </div>
        </div>
    );
};

export default CookiePolicy;
