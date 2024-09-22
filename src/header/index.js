import { useContext } from 'react';
import './index.css';
import VideoFlipperContext from '../context';

const Header = () => {
  const { activeTab, handleTabClick } = useContext(VideoFlipperContext);

  return (
    <div className="header">
      <div className="heading">Cropper</div>
      <div className="button-groups">
        <span
          onClick={() => handleTabClick('editor')}
          className={`tab ${activeTab === 'editor' ? 'tab-active' : ''}`}
        >
          Editor
        </span>
        <span
          onClick={() => handleTabClick('preview')}
          className={`tab ${activeTab === 'preview' ? 'tab-active' : ''}`}
        >
          Recorded Preview
        </span>
      </div>
    </div>
  );
}

export default Header;