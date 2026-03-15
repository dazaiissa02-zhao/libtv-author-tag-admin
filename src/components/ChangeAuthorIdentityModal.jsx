import { useState, useEffect } from 'react';
import { CERT_PERIODS, DISPLAY_SCOPES, MESSAGE_TEMPLATES } from '../data/mockData';
import { getLabelTextColor } from '../utils/tags';

const MAX_MESSAGE_LENGTH = 1000;

export default function ChangeAuthorIdentityModal({ visible, author, tags, onSave, onCancel, addToast }) {
  const [certPeriod, setCertPeriod] = useState('');
  const [auditResult, setAuditResult] = useState(''); 
  const [messageContent, setMessageContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [changeTo, setChangeTo] = useState('original'); // 'original' or 'certified'
  const [recycleReason, setRecycleReason] = useState('');

  useEffect(() => {
    if (visible && author) {
      setCertPeriod('');
      setAuditResult('');
      setMessageContent('');
      setChangeTo('original');
      setRecycleReason('');
    }
  }, [visible, author]);

  if (!visible || !author) return null;

  function handleSubmit() {
    if (changeTo === 'original' && !recycleReason) {
      addToast('warning', '请选择回收原因');
      return;
    }

    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      onSave(author.authorId, {
        certPeriod,
        auditResult,
        messageContent,
        changeTo,
        recycleReason,
        isCancelCert: changeTo === 'original'
      });
    }, 800);
  }

  const currentIdentity = author.tagIds.includes(2) ? 'Lib认证作者' : '原创作者';

  const handleGenerateMsg = () => {
    if (changeTo === 'original') {
      const reasonMap = {
        '1': '长期未更新作品',
        '2': '违反社区规范',
        '3': '身份到期未续期',
        '4': '其他原因'
      };
      const reasonStr = reasonMap[recycleReason] || '相关原因';
      setMessageContent(`亲爱的创作者您好，因${reasonStr}，我们回收了您的${currentIdentity}认证身份。如有疑问请联系客服。`);
    } else {
      setMessageContent(MESSAGE_TEMPLATES.pass);
    }
    addToast('success', '已生成站内信模板');
  };

  return (
    <div className="modal-mask" onClick={onCancel}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <span className="modal-title">变更作者身份</span>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        
        <div className="modal-body" style={{ padding: '24px' }}>
          {/* Author Info Section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
            <div>
              <div style={{ marginBottom: '8px' }}><span style={{ color: '#666' }}>作者用户名：</span>{author.nickname}</div>
              <div><span style={{ color: '#666' }}>当前作者身份：</span>{currentIdentity}</div>
            </div>
            <div>
              <div style={{ marginBottom: '8px' }}><span style={{ color: '#666' }}>作者UUID：</span>{author.authorId}</div>
            </div>
          </div>

          {/* Change Identity Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ fontWeight: 'bold' }}>更改作者身份：</span>
            <select 
              className="form-input" 
              style={{ width: '120px' }}
              value={changeTo}
              onChange={(e) => setChangeTo(e.target.value)}
            >
              <option value="original">原创作者</option>
              <option value="certified">认证作者</option>
            </select>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0 -24px 24px' }} />

          {changeTo === 'original' ? (
            /* Original Author View */
            <div style={{ padding: '0 8px' }}>
              <div className="detail-form-row" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontWeight: 'bold', width: '80px', flexShrink: 0 }}>回收原因：</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <select 
                    className="form-input" 
                    style={{ width: '150px' }}
                    value={recycleReason}
                    onChange={(e) => setRecycleReason(e.target.value)}
                  >
                    <option value="">请选择</option>
                    <option value="1">长期未更新作品</option>
                    <option value="2">违反社区规范</option>
                    <option value="3">身份到期未续期</option>
                    <option value="4">其他原因</option>
                  </select>
                  <button className="btn btn-primary btn-sm" onClick={handleGenerateMsg} disabled={!recycleReason}>
                    生成站内信
                  </button>
                </div>
              </div>

              <div className="detail-form-row">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>站内信：</label>
                <textarea
                  className="form-input"
                  style={{ width: '100%', height: '150px', resize: 'vertical' }}
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="请输入内容..."
                />
              </div>
            </div>
          ) : (
            /* Ultra Simple Certified Author View (Only Message) */
            <div style={{ padding: '0 8px' }}>
              <div className="detail-form-row" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontWeight: 'bold' }}>站内信</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleGenerateMsg}
                    >
                      生成站内信
                    </button>
                  </div>
                </div>
                <textarea
                  className="form-input"
                  style={{ width: '100%', height: '150px', resize: 'vertical' }}
                  value={messageContent}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                      setMessageContent(e.target.value);
                    }
                  }}
                  placeholder="请输入发送给认证作者的站内信内容..."
                />
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-start', gap: '12px' }}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting} style={{ padding: '8px 24px' }}>
            {submitting ? '提交中...' : '确认提交认证结果'}
          </button>
          <button className="btn btn-default" onClick={onCancel} style={{ padding: '8px 24px' }}>取消</button>
        </div>
      </div>
    </div>
  );
}
