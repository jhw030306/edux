import { createContext, useContext, useState } from "react";

const LectureContext = createContext();

export const LectureProvider = ({ children }) => {
  const [lecture, setLecture] = useState(null); // { title, section, id }

  return (
    <LectureContext.Provider
      value={{ lecture, setLecture }}
    >
      {children}
    </LectureContext.Provider>
  );
};

export const useLecture = () => useContext(LectureContext);
