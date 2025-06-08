import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { MainLayout } from "../../../layout/MainLayout";
import ExamViewerModal from "./ExamViewerModal";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

import "../Lecture.css";

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


  // 알림 추가
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


  // 초기 데이터
  useEffect(() => {
    const examInfoId = exam?.id;
    const classroomId = JSON.parse(sessionStorage.getItem("selectedLecture"))?.id;

    if (!examInfoId || !classroomId) return;

    const fetchStudents = async () => {
      try {
        const response = await fetch(
          `/api/logs/in-exam-status?examId=${examInfoId}&classroomId=${classroomId}`
        );
        if (!response.ok) throw new Error("시험 상태 불러오기 실패");
        

        const data = await response.json();

        // 변환해서 상태에 저장
        const formatted = data.map((s) => ({
          id: s.studentId,
          name: s.name,
          studentNumber: s.studentNumber,
          status: s.status,
          connectedAt: formatTime(s.enterTime),
          logs: [] // 나중에 로그 API로 채울 예정
        }));
        console.log("📩 실시간 로그 수신:", data);


        setStudents(formatted);
      } catch (e) {
        console.error("Error fetching exam status", e);
      }
    };

    fetchStudents();
  }, [exam]);


  const statusColor = {
    IN_EXAM: "green", //시험중
    SAVE_EXAM: "blue", //시험 완료
    EXAM_EXIT: "yellow", //예기치 못한 퇴장
    CHEAT: "red", //부정행위
    NO: "gray", // 입장 안함
  };

  const fetchStudentLogs = async (studentId, classroomId, examId) => {
    try {
      const res = await fetch(
        `/api/logs/student-logs?studentId=${studentId}&classroomId=${classroomId}&examId=${examId}`
      );
      if (!res.ok) throw new Error("로그 불러오기 실패");
      const data = await res.json();

      // 로그 포맷 변환
      return data.map((log) => ({
        time: formatTime(log.timestamp),
        message: log.detail || log.status,
        type: log.status === "CHEAT" || log.status === "EXAM_EXIT" ? "warn" : "info",
      }));
    } catch (err) {
      console.error("❌ 로그 요청 실패:", err);
      return [];
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

  //실시간 로그 색상
  const getAlertType = (status) => {
    switch (status) {
      case "CHEAT":
        return "warn"; // 빨간색
      case "EXAM_EXIT":
        return "error"; // 빨간색 (예기치 못한 퇴장)
      case "SAVE_EXAM":
        return "info"; // 파란색
      case "IN_EXAM":
        return "info"; // 초록색
      default:
        return "info";
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
                    onClick={async () => {
                      const classroomId = JSON.parse(sessionStorage.getItem("selectedLecture"))?.id;
                      const studentId = s.id;
                      const examId = exam.id;

                      const logs = await fetchStudentLogs(studentId, classroomId, examId);

                      setSelectedLog({
                        ...s,
                        logs: logs,
                      });
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
