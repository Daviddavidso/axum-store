import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const AuthCallback = () => {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash || "";
    const m = hash.match(/session_id=([^&]+)/);
    const sessionId = m ? decodeURIComponent(m[1]) : null;

    (async () => {
      if (!sessionId) {
        navigate("/admin", { replace: true });
        return;
      }
      try {
        await axios.post(
          `${API}/auth/session`,
          { session_id: sessionId },
          { withCredentials: true }
        );
        await refresh();
      } catch (e) {
        console.error("session exchange failed", e);
      } finally {
        // Clean URL and go to admin
        window.history.replaceState(null, "", "/admin");
        navigate("/admin", { replace: true });
      }
    })();
  }, [navigate, refresh]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="font-display uppercase tracking-[0.3em] text-sm">Signing you in…</div>
    </div>
  );
};

export default AuthCallback;
