import React, { useState } from 'react';
import './ImageGalleryTabs.css';

/**
 * A reusable image gallery component with tabs
 * @param {Object[]} items - Array of gallery items
 * @param {string} items[].id - Unique identifier for the tab
 * @param {string} items[].tabTitle - Title to display in the tab
 * @param {string} items[].image - Image URL
 * @param {string} items[].imageAlt - Image alt text
 * @param {string} items[].title - Title for the content area
 * @param {string[]} items[].listItems - Array of list items to display
 */
const ImageGalleryTabs = ({ items }) => {
  const [activeTab, setActiveTab] = useState(items[0]?.id);

  if (!items || items.length === 0) {
    return <div className="image-gallery-tabs--empty">No gallery items provided</div>;
  }

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="image-gallery-tabs">
      <div className="image-gallery-tabs__header">
        {items.map((item) => (
          <button
            key={item.id}
            className={`image-gallery-tabs__tab ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => handleTabClick(item.id)}
          >
            {item.tabTitle}
          </button>
        ))}
      </div>
      
      <div className="image-gallery-tabs__content">
        {items.map((item) => (
          <div
            key={item.id}
            className={`image-gallery-tabs__panel ${activeTab === item.id ? 'active' : ''}`}
          >
            <div className="image-gallery-tabs__panel-content">
              <div className="image-gallery-tabs__panel-image">
                <img src={item.image} alt={item.imageAlt} />
              </div>
              <div className="image-gallery-tabs__panel-text">
                <h3>{item.title}</h3>
                <ul>
                  {item.listItems.map((listItem, index) => (
                    <li key={index}>{listItem}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGalleryTabs;