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
              maxWidth: "400px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
              animation: "slideUp 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "1.3rem" }}>Pilih Server</h3>
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

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {servers.map((server) => {
                const isActive = selectedServer === server.id;
                return (
                  <button
                    key={server.id}
                    onClick={() => handleSelect(server.id)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      padding: "16px",
                      background: isActive ? "rgba(6, 182, 212, 0.1)" : "rgba(255, 255, 255, 0.03)",
                      border: isActive ? "1px solid var(--accent-cyan)" : "1px solid var(--glass-border)",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
                      }
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                      <span style={{ fontSize: "1.1rem", fontWeight: 700, color: isActive ? "var(--accent-cyan)" : "#fff" }}>
                        {server.name}
                      </span>
                      {isActive && <span style={{ color: "var(--accent-cyan)" }}>✓</span>}
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "var(--foreground-muted)", marginTop: "4px" }}>
                      {server.desc}
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
      
      <style dangerouslySetInnerHTML={{__html: `
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
