import { useState } from 'react';
import { mockAuthors } from '../data/mockData';
import AuthorTagPage from './AuthorTagPage';

export default function AuthorListPage({ tags, authors, setAuthors, addToast, onViewDetail }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'tags'
  const [selectedTypes, setSelectedTypes] = useState(['lib', 'tv']); // Multi-select: ['lib'], ['tv'], or ['lib', 'tv']
  
  const [searchParams, setSearchSearchParams] = useState({
    id: '',
    uuid: '',
    nickname: '',
    identityType: '',
    isRevoked: ''
  });

  const toggleType = (type) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
  };

  const filteredAuthors = authors.filter(author => {
    // 1. Basic Type Filter (Lib/TV)
    if (activeTab === 'all') {
      if (author.type && !selectedTypes.includes(author.type)) return false;
      
      // 2. Search Params Filter
      if (searchParams.id && !author.authorId.toLowerCase().includes(searchParams.id.toLowerCase())) return false;
      if (searchParams.uuid && !author.authorId.toLowerCase().includes(searchParams.uuid.toLowerCase())) return false;
      if (searchParams.nickname && !author.nickname.toLowerCase().includes(searchParams.nickname.toLowerCase())) return false;
      
      // identityType: '1' is Lib认证作者, '2' is 原创作者
      // In mock data: tagId 2 is 官方认证
      const isLibCertified = author.tagIds.includes(2);
      if (searchParams.identityType === '1' && !isLibCertified) return false;
      if (searchParams.identityType === '2' && isLibCertified) return false;
      
      // isRevoked: 'yes' or 'no'. Let's assume none are revoked in mock data
      if (searchParams.isRevoked === 'yes') return false; 
    }
    return true; 
  });

  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    setAppliedSearchParams({...searchParams});
  };

  const [appliedSearchParams, setAppliedSearchParams] = useState({
    id: '',
    uuid: '',
    nickname: '',
    identityType: '',
    isRevoked: ''
  });

  const handleReset = () => {
    const defaultParams = {
      id: '',
      uuid: '',
      nickname: '',
      identityType: '',
      isRevoked: ''
    };
    setSearchSearchParams(defaultParams);
    setAppliedSearchParams(defaultParams);
  };

  const finalFilteredAuthors = authors.filter(author => {
    if (activeTab === 'all') {
      // Filter by type
      if (author.type && !selectedTypes.includes(author.type)) return false;
      
      // Filter by applied search params
      if (appliedSearchParams.id && !author.authorId.toLowerCase().includes(appliedSearchParams.id.toLowerCase())) return false;
      if (appliedSearchParams.uuid && !author.authorId.toLowerCase().includes(appliedSearchParams.uuid.toLowerCase())) return false;
      if (appliedSearchParams.nickname && !author.nickname.toLowerCase().includes(appliedSearchParams.nickname.toLowerCase())) return false;
      
      const isLibCertified = author.tagIds.includes(2);
      if (appliedSearchParams.identityType === '1' && !isLibCertified) return false;
      if (appliedSearchParams.identityType === '2' && isLibCertified) return false;
      
      if (appliedSearchParams.isRevoked === 'yes') return false; 
    }
    return true;
  });

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">作者列表</span>
      </div>
      
      <div className="card-body no-padding">
        {/* Main Tabs */}
        <div className="tab-container" style={{ padding: '16px 24px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div 
              className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
              style={{ 
                paddingBottom: '12px', 
                cursor: 'pointer', 
                color: activeTab === 'all' ? 'var(--blue)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'all' ? '2px solid var(--blue)' : '2px solid transparent',
                fontWeight: activeTab === 'all' ? '600' : '400'
              }}
              onClick={() => setActiveTab('all')}
            >
              全部作者
            </div>
            <div 
              className={`tab-item ${activeTab === 'tags' ? 'active' : ''}`}
              style={{ 
                paddingBottom: '12px', 
                cursor: 'pointer', 
                color: activeTab === 'tags' ? 'var(--blue)' : 'var(--text-secondary)',
                borderBottom: activeTab === 'tags' ? '2px solid var(--blue)' : '2px solid transparent',
                fontWeight: activeTab === 'tags' ? '600' : '400'
              }}
              onClick={() => setActiveTab('tags')}
            >
              作者标签
            </div>
          </div>
        </div>

        {activeTab === 'all' ? (
          <>
            {/* Sub Tabs for "全部作者" (Multi-select) */}
            <div style={{ padding: '12px 24px', display: 'flex', gap: '12px' }}>
              <button 
                className={`btn ${selectedTypes.includes('lib') ? 'btn-primary' : 'btn-default'}`}
                style={{ borderRadius: '20px', padding: '4px 16px' }}
                onClick={() => toggleType('lib')}
              >
                Lib作者
              </button>
              <button 
                className={`btn ${selectedTypes.includes('tv') ? 'btn-primary' : 'btn-default'}`}
                style={{ borderRadius: '20px', padding: '4px 16px' }}
                onClick={() => toggleType('tv')}
              >
                TV作者
              </button>
            </div>

            {/* Search Bar */}
            <div className="inline-search-grid" style={{ padding: '16px 24px', backgroundColor: '#fafafa', margin: '16px 24px', borderRadius: '8px' }}>
              <div className="inline-field">
                <span className="inline-field-label">id:</span>
                <input 
                  className="inline-field-input" 
                  style={{ width: '80px' }}
                  value={searchParams.id}
                  onChange={e => setSearchSearchParams({...searchParams, id: e.target.value})}
                />
              </div>
              <div className="inline-field">
                <span className="inline-field-label">uuid:</span>
                <input 
                  className="inline-field-input" 
                  style={{ width: '180px' }}
                  value={searchParams.uuid}
                  onChange={e => setSearchSearchParams({...searchParams, uuid: e.target.value})}
                />
              </div>
              <div className="inline-field">
                <span className="inline-field-label">用户名:</span>
                <input 
                  className="inline-field-input"
                  value={searchParams.nickname}
                  onChange={e => setSearchSearchParams({...searchParams, nickname: e.target.value})}
                />
              </div>
              <div className="inline-field">
                <span className="inline-field-label">身份类型:</span>
                <select 
                  className="form-input" 
                  style={{ width: '120px' }}
                  value={searchParams.identityType}
                  onChange={e => setSearchSearchParams({...searchParams, identityType: e.target.value})}
                >
                  <option value="">全部</option>
                  <option value="1">Lib认证作者</option>
                  <option value="2">原创作者</option>
                </select>
              </div>
              <div className="inline-field">
                <span className="inline-field-label">是否被回收Lib认证身份:</span>
                <select 
                  className="form-input" 
                  style={{ width: '100px' }}
                  value={searchParams.isRevoked}
                  onChange={e => setSearchSearchParams({...searchParams, isRevoked: e.target.value})}
                >
                  <option value="">全部</option>
                  <option value="yes">是</option>
                  <option value="no">否</option>
                </select>
              </div>
              <div className="inline-search-actions">
                <button className="btn btn-primary" onClick={handleSearch}>搜索</button>
              </div>
            </div>

            {/* Table */}
            <div className="table-wrap">
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '100px' }}>作者头像</th>
                    <th>用户名</th>
                    <th>ID</th>
                    <th>UUID</th>
                    <th>身份类型</th>
                    <th style={{ width: '120px' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {finalFilteredAuthors.map(author => (
                    <tr key={author.authorId}>
                      <td>
                        <div className="avatar" style={{ background: author.avatar }}>
                          {author.nickname.charAt(0)}
                        </div>
                      </td>
                      <td>{author.nickname}</td>
                      <td>{author.authorId.substring(0, 8)}</td>
                      <td className="text-mono text-secondary" style={{ fontSize: '12px' }}>{author.authorId}</td>
                      <td>{author.tagIds.includes(2) ? 'Lib认证作者' : '原创作者'}</td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => addToast('info', '功能开发中')}>
                          身份变更
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <AuthorTagPage 
            tags={tags} 
            authors={authors} 
            setAuthors={setAuthors} 
            addToast={addToast} 
            onViewDetail={onViewDetail} 
            hideCard={true} 
          />
        )}
      </div>
    </div>
  );
}
