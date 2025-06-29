import React, { useState } from "react";
import "./ExamEditor.css";
import { blockGroups } from "./blockGroups.js";


const ExamAccess = ({ access, updateAccess }) => {
  const [customUrl, setCustomUrl] = useState("");

  const handleMode = (mode) => {
    updateAccess({ ...access, mode });
  };

  const addSites = (sites) => {
    const newSites = sites.filter(
      (site) => site && !access.allowedSites.includes(site)
    );

    if (newSites.length > 0) {
      updateAccess({
        ...access,
        allowedSites: [...access.allowedSites, ...newSites],
      });
    }
  };

  const removeSite = (site) => {
    updateAccess({
      ...access,
      allowedSites: access.allowedSites.filter(
        (s) => s !== site
      ),
    });
  };

  return (
    <div className="exam-access settings">
      {/* 접속 제한 */}
      <div className="row">
        <label>접속 제한</label>
        <div className="radio-inline-group">
          <label>
            <input
              type="radio"
              checked={access.mode === "deny"}
              onChange={() => handleMode("deny")}
            />
            인터넷 차단
          </label>
          <label>
            <input
              type="radio"
              checked={access.mode === "allow"}
              onChange={() => handleMode("allow")}
            />
            전체 허용
          </label>
          <label>
            <input
              type="radio"
              checked={access.mode === "custom"}
              onChange={() => handleMode("custom")}
            />
            일부 허용
          </label>
        </div>
      </div>

      {/* 일부 허용 선택 시에만 표시 */}
      {access.mode === "custom" && (
        <>
          {/* 추천 사이트 */}
          <div className="row">
            <label>추천 차단 사이트</label>
            <div className="site-buttons">
              {blockGroups.map((group) => (
                <button onClick={() => addSites(group.sites)}>
                  {group.name}
                </button>
              ))}
            </div>
          </div>

          {/* 직접 추가 */}
          <div className="row">
            <label>직접 추가</label>
            <input
              type="text"
              placeholder="https://example.com"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addSite(customUrl.trim());
                  setCustomUrl("");
                }
              }}
            />
            <button
              // 직접 추가
              onClick={() => {
                addSites([customUrl.trim()]);
                setCustomUrl("");
              }}

            >
              추가
            </button>
          </div>

          <div className="row">
            <label>금지 목록</label>
            {access.allowedSites.length > 0 && (
              <div className="site-item">
                <div className="site-url">
                  {access.allowedSites[0]}
                </div>
                <button
                  onClick={() =>
                    removeSite(access.allowedSites[0])
                  }
                >
                  삭제
                </button>
              </div>
            )}
          </div>

          {/* 나머지 링크들 줄바꿈 렌더링 */}
          {access.allowedSites.slice(1).map((site) => (
            <div className="row" key={site}>
              <label></label>{" "}
              {/* 라벨 비움으로 들여쓰기 유지 */}
              <div className="site-item">
                <div className="site-url">{site}</div>
                <button onClick={() => removeSite(site)}>
                  삭제
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ExamAccess;
