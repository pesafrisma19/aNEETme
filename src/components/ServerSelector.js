"use client";

import { useState, useEffect } from "react";

export default function ServerSelector() {
  const [showModal, setShowModal] = useState(false);
  const [selectedServer, setSelectedServer] = useState("animelovers");
  const [servers, setServers] = useState([]);

  useEffect(() => {
    fetch('/api/providers')
      .then(res => res.json())
      .then(data => setServers(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    // Load from local storage on mount
    const saved = localStorage.getItem("aneetme-server");
    if (saved) {
      setSelectedServer(saved);
    }
  }, []);

  const handleSelect = (serverId) => {
    setSelectedServer(serverId);
    localStorage.setItem("aneetme-server", serverId);
    setShowModal(false);

    // Dispatch custom event to let page.js know to refetch data
    window.dispatchEvent(new Event("server-changed"));
  };

  const activeServer = servers.find((s) => s.id === selectedServer) || { name: "Memuat..." };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-secondary"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          fontSize: "0.85rem",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid var(--glass-border)",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        }}
      >
        <span style={{ fontWeight: 600 }}>{activeServer.name}</span>
        <span style={{ fontSize: "0.7rem", marginLeft: "4px" }}>▼</span>
      </button>

      {/* Modal Overlay */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(5px)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            animation: "fadeIn 0.2s ease-out",
          }}
          onClick={() => setShowModal(false)}
        >
          {/* Modal Content */}
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--glass-border)",
              borderRadius: "16px",
              padding: "24px",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              animation: "slideUp 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700 }}>Pilih Platform</h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--foreground-muted)", marginTop: "4px" }}>
                  {servers.length} platform tersedia
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--foreground-muted)",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: "12px", maxHeight: "60vh", overflowY: "auto", paddingRight: "4px" }}>
              {servers.map((server) => {
                const isActive = selectedServer === server.id;
                return (
                  <button
                    key={server.id}
                    onClick={() => handleSelect(server.id)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "16px 8px",
                      background: isActive ? "rgba(6, 182, 212, 0.15)" : "rgba(255, 255, 255, 0.05)",
                      border: isActive ? "1px solid var(--accent-cyan)" : "1px solid var(--glass-border)",
                      borderRadius: "16px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      textAlign: "center",
                      gap: "10px",
                      position: "relative"
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    }}
                  >
                    {isActive && (
                      <div style={{ position: "absolute", top: "8px", right: "8px", width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent-cyan)", boxShadow: "0 0 8px var(--accent-cyan)" }} />
                    )}

                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      background: "rgba(0,0,0,0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
                    }}>
                      {server.logo ? (
                        <img src={server.logo} alt={server.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <img src={`https://ui-avatars.com/api/?name=${server.name}&background=random&color=fff&size=128&bold=true`} alt={server.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </div>

                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: isActive ? "var(--accent-cyan)" : "#fff", lineHeight: 1.2 }}>
                      {server.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <p style={{ fontSize: "0.8rem", color: "var(--foreground-muted)", textAlign: "center", marginTop: "20px", marginBottom: 0 }}>
              Setiap server memiliki database konten yang berbeda. Jika tidak menemukan apa yang Anda cari, cobalah server lain!
            </p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </>
  );
}
