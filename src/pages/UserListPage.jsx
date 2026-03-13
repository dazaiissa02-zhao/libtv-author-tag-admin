import { useState } from 'react';
import { mockUsers } from '../data/mockData';
import BatchOperationModal from '../components/BatchOperationModal';

export default function UserListPage({ users = mockUsers, tags: allTags = [], addToast }) {
  const [batchIds, setBatchIds] = useState('');
  const [batchUuids, setBatchUuids] = useState('');
  const [id, setId] = useState('');
  const [uuid, setUuid] = useState('');
  const [nickname, setNickname] = useState('');
  const [account, setAccount] = useState('');
  const [mobile, setMobile] = useState('');
  const [status, setStatus] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const pageSize = 10;

  const filtered = users.filter((u) => {
    if (batchIds.trim()) {
      const ids = batchIds.trim().split(/[\s,，]+/).map(Number);
      if (!ids.includes(u.id)) return false;
    }
    if (batchUuids.trim()) {
      const uuids = batchUuids.trim().split(/[\s,，]+/).filter(Boolean);
      if (!uuids.some((x) => u.uuid.includes(x) || x.includes(u.uuid))) return false;
    }
    if (id && String(u.id) !== id) return false;
    if (uuid && !u.uuid.includes(uuid)) return false;
    if (nickname && !u.nickname.includes(nickname)) return false;
    if (account && !(u.mobile || '').includes(account)) return false;
    if (mobile && !(u.mobile || '').includes(mobile)) return false;
    if (status && u.status !== Number(status)) return false;
    if (tags.length > 0) {
      const hasTag = tags.some((t) => u.tags?.includes(t));
      if (!hasTag) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleSearch() {
    setCurrentPage(1);
  }

  function handleReset() {
    setBatchIds('');
    setBatchUuids('');
    setId('');
    setNickname('');
    setAccount('');
    setUuid('');
    setUuid('');
    setMobile('');
    setStatus('');
    setTags([]);
    setCurrentPage(1);
  }

  function toggleRow(id) {
    setSelectedRowKeys((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    const ids = paged.map((u) => u.id);
    const allSelected = ids.every((id) => selectedRowKeys.includes(id));
    if (allSelected) {
      setSelectedRowKeys((prev) => prev.filter((k) => !ids.includes(k)));
    } else {
      setSelectedRowKeys((prev) => [...new Set([...prev, ...ids])]);
    }
  }

  function handleBatchOp() {
    if (selectedRowKeys.length === 0) {
      addToast('warning', '请先勾选用户');
      return;
    }
    setBatchModalVisible(true);
  }

  function handleBatchSave(results) {
    setBatchModalVisible(false);
    setSelectedRowKeys([]);
    addToast('success', `已成功为 ${selectedRowKeys.length} 位用户提交认证结果`);
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">用户列表</span>
      </div>
      <div className="card-body">
        <div className="user-list-batch-query">
          <div className="batch-query-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div className="batch-query-label" style={{ marginBottom: 0 }}>批量查询</div>
          </div>
          <div className="batch-query-row">
            <div className="batch-field">
              <label>id</label>
              <textarea
                className="form-input"
                placeholder="多个 id 用逗号或换行分隔"
                rows={1}
                value={batchIds}
                onChange={(e) => setBatchIds(e.target.value)}
              />
            </div>
            <div className="batch-field">
              <label>uuid</label>
              <textarea
                className="form-input"
                placeholder="多个 uuid 用逗号或换行分隔"
                rows={1}
                value={batchUuids}
                onChange={(e) => setBatchUuids(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="inline-search-grid" style={{ marginBottom: 16 }}>
          <div className="inline-field">
            <span className="inline-field-label">用户名</span>
            <input
              className="inline-field-input"
              placeholder="请输入"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
          <div className="inline-field">
            <span className="inline-field-label">账号</span>
            <input
              className="inline-field-input"
              placeholder="请输入"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            />
          </div>
          <div className="inline-field">
            <span className="inline-field-label">手机号/微信号/QQ号</span>
            <input
              className="inline-field-input"
              placeholder="请输入"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>
          <div className="inline-field">
            <select
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{ minWidth: 100 }}
            >
              <option value="">全部状态</option>
              <option value="1">正常</option>
              <option value="2">禁用</option>
            </select>
          </div>
          <div className="inline-field">
            <select
              className="form-input"
              value={tags[0] || ''}
              onChange={(e) => setTags(e.target.value ? [e.target.value] : [])}
              style={{ minWidth: 120 }}
            >
              <option value="">全部身份</option>
              <option value="liblib_official">官方账号</option>
              <option value="enterprise">企业账号</option>
              <option value="liblib_teacher">学院讲师</option>
              <option value="liblib_teaching_assistant">学院助教</option>
            </select>
          </div>
          <div className="inline-search-actions">
            <button className="btn btn-primary" onClick={handleSearch}>
              搜索
            </button>
            <button className="btn btn-default" onClick={handleReset}>
              重置
            </button>
            <button
              className="btn btn-primary"
              onClick={handleBatchOp}
              disabled={selectedRowKeys.length === 0}
            >
              批量操作（已选 {selectedRowKeys.length}）
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-text">未找到匹配的用户</div>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 100 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={paged.length > 0 && paged.every((u) => selectedRowKeys.includes(u.id))}
                          onChange={toggleAll}
                        />
                        <span>多选{selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ''}</span>
                      </div>
                    </th>
                    <th>用户名</th>
                    <th>账号</th>
                    <th>手机号/微信号/QQ号</th>
                    <th style={{ width: 80 }}>头像</th>
                    <th style={{ width: 100 }}>id</th>
                    <th style={{ width: 200 }}>uuid</th>
                    <th style={{ width: 220 }}>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRowKeys.includes(u.id)}
                          onChange={() => toggleRow(u.id)}
                        />
                      </td>
                      <td className="font-medium">{u.nickname}</td>
                      <td>{u.mobile || '—'}</td>
                      <td>{u.mobile || '—'}</td>
                      <td>
                        {u.avatar ? (
                          <div
                            className="avatar"
                            style={{ background: u.avatar, width: 32, height: 32, fontSize: 12 }}
                          >
                            {u.nickname.charAt(0)}
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="text-mono">{u.id}</td>
                      <td className="text-mono text-secondary" style={{ fontSize: 12 }}>
                        {u.uuid}
                      </td>
                      <td>
                        <div className="table-actions nowrap" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <button className="btn btn-primary btn-sm">
                            身份管理
                          </button>
                          <button className="btn btn-primary btn-sm">
                            {u.status === 1 ? '封禁' : '解封'}
                          </button>
                          <button className="btn btn-primary btn-sm">
                            换绑
                          </button>
                          <button className="btn btn-primary btn-sm">注销</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination-row">
              <span className="text-secondary">
                共 {filtered.length} 条
              </span>
              <div className="pagination-btns">
                <button
                  className="btn btn-default btn-sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ‹
                </button>
                <span className="pagination-info">
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  className="btn btn-default btn-sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <BatchOperationModal
        visible={batchModalVisible}
        selectedCount={selectedRowKeys.length}
        tags={allTags}
        onSave={handleBatchSave}
        onCancel={() => setBatchModalVisible(false)}
        addToast={addToast}
      />
    </div>
  );
}
