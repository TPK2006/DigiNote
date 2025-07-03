"use client"

import { useState, useRef, useEffect } from "react"
import {
  FiBook,
  FiCamera,
  FiSearch,
  FiUnlock,
  FiLock,
  FiGrid,
  FiList,
  FiMoreVertical,
  FiCheck,
  FiShare2,
  FiEdit,
  FiTrash2,
  FiEye,
  FiShield,
  FiCopy,
  FiDownload,
  FiBookOpen,
} from "react-icons/fi"
import { FoldersView } from "./FoldersView"
import { ScanningOverlay, ScanResultModal } from "./modal-components"
import { PageView } from "./page-components"
import { SharedBooksView } from "./SharedBooksView"
import QRCodeStyling from "qr-code-styling"
import jsQR from "jsqr"
import io from "socket.io-client"

export function DashboardView({
  notebooks,
  onNotebookSelect,
  onScan,
  searchQuery,
  setSearchQuery,
  onDeleteNotebook,
  onToggleNotebookAccess,
  onShareNotebook,
  user,
}) {
  const [viewMode, setViewMode] = useState("grid")
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [showMainMenu, setShowMainMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showAccessToggleConfirm, setShowAccessToggleConfirm] = useState(null)
  const [showPinModal, setShowPinModal] = useState(null)
  const [showFoldersView, setShowFoldersView] = useState(false)
  const [showSharePopup, setShowSharePopup] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [showPinEntry, setShowPinEntry] = useState(null)
  const [pinInput, setPinInput] = useState("")
  const [showSharedBooksView, setShowSharedBooksView] = useState(false)
  const [currentFilter, setCurrentFilter] = useState("all")
  const [showAdminView, setShowAdminView] = useState(false)
  const [showCreateBookModal, setShowCreateBookModal] = useState(false)
  const [showBookExistsModal, setShowBookExistsModal] = useState(false)
  const [newBookName, setNewBookName] = useState("")
  const [qrId, setQrId] = useState(null)
  const [qrData, setQrData] = useState(null)
  const [qrImagePath, setQrImagePath] = useState(null)
  const [savedQRs, setSavedQRs] = useState([])
  const [networkIP, setNetworkIP] = useState("localhost")
  const [scanResult, setScanResult] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [allBooks, setAllBooks] = useState([])
  const [qrCodeImages, setQrCodeImages] = useState({}) // New state to store QR code images
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const qrRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    const socketUrl = networkIP !== "localhost" ? `http://${networkIP}:5005` : "http://localhost:5005"
    socketRef.current = io(socketUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current.on("connect", () => {
      console.log("WebSocket connected:", socketRef.current.id)
    })

    socketRef.current.on("qrScanned", async (data) => {
      console.log("Received qrScanned event:", data)
      setQrId(data.qrId)
      setShowAdminView(false)

      try {
        const response = await fetch(`http://localhost:5005/api/books/qr/${data.qrId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (response.ok) {
          const book = await response.json()
          if (book) {
            setShowBookExistsModal(true)
            const formattedBook = {
              id: book.id,
              title: book.title,
              isPublic: book.isPublic,
              pages: book.pages || [],
              totalPages: book.totalPages || 0,
              lastUpdated: book.lastUpdated,
              coverImage: book.coverImage,
              qrId: book.qrId,
              createdBy: book.createdBy,
              qrCode: qrCodeImages[book.qrId] || `/api/placeholder/40/40`,
            }
            onNotebookSelect(formattedBook)
          } else {
            setShowCreateBookModal(true)
          }
        } else {
          console.error("Failed to check book existence:", response.statusText)
          setError("Failed to verify QR code")
        }
      } catch (err) {
        console.error("Error checking book existence:", err)
        setError("Failed to verify QR code")
      }
    })

    socketRef.current.on("bookCreated", (data) => {
      console.log("Book created event:", data)
      loadAllBooks()
    })

    socketRef.current.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err.message)
    })

    socketRef.current.on("disconnect", () => {
      console.log("WebSocket disconnected")
    })

    return () => {
      socketRef.current.disconnect()
      console.log("WebSocket cleanup")
    }
  }, [networkIP, onNotebookSelect])

  useEffect(() => {
    loadAllBooks()
    loadQRCodeImages() // Load QR code images when component mounts
  }, [])

  // New function to load QR code images
  const loadQRCodeImages = async () => {
    try {
      const response = await fetch("http://localhost:5005/api/qr/list")
      if (response.ok) {
        const qrList = await response.json()
        const qrImageMap = {}
        qrList.forEach((qr) => {
          // Extract QR ID from the URL or use the qrId directly
          qrImageMap[qr.qrId] = `http://localhost:5005${qr.filePath}`
        })
        setQrCodeImages(qrImageMap)
        console.log("Loaded QR code images:", qrImageMap)
      }
    } catch (err) {
      console.error("Error loading QR code images:", err)
    }
  }

  const loadAllBooks = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5005/api/books/all", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        const books = await response.json()
        console.log("Loaded books from database:", books)
        setAllBooks(books)

        const formattedBooks = books.map((book) => ({
          id: book.id,
          title: book.title,
          isPublic: book.isPublic,
          pages: book.pages || [],
          totalPages: book.totalPages || 0,
          lastUpdated: book.lastUpdated,
          coverImage: book.coverImage,
          qrId: book.qrId,
          createdBy: book.createdBy,
          qrCode: qrCodeImages[book.qrId] || `/api/placeholder/40/40`, // Use actual QR code image
        }))

        formattedBooks.forEach((book) => {
          onNotebookSelect(book)
        })
      } else {
        console.error("Failed to load books:", response.statusText)
      }
    } catch (err) {
      console.error("Error loading books:", err)
      setError("Failed to load books from database")
    } finally {
      setLoading(false)
    }
  }

  // Update notebooks when QR code images are loaded
  useEffect(() => {
    if (Object.keys(qrCodeImages).length > 0 && notebooks.length > 0) {
      // Update existing notebooks with QR code images
      notebooks.forEach((notebook) => {
        if (notebook.qrId && qrCodeImages[notebook.qrId]) {
          notebook.qrCode = qrCodeImages[notebook.qrId]
        }
      })
    }
  }, [qrCodeImages, notebooks])

  const generateQRCode = async () => {
    try {
      console.log("Attempting to generate QR code...")
      setError("")
      setScanResult("")
      const response = await fetch("http://localhost:5005/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("QR code response:", data)
      const { qrId, qrUrl, networkIP: detectedIP, fileName, filePath } = data
      setQrId(qrId)
      setQrData(qrUrl)
      setQrImagePath(filePath)
      setNetworkIP(detectedIP || "localhost")

      // Update QR code images state
      setQrCodeImages((prev) => ({
        ...prev,
        [qrId]: `http://localhost:5005${filePath}`,
      }))

      loadSavedQRs()

      if (!qrRef.current) {
        console.error("qrRef.current is null, cannot render QR code")
        setError("Failed to render QR code: Container not found")
        return
      }

      const qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        data: qrUrl,
        dotsOptions: { color: "#000000", type: "rounded" },
        backgroundOptions: { color: "#ffffff" },
        cornersSquareOptions: { color: "#000000", type: "extra-rounded" },
        cornersDotOptions: { color: "#000000", type: "dot" },
      })
      qrRef.current.innerHTML = ""
      qrCode.append(qrRef.current)
      console.log("QR code appended to DOM")
    } catch (err) {
      console.error("Frontend QR generation error:", err.message)
      setError(`Failed to generate QR code: ${err.message}`)
    }
  }

  const loadSavedQRs = async () => {
    try {
      const response = await fetch("http://localhost:5005/api/qr/list")
      if (response.ok) {
        const qrList = await response.json()
        setSavedQRs(qrList)
        // Also update QR code images when loading saved QRs
        const qrImageMap = {}
        qrList.forEach((qr) => {
          qrImageMap[qr.qrId] = `http://localhost:5005${qr.filePath}`
        })
        setQrCodeImages((prev) => ({ ...prev, ...qrImageMap }))
      }
    } catch (err) {
      console.error("Error loading saved QRs:", err)
    }
  }

  useEffect(() => {
    loadSavedQRs()
  }, [])

  const startCamera = async () => {
    try {
      console.log("Starting camera...")
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      videoRef.current.srcObject = stream
      videoRef.current.play()
      scanQRCode()
    } catch (err) {
      console.error("Camera access error:", err)
      setError("Failed to access camera")
    }
  }

  const scanQRCode = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext("2d")

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = 300
        canvas.width = 300
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const qrData = context.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(qrData.data, qrData.width, qrData.height)
        if (code) {
          console.log("Scanned QR code:", code.data)
          setScanResult(`Scanned QR ID: ${code.data.split("/").pop()}`)
          stopCamera()
        } else {
          setScanResult("No QR code detected")
        }
      }
      requestAnimationFrame(scan)
    }

    scan()
  }

  const stopCamera = () => {
    console.log("Stopping camera...")
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
    }
  }

  const handleDashboardScan = () => {
    setShowAdminView(true)
  }

  const handleCreateBook = async () => {
    if (newBookName.trim() && qrId && user) {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(`http://localhost:5005/api/books/create/${qrId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newBookName.trim(),
            userId: user.googleId || user.id,
            userName: user.name,
            userEmail: user.email,
            isPublic: false,
            pages: [],
            coverImage: "/api/placeholder/400/200",
            qrId: qrId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Book created successfully:", data)

        const newBook = {
          id: data.book.id,
          title: data.book.title,
          isPublic: data.book.isPublic,
          pages: data.book.pages || [],
          totalPages: data.book.totalPages || 0,
          lastUpdated: data.book.lastUpdated || new Date().toISOString(),
          coverImage: data.book.coverImage || "/api/placeholder/400/200",
          qrId: data.book.qrId,
          createdBy: data.book.createdBy,
          qrCode: qrCodeImages[data.book.qrId] || `/api/placeholder/40/40`, // Use actual QR code
        }

        onNotebookSelect(newBook)
        await loadAllBooks()
        await loadQRCodeImages() // Reload QR code images
        setShowCreateBookModal(false)
        setNewBookName("")
        setQrId(null)

        alert("Notebook created successfully!")
      } catch (err) {
        console.error("Error creating book:", err)
        setError(`Failed to create book: ${err.message}`)
      } finally {
        setLoading(false)
      }
    } else {
      setError("Please provide a notebook name and ensure you are logged in")
    }
  }

  const formatUserAgent = (userAgent) => {
    if (!userAgent) return "Unknown device"
    if (userAgent.includes("iPhone")) return "📱 iPhone"
    if (userAgent.includes("Android")) return "📱 Android"
    if (userAgent.includes("iPad")) return "📱 iPad"
    if (userAgent.includes("Mobile")) return "📱 Mobile Device"
    return "💻 Desktop"
  }

  const handleCreateFolder = (folderName) => {
    console.log("Creating folder:", folderName)
  }

  const handleDeleteFolder = (folder) => {
    console.log("Deleting folder:", folder)
  }

  const handleShareFolder = (folder) => {
    console.log("Sharing folder:", folder)
  }

  const handleMoveFolder = (sourceFolder, targetFolder) => {
    console.log("Moving folder:", sourceFolder, "to:", targetFolder)
  }

  const handleNotebookMenuClick = (e, notebookId) => {
    e.stopPropagation()
    setActiveDropdown(activeDropdown === notebookId ? null : notebookId)
  }

  const handleMainMenuClick = () => {
    setShowMainMenu(!showMainMenu)
  }

  const handleViewFoldersClick = () => {
    setShowFoldersView(true)
    setShowMainMenu(false)
  }

  const handleSharedBooksClick = () => {
    setShowSharedBooksView(true)
    setShowMainMenu(false)
  }

  const handlePrivateBooksClick = () => {
    setCurrentFilter("private")
    setShowMainMenu(false)
  }

  const handlePublicBooksClick = () => {
    setCurrentFilter("public")
    setShowMainMenu(false)
  }

  const handleBreadcrumbClick = (filter) => {
    setCurrentFilter(filter)
  }

  const handleDeleteClick = async (e, notebook) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to delete "${notebook.title}"?`)) {
      try {
        const response = await fetch(`http://localhost:5005/api/books/${notebook.id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          onDeleteNotebook(notebook.id)
          await loadAllBooks()
          alert("Notebook deleted successfully")
        } else {
          throw new Error("Failed to delete notebook")
        }
      } catch (err) {
        console.error("Error deleting notebook:", err)
        alert("Failed to delete notebook")
      }
    }
    setActiveDropdown(null)
  }

  const handleAccessToggleClick = (e, notebook) => {
    e.stopPropagation()
    setShowAccessToggleConfirm(notebook)
    setActiveDropdown(null)
  }

  const handleLockIconClick = (e, notebook) => {
    e.stopPropagation()
    setShowAccessToggleConfirm(notebook)
  }

  const handleAccessToggleConfirm = () => {
    if (showAccessToggleConfirm.isPublic) {
      setShowPinEntry(showAccessToggleConfirm)
      setShowAccessToggleConfirm(null)
    } else {
      onToggleNotebookAccess(showAccessToggleConfirm.id)
      setShowAccessToggleConfirm(null)
    }
  }

  const handlePinEntryConfirm = () => {
    if (pinInput.length === 4 && /^\d+$/.test(pinInput)) {
      onToggleNotebookAccess(showPinEntry.id, pinInput)
      setShowPinEntry(null)
      setPinInput("")
    } else {
      alert("PIN must be exactly 4 digits")
    }
  }

  const handleShowPinClick = (e, notebook) => {
    e.stopPropagation()
    setShowPinModal(notebook)
    setActiveDropdown(null)
  }

  const handleShareClick = (e, notebook) => {
    e.stopPropagation()
    setShowSharePopup(notebook)
    setActiveDropdown(null)
  }

  const handleQRClick = (e, notebook) => {
    e.stopPropagation()
    setShowSharePopup(notebook)
  }

  const handleCopyLink = async (notebook) => {
    const shareUrl = `https://notebook.app/share/${notebook.id}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const handleDownloadQR = (notebook) => {
    const link = document.createElement("a")
    link.href = notebook.qrCode || "/api/placeholder/200/200"
    link.download = `${notebook.title}-qr-code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOverlayClick = () => {
    setActiveDropdown(null)
    setShowMainMenu(false)
  }

  const handleCloseSharePopup = () => {
    setShowSharePopup(null)
    setCopySuccess(false)
  }

  const filteredNotebooks = notebooks.filter((notebook) => {
    if (currentFilter === "private") {
      return !notebook.isPublic
    } else if (currentFilter === "public") {
      return notebook.isPublic
    }
    return true
  })

  const getHeaderTitle = () => {
    if (currentFilter === "all") {
      return "My Notebooks"
    } else {
      return (
        <div className="flex items-center">
          <button
            onClick={() => handleBreadcrumbClick("all")}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            My Notebooks
          </button>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{currentFilter === "private" ? "Private" : "Public"}</span>
        </div>
      )
    }
  }

  if (showFoldersView) {
    return (
      <FoldersView
        onBack={() => setShowFoldersView(false)}
        onCreateFolder={handleCreateFolder}
        onDeleteFolder={handleDeleteFolder}
        onShareFolder={handleShareFolder}
        onMoveFolder={handleMoveFolder}
      />
    )
  }

  if (showSharedBooksView) {
    return (
      <SharedBooksView
        onBack={() => setShowSharedBooksView(false)}
        onShareUser={(user) => console.log("Sharing with user:", user)}
        onRemoveUser={(user) => console.log("Removing user:", user)}
      />
    )
  }

  if (showAdminView) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <button
          onClick={() => setShowAdminView(false)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Network:</strong> {networkIP !== "localhost" ? `${networkIP}:5005` : "localhost:5005"}
            {networkIP !== "localhost" && <span className="ml-2 text-green-600">✅ Mobile devices can scan!</span>}
          </p>
        </div>

        {savedQRs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Recently Generated QR Codes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedQRs.slice(0, 6).map((qr) => (
                <div key={qr.qrId} className="border rounded-lg p-4 bg-gray-50">
                  <img
                    src={`http://localhost:5005${qr.filePath}`}
                    alt={`QR Code ${qr.qrId.substring(0, 8)}`}
                    className="w-32 h-32 object-contain mx-auto mb-2 bg-white rounded border"
                  />
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>
                      <strong>ID:</strong> {qr.qrId.substring(0, 8)}...
                    </p>
                    <p>
                      <strong>Created:</strong> {new Date(qr.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Scans:</strong> {qr.scanCount}
                    </p>
                    {qr.lastScanned && (
                      <p>
                        <strong>Last Scan:</strong> {new Date(qr.lastScanned).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <a
                    href={`http://localhost:5005${qr.filePath}`}
                    download
                    className="block mt-2 text-center px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Generate QR Code</h2>
          <button
            onClick={generateQRCode}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mb-4 transition-colors disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate New QR Code"}
          </button>
          <div>
            {qrId && (
              <p className="mb-2 text-gray-600">
                QR Code ID: <code className="bg-gray-100 px-2 py-1 rounded">{qrId.substring(0, 8)}...</code>
              </p>
            )}

            {qrImagePath ? (
              <div className="mx-auto w-fit border-2 border-gray-200 rounded-lg p-4 bg-white">
                <img
                  src={`http://localhost:5005${qrImagePath}`}
                  alt="Generated QR Code"
                  className="w-80 h-80 object-contain"
                />
              </div>
            ) : (
              <div ref={qrRef} className="mx-auto w-fit border-2 border-gray-200 rounded-lg p-4 bg-white"></div>
            )}
            {qrData && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                <p>
                  <strong>QR URL:</strong> <code className="break-all">{qrData}</code>
                </p>
                {qrImagePath && (
                  <div className="mt-2">
                    <p>
                      <strong>Saved as:</strong> <code>{qrImagePath}</code>
                    </p>
                    <a
                      href={`http://localhost:5005${qrImagePath}`}
                      download
                      className="inline-block mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      📥 Download JPG
                    </a>
                  </div>
                )}
                <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400">
                  <p className="text-blue-700 font-medium">📱 Instructions:</p>
                  <ul className="text-blue-600 text-xs mt-2 list-disc list-inside space-y-1">
                    <li>Open any camera app on your mobile device</li>
                    <li>Point the camera at the QR code</li>
                    <li>Tap the notification/link that appears</li>
                    <li>Follow prompts to create a new notebook</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
              <p>
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Local QR Scanner (Testing)</h2>
          <div className="space-x-2 mb-4">
            <button
              onClick={startCamera}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Start Camera
            </button>
            <button
              onClick={stopCamera}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Stop Camera
            </button>
          </div>
          <div className="relative">
            <video ref={videoRef} className="w-full max-w-md mx-auto mb-4 rounded border-2 border-gray-300" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          {scanResult && <p className="text-center mt-2 p-2 bg-gray-100 rounded text-gray-700">{scanResult}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="">
      {(activeDropdown || showMainMenu) && <div className="fixed inset-0 z-10" onClick={handleOverlayClick} />}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center justify-between mb-4 md:mb-0">
          <h2 className="text-2xl font-bold text-gray-800">{getHeaderTitle()}</h2>
          <div className="relative">
            <button
              onClick={handleMainMenuClick}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiMoreVertical size={20} />
            </button>
            {showMainMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <button
                  onClick={handlePublicBooksClick}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <FiUnlock className="mr-3 text-green-600" size={16} />
                  <span className="text-gray-700">Public Books</span>
                </button>
                <button
                  onClick={handlePrivateBooksClick}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <FiLock className="mr-3 text-red-600" size={16} />
                  <span className="text-gray-700">Private Books</span>
                </button>
                <button
                  onClick={handleViewFoldersClick}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors rounded-b-lg"
                >
                  <FiShield className="mr-3 text-green-600" size={16} />
                  <span className="text-gray-700">View Folders</span>
                </button>
                <button
                  onClick={handleSharedBooksClick}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors rounded-b-lg"
                >
                  <FiBookOpen className="mr-3 text-green-600" size={16} />
                  <span className="text-gray-700">Shared Books</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search notebooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleDashboardScan}
              className="flex items-center justify-center bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition duration-150 w-full sm:w-64"
            >
              <FiCamera className="mr-2" />
              <span className="hidden sm:inline">Scan QR Code</span>
              <span className="sm:hidden">Scan QR Code</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 border rounded-lg transition-colors ${viewMode === "grid" ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-white text-gray-600 border-gray-300"}`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 border rounded-lg transition-colors ${viewMode === "list" ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-white text-gray-600 border-gray-300"}`}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading notebooks...</p>
        </div>
      )}

      {!loading && filteredNotebooks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <FiBook className="text-gray-400 text-5xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {currentFilter === "all"
              ? "No Notebooks Found"
              : currentFilter === "private"
                ? "No Private Notebooks Found"
                : "No Public Notebooks Found"}
          </h3>
          <p className="text-gray-600 mb-6">
            {currentFilter === "all"
              ? "You don't have any notebooks yet. Scan a QR code to get started."
              : currentFilter === "private"
                ? "You don't have any private notebooks yet."
                : "You don't have any public notebooks yet."}
          </p>
          <button
            onClick={handleDashboardScan}
            className="inline-flex items-center justify-center bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition duration-150"
          >
            <FiCamera className="mr-2" />
            Scan QR Code
          </button>
        </div>
      ) : !loading && viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotebooks.map((notebook) => (
            <div
              key={notebook.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-150 cursor-pointer relative"
              onClick={() => onNotebookSelect(notebook)}
            >
              <div className="h-40 overflow-hidden">
                <img
                  src={notebook.coverImage || "/api/placeholder/400/200"}
                  alt={notebook.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 flex-1 truncate">{notebook.title}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleLockIconClick(e, notebook)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      {notebook.isPublic ? (
                        <FiUnlock className="text-green-500" title="Public" />
                      ) : (
                        <FiLock className="text-red-500" title="Protected" />
                      )}
                    </button>

                    <div className="relative">
                      <button
                        onClick={(e) => handleNotebookMenuClick(e, notebook.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <FiMoreVertical size={16} />
                      </button>
                      {activeDropdown === notebook.id && (
                        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-30">
                          <button
                            onClick={(e) => handleShareClick(e, notebook)}
                            className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                          >
                            <FiShare2 className="mr-2 text-blue-600" size={14} />
                            <span className="text-sm text-gray-700">Share</span>
                          </button>

                          {!notebook.isPublic && notebook.pin && (
                            <button
                              onClick={(e) => handleShowPinClick(e, notebook)}
                              className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                            >
                              <FiEye className="mr-2 text-green-600" size={14} />
                              <span className="text-sm text-gray-700">Show 4-digit Code</span>
                            </button>
                          )}

                          <button
                            onClick={(e) => handleDeleteClick(e, notebook)}
                            className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors rounded-b-lg"
                          >
                            <FiTrash2 className="mr-2 text-red-600" size={14} />
                            <span className="text-sm text-gray-700">Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span className="mr-4">{notebook.totalPages} pages</span>
                  <span>Last updated: {new Date(notebook.lastUpdated).toLocaleDateString()}</span>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex">
                    <button onClick={(e) => handleQRClick(e, notebook)} className="hover:opacity-80 transition-opacity">
                      <img
                        src={notebook.qrCode || "/api/placeholder/40/40"}
                        alt="QR Code"
                        className="w-10 h-10 border border-gray-200 rounded"
                        onError={(e) => {
                          // Fallback to placeholder if QR code image fails to load
                          e.target.src = "/api/placeholder/40/40"
                        }}
                      />
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onNotebookSelect(notebook)
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="space-y-2">
            {filteredNotebooks.map((notebook) => (
              <div
                key={notebook.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:bg-gray-50 transition duration-150 cursor-pointer flex relative"
                onClick={() => onNotebookSelect(notebook)}
              >
                <div className="w-16 h-16 overflow-hidden">
                  <img
                    src={notebook.coverImage || "/api/placeholder/64/64"}
                    alt={notebook.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800 flex items-center flex-1 truncate">
                      {notebook.title}
                      <button
                        onClick={(e) => handleLockIconClick(e, notebook)}
                        className="p-1 ml-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                      >
                        {notebook.isPublic ? (
                          <FiUnlock className="text-green-500" size={14} />
                        ) : (
                          <FiLock className="text-red-500" size={14} />
                        )}
                      </button>
                    </h3>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleQRClick(e, notebook)}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={notebook.qrCode || "/api/placeholder/24/24"}
                          alt="QR Code"
                          className="w-6 h-6 border border-gray-200 rounded"
                          onError={(e) => {
                            // Fallback to placeholder if QR code image fails to load
                            e.target.src = "/api/placeholder/24/24"
                          }}
                        />
                      </button>

                      <div className="relative">
                        <button
                          onClick={(e) => handleNotebookMenuClick(e, notebook.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <FiMoreVertical size={16} />
                        </button>

                        {activeDropdown === notebook.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-30">
                            <button
                              onClick={(e) => handleShareClick(e, notebook)}
                              className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                            >
                              <FiShare2 className="mr-2 text-blue-600" size={14} />
                              <span className="text-sm text-gray-700">Share</span>
                            </button>

                            {!notebook.isPublic && notebook.pin && (
                              <button
                                onClick={(e) => handleShowPinClick(e, notebook)}
                                className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                              >
                                <FiEye className="mr-2 text-green-600" size={14} />
                                <span className="text-sm text-gray-700">Show 4-digit Code</span>
                              </button>
                            )}

                            <button
                              onClick={(e) => handleDeleteClick(e, notebook)}
                              className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors rounded-b-lg"
                            >
                              <FiTrash2 className="mr-2 text-red-600" size={14} />
                              <span className="text-sm text-gray-700">Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {notebook.totalPages} pages • Last updated: {new Date(notebook.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {showCreateBookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Notebook</h3>
            <p className="text-sm text-gray-600 mb-4">QR Code scanned! Enter a name for your new notebook.</p>
            <input
              type="text"
              value={newBookName}
              onChange={(e) => setNewBookName(e.target.value)}
              placeholder="Enter notebook name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
              autoFocus
            />
            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateBookModal(false)
                  setNewBookName("")
                  setError("")
                  setQrId(null)
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBook}
                disabled={loading || !newBookName.trim()}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create & View"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBookExistsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Already Exists</h3>
            <p className="text-sm text-gray-600 mb-4">
              A notebook is already associated with this QR code. You can view it in your dashboard.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowBookExistsModal(false)
                  setQrId(null)
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowBookExistsModal(false)
                  setQrId(null)
                }}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {showPinEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Set 4-Digit PIN</h3>
            <p className="text-gray-600 mb-4">
              Enter a 4-digit PIN to protect "{showPinEntry.title}" when making it private.
            </p>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6 text-center text-lg tracking-widest"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPinEntry(null)
                  setPinInput("")
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePinEntryConfirm}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Set PIN & Make Private
              </button>
            </div>
          </div>
        </div>
      )}

      {showSharePopup && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={handleCloseSharePopup}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 transform transition-transform duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Share Notebook</h3>
            </div>
            <div className="px-6 py-6">
              <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-xl">
                <img
                  src={showSharePopup.coverImage || "/api/placeholder/60/60"}
                  alt={showSharePopup.title}
                  className="w-12 h-12 rounded-lg object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{showSharePopup.title}</h4>
                  <p className="text-sm text-gray-500">{showSharePopup.totalPages} pages</p>
                </div>
              </div>
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
                    <img
                      src={showSharePopup.qrCode || "/api/placeholder/150/150"}
                      alt="QR Code"
                      className="w-32 h-32 mx-auto"
                      onError={(e) => {
                        // Fallback to placeholder if QR code image fails to load
                        e.target.src = "/api/placeholder/150/150"
                      }}
                    />
                  </div>
                  <button
                    onClick={() => handleDownloadQR(showSharePopup)}
                    className="absolute -right-2 -top-2 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                    title="Download QR Code"
                  >
                    <FiDownload size={16} />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-3">Scan QR code to access notebook</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
                <div className="flex items-center bg-gray-50 rounded-lg p-3">
                  <input
                    type="text"
                    value={`https://notebook.app/share/${showSharePopup.id}`}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                  />
                  <button
                    onClick={() => handleCopyLink(showSharePopup)}
                    className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {copySuccess ? <FiCheck size={16} /> : <FiCopy size={16} />}
                  </button>
                </div>
                {copySuccess && <p className="text-xs text-green-600 mt-1">Link copied to clipboard!</p>}
              </div>
              {!showSharePopup.isPublic && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start">
                    <FiLock className="text-amber-600 mt-0.5 mr-3 flex-shrink-0" size={16} />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Private Notebook</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Viewers will need the 4-digit PIN to access this notebook.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={handleCloseSharePopup}
                className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Notebook</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{showDeleteConfirm.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteNotebook(showDeleteConfirm.id)
                  setShowDeleteConfirm(null)
                }}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAccessToggleConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {showAccessToggleConfirm.isPublic ? "Make Private" : "Make Public"}
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to make "{showAccessToggleConfirm.title}"{" "}
              {showAccessToggleConfirm.isPublic ? "private" : "public"}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAccessToggleConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                No
              </button>
              <button
                onClick={handleAccessToggleConfirm}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">4-Digit Access Code</h3>
            <div className="text-3xl font-bold text-blue-600 mb-4 tracking-widest">{showPinModal.pin || "****"}</div>
            <p className="text-gray-600 mb-6 text-sm">
              Share this code with others to grant access to this private notebook.
            </p>
            <button
              onClick={() => setShowPinModal(null)}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function NotebookDetailView({
  notebook,
  onBack,
  onPageSelect,
  onToggleAccess,
  onUpdatePin,
  onDeletePage,
  onSharePage,
  onMovePage,
  onScan,
  onNotebookSelect,
}) {
  const [newPin, setNewPin] = useState("")
  const [showPinInput, setShowPinInput] = useState(false)
  const [viewMode, setViewMode] = useState("grid")
  const [activePageDropdown, setActivePageDropdown] = useState(null)
  const [showMovePageModal, setShowMovePageModal] = useState(null)
  const [moveToPageNumber, setMoveToPageNumber] = useState("")
  const [selectedTag, setSelectedTag] = useState("")
  const [showPageView, setShowPageView] = useState(false)
  const [selectedPage, setSelectedPage] = useState(null)
  const [showScanningOverlay, setShowScanningOverlay] = useState(false)
  const [showScanResult, setShowScanResult] = useState(null)
  const [error, setError] = useState("")
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    socketRef.current = io("http://localhost:5005", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current.on("connect", () => {
      console.log("WebSocket connected for NotebookDetailView:", socketRef.current.id)
    })

    socketRef.current.on("qrScanned", async (data) => {
      console.log("Received qrScanned event in NotebookDetailView:", data)
      setShowScanningOverlay(false)
      try {
        const response = await fetch(`http://localhost:5005/api/books/qr/${data.qrId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (response.ok) {
          const book = await response.json()
          if (book && book.id !== notebook.id) {
            setShowScanResult({
              qrId: data.qrId,
              message: "This QR code is associated with another notebook.",
              isExistingBook: true,
            })
          } else {
            const newPageNumber = (notebook?.pages?.length || 0) + 1
            setShowScanResult({
              qrId: data.qrId,
              pageNumber: newPageNumber,
              isExistingBook: false,
            })
          }
        } else {
          console.error("Failed to check book existence:", response.statusText)
          setError("Failed to verify QR code")
        }
      } catch (err) {
        console.error("Error checking book existence:", err)
        setError("Failed to verify QR code")
      }
    })

    socketRef.current.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err.message)
      setError("Failed to connect to server")
    })

    socketRef.current.on("disconnect", () => {
      console.log("WebSocket disconnected")
    })

    return () => {
      socketRef.current.disconnect()
      console.log("WebSocket cleanup for NotebookDetailView")
    }
  }, [notebook])

  const handlePinUpdate = () => {
    if (newPin.length === 4 && /^\d+$/.test(newPin)) {
      onUpdatePin(newPin)
      setNewPin("")
      setShowPinInput(false)
    } else {
      alert("PIN must be 4 digits")
    }
  }

  const handlePageMenuClick = (e, pageNumber) => {
    e.stopPropagation()
    setActivePageDropdown(activePageDropdown === pageNumber ? null : pageNumber)
  }

  const handleMovePageClick = (e, page) => {
    e.stopPropagation()
    setShowMovePageModal(page)
    setActivePageDropdown(null)
  }

  const handleDeletePageClick = (e, page) => {
    e.stopPropagation()
    if (window.confirm(`Are you sure you want to delete Page ${page.pageNumber}?`)) {
      onDeletePage(page.pageNumber)
    }
    setActivePageDropdown(null)
  }

  const handleSharePageClick = (e, page) => {
    e.stopPropagation()
    onSharePage(page)
    setActivePageDropdown(null)
  }

  const handleMovePageConfirm = () => {
    if (moveToPageNumber && !isNaN(moveToPageNumber) && moveToPageNumber > 0) {
      onMovePage(showMovePageModal.pageNumber, Number.parseInt(moveToPageNumber))
      setShowMovePageModal(null)
      setMoveToPageNumber("")
    } else {
      alert("Please enter a valid page number")
    }
  }

  const startCamera = async () => {
    try {
      console.log("Starting camera for page scan...")
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      videoRef.current.srcObject = stream
      videoRef.current.play()
      scanQRCode()
    } catch (err) {
      console.error("Camera access error:", err)
      setError("Failed to access camera")
    }
  }

  const scanQRCode = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext("2d")

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = 300
        canvas.width = 300
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const qrData = context.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(qrData.data, qrData.width, qrData.height)
        if (code) {
          console.log("Scanned QR code:", code.data)
          socketRef.current.emit("qrScanned", { qrId: code.data.split("/").pop() })
          stopCamera()
        }
      }
      requestAnimationFrame(scan)
    }

    scan()
  }

  const stopCamera = () => {
    console.log("Stopping camera...")
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
    }
  }

  const handleNotebookDetailScan = () => {
    setShowScanningOverlay(true)
    setError("")
    startCamera()
  }

  const handleScanResultConfirm = async () => {
    if (showScanResult && !showScanResult.isExistingBook) {
      try {
        const newPage = {
          pageNumber: showScanResult.pageNumber,
          imageUrl: "/api/placeholder/400/160",
          tags: ["Scanned"],
          notes: "",
          lastUpdated: new Date(),
        }

        const updatedNotebook = {
          ...notebook,
          pages: [...(notebook?.pages || []), newPage],
          totalPages: (notebook?.totalPages || 0) + 1,
          lastUpdated: new Date(),
        }

        // Update backend
        const response = await fetch(`http://localhost:5005/api/books/${notebook.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedNotebook),
        })

        if (!response.ok) {
          throw new Error("Failed to update notebook with new page")
        }

        setSelectedPage(newPage)
        setShowPageView(true)
        setShowScanResult(null)
        onPageSelect(newPage)

        // Notify parent component of updated notebook
        onNotebookSelect(updatedNotebook)
      } catch (err) {
        console.error("Error adding new page:", err)
        setError("Failed to add new page")
      }
    } else {
      setShowScanResult(null)
    }
  }

  const handleScanResultCancel = () => {
    setShowScanResult(null)
    setError("")
  }

  const handleOverlayClick = () => {
    setActivePageDropdown(null)
  }

  const uniqueTags = [...new Set(notebook?.pages?.flatMap((page) => page.tags) || [])]

  const filteredPages = selectedTag
    ? notebook?.pages?.filter((page) => page.tags.includes(selectedTag)) || []
    : notebook?.pages || []

  return (
    <div className="relative max-w-4xl mx-auto px-4 py-6 bg-gray-50 min-h-screen">
      {activePageDropdown && <div className="fixed inset-0 z-10" onClick={handleOverlayClick} />}
      <button onClick={onBack} className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="h-48 overflow-hidden relative">
          <img
            src={notebook?.coverImage || "/api/placeholder/400/192"}
            alt={notebook?.title || "Notebook Cover"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-2">{notebook?.title || "Untitled Notebook"}</h2>
              <div className="flex items-center text-white/80 text-sm">
                <span className="mr-4">{notebook?.totalPages || 0} pages</span>
                <span>Last updated: {new Date(notebook?.lastUpdated || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">Access:</span>
              <button
                onClick={onToggleAccess}
                className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
                  notebook?.isPublic
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-red-100 text-red-800 hover:bg-red-200"
                }`}
              >
                {notebook?.isPublic ? (
                  <>
                    <FiUnlock className="mr-1" />
                    Public
                  </>
                ) : (
                  <>
                    <FiLock className="mr-1" />
                    Protected
                  </>
                )}
              </button>
            </div>

            {!notebook?.isPublic && (
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">PIN:</span>
                {showPinInput ? (
                  <div className="flex items-center">
                    <input
                      type="password"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      maxLength={4}
                      placeholder="4-digit PIN"
                      className="w-24 px-2 py-1 border border-gray-300 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={handlePinUpdate} className="text-blue-600 hover:text-blue-800">
                      <FiCheck />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowPinInput(true)} className="text-blue-600 hover:text-blue-800 text-sm">
                    {notebook?.pin ? "Change PIN" : "Set PIN"}
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center ml-auto gap-2">
              <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm">
                <FiShare2 className="mr-1" size={14} />
                Share
              </button>
              <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm">
                <FiEdit className="mr-1" size={14} />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleNotebookDetailScan}
        className="w-full flex items-center justify-center bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition duration-150 mb-6"
      >
        <FiCamera className="mr-2" size={18} />
        <span className="font-medium">Scan QR Code to Add Page</span>
      </button>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 flex items-center justify-center transition-colors ${
                viewMode === "grid" ? "bg-blue-100 text-blue-700" : "bg-white text-gray-600"
              }`}
            >
              <FiGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 flex items-center justify-center transition-colors ${
                viewMode === "list" ? "bg-blue-100 text-blue-700" : "bg-white text-gray-600"
              }`}
            >
              <FiList size={16} />
            </button>
          </div>

          <div className="flex-1 relative">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 appearance-none cursor-pointer"
            >
              <option value="">All Tags</option>
              {uniqueTags.map((tag, index) => (
                <option key={index} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {selectedTag && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                Filtered by tag: <span className="font-medium">{selectedTag}</span>
              </span>
              <button
                onClick={() => setSelectedTag("")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear filter
              </button>
            </div>
          </div>
        )}
      </div>

      <h3 className="text-xl font-semibold text-gray-800 mb-4">Pages ({filteredPages.length})</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          <p>
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {filteredPages.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <FiBookOpen className="text-gray-400 text-5xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Pages Found</h3>
          <p className="text-gray-600 mb-6">
            {selectedTag
              ? `No pages found with the tag "${selectedTag}".`
              : "This notebook doesn't have any pages yet. Scan a QR code to add a new page."}
          </p>
          <button
            onClick={handleNotebookDetailScan}
            className="inline-flex items-center justify-center bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition duration-150"
          >
            <FiCamera className="mr-2" />
            Scan QR Code
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => (
            <div
              key={page.pageNumber}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-150 cursor-pointer relative"
              onClick={() => {
                setSelectedPage(page)
                setShowPageView(true)
                onPageSelect(page)
              }}
            >
              <div className="h-40 overflow-hidden">
                <img
                  src={page.imageUrl || "/api/placeholder/400/160"}
                  alt={`Page ${page.pageNumber}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-gray-800">Page {page.pageNumber}</h4>
                  <div className="relative">
                    <button
                      onClick={(e) => handlePageMenuClick(e, page.pageNumber)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <FiMoreVertical size={16} />
                    </button>
                    {activePageDropdown === page.pageNumber && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-30">
                        <button
                          onClick={(e) => handleSharePageClick(e, page)}
                          className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <FiShare2 className="mr-2 text-blue-600" size={14} />
                          <span className="text-sm text-gray-700">Share Page</span>
                        </button>
                        <button
                          onClick={(e) => handleMovePageClick(e, page)}
                          className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <FiBook className="mr-2 text-blue-600" size={14} />
                          <span className="text-sm text-gray-700">Move Page</span>
                        </button>
                        <button
                          onClick={(e) => handleDeletePageClick(e, page)}
                          className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors rounded-b-lg"
                        >
                          <FiTrash2 className="mr-2 text-red-600" size={14} />
                          <span className="text-sm text-gray-700">Delete Page</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-3">
                  <span className="mr-4">{page.tags.join(", ") || "No tags"}</span>
                  <span>Last updated: {new Date(page.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPages.map((page) => (
            <div
              key={page.pageNumber}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:bg-gray-50 transition duration-150 cursor-pointer flex relative"
              onClick={() => {
                setSelectedPage(page)
                setShowPageView(true)
                onPageSelect(page)
              }}
            >
              <div className="w-16 h-16 overflow-hidden">
                <img
                  src={page.imageUrl || "/api/placeholder/64/64"}
                  alt={`Page ${page.pageNumber}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 p-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-800">Page {page.pageNumber}</h4>
                  <div className="relative">
                    <button
                      onClick={(e) => handlePageMenuClick(e, page.pageNumber)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <FiMoreVertical size={16} />
                    </button>
                    {activePageDropdown === page.pageNumber && (
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-30">
                        <button
                          onClick={(e) => handleSharePageClick(e, page)}
                          className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <FiShare2 className="mr-2 text-blue-600" size={14} />
                          <span className="text-sm text-gray-700">Share Page</span>
                        </button>
                        <button
                          onClick={(e) => handleMovePageClick(e, page)}
                          className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <FiBook className="mr-2 text-blue-600" size={14} />
                          <span className="text-sm text-gray-700">Move Page</span>
                        </button>
                        <button
                          onClick={(e) => handleDeletePageClick(e, page)}
                          className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors rounded-b-lg"
                        >
                          <FiTrash2 className="mr-2 text-red-600" size={14} />
                          <span className="text-sm text-gray-700">Delete Page</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {page.tags.join(", ") || "No tags"} • Last updated: {new Date(page.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showMovePageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Move Page</h3>
            <p className="text-gray-600 mb-4">
              Move page {showMovePageModal.pageNumber} to a new position in "{notebook.title}".
            </p>
            <input
              type="number"
              value={moveToPageNumber}
              onChange={(e) => setMoveToPageNumber(e.target.value)}
              placeholder="Enter new page number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMovePageModal(null)
                  setMoveToPageNumber("")
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMovePageConfirm}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Move
              </button>
            </div>
          </div>
        </div>
      )}

      {showScanningOverlay && (
        <ScanningOverlay
          onClose={() => {
            setShowScanningOverlay(false)
            stopCamera()
          }}
        />
      )}

      {showScanResult && (
        <ScanResultModal
          result={showScanResult}
          onConfirm={handleScanResultConfirm}
          onCancel={handleScanResultCancel}
        />
      )}

      {showPageView && selectedPage && (
        <PageView
          notebook={notebook}
          page={selectedPage}
          onBack={() => setShowPageView(false)}
          onAddTag={(tag) => {
            const updatedPage = { ...selectedPage, tags: [...selectedPage.tags, tag] }
            setSelectedPage(updatedPage)
            onPageSelect(updatedPage)
          }}
          onAddNote={(note) => {
            const updatedPage = { ...selectedPage, notes: note }
            setSelectedPage(updatedPage)
            onPageSelect(updatedPage)
          }}
        />
      )}
    </div>
  )
}
