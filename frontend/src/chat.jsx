import React, { useState, useEffect, useRef } from "react";
import './chat.css'; // 스타일 파일 가져오기
import { useNavigate } from "react-router-dom";
import backlogo from './img/backlogo.svg';
import mainimg from './img/mainimg.png';
import TypingIndicator from "./TypingIndicator";

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      sender: "AI Chatbot",
      message: "안녕하세요! 의약품 도움 챗봇 의약이에요! 원하는 의약품을 검색해 보세요?",
    },
  ]);

  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const apiKey = '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';
  const [isSending, setIsSending] = useState(false);

  const chatContentRef = useRef(null);

  const [itemName, setItemName] = useState("");
  const [efcyQesitm, setEfcyQesitm] = useState("");
  const [useMethodQesitm, setUseMethodQesitm] = useState("");

  const fetchData = async () => {
    try {
      if (isSending) {
        return; // 이미 다른 요청을 처리 중이면 중복 호출 방지
      }

      setIsSending(true);

      const serviceKey = "3Hd44nU1oacpmj6tlcnrVUlBcPv%2FwvnBhtVClAa5OA3riQo7p1cdMcG5foYMJzxTdPmmX2eOq3oZrB5zTZdEfg%3D%3D";
      const itemNameEncoded = encodeURIComponent(input);

      const url = `http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList?serviceKey=${serviceKey}&itemName=${itemNameEncoded}&type=json`;

      const response = await fetch(url);
      const data = await response.json();

      const firstItem = data.body.items[0];

      setItemName(firstItem.itemName);
      setEfcyQesitm(firstItem.efcyQesitm);
      setUseMethodQesitm(firstItem.useMethodQesitm);

    } catch (error) {
      console.error('데이터를 가져오는 중 오류가 발생했습니다:', error);
    } finally {
      setIsSending(false); // 요청이 완료되면 상태를 원래대로 복구
      await fetchGPTResponse(); // fetchData 완료 후에 fetchGPTResponse 호출
    }
  };

  const fetchGPTResponse = async () => {
    try {
      const userInput = input.trim();

      if (userInput === "") {
        return;
      }

      // GPT 호출 전에 최신 데이터로 메시지 업데이트
      addMessage("User", userInput);
      addMessage("AI Chatbot", <TypingIndicator />);
   
      const data = {
        model: 'gpt-4',
        temperature: 0.5,
        n: 1,
        user: "user123456",
        messages: [
          { role: 'system', content: "너는 의약품 안내 ai 챗봇이야." },
          { role: 'user', content: `약이름 ${itemName} 효능 ${efcyQesitm} 사용방법 ${useMethodQesitm} 에 대해서 그대로 알려줘` },
        ],
      };

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      const gptResponse = responseData.choices[0].message.content;

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const typingMessageIndex = updatedMessages.findIndex(
          (msg) => msg.sender === "AI Chatbot" && typeof msg.message === "object"
        );

        if (typingMessageIndex !== -1) {
          updatedMessages[typingMessageIndex] = {
            sender: "AI Chatbot",
            message: gptResponse,
          };
        }

        return updatedMessages;
      });
    } catch (error) {
      console.error(error);
      addMessage("AI Chatbot", "죄송해요, 에러가 발생했어요.");
    }
  };


  const scrollToBottom = () => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  };

  const addMessage = (sender, message) => {
    const newMessage = { sender, message };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    scrollToBottom();
  };

  const handleSendMessage = async () => {
    if (isSending) {
      return;
    }

    setIsSending(true);

    const userInput = input.trim();

    if (userInput === "") {
      setIsSending(false);
      return;
    }

    // 사용자가 엔터를 입력했을 때에만 fetchData 호출
    await fetchData();

    setInput("");
    setIsSending(false);
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleInputKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  useEffect(() => {
    const adjustChatContentHeight = () => {
      const chatContent = chatContentRef.current;
      const windowHeight = window.innerHeight;
      const chatContentTop = chatContent.getBoundingClientRect().top;
      const newHeight = windowHeight - chatContentTop;
      chatContent.style.height = newHeight - 45 + 'px';
      scrollToBottom();
    };

    window.addEventListener('resize', adjustChatContentHeight);
    adjustChatContentHeight();

    return () => {
      window.removeEventListener('resize', adjustChatContentHeight);
    };
  }, []);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div>
      <div className="top-backcolor">
        <img className="back-logo" src={backlogo} width='30px' height='35px' onClick={() => { navigate('/memo'); }}></img>
        <span className="chat-name">의약이</span>
        <span className="chat-main-img">
          {/* <img className="chat-main" src={mainimg} width='40px' alt="AI"></img> */}
        </span>
      </div>
      <div className="chat-content" ref={chatContentRef}>
        {messages.map((message, index) => (
          <div className="line" key={index}>
            <span className={`chat-box ${message.sender === "User" ? "user-message" : "ai-message"}`}>
              {typeof message.message === "string" ? message.message : <TypingIndicator />}
            </span>
          </div>
        ))}
      </div>
      <input
        className="chat-box"
        id="input"
        value={input}
        onChange={handleInputChange}
        onKeyPress={handleInputKeyPress}
        placeholder="궁금한 모든 것을 물어보세요"
      />
    </div>
  );
};

export default Chat;
