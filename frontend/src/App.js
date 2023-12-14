import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Memo from './Memo';
import Chat from './chat'; // Chat 컴포넌트를 가져옵니다

function AppWrapper() {
  const location = useLocation();
  const isMemoPage = location.pathname === '/memo';
  const isChatPage = location.pathname === '/chat'; // chat 페이지 확인

  return (
    <div className={isMemoPage || isChatPage ? "login-body memo-page" : "login-body"}>
      <div className={isMemoPage || isChatPage ? "login-wrap memo-page" : "login-wrap"}>
        <div className={isMemoPage || isChatPage ? "login-html memo-page" : "login-html"}>
          {!isMemoPage && !isChatPage && (
            // 로그인 및 회원가입 탭과 라벨이 chat 페이지에서는 보이지 않도록 합니다
            <>
              <input id="tab-1" type="radio" name="tab" className="sign-in" defaultChecked />
              <label htmlFor="tab-1" className="tab">로그인</label>
              <input id="tab-2" type="radio" name="tab" className="sign-up" />
              <label htmlFor="tab-2" className="tab">회원가입</label>
            </>
          )}
          <div className="login-form">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/memo" element={<Memo />} />
              <Route path="/chat" element={<Chat />} /> // chat 경로 라우팅
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
