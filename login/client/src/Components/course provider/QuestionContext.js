import React, { createContext, useState } from 'react';

export const QuestionContext = createContext();

export const QuestionProvider = ({ children }) => {
  const [mcqQuestions, setMcqQuestions] = useState([
    { question: '', options: ['', '', '', ''], correctOption: '' },
  ]);

  return (
    <QuestionContext.Provider value={{ mcqQuestions, setMcqQuestions }}>
      {children}
    </QuestionContext.Provider>
  );
};
