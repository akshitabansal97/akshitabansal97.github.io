import { useCallback, useEffect, useRef, useState } from "react";

import './VideoFlipper.css';
import { aspectRatios } from "./constant";
import RecordedPreview from "./RecordedPreview";
import Header from "./header";
import VideoFlipperContext from "./context";
import Preview from "./preview";
import Controls from "./controls";

const VideoFlipper = () => {
  const [activeTab, setActiveTab] = useState('editor');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [aspectRatio, setAspectRatio] = useState("9:18");
  const [showCropper, setShowCropper] = useState(false);
  const [recordedData, setRecordedData] = useState([]);
  const [duration, setDuration] = useState(0);
  const [cropperSize, setCropperSize] = useState({ width: 0, height: 0 });
  const cropperRef = useRef(null);
  const videoRef = useRef(null);
  const previewCanvasRef = useRef(null);

  console.log('recordedData', recordedData);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, []);

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
      videoRef.current.volume = volume;
    }
  }, [playbackRate, videoRef, volume]);

  useEffect(() => {
    const recordData = (
      // { x = position.x, y = position.y, width = cropperSize.width, height = cropperSize.height, newVolume = volume, newPlaybackRate = playbackRate }
    ) => {
      const prevData = [...recordedData];
      const lastEl = prevData.at(-1);

      console.log('lastEl', lastEl);
      const {width, height} = getCropperSize(aspectRatio);
      console.log('width, height', width, height)
      const newData = {
        timeStamp: currentTime,
        coordinates: [
          position.x,
          position.y,
          width,
          height
        ],
        volume,
        playbackRate
      };

      if (lastEl && lastEl.timeStamp === currentTime) {
        prevData.pop();
      }

      setRecordedData([...prevData, newData]);
    };
    
    if (videoRef.current) {
      recordData();
    };
  }, [volume, playbackRate, aspectRatio, position.x, position.y, cropperSize.width, cropperSize.height]);

  useEffect(() => {
    const updatePreview = () => {

      if (showCropper && videoRef.current && cropperRef.current && previewCanvasRef.current) {
        const video = videoRef.current;
        const cropper = cropperRef.current;
        const canvas = previewCanvasRef.current;
        const ctx = canvas.getContext('2d');

        const cropperRect = cropper.getBoundingClientRect();
        const videoRect = video.getBoundingClientRect();

        const scaleX = video.videoWidth / videoRect.width;
        const scaleY = video.videoHeight / videoRect.height;

        const sourceX = (cropperRect.left - videoRect.left) * scaleX;
        const sourceY = (cropperRect.top - videoRect.top) * scaleY;
        const sourceWidth = cropperRect.width * scaleX;
        const sourceHeight = cropperRect.height * scaleY;

        canvas.width = cropperRect.width;
        canvas.height = cropperRect.height;

        ctx.drawImage(
          video,
          sourceX, sourceY, sourceWidth, sourceHeight,
          0, 0, canvas.width, canvas.height
        );
      }
    };

    const animationId = requestAnimationFrame(function animate() {
      updatePreview();
      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationId);
  }, [aspectRatio, showCropper]);

  const handleMouseUp = () => {
    // if (dragging) recordData({ x: position.x, y: position.y });
    setDragging(false);
    
  };

  const handleMouseDown = (e) => {
    setDragging(true);
    // Get initial mouse position and box position
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const container = videoRef.current.getBoundingClientRect();
      const box = cropperRef.current.getBoundingClientRect();

      let newX = e.clientX - offset.x;
      let newY = e.clientY - offset.y;

      // Keep the box within container bounds
      if (newX < 0) newX = 0;
      if (newY < 0) newY = 0;
      if (newX + box.width > container.width) newX = container.width - box.width;
      if (newY + box.height > container.height) newY = container.height - box.height;

      setPosition({ x: newX, y: newY });
      
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const getCropperSize = (ratio) => {
    const videoHeight = videoRef.current.offsetHeight;
    console.log('videoRef.current', videoRef.current, videoRef.current.offsetHeight)
    const newWidth = videoHeight * aspectRatios[ratio];

    return { width: newWidth, height: videoHeight };
  }

  const handleAspectRatioChange = (newRatio) => {
    setAspectRatio(newRatio);
    // Update cropper size based on new aspect ratio
    const { width, height } = getCropperSize(newRatio);
    setCropperSize({ width, height });
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(recordedData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "recorded_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const getVideoWidth = useCallback(() => {
    let height = 460;

    if (videoRef.current) {
      height = videoRef.current.getBoundingClientRect().height;
    } 
  
    return `${height * aspectRatios[aspectRatio]}px`
  }, [aspectRatio]);

  const editorUi = () => (
    <div className="editor-container">
      <div className="editor">
        <div className="video-container"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <video
            className="video"
            ref={videoRef}
            src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            onTimeUpdate={handleTimeUpdate}
          />
          {showCropper && <div
            id="draggable"
            ref={cropperRef}
            className="cropper"
            style={{
              top: `${position.y}px`,
              left: `${position.x}px`,
              width: getVideoWidth(),
              height: "100%",
              aspectRatio: aspectRatio,
            }}
            onMouseDown={handleMouseDown}
          >
            <div class="grid-item"></div>
            <div class="grid-item"></div>
            <div class="grid-item"></div>
            <div class="grid-item"></div>
            <div class="grid-item"></div>
            <div class="grid-item"></div>
            <div class="grid-item"></div>
            <div class="grid-item"></div>
            <div class="grid-item"></div>
          </div>}
        </div>
        <Controls />
      </div>
      <Preview />
    </div>
  );

  const startCropper = () => {
    setShowCropper(true);
    const { width, height } = getCropperSize(aspectRatio);
    console.log(width, height);
  };

  const removeCropper = () => {
    setShowCropper(false);
  };

  return (
    <VideoFlipperContext.Provider value={{ 
      activeTab,
      handleTabClick,
      videoRef,
      aspectRatio,
      previewCanvasRef,
      showCropper,
      position,
      handleTimeUpdate,
      duration, 
      isPlaying, currentTime, setCurrentTime, playbackRate, setPlaybackRate, volume, setVolume, handleAspectRatioChange, handleDownloadJSON, setIsPlaying, handleMouseUp, handleMouseDown, handleMouseMove
    }}>
      <div className="cropper-container">
        <div className="cropper-top">
          <Header activeTab={activeTab} onTabClick={handleTabClick} />
          {activeTab === 'editor' ? editorUi() : <RecordedPreview recordedData={recordedData} videoSrc={"http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} />}
        </div>
        {activeTab === 'editor' && <div className="cropper-bottom">
          <div className={`cropper-bottom-btn ${showCropper && 'cropper-bottom-btn-disabled'}`} type="button" onClick={startCropper}>Start Cropper</div>
          <div className={`cropper-bottom-btn ${!showCropper && 'cropper-bottom-btn-disabled'}`} type="button" onClick={removeCropper}>Remove Cropper</div>
          <div className="cropper-bottom-btn" type="button" onClick={handleDownloadJSON}>Generate Preview</div>
        </div>}
        
      </div>
    </VideoFlipperContext.Provider>
  );
};

export default VideoFlipper;
