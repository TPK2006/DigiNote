  "use client"

  import { useState } from "react"
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
    FiDownload, FiBookOpen
  } from "react-icons/fi"
  import { FoldersView } from "./FoldersView" // Import the FoldersView component
  import { ScanningOverlay, ScanResultModal } from "./modal-components"
  import { PageView } from "./PageView" // Added PageView import
  import { SharedBooksView } from "./SharedBooksView" // Added SharedBooksView import

  // Enhanced DashboardView component with folders integration and share popup
  export function DashboardView({
    notebooks,
    onNotebookSelect,
    onScan,
    searchQuery,
    setSearchQuery,
    onDeleteNotebook,
    onToggleNotebookAccess,
    onShareNotebook,
  }) {
    const [viewMode, setViewMode] = useState("grid") // "grid" or "list"
    const [activeDropdown, setActiveDropdown] = useState(null)
    const [showMainMenu, setShowMainMenu] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
    const [showAccessToggleConfirm, setShowAccessToggleConfirm] = useState(null)
    const [showPinModal, setShowPinModal] = useState(null)
    const [showFoldersView, setShowFoldersView] = useState(false)
    const [showSharePopup, setShowSharePopup] = useState(null) // New state for share popup
    const [copySuccess, setCopySuccess] = useState(false) // State for copy feedback
    const [showPinEntry, setShowPinEntry] = useState(null) // New state for PIN entry
    const [pinInput, setPinInput] = useState("") // New state for PIN input
    const [showSharedBooksView, setShowSharedBooksView] = useState(false) // New state for SharedBooksView

    // New state for filtering
    const [currentFilter, setCurrentFilter] = useState("all") // "all", "private", "public"

    const [showScanningOverlay, setShowScanningOverlay] = useState(false)
    const [showScanResult, setShowScanResult] = useState(null)
    const [showCreateBookModal, setShowCreateBookModal] = useState(false)
    const [newBookName, setNewBookName] = useState("")

    // Folders management functions
    const handleCreateFolder = (folderName) => {
      console.log("Creating folder:", folderName)
      // Implement folder creation logic here
    }

    const handleDeleteFolder = (folder) => {
      console.log("Deleting folder:", folder)
      // Implement folder deletion logic here
    }

    const handleShareFolder = (folder) => {
      console.log("Sharing folder:", folder)
      // Implement folder sharing logic here
    }

    const handleMoveFolder = (sourceFolder, targetFolder) => {
      console.log("Moving folder:", sourceFolder, "to:", targetFolder)
      // Implement folder moving logic here
    }

    // Handle three dots click for individual notebooks
    const handleNotebookMenuClick = (e, notebookId) => {
      e.stopPropagation()
      setActiveDropdown(activeDropdown === notebookId ? null : notebookId)
    }

    // Handle main menu three dots click
    const handleMainMenuClick = () => {
      setShowMainMenu(!showMainMenu)
    }

    // Handle View Folders click
    const handleViewFoldersClick = () => {
      setShowFoldersView(true)
      setShowMainMenu(false)
    }

     // Handle shared books click
  const handleSharedBooksClick = () => {
    setShowSharedBooksView(true)
    setShowMainMenu(false)
  }


    // Handle filter clicks
    const handlePrivateBooksClick = () => {
      setCurrentFilter("private")
      setShowMainMenu(false)
    }

    const handlePublicBooksClick = () => {
      setCurrentFilter("public")
      setShowMainMenu(false)
    }

    // Handle breadcrumb navigation
    const handleBreadcrumbClick = (filter) => {
      setCurrentFilter(filter)
    }

    // Handle delete confirmation
    const handleDeleteClick = (e, notebook) => {
      e.stopPropagation()
      setShowDeleteConfirm(notebook)
      setActiveDropdown(null)
    }

    // Handle access toggle confirmation - Updated to show confirmation first
    const handleAccessToggleClick = (e, notebook) => {
      e.stopPropagation()
      setShowAccessToggleConfirm(notebook)
      setActiveDropdown(null)
    }

    // Handle lock icon click - Updated to show confirmation first
    const handleLockIconClick = (e, notebook) => {
      e.stopPropagation()
      setShowAccessToggleConfirm(notebook)
    }

    // Handle access toggle confirmation from modal
    const handleAccessToggleConfirm = () => {
      // If making public to private, show PIN entry
      if (showAccessToggleConfirm.isPublic) {
        setShowPinEntry(showAccessToggleConfirm)
        setShowAccessToggleConfirm(null)
      } else {
        // If making private to public, just toggle
        onToggleNotebookAccess(showAccessToggleConfirm.id)
        setShowAccessToggleConfirm(null)
      }
    }

    // Handle dashboard QR scan
    const handleDashboardScan = () => {
      setShowScanningOverlay(true)
      // Simulate scanning delay
      setTimeout(() => {
        setShowScanningOverlay(false)
        setShowCreateBookModal(true)
      }, 3000)
    }

    // Handle create book
    const handleCreateBook = () => {
      if (newBookName.trim()) {
        // Create new book and redirect to detail view
        const newBook = {
          id: Date.now(),
          title: newBookName.trim(),
          isPublic: true,
          pages: [],
          totalPages: 0,
          lastUpdated: new Date(),
          coverImage: "/api/placeholder/400/200",
          qrCode: "/api/placeholder/40/40",
        }
        onNotebookSelect(newBook)
        setShowCreateBookModal(false)
        setNewBookName("")
      }
    }

    // Handle PIN entry confirmation
    const handlePinEntryConfirm = () => {
      if (pinInput.length === 4 && /^\d+$/.test(pinInput)) {
        // Set the PIN and toggle access
        onToggleNotebookAccess(showPinEntry.id, pinInput)
        setShowPinEntry(null)
        setPinInput("")
      } else {
        alert("PIN must be exactly 4 digits")
      }
    }

    // Handle show pin click - Fixed to show popup properly
    const handleShowPinClick = (e, notebook) => {
      e.stopPropagation()
      setShowPinModal(notebook)
      setActiveDropdown(null)
    }

    // Handle share click - Fixed to show share popup from bottom
    const handleShareClick = (e, notebook) => {
      e.stopPropagation()
      setShowSharePopup(notebook)
      setActiveDropdown(null)
    }

    // Handle QR code click - New function
    const handleQRClick = (e, notebook) => {
      e.stopPropagation()
      setShowSharePopup(notebook)
    }

    // Handle copy link
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

    // Handle download QR
    const handleDownloadQR = (notebook) => {
      // Create a download link for the QR code
      const link = document.createElement("a")
      link.href = notebook.qrCode || "/api/placeholder/200/200"
      link.download = `${notebook.title}-qr-code.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    // Handle share via email
    const handleShareEmail = (notebook) => {
      const shareUrl = `https://notebook.app/share/${notebook.id}`
      const subject = `Check out my notebook: ${notebook.title}`
      const body = `I'd like to share my notebook "${notebook.title}" with you. You can view it here: ${shareUrl}`
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }

    // Handle share via SMS
    const handleShareSMS = (notebook) => {
      const shareUrl = `https://notebook.app/share/${notebook.id}`
      const message = `Check out my notebook "${notebook.title}": ${shareUrl}`
      window.location.href = `sms:?body=${encodeURIComponent(message)}`
    }

    // Close all dropdowns when clicking outside
    const handleOverlayClick = () => {
      setActiveDropdown(null)
      setShowMainMenu(false)
    }

    // Close share popup
    const handleCloseSharePopup = () => {
      setShowSharePopup(null)
      setCopySuccess(false)
    }

    // Filter notebooks based on current filter
    const filteredNotebooks = notebooks.filter((notebook) => {
      if (currentFilter === "private") {
        return !notebook.isPublic
      } else if (currentFilter === "public") {
        return notebook.isPublic
      }
      return true // "all" filter
    })

    // Get header title with breadcrumb navigation
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

    // If folders view is active, render FoldersView component
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

     // If shared books view is active, render SharedBooksView
  if (showSharedBooksView) {
    return (
      <SharedBooksView
        onBack={() => setShowSharedBooksView(false)}
        onShareUser={(user) => console.log("Sharing with user:", user)}
        onRemoveUser={(user) => console.log("Removing user:", user)}
      />
    )
  }

    return (
      <div className="relative">
        {/* Overlay for closing dropdowns */}
        {(activeDropdown || showMainMenu) && <div className="fixed inset-0 z-10" onClick={handleOverlayClick} />}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center justify-between mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-gray-800">{getHeaderTitle()}</h2>

            {/* Main Menu Three Dots */}
            <div className="relative">
              <button
                onClick={handleMainMenuClick}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiMoreVertical size={20} />
              </button>

              {/* Main Menu Dropdown */}
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

              <div className="flex gap-2 ">
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

        {filteredNotebooks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <FiBook className="text-gray-400 text-5xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">
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
              onClick={onScan}
              className="inline-flex items-center justify-center bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition duration-150"
            >
              <FiCamera className="mr-2" />
              Scan QR Code
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotebooks.map((notebook) => (
              <div
                key={notebook.id}
                className="bg-white rounded-lg shadow-md  hover:shadow-lg transition duration-150 cursor-pointer relative"
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
                  <div className="flex items-center justify-between  mb-2">
                    <h3 className="text-lg font-semibold text-gray-800  flex-1 truncate">{notebook.title}</h3>
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

                      {/* Three Dots Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => handleNotebookMenuClick(e, notebook.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <FiMoreVertical size={16} />
                        </button>
                        {/* Dropdown Menu */}
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
                        <img src={notebook.qrCode || "/api/placeholder/40/40"} alt="QR Code" className="w-10 h-10" />
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
                      <button onClick={(e) => handleQRClick(e, notebook)} className="hover:opacity-80 transition-opacity">
                        <img src={notebook.qrCode || "/api/placeholder/24/24"} alt="QR Code" className="w-6 h-6" />
                      </button>

                      {/* Three Dots Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => handleNotebookMenuClick(e, notebook.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <FiMoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
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
        )}

        {/* PIN Entry Modal - New modal for entering 4-digit PIN when making private */}
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

        {/* Share Popup - Updated with Download Icon */}
        {showSharePopup && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
              onClick={handleCloseSharePopup}
            />

            {/* Popup */}
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 transform transition-transform duration-300 max-h-[90vh] overflow-y-auto">
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Share Notebook</h3>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {/* Notebook Info */}
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

                {/* QR Code Section with Download Icon */}
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <div className="p-4 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
                      <img
                        src={showSharePopup.qrCode || "/api/placeholder/150/150"}
                        alt="QR Code"
                        className="w-32 h-32 mx-auto"
                      />
                    </div>
                    {/* Download Icon positioned beside the QR code */}
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

                {/* Share Link */}
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

                {/* Access Info */}
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
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
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

        {/* Access Toggle Confirmation Modal */}
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

        {/* Scanning Overlay */}
        {showScanningOverlay && <ScanningOverlay onClose={() => setShowScanningOverlay(false)} />}

        {/* Create Book Modal */}
        {showCreateBookModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Notebook</h3>
              <input
                type="text"
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                placeholder="Enter notebook name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateBookModal(false)
                    setNewBookName("")
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBook}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create & View
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Enhanced NotebookDetailView component with requested modifications
  export function NotebookDetailView({
    notebook,
    onBack,
    onPageSelect,
    onToggleAccess,
    onUpdatePin,
    onDeletePage,
    onSharePage,
    onMovePage,
    onScan, // Added onScan prop
  }) {
    const [newPin, setNewPin] = useState("")
    const [showPinInput, setShowPinInput] = useState(false)
    const [viewMode, setViewMode] = useState("grid") // "grid" or "list"
    const [activePageDropdown, setActivePageDropdown] = useState(null)
    const [showMovePageModal, setShowMovePageModal] = useState(null)
    const [moveToPageNumber, setMoveToPageNumber] = useState("")
    const [selectedTitle, setSelectedTitle] = useState("")
    const [showPageView, setShowPageView] = useState(false)
    const [selectedPage, setSelectedPage] = useState(null)

    // Added scanning states for NotebookDetailView
    const [showScanningOverlay, setShowScanningOverlay] = useState(false)
    const [showScanResult, setShowScanResult] = useState(null)

    const handlePinUpdate = () => {
      if (newPin.length === 4 && /^\d+$/.test(newPin)) {
        onUpdatePin(newPin)
        setNewPin("")
        setShowPinInput(false)
      } else {
        alert("PIN must be 4 digits")
      }
    }

    // Handle page menu click
    const handlePageMenuClick = (e, pageId) => {
      e.stopPropagation()
      setActivePageDropdown(activePageDropdown === pageId ? null : pageId)
    }

    // Handle move page click
    const handleMovePageClick = (e, page) => {
      e.stopPropagation()
      setShowMovePageModal(page)
      setActivePageDropdown(null)
    }

    // Handle delete page click
    const handleDeletePageClick = (e, page) => {
      e.stopPropagation()
      onDeletePage(page.id)
      setActivePageDropdown(null)
    }

    // Handle share page click
    const handleSharePageClick = (e, page) => {
      e.stopPropagation()
      onSharePage(page)
      setActivePageDropdown(null)
    }

    // Handle move page confirmation
    const handleMovePageConfirm = () => {
      if (moveToPageNumber && !isNaN(moveToPageNumber)) {
        onMovePage(showMovePageModal.id, Number.parseInt(moveToPageNumber))
        setShowMovePageModal(null)
        setMoveToPageNumber("")
      } else {
        alert("Please enter a valid page number")
      }
    }

    // Handle QR scan in NotebookDetailView
    const handleNotebookDetailScan = () => {
      setShowScanningOverlay(true)
      // Simulate scanning delay
      setTimeout(() => {
        setShowScanningOverlay(false)
        // Simulate successful scan result
        const mockResult = {
          pageNumber: Math.floor(Math.random() * 10) + 1,
        }
        setShowScanResult(mockResult)
      }, 3000)
    }

    // Handle scan result confirmation
    const handleScanResultConfirm = () => {
      if (showScanResult) {
        // Create a mock page object and show it
        const mockPage = {
          id: Date.now(),
          pageNumber: showScanResult.pageNumber,
          imageUrl: "/api/placeholder/400/160",
          tags: ["Scanned"],
          lastUpdated: new Date(),
        }
        setSelectedPage(mockPage)
        setShowPageView(true)
        setShowScanResult(null)
      }
    }

    // Handle scan result cancel
    const handleScanResultCancel = () => {
      setShowScanResult(null)
    }

    // Close all dropdowns when clicking outside
    const handleOverlayClick = () => {
      setActivePageDropdown(null)
    }

    // Get unique titles for dropdown
    const uniqueTitles = [...new Set(notebook?.pages?.flatMap((page) => page.tags) || [])]

    // Filter pages based on selected title
    const filteredPages = selectedTitle
      ? notebook?.pages?.filter((page) => page.tags.includes(selectedTitle)) || []
      : notebook?.pages || []

    return (
      <div className="relative max-w-lg mx-auto px-4 py-6 bg-gray-50 min-h-screen">
        {/* Overlay for closing dropdowns */}
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
              alt={notebook?.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-2">{notebook?.title}</h2>
                <div className="flex items-center text-white/80 text-sm">
                  <span className="mr-4">{notebook?.totalPages} pages</span>
                  <span>Last updated: {new Date(notebook?.lastUpdated).toLocaleDateString()}</span>
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
                        onChange={(e) => setNewPin(e.target.value)}
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

        {/* Full-width Scan QR Code Button - Updated to use handleNotebookDetailScan */}
        <button
          onClick={handleNotebookDetailScan}
          className="w-full flex items-center justify-center bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition duration-150 mb-6"
        >
          <FiCamera className="mr-2" size={18} />
          <span className="font-medium">Scan QR Code</span>
        </button>

        {/* View Toggle and Title Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-blue-100 text-blue-700" : "bg-white text-gray-600"}`}
              >
                <FiGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-blue-100 text-blue-700" : "bg-white text-gray-600"}`}
              >
                <FiList size={16} />
              </button>
            </div>

            <div className="flex-1 relative">
              <select
                value={selectedTitle}
                onChange={(e) => setSelectedTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 appearance-none cursor-pointer"
              >
                <option value="" className="text-gray-500">
                  Select tag
                </option>
                {uniqueTitles.map((title, index) => (
                  <option key={index} value={title} className="text-gray-700">
                    {title}
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

          {/* Enhanced Tag Filter Display */}
          {selectedTitle && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">
                  Filtered by tag: <span className="font-medium">{selectedTitle}</span>
                </span>
                <button
                  onClick={() => setSelectedTitle("")}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear filter
                </button>
              </div>
            </div>
          )}
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-4">Pages ({notebook?.pages?.length || 0})</h3>

        {filteredPages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <FiBook className="text-gray-400 text-5xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No Pages Found</h3>
            <p className="text-gray-600 mb-6">No pages match your search criteria.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredPages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-lg shadow overflow-hidden cursor-pointer hover:shadow-md transition duration-150 relative"
                onClick={() => {
                  setSelectedPage(page)
                  setShowPageView(true)
                }}
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={page.imageUrl || "/api/placeholder/400/160"}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">Page {page.pageNumber}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{new Date(page.lastUpdated).toLocaleDateString()}</span>

                      {/* Three Dots Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => handlePageMenuClick(e, page.id)}
                          className="text-gray-400 p-1 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <FiMoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {activePageDropdown === page.id && (
                          <div
                            className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] min-w-[144px]"
                            style={{
                              top: `${typeof window !== "undefined" ? window.scrollY + 200 : 200}px`,
                              right: "20px",
                            }}
                          >
                            <button
                              onClick={(e) => handleMovePageClick(e, page)}
                              className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 rounded-t-lg"
                            >
                              <svg
                                className="mr-2 w-4 h-4 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                />
                              </svg>
                              <span className="text-sm text-gray-700">Move to</span>
                            </button>

                            <button
                              onClick={(e) => handleSharePageClick(e, page)}
                              className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                            >
                              <FiShare2 className="mr-2 text-green-600" size={14} />
                              <span className="text-sm text-gray-700">Share</span>
                            </button>

                            <button
                              onClick={(e) => handleDeletePageClick(e, page)}
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

                  {page.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {page.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:bg-gray-50 transition duration-150 cursor-pointer relative"
                onClick={() => {
                  setSelectedPage(page)
                  setShowPageView(true)
                }}
              >
                <div className="flex items-center p-3">
                  <div className="w-10 h-10 rounded overflow-hidden mr-3">
                    <img
                      src={page.imageUrl || "/api/placeholder/40/40"}
                      alt={`Page ${page.pageNumber}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium text-gray-800">Page {page.pageNumber}</h3>
                    </div>
                    {page.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {page.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                        {page.tags.length > 2 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs">
                            +{page.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Three Dots Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => handlePageMenuClick(e, page.id)}
                      className="text-gray-400 p-1 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <FiMoreVertical size={16} />
                    </button>

                    {/* Dropdown Menu */}
                    {activePageDropdown === page.id && (
                      <div
                        className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] min-w-[144px]"
                        style={{
                          top: `${typeof window !== "undefined" ? window.scrollY + 200 : 200}px`,
                          right: "20px",
                        }}
                      >
                        <button
                          onClick={(e) => handleMovePageClick(e, page)}
                          className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 rounded-t-lg"
                        >
                          <svg
                            className="mr-2 w-4 h-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                          </svg>
                          <span className="text-sm text-gray-700">Move to</span>
                        </button>

                        <button
                          onClick={(e) => handleSharePageClick(e, page)}
                          className="w-full flex items-center px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                        >
                          <FiShare2 className="mr-2 text-green-600" size={14} />
                          <span className="text-sm text-gray-700">Share</span>
                        </button>

                        <button
                          onClick={(e) => handleDeletePageClick(e, page)}
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
            ))}
          </div>
        )}

        {/* PageView Component - Added from duplicate file */}
        {showPageView && (
          <PageView
            notebook={notebook}
            currentPage={selectedPage}
            onBack={() => setShowPageView(false)}
            onPageChange={setSelectedPage}
            onDeletePage={(page) => {
              onDeletePage(page.id)
              setShowPageView(false)
            }}
            onSharePage={onSharePage}
            onEditPage={(page) => {
              // Handle edit page functionality
              console.log("Edit page:", page)
            }}
          />
        )}

        {/* Move Page Modal */}
        {showMovePageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Move Page</h3>
              <p className="text-gray-600 mb-4">Enter page number to move after that page:</p>
              <input
                type="number"
                value={moveToPageNumber}
                onChange={(e) => setMoveToPageNumber(e.target.value)}
                placeholder="Page number"
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

        {/* Scanning Overlay for NotebookDetailView */}
        {showScanningOverlay && <ScanningOverlay onClose={() => setShowScanningOverlay(false)} />}

        {/* Scan Result Modal for NotebookDetailView */}
        {showScanResult && (
          <ScanResultModal
            result={showScanResult}
            onConfirm={handleScanResultConfirm}
            onCancel={handleScanResultCancel}
          />
        )}
      </div>
    )
  }
