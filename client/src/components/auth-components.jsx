"use client"

import { useState, useEffect } from "react"
import { FiBook, FiCamera, FiShare2, FiLogOut, FiMenu, FiX, FiBell } from "react-icons/fi"

// Mock NotificationView component
const NotificationView = ({ onClose }) => (
  <div className="bg-white h-full flex flex-col">
    <div className="flex items-center justify-between p-4 border-b">
      <h2 className="text-lg font-semibold">Notifications</h2>
      <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
        <FiX className="text-xl" />
      </button>
    </div>
    <div className="flex-1 p-4">
      <p className="text-gray-500">No new notifications</p>
    </div>
  </div>
)

// Login View Component with Google Sign-In
export function LoginView({ onLogin }) {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [debugInfo, setDebugInfo] = useState("")

  useEffect(() => {
    setDebugInfo(`Current origin: ${window.location.origin}`)

    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogleSignIn()
        return
      }

      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      script.onload = initializeGoogleSignIn
      script.onerror = () => {
        setError("Failed to load Google Sign-In script")
      }
      document.head.appendChild(script)
    }

    const initializeGoogleSignIn = () => {
      try {
        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: "320764355400-n0c4d90n2lhn9nf1se5vh8oqqtjbmbhc.apps.googleusercontent.com",
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false,
            itp_support: true,
          })
          setIsGoogleLoaded(true)
          setError(null)
        } else {
          setError("Google Sign-In API not available")
        }
      } catch (err) {
        console.error("Google Sign-In initialization error:", err)
        setError("Failed to initialize Google Sign-In: " + err.message)
      }
    }

    loadGoogleScript()
  }, [])

  const handleGoogleSignIn = async (response) => {
    try {
      console.log("Google Sign-In response:", response)
      const payload = JSON.parse(atob(response.credential.split(".")[1]))
      console.log("Decoded payload:", payload)

      const userData = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        profilePicture: payload.picture,
        googleId: payload.sub,
      }

      try {
        const response = await fetch("http://localhost:5005/api/save-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        })

        if (!response.ok) {
          throw new Error(`Failed to save user data: ${response.statusText}`)
        }

        const result = await response.json()
        console.log("User data saved:", result)

        const adjustedUser = {
          ...result.user,
          profilePicturePath: `http://localhost:5005/components/${result.user.googleId}.jpg`,
        }
        onLogin(adjustedUser)
      } catch (error) {
        console.error("Error saving user data to backend:", error)
        setError("Failed to save user data: " + error.message)
        // Proceed with login using Google data
        userData.profilePicturePath = `http://localhost:5005/components/${userData.googleId}.jpg`
        onLogin(userData)
      }
    } catch (error) {
      console.error("Error processing Google Sign-In:", error)
      setError("Sign-in failed: " + error.message)
    }
  }

  const handleGoogleSignInClick = () => {
    if (!window.google) {
      setError("Google Sign-In not loaded")
      return
    }

    if (!isGoogleLoaded) {
      setError("Google Sign-In not initialized")
      return
    }

    try {
      setError(null)

      const tempDiv = document.createElement("div")
      tempDiv.style.position = "fixed"
      tempDiv.style.top = "-1000px"
      tempDiv.style.left = "-1000px"
      document.body.appendChild(tempDiv)

      window.google.accounts.id.renderButton(tempDiv, {
        theme: "outline",
        size: "large",
        width: 250,
        click_listener: () => {
          window.google.accounts.id.prompt((notification) => {
            console.log("Prompt notification:", notification)
            if (notification.isNotDisplayed()) {
              console.log("Not displayed reason:", notification.getNotDisplayedReason())
              tryPopupSignIn()
            } else if (notification.isSkippedMoment()) {
              console.log("Skipped reason:", notification.getSkippedReason())
              tryPopupSignIn()
            }
          })
        },
      })

      setTimeout(() => {
        const button = tempDiv.querySelector('div[role="button"]')
        if (button) {
          button.click()
        } else {
          tryPopupSignIn()
        }
        document.body.removeChild(tempDiv)
      }, 100)
    } catch (err) {
      console.error("Error showing Google Sign-In prompt:", err)
      setError("Failed to show sign-in prompt: " + err.message)
      tryPopupSignIn()
    }
  }

  const tryPopupSignIn = () => {
    try {
      const clientId = "1091796067911-9ob10a9epuuvj6ol9mjsj79i7fhk9e12.apps.googleusercontent.com"
      const redirectUri = window.location.origin
      const scope = "openid profile email"

      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(scope)}&` +
        `include_granted_scopes=true&` +
        `state=popup`

      const popup = window.open(authUrl, "google-signin", "width=500,height=600,scrollbars=yes,resizable=yes")

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed)
          setError("Sign-in popup was closed")
        }
      }, 1000)

      setError("Popup sign-in opened. Complete sign-in in the popup window.")
    } catch (err) {
      console.error("Popup sign-in error:", err)
      setError("All sign-in methods failed.")
    }
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 py-6 px-8">
          <div className="flex items-center justify-center">
            <FiBook className="text-white text-3xl mr-2" />
            <h2 className="text-2xl font-bold text-white">Smart Notebook</h2>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Welcome to Smart Notebook</h3>
          <p className="text-gray-600 mb-8 text-center">
            The cloud-connected platform for your physical notebooks. Scan, store, and share your notes securely.
          </p>

          {debugInfo && <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">{debugInfo}</div>}

          {error && <div className="mb-4 p-3 bg-red-50 rounded-lg text-sm text-red-700">{error}</div>}

          <button
            onClick={handleGoogleSignInClick}
            disabled={!isGoogleLoaded}
            className={`w-full flex items-center justify-center border border-gray-300 rounded-lg py-3 px-4 text-gray-700 transition duration-150 mb-3 ${
              isGoogleLoaded ? "bg-white hover:bg-gray-50 cursor-pointer" : "bg-gray-100 cursor-not-allowed opacity-60"
            }`}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.20-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.60 3.30-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isGoogleLoaded ? "Sign in with Google" : "Loading Google Sign-In..."}
          </button>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">First time user? Scan the QR code on your notebook to get started.</p>
          </div>
        </div>
      </div>

      <div className="mt-12 max-w-2xl text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiCamera className="text-blue-600 text-xl" />
              </div>
            </div>
            <h4 className="font-medium text-gray-800 mb-2">Scan QR Code</h4>
            <p className="text-sm text-gray-600">Scan the QR code on your notebook to connect it to your account</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiBook className="text-blue-600 text-xl" />
              </div>
            </div>
            <h4 className="font-medium text-gray-800 mb-2">Store Pages</h4>
            <p className="text-sm text-gray-600">Digitize and store your notebook pages securely in the cloud</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiShare2 className="text-blue-600 text-xl" />
              </div>
            </div>
            <h4 className="font-medium text-gray-800 mb-2">Share & Access</h4>
            <p className="text-sm text-gray-600">Access your notes from anywhere and share with others securely</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Header Component with Sidebar and Full-Screen Notifications
export function Header({ user, onLogout, isMobileMenuOpen, setIsMobileMenuOpen, activeView, setActiveView }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [profileImages, setProfileImages] = useState({}) // New state to store profile images

  useEffect(() => {
    console.log("Header received user:", user)
    if (user) {
      loadProfileImages()
    }
  }, [user])

  // New function to load profile images
  const loadProfileImages = async () => {
    if (!user?.googleId) return

    try {
      // Try to load the profile image from the backend
      const imageUrl = `http://localhost:5005/components/${user.googleId}.jpg`

      // Test if the image exists by creating a new Image object
      const img = new Image()
      img.onload = () => {
        setProfileImages((prev) => ({
          ...prev,
          [user.googleId]: imageUrl,
        }))
        console.log("Profile image loaded successfully:", imageUrl)
      }
      img.onerror = () => {
        console.log("Profile image not found, using fallback")
        setProfileImages((prev) => ({
          ...prev,
          [user.googleId]: "/placeholder.svg",
        }))
      }
      img.src = imageUrl
    } catch (err) {
      console.error("Error loading profile image:", err)
      setProfileImages((prev) => ({
        ...prev,
        [user.googleId]: "/placeholder.svg",
      }))
    }
  }

  const toggleSidebar = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setShowNotifications(false)
  }

  const handleNotificationsClick = () => {
    setShowNotifications(true)
    setIsMobileMenuOpen(false)
  }

  const handleCloseNotifications = () => {
    setShowNotifications(false)
  }

  // Get the profile image URL with fallback
  const getProfileImageUrl = () => {
    if (user?.googleId && profileImages[user.googleId]) {
      return profileImages[user.googleId]
    }
    return user?.profilePicturePath || "/placeholder.svg"
  }

  return (
    <>
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FiBook className="text-blue-600 text-2xl mr-2" />
              <h1 className="text-xl font-bold text-gray-800">Smart Notebook</h1>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setActiveView("dashboard")}
                className={`text-sm font-medium ${activeView === "dashboard" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveView("orderPortal")}
                className={`text-sm font-medium ${activeView === "orderPortal" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
              >
                Order Notebooks
              </button>

              <div className="flex items-center ml-6">
                <img
                  src={getProfileImageUrl() || "/placeholder.svg"}
                  alt={user?.name || "Unknown User"}
                  className="w-8 h-8 rounded-full mr-2"
                  onError={(e) => {
                    // Fallback to placeholder if profile image fails to load
                    e.target.src = "/placeholder.svg"
                  }}
                />
                <span className="text-sm font-medium text-gray-700">{user?.name || "Unknown User"}</span>
                <button onClick={onLogout} className="ml-4 text-sm text-gray-600 hover:text-red-600">
                  <FiLogOut />
                </button>
              </div>
            </div>

            <button className="md:hidden text-gray-600" onClick={toggleSidebar}>
              {isMobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-800">
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center mb-6">
            <img
              src={getProfileImageUrl() || "/placeholder.svg"}
              alt={user?.name || "Unknown User"}
              className="w-10 h-10 rounded-full mr-3"
              onError={(e) => {
                // Fallback to placeholder if profile image fails to load
                e.target.src = "/placeholder.svg"
              }}
            />
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name || "Unknown User"}</p>
              <p className="text-xs text-gray-500">{user?.email || "No email available"}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setActiveView("dashboard")
                setIsMobileMenuOpen(false)
              }}
              className={`w-full text-left py-2 px-3 rounded-lg font-medium transition-colors ${
                activeView === "dashboard" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveView("orderPortal")
                setIsMobileMenuOpen(false)
              }}
              className={`w-full text-left py-2 px-3 rounded-lg font-medium transition-colors ${
                activeView === "orderPortal" ? "bg-blue-100 text-blue-600" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Order Notebooks
            </button>
            <button
              onClick={handleNotificationsClick}
              className="w-full flex items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <FiBell className="mr-2" />
              Notifications
            </button>
            <button
              onClick={() => {
                onLogout()
                setIsMobileMenuOpen(false)
              }}
              className="w-full flex items-center py-2 px-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleSidebar} />
      )}

      {showNotifications && (
        <div className="fixed inset-0 z-50">
          <NotificationView onClose={handleCloseNotifications} />
        </div>
      )}
    </>
  )
}
