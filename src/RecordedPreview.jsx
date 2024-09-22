import { useEffect, useRef, useState } from 'react';
import './VideoFlipper.css';

const RecordedPreview = ({ recordedData, videoSrc }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const fullVideoCanvasRef = useRef(null);
  const cropperOverlayRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (recordedData.length === 0) return;

    const playback = () => {
      if (!isPlaying) return;

      const currentTime = videoRef.current.currentTime;
      const currentData = recordedData[currentIndex];
      const nextData = recordedData[currentIndex + 1];

      if (nextData && currentTime >= nextData.timeStamp) {
        setCurrentIndex(currentIndex + 1);
      }

      applyVideoAttributes(currentData);
      drawVideoFrame();

      animationRef.current = requestAnimationFrame(playback);
    };

    const applyVideoAttributes = (data) => {
      if (!data) return;

      videoRef.current.volume = data.volume;
      videoRef.current.playbackRate = data.playbackRate;

      const [x, y, width, height] = data.coordinates;
      const cropperOverlay = cropperOverlayRef.current;
      console.log('videoRef.current.getBoundingClientRect().height', videoRef.current.getBoundingClientRect().height, videoRef.current.getBoundingClientRect().width)
      cropperOverlay.style.left = `${(x / videoRef.current.getBoundingClientRect().width) * 100}%`;
      cropperOverlay.style.top = `${(y / videoRef.current.getBoundingClientRect().height) * 100}%`;
      cropperOverlay.style.width = `${(width / videoRef.current.getBoundingClientRect().width) * 100}%`;
      cropperOverlay.style.height = `${(height / videoRef.current.getBoundingClientRect().height) * 100}%`;
    };

    const drawVideoFrame = () => {
      const fullVideoCanvas = fullVideoCanvasRef.current;
      const fullVideoCtx = fullVideoCanvas.getContext('2d');

      fullVideoCanvas.width = videoRef.current.videoWidth;
      fullVideoCanvas.height = videoRef.current.videoHeight;

      fullVideoCtx.drawImage(videoRef.current, 0, 0);
    };

    if (isPlaying) {
      videoRef.current.play();
      animationRef.current = requestAnimationFrame(playback);
    } else {
      videoRef.current.pause();
      cancelAnimationFrame(animationRef.current);
    }

    return () => cancelAnimationFrame(animationRef.current);
  }, [recordedData, currentIndex, isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className='recorded-preview'>
      <span className='cropper-bottom-btn' onClick={togglePlayback}>{isPlaying ? "Pause Recording" : "Play Recording"}</span>
      <div className="video-container">
        <canvas
          className="video"
          ref={fullVideoCanvasRef}
        />
        <div
          id="draggable"
          ref={cropperOverlayRef}
          className="cropper"
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
        </div>
      </div>
      <video ref={videoRef} src={videoSrc} style={{ visibility: "hidden" }} className="video-container-hidden" />
    </div>
  );
};

export default RecordedPreview;
