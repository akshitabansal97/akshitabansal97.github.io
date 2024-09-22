import { useContext } from "react";
import VideoFlipperContext from "../context";

import './index.css';

const Preview = () => {
  const { aspectRatio, previewCanvasRef, showCropper } = useContext(VideoFlipperContext);

  return (
    <div className="preview-container">
      <div className="preview-heading">Preview</div>
      <div className={`preview ${showCropper && 'preview-cropper'}`} style={{ aspectRatio: aspectRatio, overflow: 'hidden' }}>
        {showCropper ? <canvas ref={previewCanvasRef} /> :
          <div className="placeholder">
            <div className="text">Preview not available</div>
            <div className="subtext">Please click on "Start Cropper" and then play video</div>
          </div>}
      </div>
    </div>
  );
};

export default Preview;
