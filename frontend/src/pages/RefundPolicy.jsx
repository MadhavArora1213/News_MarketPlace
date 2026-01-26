import React, { useState, useEffect, useRef } from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';
import Skeleton from '../components/common/Skeleton';
import { useLanguage } from '../context/LanguageContext';

const RefundPolicy = () => {
    const { t } = useLanguage();
    const [activeSection, setActiveSection] = useState(0);
    const [loading, setLoading] = useState(true);
    const observerRefs = useRef([]);

    const sections = [
        {
            id: 'eligibility',
            title: t('refund.sections.eligibility.title'),
            question: t('refund.sections.eligibility.question'),
            icon: "currency-dollar",
            content: t('refund.sections.eligibility.content'),
            stats: [
                { label: t('refund.sections.eligibility.stats.serviceFailure'), value: t('refund.sections.eligibility.stats.serviceFailureValue') },
                { label: t('refund.sections.eligibility.stats.techErrors'), value: t('refund.sections.eligibility.stats.techErrorsValue') },
                { label: t('refund.sections.eligibility.stats.preWorkCancel'), value: t('refund.sections.eligibility.stats.preWorkCancelValue') }
            ],
            color: "from-blue-600 to-cyan-500"
        },
        {
            id: 'non-refundable',
            title: t('refund.sections.nonRefundable.title'),
            question: t('refund.sections.nonRefundable.question'),
            icon: "lock-closed",
            content: t('refund.sections.nonRefundable.content'),
            stats: [
                { label: t('refund.sections.nonRefundable.stats.liveArticles'), value: t('refund.sections.nonRefundable.stats.liveArticlesValue') },
                { label: t('refund.sections.nonRefundable.stats.startedJobs'), value: t('refund.sections.nonRefundable.stats.startedJobsValue') },
                { label: t('refund.sections.nonRefundable.stats.orderAge'), value: t('refund.sections.nonRefundable.stats.orderAgeValue') }
            ],
            color: "from-rose-500 to-pink-600"
        },
        {
            id: 'timeline',
            title: t('refund.sections.timeline.title'),
            question: t('refund.sections.timeline.question'),
            icon: "calendar-days",
            content: t('refund.sections.timeline.content'),
            stats: [
                { label: t('refund.sections.timeline.stats.submitRequest'), value: t('refund.sections.timeline.stats.submitRequestValue') },
                { label: t('refund.sections.timeline.stats.verification'), value: t('refund.sections.timeline.stats.verificationValue') },
                { label: t('refund.sections.timeline.stats.transfer'), value: t('refund.sections.timeline.stats.transferValue') }
            ],
            color: "from-violet-600 to-indigo-600"
        },
        {
            id: 'contact',
            title: t('refund.sections.contact.title'),
            question: t('refund.sections.contact.question'),
            icon: "mail",
            content: t('refund.sections.contact.content'),
            stats: [
                { label: t('refund.sections.contact.stats.support'), value: t('refund.sections.contact.stats.supportValue') },
                { label: t('refund.sections.contact.stats.response'), value: t('refund.sections.contact.stats.responseValue') },
                { label: t('refund.sections.contact.stats.resolution'), value: t('refund.sections.contact.stats.resolutionValue') }
            ],
            color: "from-amber-400 to-orange-500"
        }
    ];

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'));
                        setActiveSection(index);
                    }
                });
            },
            { threshold: 0.5 }
        );

        observerRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, []);

    // Custom "Aurora" Background Component
    const AuroraBackground = () => (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob bg-gradient-to-r ${sections[activeSection].color} transition-colors duration-1000 ease-in-out`}></div>
            <div className={`absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-2000 bg-gradient-to-l ${sections[(activeSection + 1) % 4].color} transition-colors duration-1000 ease-in-out`}></div>
            <div className={`absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-4000 bg-slate-200`}></div>
            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-white font-sans text-slate-800">
                <UserHeader />
                <main className="relative z-10">
                    <section className="min-h-[40vh] md:min-h-[50vh] flex flex-col justify-center items-center text-center px-4 relative pt-12 pb-12">
                        <div className="max-w-4xl mx-auto w-full">
                            <Skeleton className="h-20 w-3/4 mx-auto mb-6" />
                            <Skeleton className="h-10 w-1/2 mx-auto" />
                        </div>
                    </section>
                    <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pb-20 md:pb-40">
                        <div className="lg:grid lg:grid-cols-2 gap-10 lg:gap-20">
                            <div className="hidden lg:block relative">
                                <div className="sticky top-1/4 h-[auto] min-h-[400px] flex flex-col justify-start gap-8">
                                    <Skeleton className="w-full aspect-square max-w-[250px] rounded-[2rem]" />
                                    <div className="space-y-4">
                                        {[...Array(4)].map((_, i) => (
                                            <Skeleton key={i} className="h-8 w-full rounded-lg" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-16">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-white/80 p-8 rounded-[2rem] border border-slate-100">
                                        <Skeleton className="h-12 w-3/4 mb-6" />
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <Skeleton className="h-4 w-2/3 mb-8" />
                                        <div className="grid grid-cols-3 gap-4">
                                            <Skeleton className="h-16 rounded-xl" />
                                            <Skeleton className="h-16 rounded-xl" />
                                            <Skeleton className="h-16 rounded-xl" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
                <UserFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-blue-100">
            <UserHeader />

            <AuroraBackground />

            <main className="relative z-10">

                {/* Immersive Hero */}
                <section className="min-h-[40vh] md:min-h-[50vh] flex flex-col justify-center items-center text-center px-4 relative pt-12 pb-12">
                    <div className="animate-fade-in-up max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 leading-tight">
                            {t('refund.heroTitle')} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-rose-500 font-bold italic">{t('refund.heroSubtitle')}</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed px-4">
                            {t('refund.heroDesc')}
                        </p>
                    </div>
                </section>

                {/* Sticky Split Layout */}
                <div className="relative max-w-7xl mx-auto px-4 lg:px-8 pb-20 md:pb-40">
                    <div className="lg:grid lg:grid-cols-2 gap-10 lg:gap-20">

                        {/* Left Side: Sticky Navigator & Graphic (Desktop Only) */}
                        <div className="hidden lg:block relative">
                            <div className="sticky top-1/4 h-[auto] min-h-[400px] flex flex-col justify-start gap-8">
                                {/* Dynamic Icon Display */}
                                <div className={`w-full aspect-square max-w-[250px] rounded-[2rem] bg-gradient-to-br ${sections[activeSection].color} shadow-2xl flex items-center justify-center transition-all duration-700 ease-out`}>
                                    <div className="bg-white/20 backdrop-blur-xl p-8 rounded-2xl border border-white/30 text-white shadow-inner">
                                        <Icon name={sections[activeSection].icon} size="xl" className="w-16 h-16" />
                                    </div>
                                </div>

                                {/* Section Progress */}
                                <div className="space-y-4">
                                    {sections.map((section, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => document.getElementById(section.id).scrollIntoView({ behavior: 'smooth' })}
                                            className={`group flex items-center gap-4 w-full text-left transition-all duration-300 ${activeSection === idx ? 'opacity-100 translate-x-4' : 'opacity-40 hover:opacity-70 hover:translate-x-2'}`}
                                        >
                                            <span className={`h-px bg-slate-900 transition-all duration-300 ${activeSection === idx ? 'w-12' : 'w-4'}`}></span>
                                            <span className="text-lg font-bold tracking-widest uppercase">{section.title}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Scrollable Content */}
                        <div className="space-y-16 md:space-y-[30vh] md:py-[5vh]">
                            {sections.map((section, idx) => (
                                <div
                                    key={idx}
                                    id={section.id}
                                    data-index={idx}
                                    ref={el => observerRefs.current[idx] = el}
                                    className="min-h-[auto] md:min-h-[50vh] flex flex-col justify-center scroll-mt-24"
                                >
                                    {/* Mobile Only Header with Icon */}
                                    <div className="lg:hidden mb-6 flex items-center gap-4 sticky top-20 z-20 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-sm border border-slate-100">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${section.color} text-white shadow-md`}>
                                            <Icon name={section.icon} size="md" />
                                        </div>
                                        <h2 className="text-xl font-black text-slate-900">{section.title}</h2>
                                    </div>

                                    <div className="bg-white/80 backdrop-blur-3xl p-6 md:p-10 rounded-[2rem] border border-white/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                                        <h3 className="hidden md:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 mb-2 uppercase tracking-wide">
                                            {section.title}
                                        </h3>

                                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 md:mb-8 leading-tight">
                                            {section.question}
                                        </h2>
                                        <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8 md:mb-12">
                                            {section.content}
                                        </p>

                                        {/* Data Pills */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                                            {section.stats.map((stat, sIdx) => (
                                                <div key={sIdx} className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-100 flex flex-col gap-1 md:gap-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                                                    <span className="text-base md:text-lg font-bold text-slate-800">{stat.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Final CTA Card */}
                            <div className="min-h-[30vh] flex flex-col justify-center items-center text-center py-12">
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">{t('refund.ctas.startReturn')}</h2>
                                <a
                                    href="/contact-us"
                                    className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors shadow-xl w-full sm:w-auto inline-flex justify-center items-center gap-2"
                                >
                                    <Icon name="mail" size="sm" className="text-white" />
                                    {t('refund.ctas.contactSupport')}
                                </a>
                            </div>
                        </div>
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

