import React, { useState } from 'react';
import Icon from '../common/Icon';

export default function Sidebar({
  admin,
  roleDisplayNames = {},
  theme = {
    primary: '#1976D2',
    primaryDark: '#0D47A1',
    primaryLight: '#E3F2FD',
    secondary: '#00796B',
    secondaryDark: '#004D40',
    secondaryLight: '#E0F2F1',
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#F44336',
    info: '#9C27B0',
    textPrimary: '#212121',
    textSecondary: '#757575',
    textDisabled: '#BDBDBD',
    background: '#FFFFFF',
    backgroundAlt: '#FAFAFA',
    backgroundSoft: '#F5F5F5',
    borderLight: '#E0E0E0',
    borderMedium: '#BDBDBD',
    borderDark: '#757575',
  },
  sidebarOpen,
  setSidebarOpen,
  sidebarStyles,
  mobileSidebarOverlay,
  isMobile,
  headerHeight,
  sidebarWidth,
  sidebarZ = 200,
  mobileOverlayZ = 500
}) {
  // Dropdown state management
  const [openDropdowns, setOpenDropdowns] = useState({});

  const toggleDropdown = (key) => {
    setOpenDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // NEW: nicer style tokens used inline (declare first to avoid reference errors)
  const headingStyle = { fontWeight: 900, letterSpacing: 2, marginBottom: 18, color: '#212121', fontSize: 13 };
  const cardStyle = { background: '#ffffff', borderRadius: 12, padding: 14, boxShadow: '0 8px 24px rgba(7,22,48,0.06)', marginBottom: 18 };
  const avatarStyle = { width: 56, height: 56, borderRadius: 12, background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#1976D2', fontSize: 20 };
  const statTile = { flex: 1, background: '#FAFAFA', padding: 12, borderRadius: 10, textAlign: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)' };
  const navItemBase = { display: 'flex', alignItems: 'center', gap: 12, color: '#212121', textDecoration: 'none', padding: '10px 12px', borderRadius: 10, transition: 'background 140ms, transform 140ms', cursor: 'pointer' };
  const navIconCircle = (bg) => ({ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' });
  const dropdownHeader = { ...navItemBase, justifyContent: 'space-between', fontWeight: 600 };
  const subItemStyle = { ...navItemBase, paddingLeft: '48px', fontSize: '14px' };

  // compute desktop fixed styles so sidebar sticks to viewport left (matches screenshot)
  const desktopFixedStyles = {
    ...sidebarStyles,
    position: 'fixed',
    left: 0,
    top: headerHeight,
    height: `calc(100vh - ${headerHeight}px)`,
    zIndex: sidebarZ, // below header but visible
    borderRadius: 0,
    display: sidebarOpen ? 'block' : 'none', // show/hide via inline style
    boxSizing: 'border-box',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    paddingRight: 8
  };

  // mobile sliding overlay styles (small slide animation)
  const mobileOverlayStyles = {
    ...mobileSidebarOverlay,
    transform: sidebarOpen ? 'translateX(0)' : `translateX(-${sidebarWidth}px)`,
    transition: 'transform 220ms ease',
    display: sidebarOpen ? 'block' : 'none',
    zIndex: mobileOverlayZ,
    overflowY: 'auto',
    boxSizing: 'border-box'
  };

  // When tailwind is not guaranteed, control visibility using inline display.
  const desktopStyleToUse = isMobile ? { ...sidebarStyles, boxSizing: 'border-box', overflowY: 'auto' } : desktopFixedStyles;

  return (
    <>
      {/* Desktop aside (fixed on viewport left when not mobile) */}
      <aside
        style={{ ...desktopStyleToUse, paddingTop: 18, paddingBottom: 18, paddingLeft: 18, paddingRight: 18 }}
        aria-hidden={!sidebarOpen}
        role="navigation"
      >
        <div style={headingStyle}>ADMIN PANEL</div>

        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={avatarStyle}>
              {admin?.first_name ? admin.first_name[0].toUpperCase() : 'M'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: '#212121' }}>{admin?.first_name ? `${admin.first_name} ${admin.last_name}` : 'Master Admin'}</div>
              <div style={{ fontSize: 12, color: '#757575', marginTop: 4 }}>{roleDisplayNames[admin?.role] || 'Master Admin'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <div style={statTile}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>11</div>
              <div style={{ fontSize: 12, color: '#757575', marginTop: 6 }}>Total Admins</div>
            </div>
            <div style={statTile}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1976D2' }}>11</div>
              <div style={{ fontSize: 12, color: '#757575', marginTop: 6 }}>Active</div>
            </div>
          </div>
        </div>

        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {/* Dashboard - No dropdown */}
            <li style={{ marginBottom: 12 }}>
              <a
                href="/admin/dashboard"
                style={{
                  ...navItemBase,
                  background: '#1976D2',
                  color: '#fff',
                  fontWeight: 700,
                  boxShadow: '0 6px 14px rgba(25,118,210,0.12)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = ''}
              >
                <span style={navIconCircle('#0b3a61')}><Icon name="home" size="sm" style={{ color: '#fff' }} /></span>
                <span>Dashboard</span>
              </a>
            </li>

            {/* Single Items */}
            <li style={{ marginBottom: 10 }}>
              <a href="/admin/affiliate-enquiries" style={navItemBase} onMouseEnter={e => e.currentTarget.style.background = '#E8F5E8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={navIconCircle('#e8f5e8')}><Icon name="user-group" size="sm" style={{ color: '#4CAF50' }} /></span>
                <span>Affiliate Enquiries</span>
              </a>
            </li>

            <li style={{ marginBottom: 10 }}>
              <a href="/admin/agencies" style={navItemBase} onMouseEnter={e => e.currentTarget.style.background = '#F3E5F5'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={navIconCircle('#f3e5f5')}><Icon name="building" size="sm" style={{ color: '#9C27B0' }} /></span>
                <span>Agency Management</span>
              </a>
            </li>

            <li style={{ marginBottom: 10 }}>
              <a href="/admin/ai-articles" style={navItemBase} onMouseEnter={e => e.currentTarget.style.background = '#E3F2FD'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={navIconCircle('#e3f2fd')}><Icon name="light-bulb" size="sm" style={{ color: '#1976D2' }} /></span>
                <span>AI Articles</span>
              </a>
            </li>

            <li style={{ marginBottom: 10 }}>
              <a href="/admin/article-submissions" style={navItemBase} onMouseEnter={e => e.currentTarget.style.background = '#E8F5E8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={navIconCircle('#e8f5e8')}><Icon name="document-text" size="sm" style={{ color: '#4CAF50' }} /></span>
                <span>Article Submissions</span>
              </a>
            </li>

            {/* Awards Dropdown */}
            <li style={{ marginBottom: 10 }}>
              <div onClick={() => toggleDropdown('awards')} style={{ ...dropdownHeader, background: openDropdowns.awards ? '#FFF3E0' : 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = '#FFF3E0'} onMouseLeave={e => e.currentTarget.style.background = openDropdowns.awards ? '#FFF3E0' : 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={navIconCircle('#fff3e0')}><Icon name="trophy" size="sm" style={{ color: '#FF9800' }} /></span>
                  <span>Awards</span>
                </div>
                <Icon name={openDropdowns.awards ? 'chevron-up' : 'chevron-down'} size="sm" style={{ color: '#FF9800' }} />
              </div>
              {openDropdowns.awards && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: 8 }}><a href="/admin/award-creation" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#FFF9E0'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Award Creation</a></li>
                  <li style={{ marginBottom: 8 }}><a href="/admin/award-submissions" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#FFF9E0'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Award Submissions</a></li>
                  <li style={{ marginBottom: 8 }}><a href="/admin/awards" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#FFF9E0'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Awards Management</a></li>
                </ul>
              )}
            </li>

            {/* Blogs */}
            <li style={{ marginBottom: 10 }}>
              <a href="/admin/blogs" style={navItemBase} onMouseEnter={e => e.currentTarget.style.background = '#E8F5E8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={navIconCircle('#e8f5e8')}><Icon name="document-text" size="sm" style={{ color: '#4CAF50' }} /></span>
                <span>Blog Management</span>
              </a>
            </li>

            <li style={{ marginBottom: 10 }}>
              <a href="/admin/careers" style={navItemBase} onMouseEnter={e => e.currentTarget.style.background = '#FFF3E0'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={navIconCircle('#fff3e0')}><Icon name="building" size="sm" style={{ color: '#FF9800' }} /></span>
                <span>Career Management</span>
              </a>
            </li>

            <li style={{ marginBottom: 10 }}>
              <a href="/admin/contacts" style={navItemBase} onMouseEnter={e => e.currentTarget.style.background = '#E0F2FE'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={navIconCircle('#e6f3ff')}><Icon name="chat-bubble-left" size="sm" style={{ color: '#0369a1' }} /></span>
                <span>Contact Management</span>
              </a>
            </li>

            {/* Events Dropdown */}
            <li style={{ marginBottom: 10 }}>
              <div onClick={() => toggleDropdown('events')} style={{ ...dropdownHeader, background: openDropdowns.events ? '#FFF3E0' : 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = '#FFF3E0'} onMouseLeave={e => e.currentTarget.style.background = openDropdowns.events ? '#FFF3E0' : 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={navIconCircle('#fff3e0')}><Icon name="calendar" size="sm" style={{ color: '#FF9800' }} /></span>
                  <span>Events</span>
                </div>
                <Icon name={openDropdowns.events ? 'chevron-up' : 'chevron-down'} size="sm" style={{ color: '#FF9800' }} />
              </div>
              {openDropdowns.events && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: 8 }}><a href="/admin/event-creation" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#FFF9E0'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Event Creation</a></li>
                  <li style={{ marginBottom: 8 }}><a href="/admin/event-enquiries" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#FFF9E0'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Event Enquiries</a></li>
                  <li style={{ marginBottom: 8 }}><a href="/admin/events" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#FFF9E0'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Event Management</a></li>
                </ul>
              )}
            </li>

            <li style={{ marginBottom: 10 }}>
              <a href="/admin/groups" style={navItemBase} onMouseEnter={e => e.currentTarget.style.background = '#FFF3E0'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={navIconCircle('#fff3e0')}><Icon name="users" size="sm" style={{ color: '#f57c00' }} /></span>
                <span>Group Management</span>
              </a>
            </li>

            {/* Orders Dropdown */}
            <li style={{ marginBottom: 10 }}>
              <div onClick={() => toggleDropdown('orders')} style={{ ...dropdownHeader, background: openDropdowns.orders ? '#E8EAF6' : 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = '#E8EAF6'} onMouseLeave={e => e.currentTarget.style.background = openDropdowns.orders ? '#E8EAF6' : 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={navIconCircle('#e8eaf6')}><Icon name="shopping-cart" size="sm" style={{ color: '#3F51B5' }} /></span>
                  <span>Orders</span>
                </div>
                <Icon name={openDropdowns.orders ? 'chevron-up' : 'chevron-down'} size="sm" style={{ color: '#3F51B5' }} />
              </div>
              {openDropdowns.orders && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: 8 }}><a href="/admin/orders" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#E8EAF6'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Order Management</a></li>
                </ul>
              )}
            </li>

            {/* Paparazzi Dropdown */}
            <li style={{ marginBottom: 10 }}>
              <div onClick={() => toggleDropdown('paparazzi')} style={{ ...dropdownHeader, background: openDropdowns.paparazzi ? '#FCE4EC' : 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = '#FCE4EC'} onMouseLeave={e => e.currentTarget.style.background = openDropdowns.paparazzi ? '#FCE4EC' : 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={navIconCircle('#fce4ec')}><Icon name="camera" size="sm" style={{ color: '#E91E63' }} /></span>
                  <span>Paparazzi</span>
                </div>
                <Icon name={openDropdowns.paparazzi ? 'chevron-up' : 'chevron-down'} size="sm" style={{ color: '#E91E63' }} />
              </div>
              {openDropdowns.paparazzi && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: 8 }}><a href="/admin/paparazzi-creation" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#FCE4EC'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Paparazzi Creation</a></li>
                  <li style={{ marginBottom: 8 }}><a href="/admin/paparazzi" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#FCE4EC'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Paparazzi Management</a></li>
                  <li style={{ marginBottom: 8 }}><a href="/admin/paparazzi-orders" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#FCE4EC'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Paparazzi Orders</a></li>
                </ul>
              )}
            </li>

            <li style={{ marginBottom: 10 }}>
              <a href="/admin/podcasters" style={navItemBase} onMouseEnter={e => e.currentTarget.style.background = '#E8F5E8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={navIconCircle('#e8f5e8')}><Icon name="microphone" size="sm" style={{ color: '#4CAF50' }} /></span>
                <span>Podcaster Management</span>
              </a>
            </li>

            {/* Powerlist Dropdown */}
            <li style={{ marginBottom: 10 }}>
              <div onClick={() => toggleDropdown('powerlist')} style={{ ...dropdownHeader, background: openDropdowns.powerlist ? '#FFF8E1' : 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = '#FFF8E1'} onMouseLeave={e => e.currentTarget.style.background = openDropdowns.powerlist ? '#FFF8E1' : 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={navIconCircle('#fff8e1')}><Icon name="star" size="sm" style={{ color: '#FF9800' }} /></span>
                  <span>Power Lists</span>
                </div>
                <Icon name={openDropdowns.powerlist ? 'chevron-up' : 'chevron-down'} size="sm" style={{ color: '#FF9800' }} />
              </div>
              {openDropdowns.powerlist && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: 8 }}><a href="/admin/power-lists" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#FFF9E0'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Power Lists</a></li>
                  <li style={{ marginBottom: 8 }}><a href="/admin/powerlist-management" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#FFF9E0'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Powerlist Management</a></li>
                  <li style={{ marginBottom: 8 }}><a href="/admin/powerlist-orders" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#FFF9E0'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Powerlist Orders</a></li>
                </ul>
              )}
            </li>

            {/* Press Packs Dropdown */}
            <li style={{ marginBottom: 10 }}>
              <div onClick={() => toggleDropdown('pressPacks')} style={{ ...dropdownHeader, background: openDropdowns.pressPacks ? '#E8F5E8' : 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = '#E8F5E8'} onMouseLeave={e => e.currentTarget.style.background = openDropdowns.pressPacks ? '#E8F5E8' : 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={navIconCircle('#e8f5e8')}><Icon name="newspaper" size="sm" style={{ color: '#4CAF50' }} /></span>
                  <span>Press Packs</span>
                </div>
                <Icon name={openDropdowns.pressPacks ? 'chevron-up' : 'chevron-down'} size="sm" style={{ color: '#4CAF50' }} />
              </div>
              {openDropdowns.pressPacks && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: 8 }}><a href="/admin/press-pack-creation" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#E8F5E8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Press Pack Creation</a></li>
                  <li style={{ marginBottom: 8 }}><a href="/admin/press-packs" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#E8F5E8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Press Pack Management</a></li>
                  <li style={{ marginBottom: 8 }}><a href="/admin/press-pack-orders" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#E8F5E8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Press Pack Orders</a></li>
                </ul>
              )}
            </li>

            {/* Publications Dropdown */}
            <li style={{ marginBottom: 10 }}>
              <div onClick={() => toggleDropdown('publications')} style={{ ...dropdownHeader, background: openDropdowns.publications ? '#E8F5E8' : 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = '#E8F5E8'} onMouseLeave={e => e.currentTarget.style.background = openDropdowns.publications ? '#E8F5E8' : 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={navIconCircle('#e6f0ff')}><Icon name="document-text" size="sm" style={{ color: '#1976D2' }} /></span>
                  <span>Publications</span>
                </div>
                <Icon name={openDropdowns.publications ? 'chevron-up' : 'chevron-down'} size="sm" style={{ color: '#1976D2' }} />
              </div>
              {openDropdowns.publications && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: 8 }}><a href="/admin/publications" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#E8F5E8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Publications</a></li>
                  <li style={{ marginBottom: 8 }}><a href="/admin/publication-management" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#E8F5E8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Publication Management</a></li>
                </ul>
              )}
            </li>

            <li style={{ marginBottom: 10 }}>
              <a href="/admin/published-works" style={navItemBase} onMouseEnter={e => e.currentTarget.style.background = '#E8F5E8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={navIconCircle('#e8f5e8')}><Icon name="folder" size="sm" style={{ color: '#4CAF50' }} /></span>
                <span>Published Works Management</span>
              </a>
            </li>

            {/* Radio Dropdown */}
            <li style={{ marginBottom: 10 }}>
              <div onClick={() => toggleDropdown('radio')} style={{ ...dropdownHeader, background: openDropdowns.radio ? '#E8F4F8' : 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = '#E8F4F8'} onMouseLeave={e => e.currentTarget.style.background = openDropdowns.radio ? '#E8F4F8' : 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={navIconCircle('#e8f4f8')}><Icon name="radio" size="sm" style={{ color: '#1976D2' }} /></span>
                  <span>Radio</span>
                </div>
                <Icon name={openDropdowns.radio ? 'chevron-up' : 'chevron-down'} size="sm" style={{ color: '#1976D2' }} />
              </div>
              {openDropdowns.radio && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: 8 }}><a href="/admin/radios" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#E8F4F8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Radio Management</a></li>
                  <li style={{ marginBottom: 8 }}><a href="/admin/radio-orders" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#E8F4F8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Radio Orders</a></li>
                </ul>
              )}
            </li>

            {/* Real Estate Dropdown */}
            <li style={{ marginBottom: 10 }}>
              <div onClick={() => toggleDropdown('realEstate')} style={{ ...dropdownHeader, background: openDropdowns.realEstate ? '#FFF3E0' : 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = '#FFF3E0'} onMouseLeave={e => e.currentTarget.style.background = openDropdowns.realEstate ? '#FFF3E0' : 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={navIconCircle('#fff3e0')}><Icon name="home" size="sm" style={{ color: '#FF9800' }} /></span>
                  <span>Real Estate</span>
                </div>
                <Icon name={openDropdowns.realEstate ? 'chevron-up' : 'chevron-down'} size="sm" style={{ color: '#FF9800' }} />
              </div>
              {openDropdowns.realEstate && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: 8 }}><a href="/admin/real-estate-creation" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#FFF9E0'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Real Estate Creation</a></li>
                  <li style={{ marginBottom: 8 }}><a href="/admin/real-estates" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#FFF9E0'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Real Estate Management</a></li>
                  <li style={{ marginBottom: 8 }}><a href="/admin/real-estate-orders" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#FFF9E0'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Real Estate Orders</a></li>
                </ul>
              )}
            </li>

            <li style={{ marginBottom: 10 }}>
              <a href="/admin/reporters" style={navItemBase} onMouseEnter={e => e.currentTarget.style.background = '#E8F5E8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={navIconCircle('#e8f5e8')}><Icon name="user-group" size="sm" style={{ color: '#4CAF50' }} /></span>
                <span>Reporter Management</span>
              </a>
            </li>

            <li style={{ marginBottom: 10 }}>
              <a href="/admin/roles-permissions" style={navItemBase} onMouseEnter={e => e.currentTarget.style.background = '#E8F5E8'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={navIconCircle('#e8f5e8')}><Icon name="shield-check" size="sm" style={{ color: '#4CAF50' }} /></span>
                <span>Roles & Permissions</span>
              </a>
            </li>

            {/* Themes Dropdown */}
            <li style={{ marginBottom: 10 }}>
              <div onClick={() => toggleDropdown('themes')} style={{ ...dropdownHeader, background: openDropdowns.themes ? '#F3E5F5' : 'transparent' }} onMouseEnter={e => e.currentTarget.style.background = '#F3E5F5'} onMouseLeave={e => e.currentTarget.style.background = openDropdowns.themes ? '#F3E5F5' : 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={navIconCircle('#f3e5f5')}><Icon name="swatch" size="sm" style={{ color: '#9C27B0' }} /></span>
                  <span>Themes</span>
                </div>
                <Icon name={openDropdowns.themes ? 'chevron-up' : 'chevron-down'} size="sm" style={{ color: '#9C27B0' }} />
              </div>
              {openDropdowns.themes && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: 8 }}><a href="/admin/themes" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#F3E5F5'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Theme Management</a></li>
                  <li style={{ marginBottom: 8 }}><a href="/admin/theme-orders" style={subItemStyle} onMouseEnter={e => e.currentTarget.style.background = '#F3E5F5'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>Theme Orders</a></li>
                </ul>
              )}
            </li>

            <li style={{ marginBottom: 10 }}>
              <a href="/admin/users" style={navItemBase} onMouseEnter={e => e.currentTarget.style.background = '#F0F9FF'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={navIconCircle('#e0f2fe')}><Icon name="users" size="sm" style={{ color: '#0369a1' }} /></span>
                <span>User Management</span>
              </a>
            </li>

            <li style={{ marginBottom: 10 }}>
              <a href="/admin/websites" style={navItemBase} onMouseEnter={e => e.currentTarget.style.background = '#F3E5F5'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span style={navIconCircle('#f3e5f5')}><Icon name="globe" size="sm" style={{ color: '#9C27B0' }} /></span>
                <span>Website Management</span>
              </a>
            </li>

          </ul>
        </nav>
      </aside>

      {/* Mobile sliding overlay */}
      <div style={isMobile ? mobileOverlayStyles : { display: 'none' }} aria-hidden={!sidebarOpen}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} aria-label="Close sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#212121" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <nav style={{ marginTop: 8 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: 12 }}><a href="/admin/dashboard" style={{ color: '#212121', textDecoration: 'none', fontWeight: 600 }}>Dashboard</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/affiliate-enquiries" style={{ color: '#212121', textDecoration: 'none' }}>Affiliate Enquiries</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/agencies" style={{ color: '#212121', textDecoration: 'none' }}>Agency Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/ai-articles" style={{ color: '#212121', textDecoration: 'none' }}>AI Articles</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/article-submissions" style={{ color: '#212121', textDecoration: 'none' }}>Article Submissions</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/award-creation" style={{ color: '#212121', textDecoration: 'none' }}>Award Creation</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/award-submissions" style={{ color: '#212121', textDecoration: 'none' }}>Award Submissions</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/awards" style={{ color: '#212121', textDecoration: 'none' }}>Awards</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/blogs" style={{ color: '#212121', textDecoration: 'none' }}>Blog Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/careers" style={{ color: '#212121', textDecoration: 'none' }}>Career Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/contacts" style={{ color: '#212121', textDecoration: 'none' }}>Contact Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/event-creation" style={{ color: '#212121', textDecoration: 'none' }}>Event Creation</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/event-enquiries" style={{ color: '#212121', textDecoration: 'none' }}>Event Enquiries</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/events" style={{ color: '#212121', textDecoration: 'none' }}>Event Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/groups" style={{ color: '#212121', textDecoration: 'none' }}>Group Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/orders" style={{ color: '#212121', textDecoration: 'none' }}>Order Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/paparazzi-creation" style={{ color: '#212121', textDecoration: 'none' }}>Paparazzi Creation</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/paparazzi" style={{ color: '#212121', textDecoration: 'none' }}>Paparazzi Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/paparazzi-orders" style={{ color: '#212121', textDecoration: 'none' }}>Paparazzi Orders</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/podcasters" style={{ color: '#212121', textDecoration: 'none' }}>Podcaster Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/power-lists" style={{ color: '#212121', textDecoration: 'none' }}>Power Lists</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/powerlist-management" style={{ color: '#212121', textDecoration: 'none' }}>Powerlist Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/powerlist-orders" style={{ color: '#212121', textDecoration: 'none' }}>Powerlist Orders</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/press-pack-creation" style={{ color: '#212121', textDecoration: 'none' }}>Press Pack Creation</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/press-packs" style={{ color: '#212121', textDecoration: 'none' }}>Press Pack Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/press-pack-orders" style={{ color: '#212121', textDecoration: 'none' }}>Press Pack Orders</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/publications" style={{ color: '#212121', textDecoration: 'none' }}>Publications</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/publication-management" style={{ color: '#212121', textDecoration: 'none' }}>Publication Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/published-works" style={{ color: '#212121', textDecoration: 'none' }}>Published Works Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/radios" style={{ color: '#212121', textDecoration: 'none' }}>Radio Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/radio-orders" style={{ color: '#212121', textDecoration: 'none' }}>Radio Orders</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/real-estate-creation" style={{ color: '#212121', textDecoration: 'none' }}>Real Estate Creation</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/real-estates" style={{ color: '#212121', textDecoration: 'none' }}>Real Estate Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/real-estate-orders" style={{ color: '#212121', textDecoration: 'none' }}>Real Estate Orders</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/reporters" style={{ color: '#212121', textDecoration: 'none' }}>Reporter Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/roles-permissions" style={{ color: '#212121', textDecoration: 'none' }}>Roles & Permissions</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/themes" style={{ color: '#212121', textDecoration: 'none' }}>Theme Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/theme-orders" style={{ color: '#212121', textDecoration: 'none' }}>Theme Orders</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/users" style={{ color: '#212121', textDecoration: 'none' }}>User Management</a></li>
            <li style={{ marginBottom: 12 }}><a href="/admin/websites" style={{ color: '#212121', textDecoration: 'none' }}>Website Management</a></li>
          </ul>
        </nav>
      </div>
    </>
  );
}
