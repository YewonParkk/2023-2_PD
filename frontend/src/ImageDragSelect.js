import React, { useState } from 'react';

function ImageDragSelect({ src, onSelectionComplete }) {
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e) => {
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setDragEnd({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // 여기에서 선택한 이미지 영역을 처리하거나 서버로 전송할 수 있습니다.
    console.log("선택 영역:", dragStart, dragEnd);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ width: '500px', height: '300px', background: '#ddd' }}
    >
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            left: Math.min(dragStart.x, dragEnd.x) + 'px',
            top: Math.min(dragStart.y, dragEnd.y) + 'px',
            width: Math.abs(dragEnd.x - dragStart.x) + 'px',
            height: Math.abs(dragEnd.y - dragStart.y) + 'px',
            background: 'rgba(0, 0, 255, 0.3)',
          }}
        ></div>
      )}
    </div>
  );
}

export default ImageDragSelect;