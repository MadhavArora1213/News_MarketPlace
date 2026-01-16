
import React from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-[#F0F4F8] font-sans text-slate-800">
            <UserHeader />

            {/* Decorative Background Elements - Subtle & Light */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-blue-100/50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-rose-100/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">

                {/* Header Section - Clean & Minimal */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <div className="inline-block p-4 rounded-3xl bg-white shadow-lg shadow-blue-900/5 mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <Icon name="currency-dollar" className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                        Money Back <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-rose-500">Guarantee.</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto font-medium">
                        We keep it simple. If something goes wrong, we fix it. Here are the rules of engagement.
                    </p>
                </div>

                {/* Content stacked in a single elegant column */}
                <div className="space-y-8">

                    {/* Section 1: The Basics (Large Card) */}
                    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/50">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="md:w-1/3">
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Eligibility</h3>
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">When you can claim</p>
                            </div>
                            <div className="md:w-2/3 grid gap-4">
                                {[
                                    { title: "Service Failure", desc: "If we completely fail to deliver the agreed service." },
                                    { title: "Technical Error", desc: "Double charges or system glitches during checkout." },
                                    { title: "Pre-processing", desc: "Cancellations made before our team starts work." }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors group">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-slate-200 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                                            <Icon name="check" className="w-3 h-3 text-slate-500 group-hover:text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">{item.title}</h4>
                                            <p className="text-sm text-slate-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Non-Refundable (Glass Strip) */}
                    <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-8 border border-white/60">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex-shrink-0">
                                <Icon name="x-mark" className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Non-Refundable Items</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Please note that <span className="font-bold text-rose-600">Live Articles</span>, <span className="font-bold text-rose-600">Started Campaigns</span>, and orders older than <span className="font-bold text-slate-900">30 days</span> are final sale. Editorial preferences do not qualify for refunds.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: The Process (Horizontal Steps) */}
                    <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                        {/* Background pattern */}
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Icon name="clock" className="w-40 h-40" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-8">Refund Timeline</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="relative">
                                    <div className="text-5xl font-black text-blue-500/30 mb-2">01</div>
                                    <h4 className="text-lg font-bold mb-2">Submit Request</h4>
                                    <p className="text-slate-400 text-sm">Send us an email with your Order ID.</p>
                                </div>
                                <div className="relative">
                                    <div className="text-5xl font-black text-purple-500/30 mb-2">02</div>
                                    <h4 className="text-lg font-bold mb-2">Verification</h4>
                                    <p className="text-slate-400 text-sm">We review your case within 48 hours.</p>
                                </div>
                                <div className="relative">
                                    <div className="text-5xl font-black text-emerald-500/30 mb-2">03</div>
                                    <h4 className="text-lg font-bold mb-2">Money Returned</h4>
                                    <p className="text-slate-400 text-sm">Funds appear in 7-10 business days.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="text-center pt-8">
                        <p className="text-slate-500 mb-4">Have specific questions?</p>
                        <button className="px-8 py-3 bg-white border border-slate-200 text-slate-900 font-bold rounded-full hover:bg-slate-50 hover:shadow-lg transition-all">
                            Contact Support Team
                        </button>
                    </div>

                </div>
            </div>

            <div className="relative z-10 bg-white">
                <UserFooter />
            </div>
        </div>
    );
};

export default RefundPolicy;
