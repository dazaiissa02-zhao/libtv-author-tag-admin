import { useState } from 'react';
import { CERT_PERIODS, DISPLAY_SCOPES, MESSAGE_TEMPLATES } from '../data/mockData';
import { getLabelTextColor } from '../utils/tags';

const MAX_MESSAGE_LENGTH = 1000;
const MAX_TAGS_PER_AUTHOR = 5;

export default function BatchOperationModal({ visible, selectedCount, tags, onSave, onCancel, addToast }) {
  const [activeTab, setActiveTab] = useState('lib'); // 'lib' or 'libTV'
  const [configs, setConfigs] = useState({
    lib: { certTypeIds: [], isCancelCert: false, certPeriod: '', auditResult: '' },
    libtv: { certTypeIds: [], isCancelCert: false, certPeriod: '', auditResult: '' }
  });
  const [messageContent, setMessageContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!visible) return null;

  const currentConfig = configs[activeTab];
  const enabledTags = tags.filter((t) => t.status === 1);

  function updateConfig(key, value) {
    setConfigs(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [key]: value
      }
    }));
  }

  function toggleCertTag(tagId) {
    if (currentConfig.isCancelCert) return;
    const prevIds = currentConfig.certTypeIds;
    const nextIds = prevIds.includes(tagId) 
      ? prevIds.filter((id) => id !== tagId) 
      : [...prevIds, tagId];
    
    if (nextIds.length <= MAX_TAGS_PER_AUTHOR) {
      updateConfig('certTypeIds', nextIds);
    }
  }

  function handleSubmit() {
    // Check if at least one tab has some configuration
    const hasLibConfig = configs.lib.isCancelCert || configs.lib.certTypeIds.length > 0;
    const hasLibTVConfig = configs.libtv.isCancelCert || configs.libtv.certTypeIds.length > 0;

    if (!hasLibConfig && !hasLibTVConfig) {
      addToast('warning', '请至少在一个 Tab 中选择认证类型');
      return;
    }

    // Validate active tab or all tabs? Usually all configured tabs.
    const tabsToValidate = [];
    if (hasLibConfig) tabsToValidate.push('lib');
    if (hasLibTVConfig) tabsToValidate.push('libtv');

    for (const tab of tabsToValidate) {
      const conf = configs[tab];
      if (!conf.isCancelCert && conf.certTypeIds.length > 0 && !conf.certPeriod) {
        addToast('warning', `请为 ${tab === 'lib' ? 'Lib' : 'LibTV'} 选择认证生效周期`);
        return;
      }
    }

    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      onSave({
        configs,
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
        
        <div className="modal-body" style={{ padding: '0' }}>
          {/* Tabs Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: '#fafafa' }}>
            {DISPLAY_SCOPES.filter(o => o.value).map(o => (
              <div
                key={o.value}
                onClick={() => setActiveTab(o.value)}
                style={{
                  padding: '12px 32px',
                  cursor: 'pointer',
                  borderBottom: activeTab === o.value ? '2px solid var(--blue)' : '2px solid transparent',
                  color: activeTab === o.value ? 'var(--blue)' : 'var(--text-secondary)',
                  fontWeight: activeTab === o.value ? '600' : '400',
                  transition: 'all 0.2s'
                }}
              >
                {o.label}
              </div>
            ))}
          </div>

          <div style={{ padding: '24px' }}>
            <div className="detail-form-row" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>作者认证类型</label>
              <div className="detail-cert-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {enabledTags.map((tag) => {
                  const checked = currentConfig.certTypeIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      className={`detail-cert-chip ${checked ? 'detail-cert-chip-selected' : ''}`}
                      disabled={currentConfig.isCancelCert}
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
                  className={`detail-cert-chip ${currentConfig.isCancelCert ? 'detail-cert-chip-selected' : ''}`}
                  onClick={() => {
                    const nextVal = !currentConfig.isCancelCert;
                    updateConfig('isCancelCert', nextVal);
                    if (nextVal) updateConfig('certTypeIds', []);
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    border: '1px solid #d9d9d9',
                    background: currentConfig.isCancelCert ? '#f5222d' : '#fff',
                    color: currentConfig.isCancelCert ? '#fff' : '#666',
                    borderColor: currentConfig.isCancelCert ? '#f5222d' : '#d9d9d9',
                    cursor: 'pointer'
                  }}
                >
                  {currentConfig.isCancelCert && <span style={{ marginRight: '4px' }}>✓</span>}
                  取消认证
                </button>
              </div>
              {currentConfig.certTypeIds.length > 0 && (
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>已选 {currentConfig.certTypeIds.length}/{MAX_TAGS_PER_AUTHOR} 个</div>
              )}
            </div>

            <div className="detail-form-row" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>审核结果</label>
              <select
                className="form-input"
                style={{ width: '100%' }}
                value={currentConfig.auditResult}
                onChange={(e) => updateConfig('auditResult', e.target.value)}
              >
                <option value="">请选择</option>
                <option value="pass">通过</option>
                <option value="reject">不通过</option>
              </select>
            </div>

            {!currentConfig.isCancelCert && (
              <div className="detail-form-row" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>认证生效周期</label>
                <select
                  className="form-input"
                  style={{ width: '100%' }}
                  value={currentConfig.certPeriod}
                  onChange={(e) => updateConfig('certPeriod', e.target.value)}
                >
                  <option value="">请选择</option>
                  {CERT_PERIODS.map((option) => (
                    <option key={option.value || 'empty'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

            <div className="detail-form-row">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontWeight: 'bold' }}>站内信</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={!currentConfig.auditResult}
                    onClick={() => {
                      const template = currentConfig.auditResult === 'pass' ? MESSAGE_TEMPLATES.pass : MESSAGE_TEMPLATES.reject;
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
