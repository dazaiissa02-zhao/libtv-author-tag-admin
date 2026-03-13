import { useEffect, useState } from 'react';
import AuthorTagModal from '../components/AuthorTagModal';
import { getLabelTextColor, isDataUrl } from '../utils/tags';

export default function AuthorTagPage({ tags, authors, setAuthors, addToast, onViewDetail, hideCard = false }) {
  const [nameKeyword, setNameKeyword] = useState('');
  const [uuidKeyword, setUuidKeyword] = useState('');
  const [filterTagId, setFilterTagId] = useState('all');
  const [searchResult, setSearchResult] = useState(authors);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    setSearchResult(applyFilters(authors, nameKeyword, uuidKeyword, filterTagId));
  }, [authors, filterTagId, nameKeyword, uuidKeyword]);

  const totalPages = Math.ceil(searchResult.length / pageSize);
  const pagedAuthors = searchResult.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function getTagCount(tagId) {
    if (tagId === 'all') {
      return authors.length;
    }
    if (tagId === 'none') {
      return authors.filter((author) => author.tagIds.length === 0).length;
    }

    const targetTagId = Number.parseInt(tagId, 10);
    return authors.filter((author) => author.tagIds.includes(targetTagId)).length;
  }

  function handleSearch() {
    setSearchResult(applyFilters(authors, nameKeyword, uuidKeyword, filterTagId));
    setCurrentPage(1);
  }

  function handleFilterTagChange(nextTagId) {
    setFilterTagId(nextTagId);
    setSearchResult(applyFilters(authors, nameKeyword, uuidKeyword, nextTagId));
    setCurrentPage(1);
  }

  function handleReset() {
    setNameKeyword('');
    setUuidKeyword('');
    setFilterTagId('all');
    setSearchResult(authors);
    setCurrentPage(1);
  }

  function handleSaveTags(authorId, tagIds) {
    setAuthors((current) =>
      current.map((author) => (author.authorId === authorId ? { ...author, tagIds } : author)),
    );
    setModalVisible(false);
    setEditingAuthor(null);
    addToast('success', '标签更新成功');
  }

  function getAuthorTags(author) {
    return author.tagIds.map((id) => tags.find((tag) => tag.id === id)).filter(Boolean);
  }

  const content = (
    <>
      <div className="pill-tab-bar">
        <button
          className={`pill-tab ${filterTagId === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterTagChange('all')}
        >
          全部 {getTagCount('all')}
        </button>
        {tags
          .filter((tag) => tag.status === 1)
          .map((tag) => (
            <button
              key={tag.id}
              className={`pill-tab ${filterTagId === String(tag.id) ? 'active' : ''}`}
              onClick={() => handleFilterTagChange(String(tag.id))}
            >
              <span className="pill-tab-dot" style={{ background: tag.color }} />
              {tag.name} {getTagCount(String(tag.id))}
            </button>
          ))}
        <button
          className={`pill-tab ${filterTagId === 'none' ? 'active' : ''}`}
          onClick={() => handleFilterTagChange('none')}
        >
          无标签 {getTagCount('none')}
        </button>
      </div>

      <div className="inline-search-grid">
        <div className="inline-field">
          <span className="inline-field-label">作者名称</span>
          <input
            className="inline-field-input"
            placeholder="请输入作者名称"
            value={nameKeyword}
            onChange={(event) => setNameKeyword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
        <div className="inline-field">
          <span className="inline-field-label">作者 UUID</span>
          <input
            className="inline-field-input"
            placeholder="请输入 UUID"
            value={uuidKeyword}
            onChange={(event) => setUuidKeyword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </div>
        <div className="inline-search-actions">
          <button className="btn btn-primary" onClick={handleSearch}>
            搜索
          </button>
          <button className="btn btn-default" onClick={handleReset}>
            重置
          </button>
        </div>
      </div>

      {searchResult.length === 0 ? (
        <div className="empty search-empty">
          <div className="empty-icon">👤</div>
          <div className="empty-text">未找到匹配的作者</div>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 60 }}>头像</th>
                  <th>作者名称</th>
                  <th>UUID</th>
                  <th style={{ width: 80 }}>作品数</th>
                  <th>已有标签</th>
                  <th style={{ width: 140, whiteSpace: 'nowrap' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {pagedAuthors.map((author) => {
                  const authorTags = getAuthorTags(author);

                  return (
                    <tr key={author.authorId}>
                      <td>
                        <div className="avatar" style={{ background: author.avatar }}>
                          {author.nickname.charAt(0)}
                        </div>
                      </td>
                      <td className="font-medium">{author.nickname}</td>
                      <td>
                        <span className="text-mono text-secondary">
                          {author.authorId.substring(0, 8)}...
                        </span>
                      </td>
                      <td>{author.workCount}</td>
                      <td>
                        {authorTags.length > 0 ? (
                          <div className="tag-list-wrap">
                            {authorTags.map((tag) => (
                              <span
                                key={tag.id}
                                className="tag"
                                style={{
                                  background: tag.color,
                                  color: getLabelTextColor(tag.color),
                                }}
                              >
                                {renderInlineTagIcon(tag.iconUrl)}
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-secondary">—</span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions nowrap">
                          <button className="btn-link" onClick={() => onViewDetail(author)}>
                            查看详情
                          </button>
                          <span className="table-divider">|</span>
                          <button
                            className="btn-link"
                            onClick={() => {
                              setEditingAuthor(author);
                              setModalVisible(true);
                            }}
                          >
                            编辑标签
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pagination pagination-padded">
            <span className="page-info">共 {searchResult.length} 条</span>
            <button
              className="page-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              ›
            </button>
          </div>
        </>
      )}
    </>
  );

  return (
    <>
      {hideCard ? (
        <div style={{ padding: '0 0 24px' }}>
          {content}
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <span className="card-title">作者标签管理</span>
          </div>
          <div className="card-body no-padding">
            {content}
          </div>
        </div>
      )}

      <AuthorTagModal
        visible={modalVisible}
        author={editingAuthor}
        tags={tags}
        onSave={handleSaveTags}
        onCancel={() => {
          setModalVisible(false);
          setEditingAuthor(null);
        }}
      />
    </>
  );
}

function applyFilters(authors, nameKeyword, uuidKeyword, filterTagId) {
  let result = authors;

  if (nameKeyword.trim()) {
    const keyword = nameKeyword.trim().toLowerCase();
    result = result.filter((author) => author.nickname.toLowerCase().includes(keyword));
  }

  if (uuidKeyword.trim()) {
    const keyword = uuidKeyword.trim().toLowerCase();
    result = result.filter((author) => author.authorId.toLowerCase().includes(keyword));
  }

  if (filterTagId === 'none') {
    result = result.filter((author) => author.tagIds.length === 0);
  } else if (filterTagId !== 'all') {
    const targetTagId = Number.parseInt(filterTagId, 10);
    result = result.filter((author) => author.tagIds.includes(targetTagId));
  }

  return result;
}

function renderInlineTagIcon(iconUrl) {
  if (!iconUrl) {
    return null;
  }

  if (isDataUrl(iconUrl)) {
    return <img src={iconUrl} alt="" className="inline-tag-icon" />;
  }

  return <span className="inline-emoji-icon small">{iconUrl}</span>;
}
