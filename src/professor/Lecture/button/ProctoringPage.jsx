import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { MainLayout } from "../../../layout/MainLayout";
import ExamViewerModal from "./ExamViewerModal"; // 🔹 새로 추가
import "../Lecture.css";

export const ProctoringPage = () => {
  const location = useLocation();
  const exam = location.state?.exam;
  const [students, setStudents] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showExamModal, setShowExamModal] = useState(false);
  const [logFilter, setLogFilter] = useState("all");
  const [alerts, setAlerts] = useState([]);

  // 알림 추가
  const addAlert = (text, type = "warn") => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 5000);
  };

  // 자동 로그 갱신
  useEffect(() => {
    const interval = setInterval(() => {
      console.log(
        "🔄 로그 자동 새로고침",
        new Date().toLocaleTimeString()
      );
      setStudents((prev) => {
        const updated = [...prev];
        const s = updated[0];
        const now = new Date()
          .toLocaleTimeString()
          .slice(0, 8);
        const newLog = {
          time: now,
          message: "Alt+Tab 감지",
          type: "warn",
        };
        s.logs = [...s.logs, newLog];
        addAlert(`[${s.name}] ${newLog.message}`, "warn");
        return updated;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // 초기 데이터
  useEffect(() => {
    setStudents([
      {
        id: 1,
        name: "지혜원",
        studentNumber: "2226071",
        status: "active",
        connectedAt: "10:30",
        logs: [
          {
            time: "10:30:04",
            message: "시험 시작",
            type: "info",
          },
          {
            time: "10:35:27",
            message: "Alt+Tab 감지",
            type: "warn",
          },
        ],
      },
    ]);
  }, []);

  const statusColor = {
    active: "green",
    inactive: "gray",
    suspicious: "red",
  };

  const getLogColor = (type) => {
    switch (type) {
      case "info":
        return "green";
      case "warn":
        return "red";
      case "submit":
        return "blue";
      default:
        return "black";
    }
  };

  const filteredLogList = useMemo(() => {
    if (!selectedLog) return [];
    return logFilter === "warn"
      ? selectedLog.logs.filter(
          (log) => log.type === "warn"
        )
      : selectedLog.logs;
  }, [selectedLog, logFilter]);

  return (
    <MainLayout>
      <div className="page-content">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "800px",
          }}
        >
          <h2>
            시험 감독 중: {exam?.title || "시험명 없음"}
          </h2>
          <button
            className="action-button"
            onClick={() => setShowExamModal(true)}
          >
            시험지 보기
          </button>
        </div>

        {/* 🔔 알림 팝업 */}
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                padding: "10px 16px",
                backgroundColor:
                  alert.type === "warn"
                    ? "#ffdddd"
                    : "#ddf",
                color:
                  alert.type === "warn"
                    ? "#b00000"
                    : "#003",
                border: "1px solid #ccc",
                borderRadius: 6,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                fontWeight: "bold",
              }}
            >
              🔴 {alert.text}
            </div>
          ))}
        </div>

        {/* 학생 목록 */}
        <table className="student-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>학번</th>
              <th>상태</th>
              <th>접속 시간</th>
              <th>로그 보기</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.studentNumber}</td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      backgroundColor:
                        statusColor[s.status],
                    }}
                  ></span>
                </td>
                <td>{s.connectedAt || "-"}</td>
                <td>
                  <button
                    className="action-button"
                    onClick={() => {
                      setSelectedLog(s);
                      setLogFilter("all");
                    }}
                  >
                    보기
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 시험지 미리보기 팝업 */}
        {showExamModal && (
          <ExamViewerModal
            onClose={() => setShowExamModal(false)}
          />
        )}

        {/* 로그 모달 */}
        {selectedLog && (
          <div className="modal">
            <div
              className="modal-box"
              style={{ maxWidth: "600px" }}
            >
              <div
                style={{
                  fontSize: "18px",
                  marginBottom: "8px",
                  fontWeight: "bold",
                }}
              >
                {selectedLog.studentNumber} &nbsp;{" "}
                {selectedLog.name}
              </div>

              {/* 로그 필터 */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <button
                  className="submit-btn"
                  onClick={() => setLogFilter("all")}
                  style={{
                    backgroundColor:
                      logFilter === "all"
                        ? "#1a2a3a"
                        : "#ccc",
                  }}
                >
                  전체 보기
                </button>
                <button
                  className="submit-btn"
                  onClick={() => setLogFilter("warn")}
                  style={{
                    backgroundColor:
                      logFilter === "warn"
                        ? "#1a2a3a"
                        : "#ccc",
                  }}
                >
                  비정상 로그만
                </button>
              </div>

              {/* 로그 테이블 */}
              <div
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  <tbody>
                    {filteredLogList.map((log, idx) => (
                      <tr key={idx}>
                        <td style={{ width: "32px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: "black",
                            }}
                          ></span>
                        </td>
                        <td
                          style={{
                            width: "80px",
                            fontFamily: "monospace",
                          }}
                        >
                          {log.time}
                        </td>
                        <td>
                          <span
                            style={{
                              color: getLogColor(log.type),
                              fontWeight:
                                log.type === "warn"
                                  ? "bold"
                                  : "normal",
                            }}
                          >
                            {log.message}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                className="delete-buttons"
                style={{
                  justifyContent: "right",
                  marginTop: "20px",
                }}
              >
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
