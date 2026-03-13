import { useCallback, useRef, useState } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const TARGET_SIZE = 24;

function centerAspectCrop(mediaWidth, mediaHeight, aspect = 1) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageCropModal({ src, onConfirm, onCancel }) {
  const imgRef = useRef(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const getCroppedImg = useCallback(() => {
    if (!imgRef.current || !completedCrop) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = TARGET_SIZE;
    canvas.height = TARGET_SIZE;

    const cropPx = {
      x: completedCrop.x * scaleX,
      y: completedCrop.y * scaleY,
      width: completedCrop.width * scaleX,
      height: completedCrop.height * scaleY,
    };

    ctx.drawImage(
      image,
      cropPx.x, cropPx.y, cropPx.width, cropPx.height,
      0, 0, TARGET_SIZE, TARGET_SIZE
    );

    return canvas.toDataURL('image/png');
  }, [completedCrop]);

  function handleConfirm() {
    const result = getCroppedImg();
    if (result) onConfirm(result);
  }

  return (
    <div className="modal-mask" onClick={onCancel}>
      <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">裁剪图标</span>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body">
          <div className="crop-container">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
            >
              <img
                ref={imgRef}
                src={src}
                alt="裁剪"
                style={{ maxHeight: 240, display: 'block' }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          </div>
          <div className="form-hint">拖动选择区域，将裁剪为 24×24 图标</div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-default" onClick={onCancel}>取消</button>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={!completedCrop}>
            完成裁剪
          </button>
        </div>
      </div>
    </div>
  );
}
