import { useContext } from "react";
import VideoFlipperContext from "../context";
import { aspectRatios } from "../constant";

import './index.css';

const Controls = () => {
  const { isPlaying, duration, videoRef, currentTime, setCurrentTime, playbackRate, setPlaybackRate, volume, setVolume, aspectRatio, handleAspectRatioChange, setIsPlaying } = useContext(VideoFlipperContext);

  const handlePlay = () => {
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    videoRef.current.pause();
    setIsPlaying(false);
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div className="row">
        {isPlaying ? (
          <span className="icon" onClick={handlePause}>⏸️</span>
        ) : (
          <span className="icon" onClick={handlePlay}>▶️</span>
        )}
        <input type="range" className="seekbar" min="0" max={videoRef.current ? duration : 0} value={currentTime} onChange={(e) => {
          videoRef.current.currentTime = e.target.value;
          setCurrentTime(e.target.value);
        }}/>
      </div>
      <div className="row">
        <div>
          <span className="current-time">{formatTime(currentTime)}</span>
          <span className="current-time duration"> | </span>
          <span className="current-time duration">{formatTime(duration)}</span>
        </div>
        <div className="row volume">
          🔊
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
            }}
          />
        </div>
      </div>
      <div className="dropdown-container">
        <div className="dropdown-btn">
          <span>Playback Speed</span>
          <select className="select" value={playbackRate} onChange={(e) => {
              setPlaybackRate(Number(e.target.value))
            }
          }>
            <option value={0.25}>0.25x</option>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
        <div className="dropdown-btn">
          <span>Cropper Aspect Ratio</span>
          <select className="select" value={aspectRatio} onChange={(e) => handleAspectRatioChange(e.target.value)}>
            {Object.keys(aspectRatios).map((ratio) => (
              <option key={ratio} value={ratio}>{ratio}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Controls;
