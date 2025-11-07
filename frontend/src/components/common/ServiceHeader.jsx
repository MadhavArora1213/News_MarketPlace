import React from 'react';
import Icon from './Icon';

const ServiceHeader = () => {
  const services = [
    { name: 'Submit Article', href: '#submit-article', icon: 'document-text' },
    { name: 'Publications', href: '#publications', icon: 'newspaper' },
    { name: 'Websites', href: '#websites', icon: 'globe-alt' },
    { name: 'Radio', href: '#radio', icon: 'microphone' },
    { name: 'Paparazzi', href: '#paparazzi', icon: 'camera' },
    { name: 'Theme Pages', href: '#theme-pages', icon: 'collection' },
    { name: 'Power List', href: '#power-list', icon: 'trending-up' },
    { name: 'Awards', href: '#awards', icon: 'badge-check' },
    { name: 'Events', href: '#events-awards', icon: 'calendar' },
    { name: 'Press Release', href: '#press-release', icon: 'megaphone' },
    { name: 'Podcasters', href: '#podcasters', icon: 'music-note' },
    { name: 'Real Estate', href: '#real-estate', icon: 'home' }
  ];

  return (
    <div className="bg-white py-2 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout - Grid */}
        <div className="hidden lg:grid grid-cols-6 gap-2">
          {services.map((service, index) => (
            <a
              key={index}
              href={service.href}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all duration-200 group"
            >
              <Icon 
                name={service.icon} 
                size="sm" 
                className="text-gray-500 group-hover:text-blue-600 transition-colors flex-shrink-0" 
              />
              <span className="truncate">{service.name}</span>
            </a>
          ))}
        </div>

        {/* Tablet Layout - Grid */}
        <div className="hidden md:grid lg:hidden grid-cols-4 gap-2">
          {services.map((service, index) => (
            <a
              key={index}
              href={service.href}
              className="flex items-center space-x-2 p-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
            >
              <Icon 
                name={service.icon} 
                size="sm" 
                className="text-gray-500 group-hover:text-blue-600 transition-colors flex-shrink-0" 
              />
              <span className="truncate">{service.name}</span>
            </a>
          ))}
        </div>

        {/* Mobile Layout - Dropdown */}
        <div className="md:hidden">
          <div className="relative group">
            <button className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
              <div className="flex items-center space-x-2">
                <Icon name="menu" size="sm" className="text-gray-500" />
                <span>Our Services</span>
              </div>
              <Icon name="chevron-down" size="xs" className="text-gray-500 group-hover:rotate-180 transition-transform duration-300" />
            </button>
            
            {/* Mobile Dropdown Menu */}
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30">
              <div className="py-1 max-h-80 overflow-y-auto">
                {services.map((service, index) => (
                  <a
                    key={index}
                    href={service.href}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors group/item"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded flex items-center justify-center group-hover/item:bg-blue-100 transition-colors">
                      <Icon 
                        name={service.icon} 
                        size="xs" 
                        className="text-gray-500 group-hover/item:text-blue-600 transition-colors" 
                      />
                    </div>
                    <span className="flex-1">{service.name}</span>
                    <Icon 
                      name="arrow-right" 
                      size="xs" 
                      className="text-gray-400 group-hover/item:text-blue-600 group-hover/item:translate-x-1 transition-all duration-200" 
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceHeader;