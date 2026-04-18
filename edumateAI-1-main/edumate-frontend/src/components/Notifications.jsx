import { useEffect, useState } from "react";
import { getNotifications, getPerformanceAnalytics } from "../api/axios";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      if (res.data.success) {
        setNotifications(res.data.notifications);
        const unread = res.data.notifications.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notifId) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/notification/mark-as-read/${notifId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const deleteNotification = async (notifId) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/notification/delete/${notifId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });
      fetchNotifications();
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      ATTENDANCE: "📍",
      PERFORMANCE: "📊",
      STRESS: "😟",
      STUDY_PLAN: "📚",
      EXAM: "📝",
      WEAK_SUBJECT: "⚠️",
      GENERAL: "ℹ️"
    };
    return icons[type] || "📬";
  };

  const getNotificationColor = (type) => {
    const colors = {
      ATTENDANCE: "border-l-4 border-amber-500 bg-amber-50",
      PERFORMANCE: "border-l-4 border-red-500 bg-red-50",
      STRESS: "border-l-4 border-pink-500 bg-pink-50",
      STUDY_PLAN: "border-l-4 border-blue-500 bg-blue-50",
      EXAM: "border-l-4 border-purple-500 bg-purple-50",
      WEAK_SUBJECT: "border-l-4 border-orange-500 bg-orange-50",
      GENERAL: "border-l-4 border-gray-500 bg-gray-50"
    };
    return colors[type] || "border-l-4 border-gray-500 bg-gray-50";
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-600 hover:text-indigo-600 transition"
        title="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Notifications</h3>
              <button
                onClick={() => setShowPanel(false)}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-indigo-100 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div>
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📬</div>
                <p>No notifications yet</p>
                <p className="text-xs mt-2">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 border-b hover:bg-gray-50 transition cursor-pointer ${getNotificationColor(
                    notif.type
                  )} ${!notif.is_read ? "opacity-100" : "opacity-75"}`}
                  onClick={() => markAsRead(notif._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl mt-1">{getNotificationIcon(notif.type)}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">
                          {notif.title}
                          {!notif.is_read && (
                            <span className="ml-2 inline-block w-2 h-2 bg-indigo-600 rounded-full"></span>
                          )}
                        </h4>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif._id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition ml-2"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="sticky bottom-0 bg-gray-50 border-t p-3 text-center text-xs text-gray-500">
              Showing last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Overlay to close panel */}
      {showPanel && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPanel(false)}
        />
      )}
    </div>
  );
}
