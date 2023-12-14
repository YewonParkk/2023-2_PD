// TypingIndicator.js

import React, { useEffect, useState } from "react";

function TypingIndicator() {
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => {
        if (prevDots === "....") {
          return ".";
        } else {
          return prevDots + ".";
        }
      });
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return <span>답변을 작성중{dots}</span>;
}

export default TypingIndicator;
