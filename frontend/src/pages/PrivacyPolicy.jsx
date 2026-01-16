
import React, { useState } from 'react';
import UserHeader from '../components/common/UserHeader';
import UserFooter from '../components/common/UserFooter';
import Icon from '../components/common/Icon';

const PrivacyPolicy = () => {
    const [activeTab, setActiveTab] = useState('highlights');

    const highlights = [
        {
            id: 'collection',
            title: 'What We Collect',
            icon: 'document-text', // mapped from collection
            color: 'bg-blue-50 text-blue-700 border-blue-200',
            iconColor: 'text-blue-600',
            summary: 'Basic account details, usage data, and communication preferences to provide our services.',
            details: [
                'Personal identifiers (Name, Email, Phone)',
                'Device and usage information',
                'Cookies and tracking technologies',
                'User-generated content'
            ]
        },
        {
            id: 'usage',
            title: 'How We Use It',
            icon: 'lightning-bolt',
            color: 'bg-teal-50 text-teal-700 border-teal-200',
            iconColor: 'text-teal-600',
            summary: 'To improve personal experience, process transactions, and send relevant updates.',
            details: [
                'Service delivery and maintenance',
                'Personalization of content',
                'Security and fraud prevention',
                'Communication about updates'
            ]
        },
        {
            id: 'sharing',
            title: 'Who We Share With',
            icon: 'share-nodes',
            color: 'bg-purple-50 text-purple-700 border-purple-200',
            iconColor: 'text-purple-600',
            summary: 'We do not sell your data. We only share with trusted partners essential for service delivery.',
            details: [
                'Service providers (Hosting, Payment)',
                'Legal compliance authorities',
                'Affiliates (with consent)',
                'Business transfer entities'
            ]
        },
        {
            id: 'protection',
            title: 'Your Protection',
            icon: 'shield-check',
            color: 'bg-green-50 text-green-700 border-green-200',
            iconColor: 'text-green-600',
            summary: 'Industry-standard encryption and security measures to keep your data safe.',
            details: [
                'SSL/TLS Encryption',
                'Regular security audits',
                'Access control policies',
                'Data anonymization'
            ]
        },
        {
            id: 'rights',
            title: 'Your Rights',
            icon: 'user-check',
            color: 'bg-orange-50 text-orange-700 border-orange-200',
            iconColor: 'text-orange-600',
            summary: 'Full control over your data. Access, update, or delete your information anytime.',
            details: [
                'Right to access your data',
                'Right to rectification',
                'Right to erasure ("Right to be forgotten")',
                'Right to restrict processing'
            ]
        },
        {
            id: 'cookies',
            title: 'Cookies & Tracking',
            icon: 'eye',
            color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            iconColor: 'text-indigo-600',
            summary: 'We use cookies to enhance your browsing experience and analyze site traffic.',
            details: [
                'Essential cookies for site function',
                'Analytics cookies for improvements',
                'Marketing cookies (optional)',
                'Cookie management options'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800">
            <UserHeader />

            {/* Unique Hero Section */}
            <div className="relative bg-white overflow-hidden">
                {/* Background decorative blobs */}
                <div className="absolute top-0 left-1/2 -ml-[40rem] w-[80rem] h-[80rem] rounded-full bg-blue-50/50 mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none -z-10 animate-pulse" />
                <div className="absolute top-0 right-0 -mr-20 w-[60rem] h-[60rem] rounded-full bg-teal-50/50 mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/50 text-blue-700 font-medium text-sm mb-6 border border-blue-100">
                        <Icon name="shield-check" className="w-4 h-4" />
                        <span>Trusted & Secure</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
                        Privacy, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">Simplified.</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        We believe you shouldn't need a law degree to understand how your data is handled. Here is our plain-English guide to your privacy.
                    </p>
                </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

                {/* Toggle View (Simple vs Detailed) - Optional flair */}
                <div className="flex justify-center mb-12">
                    <div className="bg-gray-100/80 p-1.5 rounded-xl inline-flex relative">
                        <button
                            onClick={() => setActiveTab('highlights')}
                            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${activeTab === 'highlights'
                                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <Icon name="sparkles" size="sm" className={activeTab === 'highlights' ? 'text-amber-500' : ''} />
                            Visual Guide
                        </button>
                        <button
                            onClick={() => setActiveTab('full')}
                            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${activeTab === 'full'
                                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                                    : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <Icon name="document-text" size="sm" className={activeTab === 'full' ? 'text-blue-500' : ''} />
                            Full Policy
                        </button>
                    </div>
                </div>

                {activeTab === 'highlights' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {highlights.map((item) => (
                            <div
                                key={item.id}
                                className={`group relative p-8 rounded-3xl border border-transparent transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-default ${item.color.replace('text', 'bg').replace('bg', 'bg-opacity-10')} hover:bg-white hover:border-gray-100`}
                            >
                                {/* Card visual elements */}
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-6 ${item.color}`}>
                                    <Icon name={item.icon} className="w-7 h-7" />
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {item.summary}
                                </p>

                                {/* Micro-details list */}
                                <ul className="space-y-3">
                                    {item.details.map((detail, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-sm font-medium text-gray-500">
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.iconColor.replace('text', 'bg')}`} />
                                            {detail}
                                        </li>
                                    ))}
                                </ul>

                                {/* Corner decorative icon */}
                                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <Icon name="arrow-right" className="w-5 h-5 text-gray-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'full' && (
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 animate-fade-in">
                        <div className="prose prose-lg prose-blue max-w-none text-gray-600">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Full Privacy Policy</h2>

                            <p className="lead text-xl text-gray-500 mb-8">
                                Effective Date: January 16, 2026
                            </p>

                            <div className="space-y-12">
                                <section>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm">1</span>
                                        Information We Collect
                                    </h3>
                                    <p className="mb-4">
                                        We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, request customer support, or otherwise communicate with us. The types of information we may collect include your name, email address, postal address, phone number, and any other information you choose to provide.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm">2</span>
                                        How We Use Your Information
                                    </h3>
                                    <p className="mb-4">
                                        We use the information we collect to provide, maintain, and improve our services, including to process transactions, send you related information, respond to your comments and questions, and communicate with you about products, services, offers, and events.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm">3</span>
                                        Information Sharing
                                    </h3>
                                    <p className="mb-4">
                                        We do not share your personal information with third parties except as described in this policy. We may share your information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.
                                    </p>
                                </section>

                                <section>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm">4</span>
                                        Data Security
                                    </h3>
                                    <p className="mb-4">
                                        We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
                                    </p>
                                </section>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom CTA */}
                <div className="mt-20 text-center">
                    <p className="text-gray-500 mb-4">Still have questions about your privacy?</p>
                    <a
                        href="/contact-us"
                        className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-200"
                    >
                        Contact our Data Protection Officer
                    </a>
                </div>

            </div>

            <UserFooter />
        </div>
    );
};

export default PrivacyPolicy;
