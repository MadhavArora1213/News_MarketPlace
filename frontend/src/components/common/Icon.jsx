import React from 'react';

/**
 * Minimal inline SVG Icon component.
 * - Props: name (string), size (one of 'sm','lg','xl','2xl' or number), className, style
 * - Returns a mapped inline SVG for known names, otherwise a neutral placeholder.
 *
 * This avoids runtime "Icon not found" warnings and keeps the API compatible.
 */

const SIZE_MAP = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32
};

export default function Icon({ name = '', size = 'md', className = '', style = {}, ...rest }) {
  const s = typeof size === 'number' ? size : (SIZE_MAP[size] || SIZE_MAP.md);
  const common = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

  // Simple mapping of icon names used in the admin UI -> inline SVG paths
  switch (name) {
    case 'shield-check':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M12 2l7 3v5c0 5-3.5 9.5-7 11-3.5-1.5-7-6-7-11V5l7-3z" />
          <path d="M9 12l2 2 4-4" strokeWidth="2" />
        </svg>
      );

    case 'arrow-right-on-rectangle':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <rect x="3" y="5" width="14" height="14" rx="2" />
          <path d="M10 12h7" />
          <path d="M14 8l4 4-4 4" />
        </svg>
      );

    case 'document-text':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M8 13h8M8 17h8M8 9h4" />
        </svg>
      );

    case 'arrow-down-tray':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M12 3v12" />
          <path d="M8 11l4 4 4-4" />
          <path d="M21 21H3" />
        </svg>
      );

    case 'cog-6-tooth':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.7 0 1.27-.4 1.51-1a1.65 1.65 0 0 0-.33-1.82L4.3 6.3A2 2 0 0 1 7.12 3.47l.06.06c.5.5 1.2.66 1.82.33.44-.22.93-.33 1.42-.33H12a2 2 0 0 1 4 0h.09c.49 0 .98.11 1.42.33.62.33 1.32.17 1.82-.33l.06-.06A2 2 0 0 1 20.7 6.3l-.06.06c-.5.5-.66 1.2-.33 1.82.22.44.33.93.33 1.42V12a2 2 0 0 1 0 4h-.09c-.7 0-1.27.4-1.51 1z" />
        </svg>
      );

    case 'toggle-left':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <rect x="2" y="7" width="20" height="10" rx="5" />
          <circle cx="8" cy="12" r="3" />
        </svg>
      );

    case 'list-bullet':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M8 6h13M8 12h13M8 18h13" />
          <path d="M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      );

    case 'boxes':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <path d="M7 8.5l5 3 5-3" />
        </svg>
      );

    case 'tag':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M20.59 13.41L13 6 4 6v8l9 8 9-8v-0z" />
          <circle cx="7.5" cy="7.5" r="1.5" />
        </svg>
      );

    case 'video':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <rect x="2" y="5" width="15" height="14" rx="2" />
          <path d="M23 7l-6 4v2l6 4V7z" />
        </svg>
      );

    case 'users':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M9 21v-2a4 4 0 0 1 3-3.87" />
          <path d="M12 7a4 4 0 1 0 0 8" />
        </svg>
      );

    case 'home':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M3 9l9-7 9 7" />
          <path d="M9 22V12h6v10" />
        </svg>
      );

    case 'facebook':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      );

    case 'twitter':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
        </svg>
      );

    case 'linkedin':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );

    case 'instagram':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );

    case 'whatsapp':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.885 3.488" />
        </svg>
      );

    case 'telegram':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );

    case 'youtube':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );

    case 'phone':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M2 3a1 1 0 0 1 1-1h2.153a1 1 0 0 1 .986.836l.74 4.435a1 1 0 0 1-.54 1.06l-1.548.773a11.037 11.037 0 0 0 6.105 6.105l.774-1.548a1 1 0 0 1 1.059-.54l4.435.74a1 1 0 0 1 .836.986V17a1 1 0 0 1-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      );

    case 'botim':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12l2 2 4-4" />
        </svg>
      );

    case 'user-group':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M9 21v-2a4 4 0 0 1 3-3.87" />
          <path d="M12 7a4 4 0 1 0 0 8" />
          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        </svg>
      );

    case 'currency-dollar':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );

    case 'handshake':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M10.5 1a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3a.5.5 0 0 1 .5-.5z" />
          <path d="M2 4.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
          <path d="M2 7.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
          <path d="M2 10.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
          <path d="M2 13.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
          <path d="M2 16.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
        </svg>
      );

    case 'play-circle':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <circle cx="12" cy="12" r="10" />
          <path d="M10 8l6 4-6 4V8z" />
        </svg>
      );

    case 'question-mark-circle':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      );

    case 'document':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
        </svg>
      );

    case 'newspaper':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      );

    case 'globe-alt':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9m-9 9a9 9 0 0 1 9 9m0-9c0 1.11-.18 2.17-.52 3.17" />
        </svg>
      );

    case 'radio':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          <circle cx="12" cy="12" r="2.25" />
        </svg>
      );

    case 'camera':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
          <path d="M15 13a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
        </svg>
      );

    case 'map-pin':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
          <path d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
        </svg>
      );

    case 'star':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 0 0 .95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 0 0-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 0 0-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 0 0-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 0 0 .951-.69l1.519-4.674z" />
        </svg>
      );

    case 'calendar-days':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
        </svg>
      );

    case 'megaphone':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.688-.06 1.386-.09 2.09-.09h.75a4.5 4.5 0 1 0 0-9h-.75c-.704 0-1.402-.03-2.09-.09m-4.5 0H5.25A2.25 2.25 0 0 1 3 13.5v-3a2.25 2.25 0 0 1 2.25-2.25H7.5m6 0h2.25A2.25 2.25 0 0 1 18 10.5v3a2.25 2.25 0 0 1-2.25 2.25H13.5m-6-6h6m-6 3h6" />
        </svg>
      );

    case 'microphone':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v3a3.75 3.75 0 1 1-7.5 0V4.5z" />
          <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.75 6.75 0 0 1-6 6.675V19.5h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-1.575a6.75 6.75 0 0 1-6-6.675v-1.5A.75.75 0 0 1 6 10.5z" />
        </svg>
      );

    case 'home':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 0 1 0 1.06l-8.69 8.69a.75.75 0 0 1-1.06 0l-8.69-8.69a.75.75 0 0 1 0-1.06l8.69-8.69zM12 5.43L19.569 13H18.25v6.75a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75V18a.75.75 0 0 1 .75-.75h1.5V13H12V5.43z" />
        </svg>
      );

    case 'pencil':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712zM19.513 8.199l-3.712-3.712L3.714 16.5a2.25 2.25 0 0 0-.643 1.263V19.5a.75.75 0 0 0 .75.75h2.237a2.25 2.25 0 0 0 1.263-.643L19.513 8.199z" />
        </svg>
      );

    case 'eye':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
        </svg>
      );

    case 'bell':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M14 3.102a3 3 0 0 0-.47-.18c-.263-.096-.546-.102-.81-.102a3 3 0 0 0-3 3v1.5a3 3 0 0 0-3 3v2.25a3 3 0 0 0-3 3v1.5a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-1.5a3 3 0 0 0-3-3V9.75a3 3 0 0 0-3-3V6a3 3 0 0 0-3-3c-.264 0-.547.006-.81.102a3 3 0 0 0-.47.18z" />
          <path d="M14 15a2 2 0 1 1-4 0" />
        </svg>
      );

    case 'chevron-left':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      );

    case 'chevron-right':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      );

    case 'arrow-right':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M4 12h16m0 0l-6-6m6 6l-6 6" />
        </svg>
      );

    case 'arrow-path':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M4.5 12c0-1.232.285-2.408.807-3.468a1.5 1.5 0 0 1 2.674-.386L9.47 9.47a.75.75 0 0 0 1.06 0l1.993-1.993a1.5 1.5 0 0 1 2.674.386A7.5 7.5 0 0 1 19.5 12a7.5 7.5 0 0 1-1.5 4.5.75.75 0 0 0 .75 1.5A9 9 0 1 0 4.5 10.5a.75.75 0 0 0 1.5 0z" />
        </svg>
      );

    case 'key':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M3 11a5 5 0 1 0 7 7L21 7l-4-4L10 10" />
        </svg>
      );

    case 'pencil-square':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M16 3l5 5" />
          <path d="M17 6l-10 10H3v-4L13 2z" />
        </svg>
      );

    case 'chart-bar':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <path d="M3 3v18h18" />
          <path d="M7 12v6" />
          <path d="M12 8v10" />
          <path d="M17 4v14" />
        </svg>
      );

    case 'check-circle':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );

    case 'x-circle':
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15 9l-6 6M9 9l6 6" />
        </svg>
      );

    default:
      // neutral placeholder: square with first letter (keeps layout stable)
      const label = (name || '').split('-').map(p => p[0]).join('').slice(0, 2).toUpperCase() || '?';
      return (
        <svg {...common} className={className} style={style} {...rest}>
          <rect x="2" y="2" width="20" height="20" rx="3" fill="#e5e7eb" stroke="none" />
          <text x="12" y="15" fontSize={s / 2.5} textAnchor="middle" fill="#374151" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700">
            {label}
          </text>
        </svg>
      );
  }
}