import React from "react";

const ExamAccess = ({ access, updateAccess }) => {
  const handleMode = (mode) => {
    updateAccess({ ...access, mode });
  };

  const addSite = (site) => {
    if (!access.allowedSites.includes(site)) {
      updateAccess({
        ...access,
        allowedSites: [...access.allowedSites, site],
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
    <div className="exam-access">
      <div>
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

      {access.mode === "custom" && (
        <>
          <div>
            <button
              onClick={() =>
                addSite("https://www.youtube.com")
              }
            >
              유튜브
            </button>
            <button
              onClick={() =>
                addSite("https://www.tistory.com")
              }
            >
              티스토리
            </button>
          </div>

          <ul>
            {access.allowedSites.map((site) => (
              <li key={site}>
                {site}
                <button onClick={() => removeSite(site)}>
                  X
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ExamAccess;
