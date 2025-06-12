import { FiArrowLeft, FiX } from "react-icons/fi"

export function NotificationView({ onClose }) {
  const notifications = [
    {
      id: 1,
      message: "Prasanth Kumar has accessed your mathematics folder",
      time: "10h",
    },
    {
      id: 2,
      message: "Prasanth Kumar has accessed your Mathematics/Algebra Notebook",
      time: "10h",
    },
    {
      id: 3,
      message: "Prasanth Kumar has accessed your mathematics/algebra/page 1",
      time: "10h",
    },
  ]

  const handleDenyAccess = (notificationId) => {
    console.log(`Denying access for notification ${notificationId}`)
    // Implement deny access logic here
  }

  return (
    <div className="h-full bg-gray-100 flex flex-col">
      {/* Header - Close icon (X) removed */}
      <div className="bg-white shadow-md p-4 flex items-center">
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 mr-3"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-6">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <FiBell className="text-gray-400 text-xl" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Notifications</h3>
            <p className="text-gray-600">You don't have any notifications at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-lg mx-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 mr-4 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-800 leading-relaxed">{notification.message}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-gray-500 mr-3">{notification.time}</span>
                    <button
                      onClick={() => handleDenyAccess(notification.id)}
                      className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
                    >
                      Deny Access
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 









