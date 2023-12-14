import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberId, setRememberId] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      setRememberId(true);
    }
  }, []);

  const handleUserIdChange = (e) => setUserId(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleRememberIdChange = (e) => setRememberId(e.target.checked);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rememberId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          password: password,
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        const access_token = data.access_token; // 토큰 가져오기
        localStorage.setItem('access_token', data.access_token);
        alert('로그인 성공!!');
        navigate('/memo'); // 로그인 성공 시 메모 페이지로 이동
      } else {
        alert('다시 확인하세요.');
      }
    } catch (error) {
      console.error('로그인 요청 실패:', error);
      alert('로그인 중 문제가 발생했습니다.');
    }
  };

  return (
    <div className="sign-in-htm">
      <form onSubmit={handleSubmit}>
        <div className="group">
          <label htmlFor="user" className="label">아이디</label>
          <input id="user" type="text" className="input" value={userId} onChange={handleUserIdChange} />
        </div>
        <div className="group">
          <label htmlFor="pass" className="label">비밀번호</label>
          <input id="pass" type="password" className="input" data-type="password" value={password} onChange={handlePasswordChange} />
        </div>
        <div className="group">
          <input id="check" type="checkbox" className="check" checked={rememberId} onChange={handleRememberIdChange} />
          <label htmlFor="check"><span className="icon"></span> 아이디 저장</label>
        </div>
        <div className="group">
          <input type="submit" className="button" value="로그인" />
        </div>
      </form>
      <div className="hr"></div>
      <div className="foot-lnk">
        <label htmlFor="tab-2">계정이 없다면 회원가입을 해주세요.</label>
      </div>
    </div>
  );
}

export default Login;
