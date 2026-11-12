import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  }, []);

  const showSuccess = useCallback((msg) => addNotification(msg, "success"), [addNotification]);
  const showError = useCallback((msg) => addNotification(msg, "error"), [addNotification]);
  const showInfo = useCallback((msg) => addNotification(msg, "info"), [addNotification]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{ showSuccess, showError, showInfo }}
    >
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold transition-all transform duration-300 ease-out ${
              n.type === "success"
                ? "bg-[#101310] border-[#C5F53C]/40 text-white"
                : n.type === "error"
                ? "bg-[#F15B52] border-[#F15B52] text-white"
                : "bg-white border-[#E9ECE7] text-[#171917]"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {n.type === "success" && <CheckCircle2 className="w-5 h-5 text-[#C5F53C]" />}
              {n.type === "error" && <AlertCircle className="w-5 h-5 text-white" />}
              {n.type === "info" && <Info className="w-5 h-5 text-[#3789F5]" />}
            </div>
            <div className="flex-1 font-bold leading-snug">{n.message}</div>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-white/60 hover:text-white p-0.5 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
