import React, { useRef, useState } from 'react';
import Icon from './Icon';

// Replaced ImageWithFallback with improved blur-up + skeleton and updated Articles layout for featured card etc.

const ImageWithFallback = ({ src, alt, className }) => {
  const [failed, setFailed] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);

  if (!src || failed) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gradient-to-br from-[#E3F2FD] to-[#B3E5FC] text-[#1976D2]`}
        aria-hidden="true"
      >
        <svg width="84" height="84" viewBox="0 0 24 24" fill="none" className="opacity-90">
          <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" stroke="#0D47A1" strokeWidth="0.8" fill="rgba(255,255,255,0.06)"/>
          <path d="M7 14l3-3 2 2 5-5" stroke="#1976D2" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* skeleton / low-res placeholder */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#E3F2FD] to-[#B3E5FC] animate-pulse">
          <div className="w-12 h-12 rounded-md bg-white/30" />
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'} `}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
      {/* subtle low-to-high quality feel: blurred overlay until loaded */}
      {!loaded && <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" aria-hidden="true" />}
    </div>
  );
};

// new: small tilt hook for interactive 3D card tilt
function useTilt(active = true) {
  const ref = useRef(null);
  React.useEffect(() => {
    if (!ref.current || !active) return;
    const el = ref.current;
    function handleMove(e) {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rotateX = (-y * 10).toFixed(2);
      const rotateY = (x * 10).toFixed(2);
      el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
    }
    function handleLeave() {
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
    }
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    el.addEventListener('touchmove', handleMove);
    el.addEventListener('touchend', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      el.removeEventListener('touchmove', handleMove);
      el.removeEventListener('touchend', handleLeave);
    };
  }, [active]);
  return ref;
}

