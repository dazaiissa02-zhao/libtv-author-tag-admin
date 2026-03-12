import { useEffect, useRef, useState } from 'react';
import {
  ICON_EMOJIS,
  ICON_MAX_SIZE,
  MAX_TAGS,
  PRESET_COLORS,
} from '../data/mockData';
import { getLabelTextColor, isDataUrl } from '../utils/tags';

export default function TagFormModal({ visible, editingTag, tags, onSave, onCancel }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [hexInput, setHexInput] = useState(PRESET_COLORS[0]);
  const [iconUrl, setIconUrl] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (editingTag) {
      setName(editingTag.name);
      setColor(editingTag.color);
      setHexInput(editingTag.color);
      setIconUrl(editingTag.iconUrl || '');
      setDescription(editingTag.description);
      setSortOrder(editingTag.sortOrder);
    } else {
      setName('');
      setColor(PRESET_COLORS[0]);
      setHexInput(PRESET_COLORS[0]);
      setIconUrl('');
      setDescription('');
      setSortOrder(tags.length);
    }

    setErrors({});
  }, [editingTag, tags.length, visible]);

  if (!visible) {
    return null;
  }

  const isAtLimit = !editingTag && tags.length >= MAX_TAGS;

  function validate() {
    const nextErrors = {};

    if (!name.trim()) {
      nextErrors.name = '请输入标签名称';
    } else if (name.length > 32) {
      nextErrors.name = '标签名称不能超过 32 个字符';
    } else {
      const duplicated = tags.find(
        (tag) => tag.name === name.trim() && (!editingTag || tag.id !== editingTag.id),
      );
      if (duplicated) {
        nextErrors.name = '标签名称已存在';
      }
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      nextErrors.color = '请选择有效的颜色';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) {
      return;
    }

    onSave({
      id: editingTag?.id,
      name: name.trim(),
      iconUrl,
      color,
      description: description.trim(),
      sortOrder,
    });
  }

  function handleHexChange(value) {
    setHexInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      setColor(value);
    }
  }

  function handleIconUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!/^image\/(png|svg\+xml|svg|jpeg|jpg|gif|webp)$/i.test(file.type)) {
      setErrors((current) => ({
        ...current,
        icon: '请上传 PNG、SVG、JPG、GIF 或 WebP 格式的图片',
      }));
      return;
    }

    if (file.size > ICON_MAX_SIZE) {
      setErrors((current) => ({
        ...current,
        icon: '图标文件需 ≤ 50KB',
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setIconUrl(reader.result);
      setErrors((current) => ({ ...current, icon: null }));
    };
    reader.readAsDataURL(file);
  }

  function clearIcon() {
    setIconUrl('');
    setErrors((current) => ({ ...current, icon: null }));
  }

  return (
    <div className="modal-mask" onClick={onCancel}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{editingTag ? '编辑标签' : '新增标签'}</span>
          <button className="modal-close" onClick={onCancel}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {isAtLimit ? (
            <div className="empty">
              <div className="empty-icon">🚫</div>
              <div className="empty-text">
                标签数量已达上限（{MAX_TAGS}/{MAX_TAGS}），请删除或停用部分标签后再新增
              </div>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span>标签名称
                </label>
                <input
                  className="form-input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="如：精选、官方认证"
                  maxLength={32}
                />
                {errors.name ? <div className="form-hint form-error">{errors.name}</div> : null}
              </div>

              <div className="form-group">
                <label className="form-label">标签图标（选填）</label>
                <div className="flex items-center gap-3 wrap">
                  <div className="color-picker">
                    {ICON_EMOJIS.map((emoji) => (
                      <div
                        key={emoji}
                        className={`color-swatch ${!isDataUrl(iconUrl) && iconUrl === emoji ? 'active' : ''}`}
                        style={emojiSwatchStyle}
                        onClick={() => {
                          setIconUrl(iconUrl === emoji ? '' : emoji);
                          setErrors((current) => ({ ...current, icon: null }));
                        }}
                      >
                        {iconUrl !== emoji ? emoji : null}
                      </div>
                    ))}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/svg+xml,image/svg,image/jpeg,image/jpg,image/gif,image/webp"
                    className="hidden-input"
                    onChange={handleIconUpload}
                  />
                  <button
                    type="button"
                    className="btn btn-default"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    上传图标
                  </button>
                  {isDataUrl(iconUrl) ? (
                    <div className="icon-upload-preview">
                      <img src={iconUrl} alt="图标" />
                      <button
                        type="button"
                        className="icon-upload-remove"
                        onClick={clearIcon}
                        title="移除图标"
                      >
                        ×
                      </button>
                    </div>
                  ) : null}
                </div>
                {errors.icon ? <div className="form-hint form-error">{errors.icon}</div> : null}
                <div className="form-hint">
                  点击选择预设图标或上传自定义图标（PNG/SVG，建议 24×24，≤ 50KB）；图标将展示在标签名称前
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="required">*</span>标签颜色
                </label>
                <div className="color-picker">
                  {PRESET_COLORS.map((presetColor) => (
                    <div
                      key={presetColor}
                      className={`color-swatch ${color === presetColor ? 'active' : ''}`}
                      style={{ background: presetColor }}
                      onClick={() => {
                        setColor(presetColor);
                        setHexInput(presetColor);
                      }}
                    />
                  ))}
                  <div className="color-hex-input">
                    <input
                      className="form-input"
                      value={hexInput}
                      onChange={(event) => handleHexChange(event.target.value)}
                      placeholder="#000000"
                      maxLength={7}
                    />
                    <div className="color-dot color-dot-lg" style={{ background: color }} />
                  </div>
                </div>
                {errors.color ? <div className="form-hint form-error">{errors.color}</div> : null}
                <div className="tag-preview-row">
                  <span className="preview-label">预览：</span>
                  <span className="tag" style={{ background: color, color: getLabelTextColor(color) }}>
                    {renderTagIcon(iconUrl, 14)}
                    {name || '标签名称'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">排序权重</label>
                <input
                  className="form-input compact-input"
                  type="number"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(Number.parseInt(event.target.value, 10) || 0)}
                />
                <div className="form-hint">数值越小排序越靠前</div>
              </div>

              <div className="form-group">
                <label className="form-label">备注描述</label>
                <textarea
                  className="form-input form-textarea"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="仅内部可见，备注标签用途"
                />
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onCancel}>
            取消
          </button>
          {!isAtLimit ? (
            <button className="btn btn-primary" onClick={handleSave}>
              保存
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const emojiSwatchStyle = {
  background: '#f5f5f5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 16,
};

function renderTagIcon(iconUrl, size) {
  if (!iconUrl) {
    return null;
  }

  if (isDataUrl(iconUrl)) {
    return (
      <img
        src={iconUrl}
        alt=""
        style={{
          width: size,
          height: size,
          verticalAlign: 'middle',
          marginRight: 2,
          objectFit: 'contain',
        }}
      />
    );
  }

  return <span style={{ fontSize: Math.max(11, size - 2) }}>{iconUrl}</span>;
}
