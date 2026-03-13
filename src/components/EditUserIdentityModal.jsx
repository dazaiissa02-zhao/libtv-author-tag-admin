import { useState, useEffect } from 'react';

export default function EditUserIdentityModal({ visible, user, onSave, onCancel }) {
  const [identityType, setIdentityType] = useState('');
  const [enterpriseName, setEnterpriseName] = useState('');

  useEffect(() => {
    if (visible && user) {
      // 简单映射 mock 数据中的标签到下拉框
      const tag = user.tags && user.tags[0];
      if (tag === 'liblib_official') setIdentityType('official');
      else if (tag === 'enterprise') setIdentityType('enterprise');
      else if (tag === 'liblib_teacher') setIdentityType('teacher');
      else if (tag === 'liblib_teaching_assistant') setIdentityType('assistant');
      else setIdentityType('none');
      
      setEnterpriseName(''); // 初始企业名称为空
    }
  }, [visible, user]);

  if (!visible || !user) return null;

  return (
    <div className="modal-mask" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <span className="modal-title">编辑用户身份</span>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        
        <div className="modal-body" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px', color: '#333' }}>
            用户名id/用户名：{user.id} {user.nickname}
          </div>
          
          <div className="form-group" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '80px', flexShrink: 0 }}>身份类型：</label>
            <select 
              className="form-input" 
              value={identityType}
              onChange={(e) => setIdentityType(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="none">无身份</option>
              <option value="official">官方号</option>
              <option value="enterprise">企业号</option>
              <option value="teacher">学院讲师</option>
              <option value="assistant">学院助教</option>
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '80px', flexShrink: 0 }}>企业名称：</label>
            <input 
              type="text"
              className="form-input"
              placeholder="请输入企业名称"
              value={enterpriseName}
              onChange={(e) => setEnterpriseName(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn btn-default" onClick={onCancel}>取消</button>
          <button className="btn btn-primary" onClick={() => onSave(user.id, { identityType, enterpriseName })}>确定</button>
        </div>
      </div>
    </div>
  );
}