// new: ArticleCard component (uses existing ImageWithFallback)
const ArticleCard = ({ article, featured = false }) => {
  const tiltRef = useTilt(true);
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <article
      ref={tiltRef}
      className={`group relative rounded-3xl overflow-hidden border border-white/30 shadow-2xl bg-gradient-to-br from-white/60 to-white/40 transform transition-all duration-500 focus-within:scale-[1.01] ${
        featured ? 'sm:col-span-2 lg:col-span-2' : ''
      }`}
      style={{ transitionProperty: 'transform, box-shadow' }}
    >
      <div className={`${featured ? 'h-80' : 'h-56'} relative`}>
        {/* glass frame + subtle border glow */}
        <div className="absolute inset-0 rounded-3xl ring-1 ring-white/20 pointer-events-none" />
        <ImageWithFallback
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <span className="bg-white/95 text-[#0D47A1] text-xs font-semibold px-3 py-1 rounded-full shadow-sm border border-white/50">
            {article.category}
          </span>
          <span className="bg-white/90 text-slate-700 text-xs px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <Icon name="clock" size="xs" className="inline text-[#1976D2]" /> {article.readTime}
          </span>
        </div>

        {/* actions */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-10">
          <button
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            onClick={() => setBookmarked(!bookmarked)}
            className="p-2 bg-white/90 rounded-full shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1976D2]"
            title={bookmarked ? 'Bookmarked' : 'Bookmark'}
          >
            <Icon name={bookmarked ? 'bookmark' : 'bookmark-outline'} size="sm" className="text-[#1976D2]" />
          </button>
          <button
            aria-label="Share article"
            className="p-2 bg-white/90 rounded-full shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1976D2]"
            title="Share"
          >
            <Icon name="share" size="sm" className="text-[#1976D2]" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className={`text-lg font-extrabold leading-snug mb-2 ${featured ? 'text-2xl' : ''}`}>
              <span className="bg-gradient-to-r from-[#0D47A1] via-[#1976D2] to-[#4FC3F7] bg-clip-text text-transparent">
                {article.title}
              </span>
            </h3>
            <p className="text-sm text-slate-600 line-clamp-3 mb-4">{article.excerpt}</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1976D2] to-[#0D47A1] text-white flex items-center justify-center font-semibold">
                {article.author.split(' ').map(n => n[0]).slice(0,2).join('')}
              </div>
              <div className="text-xs">
                <div className="font-medium text-slate-800">{article.author}</div>
                <div className="text-slate-500">{article.date}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <a
              href="#"
              aria-label={`Read article: ${article.title}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#1976D2] to-[#0D47A1] text-white font-semibold shadow-lg transform transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1]"
            >
              Read
              <Icon name="arrow-right" size="sm" />
            </a>

            {/* featured CTA spotlight */}
            {featured && (
              <div className="mt-3 text-xs text-slate-500 text-right">
                <span className="inline-block px-2 py-1 bg-white/60 rounded-full">Editor's pick</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

const Articles = () => {
  const articles = [
    {
      id: 1,
      title: "The Future of Digital Publishing",
      excerpt: "Explore how technology is transforming the way we create and distribute content in the digital age.",
      author: "News MarketPlace Team",
      date: "2024-11-08",
      readTime: "5 min read",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&crop=center"
    },
    {
      id: 2,
      title: "Building Successful Media Partnerships",
      excerpt: "Learn the key strategies for creating mutually beneficial relationships with media outlets.",
      author: "Sarah Johnson",
      date: "2024-11-07",
      readTime: "7 min read",
      category: "Business",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&crop=center"
    },
    {
      id: 3,
      title: "Content Marketing Trends for 2025",
      excerpt: "Stay ahead of the curve with the latest trends shaping content marketing strategies.",
      author: "Mike Chen",
      date: "2024-11-06",
      readTime: "6 min read",
      category: "Marketing",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=800&fit=crop&crop=center"
    },
    {
      id: 4,
      title: "Maximizing Your Content's Reach",
      excerpt: "Practical tips for getting your articles in front of the right audience.",
      author: "Emma Davis",
      date: "2024-11-05",
      readTime: "4 min read",
      category: "Strategy",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=800&fit=crop&crop=center"
    }
  ];

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Layered Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white"></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231976D2' fill-opacity='0.06'%3E%3Ccircle cx='40' cy='40' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="absolute -right-40 -top-20 w-96 h-96 bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-full opacity-30 blur-3xl transform rotate-12"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-30 animate-pulse">
            {/* subtle animated orb */}
            <svg width="220" height="80" viewBox="0 0 220 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#1976D2" stopOpacity="0.15"/>
                  <stop offset="1" stopColor="#4FC3F7" stopOpacity="0.15"/>
                </linearGradient>
              </defs>
              <ellipse cx="110" cy="40" rx="100" ry="30" fill="url(#g1)"/>
            </svg>
          </div>

          <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#1976D2] to-[#0D47A1] text-white shadow-md z-10 relative">
            <Icon name="newspaper" size="md" className="text-white" />
            <span className="text-sm font-semibold">Latest Updates</span>
          </div>

          <h2 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight z-10 relative">
            <span className="bg-gradient-to-r from-[#4FC3F7] via-[#1976D2] to-[#0D47A1] bg-clip-text text-transparent">
              Latest Articles — Curated & Trending
            </span>
          </h2>

          <p className="mt-3 text-lg text-slate-600 max-w-3xl mx-auto z-10 relative">
            Stay informed with our latest insights, trends, and expert opinions on digital publishing and media.
          </p>
        </div>

        {/* Articles Grid - first item featured */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch">
          {articles.map((article, index) => {
            const isFeatured = index === 0;
            return (
              <ArticleCard
                key={article.id}
                article={article}
                featured={isFeatured}
              />
            );
          })}
        </div>

        {/* View All */}
        <div className="text-center mt-10">
          <button className="inline-flex items-center gap-3 px-8 py-3 rounded-full border-2 border-[#1976D2] text-[#1976D2] bg-white/80 shadow hover:bg-gradient-to-r hover:from-[#1976D2] hover:to-[#0D47A1] hover:text-white transition-all transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1976D2]">
            <span className="transform transition-transform group-hover:translate-x-1">
              <Icon name="grid" size="sm" className="text-[#1976D2]" />
            </span>
            View All Articles
          </button>
        </div>
      </div>
    </section>
  );
};

export default Articles;