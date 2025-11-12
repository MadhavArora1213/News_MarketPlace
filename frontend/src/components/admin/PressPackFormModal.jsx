import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const PressPackFormModal = ({ isOpen, onClose, pressPack, publications, onSave }) => {
  const [formData, setFormData] = useState({
    distribution_package: '',
    region: '',
    price: '',
    industry: '',
    news: '',
    indexed: false,
    disclaimer: '',
    no_of_indexed_websites: '',
    no_of_non_indexed_websites: '',
    image: '',
    link: '',
    words_limit: '',
    language: ''
  });
  const [selectedPublications, setSelectedPublications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pressPack) {
      setFormData({
        distribution_package: pressPack.distribution_package || '',
        region: pressPack.region || '',
        price: pressPack.price || '',
        industry: pressPack.industry || '',
        news: pressPack.news || '',
        indexed: pressPack.indexed || false,
        disclaimer: pressPack.disclaimer || '',
        no_of_indexed_websites: pressPack.no_of_indexed_websites || '',
        no_of_non_indexed_websites: pressPack.no_of_non_indexed_websites || '',
        image: pressPack.image || '',
        link: pressPack.link || '',
        words_limit: pressPack.words_limit || '',
        language: pressPack.language || ''
      });

      // Load associated publications
      if (pressPack.id) {
        fetchAssociatedPublications(pressPack.id);
      }
    } else {
      setFormData({
        distribution_package: '',
        region: '',
        price: '',
        industry: '',
        news: '',
        indexed: false,
        disclaimer: '',
        no_of_indexed_websites: '',
        no_of_non_indexed_websites: '',
        image: '',
        link: '',
        words_limit: '',
        language: ''
      });
      setSelectedPublications([]);
    }
  }, [pressPack, isOpen]);

  const fetchAssociatedPublications = async (pressPackId) => {
    try {
      const response = await api.get(`/press-packs/${pressPackId}/publications`);
      setSelectedPublications(response.data.publications.map(p => p.id));
    } catch (error) {
      console.error('Error fetching associated publications:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        no_of_indexed_websites: parseInt(formData.no_of_indexed_websites) || 0,
        no_of_non_indexed_websites: parseInt(formData.no_of_non_indexed_websites) || 0,
        words_limit: parseInt(formData.words_limit) || 0,
        publication_ids: selectedPublications
      };

      if (pressPack) {
        await api.put(`/press-packs/admin/${pressPack.id}`, dataToSend);
      } else {
        await api.post('/press-packs/admin', dataToSend);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving press pack:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error saving press pack. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePublicationToggle = (publicationId) => {
    setSelectedPublications(prev =>
      prev.includes(publicationId)
        ? prev.filter(id => id !== publicationId)
        : [...prev, publicationId]
    );
  };

  if (!isOpen) return null;

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px'
  };

  const contentStyle = {
    background: '#fff',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
  };

  const formGroupStyle = {
    marginBottom: '16px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#212121',
    marginBottom: '6px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  const checkboxStyle = {
    marginRight: '8px'
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    marginRight: '12px'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800' }}>
            {pressPack ? 'Edit Press Pack' : 'Create Press Pack'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Distribution Package *</label>
              <input
                type="text"
                value={formData.distribution_package}
                onChange={(e) => setFormData({ ...formData, distribution_package: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Region *</label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Industry *</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Language *</label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Words Limit</label>
              <input
                type="number"
                min="0"
                value={formData.words_limit}
                onChange={(e) => setFormData({ ...formData, words_limit: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Indexed Websites Count</label>
              <input
                type="number"
                min="0"
                value={formData.no_of_indexed_websites}
                onChange={(e) => setFormData({ ...formData, no_of_indexed_websites: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Non-Indexed Websites Count</label>
              <input
                type="number"
                min="0"
                value={formData.no_of_non_indexed_websites}
                onChange={(e) => setFormData({ ...formData, no_of_non_indexed_websites: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                style={inputStyle}
                placeholder="https://..."
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Link URL</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                style={inputStyle}
                placeholder="https://..."
              />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>News Description</label>
              <textarea
                value={formData.news}
                onChange={(e) => setFormData({ ...formData, news: e.target.value })}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                placeholder="News description for the press pack"
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Disclaimer</label>
              <textarea
                value={formData.disclaimer}
                onChange={(e) => setFormData({ ...formData, disclaimer: e.target.value })}
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                placeholder="Legal disclaimer"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px', marginBottom: '24px' }}>
            <input
              type="checkbox"
              id="indexed"
              checked={formData.indexed}
              onChange={(e) => setFormData({ ...formData, indexed: e.target.checked })}
              style={checkboxStyle}
            />
            <label htmlFor="indexed" style={{ fontSize: '14px', color: '#212121' }}>Indexed Content</label>
          </div>

          {/* Publication Selection */}
          <div style={{ marginTop: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Associated Publications</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '12px' }}>
              {publications.length === 0 ? (
                <p style={{ color: '#757575', fontStyle: 'italic' }}>No publications available</p>
              ) : (
                publications.map(publication => (
                  <div key={publication.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={selectedPublications.includes(publication.id)}
                      onChange={() => handlePublicationToggle(publication.id)}
                      style={{ marginRight: '8px' }}
                    />
                    <label style={{ fontSize: '14px', color: '#212121' }}>
                      {publication.publication_name} ({publication.publication_region})
                    </label>
                  </div>
                ))
              )}
            </div>
            <p style={{ fontSize: '12px', color: '#757575', marginTop: '8px' }}>
              Selected: {selectedPublications.length} publication{selectedPublications.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...buttonStyle, backgroundColor: '#f3f4f6', color: '#374151' }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...buttonStyle, backgroundColor: '#1976D2', color: '#fff' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : (pressPack ? 'Update Press Pack' : 'Create Press Pack')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PressPackFormModal;