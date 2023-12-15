import React, { useState, useEffect,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Memo.css';
import OCRImg from './img/OcrBtn.png';
import PlusRImg from './img/PlusBtn.png';
import AiImg from './img/AiBtn.png';
import backlogo from './img/backlogo.svg';


function Memo() {
  const [memos, setMemos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentMemo, setCurrentMemo] = useState({ title: '', content: '', image: null });
  const [searchTerm, setSearchTerms] = useState('');
  const [sortOption, setSortOption] = useState('recent');
  const userId = localStorage.getItem('userId');
  const hiddenFileInput = useRef(null);

  const addMemo = async () => {
    if (currentMemo.title.trim() !== '' || currentMemo.content.trim() !== '') {
      try {
        const memoData = {
          //          id: memoCount,
          //          user_id: userId,
          title: currentMemo.title,
          content: currentMemo.content,
        };

          // 클라이언트 상태에 추가할 데이터
  const memoDataWithCreatedAt = {
    ...memoData,
    createdAt: new Date().toISOString(),  // 현재 시간을 ISO 형식으로 저장
  };

        const token = localStorage.getItem('access_token');
        if (!token) {
          console.error('토큰이 없습니다.');
          return;
        }

        const response = await fetch('http://13.124.3.102:8080/add_memo', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json', // JSON 형식으로 데이터 보내기
          },
          body: JSON.stringify(memoData), // 데이터를 JSON 문자열로 변환하여 보내기
        });

        if (response.ok) {
          const newMemo = await response.json();
          setMemos([...memos, newMemo]);
        } else {
          console.error('메모 추가 실패: ', await response.text());
        }
      } catch (error) {
        console.error('메모 추가 중 오류 발생:', error);
      }

      setCurrentMemo({ title: '', content: '', image: null });
      setShowModal(false);
    }
    // 페이지 업데이트를 위해 메모 데이터 다시 불러오기
    await fetchMemos();
  };


  const fetchMemos = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('토큰이 없습니다.');
        return;
      }

      const response = await fetch('http://13.124.3.102:8080/get_memos', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const memosData = await response.json();
        setMemos(memosData.memos);
      } else {
        console.error('메모 데이터 가져오기 실패:', await response.text());
      }
    } catch (error) {
      console.error('메모 데이터 가져오기 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    // 페이지 로드 시 메모 데이터 불러오기
    fetchMemos();
  }, []); // 빈 배열을 전달하여 한 번만 실행되도록 설정


  const deleteMemo = async (memoId) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('토큰이 없습니다.');
      return;
    }

    try {
      const response = await fetch(`http://13.124.3.102:8080/delete_memo/${memoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // 메모 삭제 후 목록 새로고침
        await fetchMemos();
      } else {
        console.error('메모 삭제 실패: ', await response.text());
      }
    } catch (error) {
      console.error('메모 삭제 중 오류 발생:', error);
    }
  };

  //  const deleteMemo = (indexToDelete) => {
  //    setMemos(memos.filter((_, index) => index !== indexToDelete));
  //  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentMemo({ title: '', content: '', image: null });
  };

  const handleSearch = (e) => {
    setSearchTerms(e.target.value);
  };


  // 정렬 로직 구현
  const sortMemos = (option) => {
    const sorted = [...memos].sort((a, b) => {
      switch (option) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'old':
          // 오래된 순 정렬
          return dateA - dateB;
        case 'recent':
        default:
          // 최근 생성순 정렬
          return dateB - dateA;
      }
    });
    setMemos(sorted);
  };

  // 정렬 옵션 변경 핸들러
  const handleSortChange = (option) => {
    setSortOption(option);
    sortMemos(option);
  };


    const navigate = useNavigate(); // useNavigate 훅을 사용합니다

  // 'AiImg' 버튼 클릭 시 chat.jsx 페이지로 이동하는 함수
  const goToChatPage = () => {
    navigate('/chat'); // '/chat' 경로로 이동
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://13.124.3.102:8080/perform_ocr', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

    if (response.ok) {
      const result = await response.json();
      // OCR 결과를 메모 목록에 추가
      setMemos(prevMemos => [...prevMemos, { title: 'OCR 결과', content: result.ocrText }]);
    } else {
      console.error('OCR 처리 실패');
    }
  } catch (error) {
    console.error('서버 통신 오류:', error);
  }
};

  return (
    <div className="memo-container">
      <div className="note-wrapper">
        <img className="back-logo" src={backlogo} width='30px' height='35px' onClick={() => { navigate('/'); }}></img>
        <h1 className="memo-header">약 노트</h1>
      </div>
      <div className="search-and-sort">
        <input
          className="search-bar"
          type="text"
          placeholder="메모 검색"
          value={searchTerm}
          onChange={handleSearch}
        />
        <div className="sort-dropdown">
          <select
            id="sortOptions"
            className="custom-select"
            value={sortOption}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="recent">최근 생성순</option>
            <option value="alphabetical">가나다순</option>
            <option value="old">오래된 순</option>
          </select>
        </div>
      </div>
      <div className="btnbtn">
      <div className="ocr-button-wrapper">
        <input
          type="file"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          ref={hiddenFileInput}
          accept="image/*"
        />
        <button className="memo-record-button" onClick={() => hiddenFileInput.current.click()}>
          <img src={OCRImg} alt="Ocr" className="btnImg"/>
        </button>
      </div>
      <div className="ai-button-wrapper">
        <button className="memo-record-button" onClick={() => goToChatPage()}>
          <img src={AiImg} alt="Ai" className="btnImg"/>
        </button>
      </div>
      <div className="record-button-wrapper">
      <button className="memo-record-button" onClick={() => setShowModal(true)}>
          <img src={PlusRImg} alt="Plus" className="btnImg"/>
        </button>
      </div>
      </div>
      {showModal && (
        <div className="memo-modal">
          <div className="memo-modal-content">
            <input
              type="text"
              className="memo-title-input"
              placeholder="제목을 입력하세요"
              value={currentMemo.title}
              onChange={(e) => setCurrentMemo({ ...currentMemo, title: e.target.value })}
            />
            <textarea
              className="memo-content-input"
              placeholder="내용을 입력하세요"
              value={currentMemo.content}
              onChange={(e) => setCurrentMemo({ ...currentMemo, content: e.target.value })}
            ></textarea>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCurrentMemo({ ...currentMemo, image: e.target.files[0] })}
            />
            <div className="memo-modal-actions">
              <button className="memo-add-button" onClick={addMemo}>
                추가
              </button>
              <button className="memo-cancel-button" onClick={closeModal}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="memo-list-container">
        <ul className="memo-list">
          {memos.map((memo, index) => (
            <li key={index} className="memo-item">
              <div className="memo-content">
                <strong>{memo.title}</strong>
                <p>{memo.content}</p>
                {memo.image && <img src={URL.createObjectURL(memo.image)} alt="Memo Image" />}
              </div>
              <button className="memo-delete-button" onClick={() => deleteMemo(memo.id)}>
                삭제
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Memo;