import React from 'react';
import Icon from './Icon';

const TopHeader = () => {
  const menuItems = [
    {
      href: "#video-tutorial",
      text: "Video Tutorial",
      icon: "play",
      description: "Learn how to use our platform effectively"
    },
    {
      href: "#download-pr-questionnaire", 
      text: "PR Questionnaire",
      icon: "document-download",
      description: "Download our comprehensive PR template"
    },
    {
      href: "#how-to-guide",
      text: "How-to Guide", 
      icon: "book-open",
      description: "Step-by-step platform instructions"
    },
    {
      href: "#terms-policies",
      text: "Terms & Policies",
      icon: "shield-check", 
      description: "Legal information and platform policies"
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout */}
        <div className="hidden lg:flex justify-center items-center py-2">
          <div className="flex items-center space-x-8">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="group relative flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md"
              >
                <Icon 
                  name={item.icon} 
                  size="sm" 
                  className="text-gray-500 group-hover:text-blue-600 transition-colors" 
                />
                <span className="font-barlow">{item.text}</span>
                
                {/* Enhanced Tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-20 shadow-lg">
                  {item.description}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mb-1"></div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Icon name="information-circle" size="sm" className="text-blue-600" />
              <span className="text-sm font-semibold text-gray-700 font-barlow">Quick Resources</span>
            </div>
            
            {/* Mobile Menu Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300">
                <Icon name="menu" size="sm" />
                <span className="font-barlow">Menu</span>
                <Icon name="chevron-down" size="xs" className="group-hover:rotate-180 transition-transform duration-300" />
              </button>
              
              {/* Mobile Dropdown Content */}
              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-30 backdrop-blur-lg">
                <div className="py-3">
                  {menuItems.map((item, index) => (
                    <a
                      key={index}
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group/item"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-hover/item:bg-blue-100 transition-colors">
                        <Icon 
                          name={item.icon} 
                          size="sm" 
                          className="text-blue-600 group-hover/item:text-blue-700 transition-colors" 
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold font-barlow">{item.text}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                      </div>
                      <Icon 
                        name="arrow-right" 
                        size="xs" 
                        className="text-gray-400 group-hover/item:text-blue-600 group-hover/item:translate-x-1 transition-all duration-200" 
                      />
                    </a>
                  ))}
                </div>
                
                {/* Footer in dropdown */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 font-barlow">Need help?</div>
                    <a 
                      href="#support" 
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold font-barlow transition-colors"
                    >
                      Contact Support
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tablet Layout */}
        <div className="hidden md:flex lg:hidden justify-center items-center py-2">
          <div className="grid grid-cols-2 gap-3 w-full max-w-3xl">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 hover:shadow-md group"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Icon 
                    name={item.icon} 
                    size="sm" 
                    className="text-blue-600 group-hover:text-blue-700 transition-colors" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold font-barlow">{item.text}</div>
                  <div className="text-xs text-gray-500 truncate">{item.description}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Subtle Animation Bar */}
        <div className="h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 opacity-30"></div>
      </div>
    </div>
  );
};

export default TopHeader;
