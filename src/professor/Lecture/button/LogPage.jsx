import React, { useState, useEffect } from "react";
import { MainLayout } from "../../../layout/MainLayout";
import "./button.css";
import * as XLSX from "xlsx";

const API_BASE = import.meta.env.VITE_API_URL;

export const LogPage = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [showOnlyCheat, setShowOnlyCheat] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const formatTime = (isoString) => {
    if (!isoString) return "-";
    const date = new Date(isoString);
    return date.toLocaleString("ko-KR", {
      hour12: false,
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleDownload = () => {
    const lecture = JSON.parse(
      sessionStorage.getItem("selectedLecture")
    );

    const fileName = `${lecture?.className ?? "강의명"}_${
      lecture?.section ?? "분반"
    }_로그목록`;

    const datas = filtered.length ? filtered : [];
    const worksheet = XLSX.utils.json_to_sheet(datas);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Sheet1"
    );
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };
  useEffect(() => {
    const exam = JSON.parse(
      sessionStorage.getItem("selectedExam")
    );
    const classroomId = JSON.parse(
      sessionStorage.getItem("selectedLecture")
    )?.id;

    if (!exam?.id || !classroomId) return;

    const fetchLogs = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/logs/in-exam-status?examId=${exam.id}&classroomId=${classroomId}`
        );
        if (!res.ok)
          throw new Error("시험 로그 목록 불러오기 실패");

        const data = await res.json();

        const allLogs = await Promise.all(
          data.map(async (s) => {
            try {
              const res = await fetch(
                `${API_BASE}/logs/student-logs?studentId=${s.studentId}&classroomId=${classroomId}&examId=${exam.id}`
              );
              if (!res.ok)
                throw new Error("학생 로그 실패");
              const logs = await res.json();

              return logs.map((log) => ({
                time: formatTime(log.timestamp),
                message: log.detail || log.status,
                type: ["CHEAT", "EXAM_EXIT"].includes(
                  log.status
                )
                  ? "warn"
                  : "info",
              }));
            } catch {
              return [];
            }
          })
        );

        const formatted = data.map((s, i) => ({
          id: s.studentId,
          name: s.name,
          studentNumber: s.studentNumber,
          examTitle: exam.title,
          cheatCount: s.cheatCount || 0,
          time: `${s.enterTimeFormatted || "-"} ~ ${
            s.exitTimeFormatted || "-"
          }`,
          logs: allLogs[i],
        }));

        setLogs(formatted);
      } catch (e) {
        console.error("로그 목록 오류:", e);
      }
    };

    fetchLogs();
  }, []);

  const filtered = logs.filter((log) => {
    const keyword = search.toLowerCase();
    const matchesSearch =
      log.name.includes(keyword) ||
      log.studentNumber.includes(keyword);
    const matchesExam = selectedExam
      ? log.examTitle === selectedExam
      : true;
    const matchesCheat = showOnlyCheat
      ? log.cheatCount > 0
      : true;
    return matchesSearch && matchesExam && matchesCheat;
  });

  return (
    <MainLayout>
      <div className="page-content">
        <div className="content-wrapper">
          {/* 🔍 필터 영역 */}
          <div className="log-filter-bar-row">
            <select
              value={selectedExam}
              onChange={(e) =>
                setSelectedExam(e.target.value)
              }
            >
              <option value="">시험명 선택</option>
              {[
                ...new Set(
                  logs.map((log) => log.examTitle)
                ),
              ].map((title, idx) => (
                <option key={idx} value={title}>
                  {title}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="학번/이름 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <label className="log-checkbox">
              <input
                type="checkbox"
                checked={showOnlyCheat}
                onChange={(e) =>
                  setShowOnlyCheat(e.target.checked)
                }
              />
              부정행위만 보기
            </label>

            <button
              className="action-button"
              onClick={handleDownload}
            >
              파일 다운로드
            </button>
          </div>

          {/* 📋 로그 테이블 */}
          <table className="student-table">
            <thead>
              <tr>
                <th>학번</th>
                <th>이름</th>
                <th>시험명</th>
                <th>부정행위 수</th>
                <th>응시시간</th>
                <th>로그보기 🔍</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td>{log.studentNumber}</td>
                  <td>{log.name}</td>
                  <td>{log.examTitle}</td>
                  <td>{log.cheatCount}</td>
                  <td>{log.time}</td>
                  <td>
                    <button
                      className="action-button"
                      onClick={() => setSelectedLog(log)}
                    >
                      보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 🪟 로그 모달 */}
        {selectedLog && (
          <div className="modal">
            <div className="modal-box">
              <div className="modal-title">
                {selectedLog.studentNumber} &nbsp;{" "}
                {selectedLog.name}
              </div>

              <div className="modal-log-scroll">
                <table className="modal-log-table">
                  <tbody>
                    {selectedLog.logs.length === 0 ? (
                      <tr>
                        <td colSpan="3">로그 없음</td>
                      </tr>
                    ) : (
                      selectedLog.logs.map((log, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className="log-dot" />
                          </td>
                          <td className="time-cell">
                            {log.time}
                          </td>
                          <td
                            className="log-message"
                            style={{
                              color:
                                log.type === "warn"
                                  ? "red"
                                  : "green",
                              fontWeight:
                                log.type === "warn"
                                  ? "bold"
                                  : "normal",
                            }}
                          >
                            {log.message}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="delete-buttons center">
                <button
                  className="submit-btn"
                  onClick={() => setSelectedLog(null)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
