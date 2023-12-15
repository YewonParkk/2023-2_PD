import React, { useState } from 'react';
import './LoginForm.css';

function Signup() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 사용자 입력 처리 함수
  const handleUserIdChange = (e) => setUserId(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  // 회원가입 요청 처리 함수
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 비밀번호 일치 확인
    if (password !== confirmPassword) {
      alert('비밀번호를 다시 확인하세요.');
      return;
    }

    try {
      const response = await fetch('http://13.124.3.102:8080/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          password: password,
        }),
      });
      if (response.status === 201) {
        alert('회원가입 성공!');
        // 추가적인 회원가입 성공 처리
      } else {
        alert('회원가입 실패. 다시 시도해주세요.');
        // 실패 처리
      }
    } catch (error) {
      console.error('회원가입 요청 실패:', error);
      alert('회원가입 실패. 다시 시도해주세요.');
    }
  };

  return (
    <div className="sign-up-htm">
      <form onSubmit={handleSubmit}>
        <div className="group">
          <label htmlFor="user" className="label">
            아이디
          </label>
          <input id="user" type="text" className="input" value={userId} onChange={handleUserIdChange} />
        </div>
        <div className="group">
          <label htmlFor="pass" className="label">
            비밀번호
          </label>
          <input id="pass" type="password" className="input" data-type="password" value={password} onChange={handlePasswordChange} />
        </div>
        <div className="group">
          <label htmlFor="confirm-pass" className="label">
            비밀번호 확인
          </label>
          <input id="confirm-pass" type="password" className="input" data-type="password" value={confirmPassword} onChange={handleConfirmPasswordChange} />
        </div>
        <div className="group">
          <input type="submit" className="button" value="회원가입" />
        </div>
      </form>
      <div className="hr"></div>
      <div className="foot-lnk">
        <label htmlFor="tab-1">이미 회원이신가요?</label>
      </div>
    </div>
  );
}

export default Signup;
