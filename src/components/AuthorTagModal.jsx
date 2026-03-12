import { useEffect, useState } from 'react';
import { MAX_TAGS_PER_AUTHOR } from '../data/mockData';
import { getLabelTextColor, isDataUrl } from '../utils/tags';

export default function AuthorTagModal({ visible, author, tags, onSave, onCancel }) {
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (visible && author) {
      setSelectedIds([...author.tagIds]);
    }
  }, [author, visible]);

  if (!visible || !author) {
    return null;
  }

  const enabledTags = tags.filter((tag) => tag.status === 1);
  const atLimit = selectedIds.length >= MAX_TAGS_PER_AUTHOR;

  function toggle(tagId) {
    if (selectedIds.includes(tagId)) {
      setSelectedIds(selectedIds.filter((id) => id !== tagId));
      return;
    }

    if (selectedIds.length >= MAX_TAGS_PER_AUTHOR) {
      return;
    }

    setSelectedIds([...selectedIds, tagId]);
  }

  return (
    <div className="modal-mask" onClick={onCancel}>
      <div className="modal wide" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-title">编辑标签</span>
            <span className="modal-subtitle">— {author.nickname}</span>
          </div>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-toolbar">
            <span className="text-secondary">选择要绑定的标签（仅展示已启用的标签）</span>
            <span className={`tag-count ${atLimit ? 'limit' : ''}`}>
              已选 <b>{selectedIds.length}</b> / {MAX_TAGS_PER_AUTHOR}
            </span>
          </div>
          <div className="tag-check-list">
            {enabledTags.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🏷️</div>
                <div className="empty-text">暂无可用标签，请先在「标签管理」中创建</div>
              </div>
            ) : (
              enabledTags.map((tag) => {
                const checked = selectedIds.includes(tag.id);
                const disabled = !checked && atLimit;

                return (
                  <div
                    key={tag.id}
                    className={`tag-check-item ${checked ? 'checked' : ''} ${disabled ? 'check-disabled' : ''}`}
                    onClick={() => {
                      if (!disabled) {
                        toggle(tag.id);
                      }
                    }}
                  >
                    <div className={`checkbox ${checked ? 'checked' : ''}`} />
                    <div className="color-dot" style={{ background: tag.color }} />
                    <span className="tag" style={{ background: tag.color, color: getLabelTextColor(tag.color) }}>
                      {renderTagIcon(tag.iconUrl)}
                      {tag.name}
                    </span>
                    <span className="spacer" />
                    <span className="text-sm text-secondary">{tag.description}</span>
                  </div>
                );
              })
            )}
          </div>
          {atLimit ? (
            <div className="form-hint form-warning">
              ⚠️ 已达单作者标签上限（{MAX_TAGS_PER_AUTHOR} 个），需取消勾选后才能选择其他标签
            </div>
          ) : null}
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onCancel}>
            取消
          </button>
          <button className="btn btn-primary" onClick={() => onSave(author.authorId, selectedIds)}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

function renderTagIcon(iconUrl) {
  if (!iconUrl) {
    return null;
  }

  if (isDataUrl(iconUrl)) {
    return (
      <img
        src={iconUrl}
        alt=""
        style={{ width: 12, height: 12, verticalAlign: 'middle', marginRight: 2, objectFit: 'contain' }}
      />
    );
  }

  return <span style={{ fontSize: 12 }}>{iconUrl}</span>;
}
