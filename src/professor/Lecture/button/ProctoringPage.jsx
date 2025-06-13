import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { MainLayout } from "../../../layout/MainLayout";
import ExamViewerModal from "./ExamViewerModal";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

import "./button.css";

const API_BASE = import.meta.env.VITE_API_URL;

export const ProctoringPage = () => {
  const location = useLocation();
  const exam = location.state?.exam;
  const [students, setStudents] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showExamModal, setShowExamModal] = useState(false);
  const [logFilter, setLogFilter] = useState("all");
  const [alerts, setAlerts] = useState([]);

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

  const addAlert = (text, type = "warn") => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 5000);
  };

    useEffect(() => {
    if (!exam?.id) return;

    const socket = new SockJS("/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe(`/topic/exam/${exam.id}`, (message) => {
        const data = JSON.parse(message.body);
        console.log("📩 실시간 로그 수신:", data);

        const alertType = getAlertType(data.status); // 타입 판단

        // 👉 알림 + 상태 업데이트 등 처리
        addAlert(`[${data.name}] ${data.status} - ${data.detail || ""}`, "warn");

      });
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [exam]);

  useEffect(() => {
    const examInfoId = exam?.id;
    const classroomId = JSON.parse(
      sessionStorage.getItem("selectedLecture")
    )?.id;
    if (!examInfoId || !classroomId) return;

    const fetchStudents = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/logs/in-exam-status?examId=${examInfoId}&classroomId=${classroomId}`
        );
        if (!response.ok)
          throw new Error("시험 상태 불러오기 실패");

        const data = await response.json();
        const formatted = data.map((s) => ({
          id: s.studentId,
          name: s.name,
          studentNumber: s.studentNumber,
          status: s.status,
          connectedAt: formatTime(s.enterTime),
          logs: [],
        }));
        setStudents(formatted);
      } catch (e) {
        console.error("Error fetching exam status", e);
      }
    };

    fetchStudents();
  }, [exam]);

  const statusColor = {
    IN_EXAM: "green",
    SAVE_EXAM: "blue",
    EXAM_EXIT: "yellow",
    CHEAT: "red",
    NO: "gray",
  };

  const fetchStudentLogs = async (
    studentId,
    classroomId,
    examId
  ) => {
    try {
      const res = await fetch(
        `${API_BASE}/logs/student-logs?studentId=${studentId}&classroomId=${classroomId}&examId=${examId}`
      );
      if (!res.ok) throw new Error("로그 불러오기 실패");
      const data = await res.json();

      return data.map((log) => ({
        time: formatTime(log.timestamp),
        message: log.detail || log.status,
        type: ["CHEAT", "EXAM_EXIT"].includes(log.status)
          ? "warn"
          : "info",
      }));
    } catch (err) {
      console.error("❌ 로그 요청 실패:", err);
      return [];
    }
  };

  const getAlertType = (status) => {
    switch (status) {
      case "CHEAT":
        return "warn";
      case "EXAM_EXIT":
        return "error";
      case "SAVE_EXAM":
      case "IN_EXAM":
        return "info";
      default:
        return "info";
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case "info":
        return "green";
      case "warn":
        return "red";
      case "submit":
        return "blue";
      case "error":
        return "yellow";
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
          className="content-wrapper"
          style={{
            width: "800px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>{exam?.title || "시험명 없음"}</h2>
          <button
            className="action-button"
            onClick={() => setShowExamModal(true)}
          >
            시험지 보기
          </button>
        </div>

        {/* 알림 */}
        <div className="alert-container">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`alert-box ${alert.type}`}
            >
              🔴 {alert.text}
            </div>
          ))}
        </div>

        {/* 테이블 */}
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
                    className={`status-dot ${
                      statusColor[s.status]
                    }`}
                  ></span>
                </td>
                <td>{s.connectedAt || "-"}</td>
                <td>
                  <button
                    className="action-button"
                    onClick={async () => {
                      const classroomId = JSON.parse(
                        sessionStorage.getItem(
                          "selectedLecture"
                        )
                      )?.id;
                      const logs = await fetchStudentLogs(
                        s.id,
                        classroomId,
                        exam.id
                      );
                      setSelectedLog({ ...s, logs });
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

        {/* 시험지 미리보기 */}
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
              <div className="log-filter-group">
                <button
                  className={`log-filter-btn ${
                    logFilter === "all"
                      ? "active"
                      : "inactive"
                  }`}
                  onClick={() => setLogFilter("all")}
                >
                  전체 보기
                </button>
                <button
                  className={`log-filter-btn ${
                    logFilter === "warn"
                      ? "active"
                      : "inactive"
                  }`}
                  onClick={() => setLogFilter("warn")}
                >
                  비정상 로그만
                </button>
              </div>

              {/* 로그 테이블 */}
              <div className="modal-log-scroll">
                <table className="modal-log-table">
                  <tbody>
                    {filteredLogList.map((log, idx) => (
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
                            color: getLogColor(log.type),
                            fontWeight:
                              log.type === "warn"
                                ? "bold"
                                : "normal",
                          }}
                        >
                          {log.message}
                        </td>
                      </tr>
                    ))}
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
