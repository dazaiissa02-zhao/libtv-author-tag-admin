import { useState } from 'react';
import { CERT_PERIODS, DISPLAY_SCOPES, MESSAGE_TEMPLATES } from '../data/mockData';
import { getLabelTextColor } from '../utils/tags';

const MAX_MESSAGE_LENGTH = 1000;
const MAX_TAGS_PER_AUTHOR = 5;

export default function BatchOperationModal({ visible, selectedCount, tags, onSave, onCancel, addToast }) {
  const [certTypeIds, setCertTypeIds] = useState([]); 
  const [isCancelCert, setIsCancelCert] = useState(false);
  const [certPeriod, setCertPeriod] = useState('');
  const [displayScopes, setDisplayScopes] = useState([]); 
  const [auditResult, setAuditResult] = useState(''); 
  const [messageContent, setMessageContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!visible) return null;

  const enabledTags = tags.filter((t) => t.status === 1);

  function toggleDisplayScope(value) {
    if (!value) return;
    setDisplayScopes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  function toggleCertTag(tagId) {
    if (isCancelCert) return;
    setCertTypeIds((prev) => {
      const next = prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId];
      return next.length <= MAX_TAGS_PER_AUTHOR ? next : prev;
    });
  }

  function handleSubmit() {
    if (!isCancelCert && certTypeIds.length === 0) {
      addToast('warning', '请选择认证类型');
      return;
    }

    if (!isCancelCert && certTypeIds.length > 0 && !certPeriod) {
      addToast('warning', '请选择认证生效周期');
      return;
    }

    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      onSave({
        certTypeIds,
        isCancelCert,
        certPeriod,
        displayScopes,
        auditResult,
        messageContent
      });
    }, 800);
  }

  return (
    <div className="modal-mask" onClick={onCancel}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <div>
            <span className="modal-title">操作台</span>
            <span className="modal-subtitle">— 已选 {selectedCount} 位用户</span>
          </div>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        
        <div className="modal-body" style={{ padding: '24px' }}>
          <div className="detail-form-row" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>作者认证类型</label>
            <div className="detail-cert-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {enabledTags.map((tag) => {
                const checked = certTypeIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={`detail-cert-chip ${checked ? 'detail-cert-chip-selected' : ''}`}
                    disabled={isCancelCert}
                    onClick={() => toggleCertTag(tag.id)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '16px',
                      border: '1px solid #d9d9d9',
                      background: checked ? tag.color : '#fff',
                      color: checked ? getLabelTextColor(tag.color) : '#666',
                      borderColor: checked ? tag.color : '#d9d9d9',
                      cursor: 'pointer'
                    }}
                  >
                    {checked && <span style={{ marginRight: '4px' }}>✓</span>}
                    {tag.name}
                  </button>
                );
              })}
              <button
                type="button"
                className={`detail-cert-chip ${isCancelCert ? 'detail-cert-chip-selected' : ''}`}
                onClick={() => {
                  setIsCancelCert(!isCancelCert);
                  if (!isCancelCert) setCertTypeIds([]);
                }}
                style={{
                  padding: '4px 12px',
                  borderRadius: '16px',
                  border: '1px solid #d9d9d9',
                  background: isCancelCert ? '#f5222d' : '#fff',
                  color: isCancelCert ? '#fff' : '#666',
                  borderColor: isCancelCert ? '#f5222d' : '#d9d9d9',
                  cursor: 'pointer'
                }}
              >
                {isCancelCert && <span style={{ marginRight: '4px' }}>✓</span>}
                取消认证
              </button>
            </div>
            {certTypeIds.length > 0 && (
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>已选 {certTypeIds.length}/{MAX_TAGS_PER_AUTHOR} 个</div>
            )}
          </div>

          <div className="detail-form-row" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>显示范围</label>
            <div className="detail-scope-tags" style={{ display: 'flex', gap: '8px' }}>
              {DISPLAY_SCOPES.filter((o) => o.value).map((option) => {
                const checked = displayScopes.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`detail-cert-chip ${checked ? 'detail-cert-chip-selected' : ''}`}
                    onClick={() => toggleDisplayScope(option.value)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '16px',
                      border: '1px solid #d9d9d9',
                      background: checked ? 'var(--blue)' : '#fff',
                      color: checked ? '#fff' : '#666',
                      borderColor: checked ? 'var(--blue)' : '#d9d9d9',
                      cursor: 'pointer'
                    }}
                  >
                    {checked && <span style={{ marginRight: '4px' }}>✓</span>}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="detail-form-row" style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>审核结果</label>
            <select
              className="form-input"
              style={{ width: '100%' }}
              value={auditResult}
              onChange={(e) => setAuditResult(e.target.value)}
            >
              <option value="">请选择</option>
              <option value="pass">通过</option>
              <option value="reject">不通过</option>
            </select>
          </div>

          {!isCancelCert && (
            <div className="detail-form-row" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>认证生效周期</label>
              <select
                className="form-input"
                style={{ width: '100%' }}
                value={certPeriod}
                onChange={(e) => setCertPeriod(e.target.value)}
              >
                {CERT_PERIODS.map((option) => (
                  <option key={option.value || 'empty'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="detail-form-row">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: 'bold' }}>站内信</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={!auditResult}
                  onClick={() => {
                    const template = auditResult === 'pass' ? MESSAGE_TEMPLATES.pass : MESSAGE_TEMPLATES.reject;
                    setMessageContent(template);
                    addToast('success', '已填充站内信模板');
                  }}
                >
                  生成站内信
                </button>
                <span style={{ fontSize: '12px', color: '#999' }}>{messageContent.length}/{MAX_MESSAGE_LENGTH}</span>
              </div>
            </div>
            <textarea
              className="form-input"
              style={{ width: '100%', height: '100px', resize: 'vertical' }}
              value={messageContent}
              onChange={(e) => {
                if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                  setMessageContent(e.target.value);
                }
              }}
              placeholder="站内信内文，可点击「生成站内信」填充模板后编辑；提交认证时可一并发送给作者"
            />
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-default" onClick={onCancel}>取消</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '提交中...' : '确认提交认证结果'}
          </button>
        </div>
      </div>
    </div>
  );
}
