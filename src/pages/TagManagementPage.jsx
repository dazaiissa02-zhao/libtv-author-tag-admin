import dayjs from 'dayjs';
import ConfirmModal from '../components/ConfirmModal';
import TagFormModal from '../components/TagFormModal';
import { PlusIcon } from '../components/icons';
import { MAX_TAGS } from '../data/mockData';
import { getLabelTextColor, isDataUrl } from '../utils/tags';
import { useState } from 'react';

export default function TagManagementPage({ tags, setTags, addToast }) {
  const [searchName, setSearchName] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formVisible, setFormVisible] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deletingTag, setDeletingTag] = useState(null);

  const filteredTags = tags
    .filter((tag) => {
      if (searchName && !tag.name.includes(searchName)) {
        return false;
      }
      if (filterStatus !== 'all' && tag.status !== Number.parseInt(filterStatus, 10)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const isAtLimit = tags.length >= MAX_TAGS;

  function handleSaveTag(data) {
    if (data.id) {
      setTags((current) => current.map((tag) => (tag.id === data.id ? { ...tag, ...data } : tag)));
      addToast('success', '标签更新成功');
    } else {
      const newTag = {
        ...data,
        id: Date.now(),
        createdBy: '运营A',
        createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
        authorCount: 0,
        status: 1,
      };
      setTags((current) => [...current, newTag]);
      addToast('success', '标签创建成功');
    }

    setFormVisible(false);
    setEditingTag(null);
  }

  function handleToggleStatus(tag) {
    setTags((current) =>
      current.map((item) =>
        item.id === tag.id ? { ...item, status: item.status === 1 ? 0 : 1 } : item,
      ),
    );
    addToast('success', `标签已${tag.status === 1 ? '停用' : '启用'}`);
  }

  function handleDelete() {
    if (!deletingTag) {
      return;
    }

    setTags((current) => current.filter((tag) => tag.id !== deletingTag.id));
    addToast('success', '标签已删除');
    setConfirmVisible(false);
    setDeletingTag(null);
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-4">
            <span className="card-title">标签管理</span>
            <span className={`tag-count ${isAtLimit ? 'limit' : ''}`}>
              <b>{tags.length}</b> / {MAX_TAGS}
            </span>
          </div>
          <button
            className="btn btn-primary"
            disabled={isAtLimit}
            onClick={() => {
              setEditingTag(null);
              setFormVisible(true);
            }}
          >
            <PlusIcon />
            新增标签
          </button>
        </div>

        <div className="card-body">
          <div className="search-bar">
            <div className="search-field">
              <label>标签名称</label>
              <input
                className="form-input"
                placeholder="搜索标签名称"
                value={searchName}
                onChange={(event) => setSearchName(event.target.value)}
              />
            </div>
            <div className="search-field">
              <label>状态</label>
              <select
                className="form-input form-select"
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value)}
              >
                <option value="all">全部</option>
                <option value="1">启用</option>
                <option value="0">停用</option>
              </select>
            </div>
            <button
              className="btn btn-default"
              onClick={() => {
                setSearchName('');
                setFilterStatus('all');
              }}
            >
              重置
            </button>
          </div>

          {filteredTags.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🏷️</div>
              <div className="empty-text">
                暂无标签{searchName || filterStatus !== 'all' ? '（当前筛选条件下）' : '，点击「新增标签」创建'}
              </div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>排序</th>
                    <th>标签名称</th>
                    <th>图标</th>
                    <th>颜色</th>
                    <th>预览</th>
                    <th>描述</th>
                    <th style={{ width: 90 }}>关联作者</th>
                    <th style={{ width: 80 }}>状态</th>
                    <th>创建人</th>
                    <th>创建时间</th>
                    <th style={{ width: 160 }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTags.map((tag) => (
                    <tr key={tag.id}>
                      <td className="text-secondary">{tag.sortOrder}</td>
                      <td className="font-medium">{tag.name}</td>
                      <td>{renderTagIconCell(tag.iconUrl)}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="color-dot" style={{ background: tag.color }} />
                          <span className="text-mono">{tag.color}</span>
                        </div>
                      </td>
                      <td>
                        <span className="tag" style={{ background: tag.color, color: getLabelTextColor(tag.color) }}>
                          {renderInlineTagIcon(tag.iconUrl)}
                          {tag.name}
                        </span>
                      </td>
                      <td>
                        <span className="text-secondary truncate">{tag.description || '—'}</span>
                      </td>
                      <td>
                        <span className="font-medium">{tag.authorCount}</span> 人
                      </td>
                      <td>
                        <div className="switch-wrap flex items-center gap-2">
                          <div
                            className={`switch ${tag.status === 1 ? 'on' : ''}`}
                            onClick={() => handleToggleStatus(tag)}
                          />
                          <span className={`status-badge ${tag.status === 1 ? 'enabled' : 'disabled'}`}>
                            {tag.status === 1 ? '启用' : '停用'}
                          </span>
                        </div>
                      </td>
                      <td className="text-secondary">{tag.createdBy}</td>
                      <td className="text-secondary text-sm">{tag.createdAt}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            className="btn-link"
                            onClick={() => {
                              setEditingTag(tag);
                              setFormVisible(true);
                            }}
                          >
                            编辑
                          </button>
                          <span className="table-divider">|</span>
                          <button
                            className="btn-link danger"
                            onClick={() => {
                              setDeletingTag(tag);
                              setConfirmVisible(true);
                            }}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <TagFormModal
        visible={formVisible}
        editingTag={editingTag}
        tags={tags}
        onSave={handleSaveTag}
        onCancel={() => {
          setFormVisible(false);
          setEditingTag(null);
        }}
      />

      <ConfirmModal
        visible={confirmVisible}
        title="确认删除"
        message={
          <>
            确定要删除标签「<b>{deletingTag?.name}</b>」吗？
            <br />
            删除后将解除该标签与所有作者的绑定关系，此操作不可恢复。
          </>
        }
        danger
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmVisible(false);
          setDeletingTag(null);
        }}
      />
    </>
  );
}

function renderTagIconCell(iconUrl) {
  if (!iconUrl) {
    return <span className="text-secondary">—</span>;
  }

  if (isDataUrl(iconUrl)) {
    return <img src={iconUrl} alt="" className="table-tag-icon" />;
  }

  return <span className="emoji-icon">{iconUrl}</span>;
}

function renderInlineTagIcon(iconUrl) {
  if (!iconUrl) {
    return null;
  }

  if (isDataUrl(iconUrl)) {
    return <img src={iconUrl} alt="" className="inline-tag-icon" />;
  }

  return <span className="inline-emoji-icon">{iconUrl}</span>;
}
