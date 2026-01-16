
import React, { useState } from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';

const RefundPolicy = () => {
    const [activeCard, setActiveCard] = useState('eligibility');

    return (
        <div className="min-h-screen bg-[#0B0F19] font-sans text-white selection:bg-purple-500/30">
            <UserHeader />

            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-blue-900/20 rounded-full blur-[100px] mix-blend-screen animate-pulse animation-delay-2000"></div>
            </div>

            <main className="relative z-10 pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

                {/* Hero Section */}
                <div className="text-center mb-24 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        <span className="text-sm font-medium text-gray-300">Updated Policy 2026</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500">
                            Peace of mind.
                        </span>
                        <span className="block text-3xl md:text-5xl lg:text-6xl font-light text-gray-400 mt-4">
                            Guaranteed.
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        We've simplified our refund process because your trust is our most valuable currency. Fair, fast, and transparent.
                    </p>
                </div>

                {/* Interactive BENTO GRID Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">

                    {/* Card 1: The Promise (Large) */}
                    <div className="md:col-span-2 row-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group shadow-2xl shadow-indigo-900/20">
                        <div className="absolute top-0 right-0 p-12 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
                            <Icon name="shield-check" className="w-64 h-64 text-white" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-3xl font-bold text-white mb-4">The "No-Risk" Guarantee</h3>
                                <p className="text-indigo-100 text-lg leading-relaxed max-w-lg">
                                    If we fail to deliver a service as described in our agreement, you are entitled to a full refund. We don't hide behind complex clauses. If the mistake is ours, the money is yours.
                                </p>
                            </div>
                            <div className="mt-8 flex gap-4">
                                <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white font-semibold">
                                    7-Day Processing
                                </div>
                                <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white font-semibold">
                                    100% Secure
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Eligibility (Tall) */}
                    <div className="row-span-2 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 hover:bg-gray-800/50 transition-colors duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6 text-green-400">
                            <Icon name="check" className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-6">Eligible Cases</h3>
                        <ul className="space-y-4">
                            {[
                                "Service not delivered",
                                "Duplicate payment",
                                "Accidental order (pre-process)",
                                "Technical billing errors"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-300 border-b border-white/5 pb-3 last:border-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Card 3: Non-Refundable (Standard) */}
                    <div className="md:col-span-1 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 hover:bg-gray-800/50 transition-colors duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                                <Icon name="x-mark" className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Exceptions</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Non-Refundable</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                             Live articles, started social media campaigns, and services fulfilled >30 days ago.
                        </p>
                    </div>

                    {/* Card 4: Process (Standard) */}
                    <div className="md:col-span-1 bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 hover:bg-gray-800/50 transition-colors duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Icon name="clock" className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Timeline</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">The Timeline</h3>
                        <div className="flex justify-between items-center text-sm text-gray-400 mt-4">
                            <span>Request</span>
                            <span className="h-px w-8 bg-gray-700"></span>
                            <span>Review (48h)</span>
                            <span className="h-px w-8 bg-gray-700"></span>
                            <span className="text-white font-bold">Paid</span>
                        </div>
                    </div>

                    {/* Card 5: Contact CTA (Wide) */}
                    <div className="md:col-span-1 bg-white text-gray-900 rounded-[2.5rem] p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform duration-300">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Need Help?</h3>
                            <button className="px-6 py-2 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-700 transition-colors">
                                Open Ticket
                            </button>
                        </div>
                        {/* Abstract background blobs for card */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200 rounded-full blur-2xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-200 rounded-full blur-2xl -ml-10 -mb-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                </div>

            </main>

            <div className="relative z-10 bg-white">
                <UserFooter />
            </div>
        </div>
    );
};

export default RefundPolicy;
