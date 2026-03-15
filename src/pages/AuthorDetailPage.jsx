import { useState } from 'react';
import { BackIcon } from '../components/icons';
import { CERT_PERIODS, DISPLAY_SCOPES, MAX_TAGS_PER_AUTHOR, MESSAGE_TEMPLATES, mockAuthorDetails } from '../data/mockData';
import { getLabelTextColor } from '../utils/tags';

const MAX_MESSAGE_LENGTH = 1000;

export default function AuthorDetailPage({ author, tags, onBack, addToast }) {
  const [activeTab, setActiveTab] = useState('lib'); // 'lib' or 'libtv'
  const [configs, setConfigs] = useState({
    lib: { certTypeIds: [], isCancelCert: false, certPeriod: '', auditResult: '' },
    libtv: { certTypeIds: [], isCancelCert: false, certPeriod: '', auditResult: '' }
  });
  const [messageContent, setMessageContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const enabledTags = tags.filter((t) => t.status === 1);
  const currentConfig = configs[activeTab];

  if (!author) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="empty">
            <div className="empty-text">作者不存在</div>
          </div>
        </div>
      </div>
    );
  }

  const detail = mockAuthorDetails[author.authorId] || {
    homepageLink: '#',
    createDate: '-',
    fanCount: 0,
    accumulatedVv: 0,
    accumulatedLikes: 0,
    publishedVideoCount: author.workCount || 0,
    worksOver30sCount: 0,
    worksLast30DaysCount: 0,
    qualityWorksCount: 0,
    publicCanvasCount: 0,
  };

  const authorTags = author.tagIds.map((id) => tags.find((tag) => tag.id === id)).filter(Boolean);

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
    const hasLibConfig = configs.lib.isCancelCert || configs.lib.certTypeIds.length > 0;
    const hasLibTVConfig = configs.libtv.isCancelCert || configs.libtv.certTypeIds.length > 0;

    if (!hasLibConfig && !hasLibTVConfig) {
      addToast('warning', '请至少在一个 Tab 中选择认证类型');
      return;
    }

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
      addToast('success', `认证结果已提交${messageContent ? '，站内信已发送' : ''}`);
    }, 800);
  }

  return (
    <>
      <div className="detail-back" onClick={onBack}>
        <BackIcon />
        返回作者列表
      </div>

      <section className="detail-section">
        <div className="detail-section-title">作者信息</div>
        <div className="detail-section-body">
          <div className="detail-grid">
            <DetailItem label="作者昵称" value={author.nickname} />
            <DetailItem
              label="作者主页链接"
              value={
                <a href={detail.homepageLink} target="_blank" rel="noopener noreferrer">
                  {detail.homepageLink}
                </a>
              }
            />
            <DetailItem label="创建账号日期" value={detail.createDate} />
            <DetailItem label="作者粉丝数" value={detail.fanCount.toLocaleString()} />
            <DetailItem label="累计 vv" value={detail.accumulatedVv.toLocaleString()} />
            <DetailItem label="累计获得点赞" value={detail.accumulatedLikes.toLocaleString()} />
            <DetailItem
              label="已有标签"
              value={
                authorTags.length > 0
                  ? authorTags.map((tag) => (
                      <span
                        key={tag.id}
                        className="tag detail-tag"
                        style={{ background: tag.color, color: getLabelTextColor(tag.color) }}
                      >
                        {tag.name}
                      </span>
                    ))
                  : '—'
              }
            />
          </div>
        </div>
      </section>

      <section className="detail-section">
        <div className="detail-section-title">作品信息</div>
        <div className="detail-section-body">
          <div className="detail-grid">
            <DetailItem label="累计发布视频作品数（公开）" value={detail.publishedVideoCount} />
            <DetailItem label="时长大于 30 秒作品数" value={detail.worksOver30sCount} />
            <DetailItem label="近 30 日发布作品数" value={detail.worksLast30DaysCount} />
            <DetailItem label="累计优质作品数（精选 tag）" value={detail.qualityWorksCount} />
            <DetailItem label="公开工作流画布数" value={detail.publicCanvasCount} />
          </div>
        </div>
      </section>

      <section className="detail-section">
        <div className="detail-section-title">操作台</div>
        
        {/* Tabs Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: '#fafafa', marginBottom: '24px' }}>
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

        <div className="detail-section-body" style={{ padding: '0 24px 24px' }}>
          <div className="detail-form-row">
            <label>作者认证类型</label>
            <div className="detail-cert-tags">
              {enabledTags.map((tag) => {
                const checked = currentConfig.certTypeIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={`detail-cert-chip ${checked ? 'detail-cert-chip-selected' : ''}`}
                    disabled={currentConfig.isCancelCert}
                    onClick={() => toggleCertTag(tag.id)}
                    style={
                      checked
                        ? { background: tag.color, color: getLabelTextColor(tag.color), borderColor: tag.color }
                        : { borderColor: '#d9d9d9', color: '#666' }
                    }
                  >
                    {checked && <span className="detail-cert-check">✓</span>}
                    {tag.name}
                  </button>
                );
              })}
              <button
                type="button"
                className={`detail-cert-chip detail-cert-chip-cancel ${currentConfig.isCancelCert ? 'detail-cert-chip-selected' : ''}`}
                onClick={() => {
                  const nextVal = !currentConfig.isCancelCert;
                  updateConfig('isCancelCert', nextVal);
                  if (nextVal) updateConfig('certTypeIds', []);
                }}
              >
                {currentConfig.isCancelCert && <span className="detail-cert-check">✓</span>}
                取消认证
              </button>
            </div>
            {currentConfig.certTypeIds.length > 0 && (
              <div className="detail-cert-hint">已选 {currentConfig.certTypeIds.length}/{MAX_TAGS_PER_AUTHOR} 个</div>
            )}
          </div>

          <div className="detail-form-row">
            <label>审核结果</label>
            <select
              className="form-input form-select"
              value={currentConfig.auditResult}
              onChange={(event) => updateConfig('auditResult', event.target.value)}
            >
              <option value="">请选择</option>
              <option value="pass">通过</option>
              <option value="reject">不通过</option>
            </select>
          </div>

          {!currentConfig.isCancelCert && (
            <div className="detail-form-row">
              <label>认证生效周期</label>
              <select
                className="form-input form-select"
                value={currentConfig.certPeriod}
                onChange={(event) => updateConfig('certPeriod', event.target.value)}
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

          <div className="detail-form-row">
            <label>站内信</label>
            <div className="detail-message-row">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={!currentConfig.auditResult}
                onClick={() => {
                  const template = currentConfig.auditResult === 'pass' ? MESSAGE_TEMPLATES.pass : MESSAGE_TEMPLATES.reject;
                  setMessageContent(template);
                  addToast('success', '已填充站内信模板，可编辑后提交');
                }}
              >
                生成站内信
              </button>
              <span className="detail-char-count">
                {messageContent.length}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
            <textarea
              className="form-input form-textarea detail-textarea"
              value={messageContent}
              onChange={(event) => {
                const v = event.target.value;
                if (v.length <= MAX_MESSAGE_LENGTH) setMessageContent(v);
              }}
              placeholder="站内信内文，可点击「生成站内信」填充模板后编辑；提交认证时可一并发送给作者"
              maxLength={MAX_MESSAGE_LENGTH}
            />
          </div>

          <div className="detail-submit-row">
            <button className="btn btn-primary" disabled={submitting} onClick={handleSubmit}>
              {submitting ? '提交中...' : '确认提交认证结果'}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="detail-item">
      <label>{label}</label>
      <div className="value">{value}</div>
    </div>
  );
}
