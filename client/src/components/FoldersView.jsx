"use client"

import { useState } from "react"
import {
  FiArrowLeft,
  FiSearch,
  FiPlus,
  FiMoreVertical,
  FiShare2,
  FiTrash2,
  FiFolder,
  FiBook,
  FiChevronRight,
  FiBookOpen,
  FiLock,
  FiUnlock,
} from "react-icons/fi"

export function FoldersView({
  onBack,
  folders = [],
  notebooks = [],
  onCreateFolder,
  onDeleteFolder,
  onShareFolder,
  onMoveFolder,
  onCreateNotebook,
  onDeleteNotebook,
  onShareNotebook,
  onMoveNotebook,
  onAddExistingBook,
}) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSelectBookModal, setShowSelectBookModal] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [showMoveModal, setShowMoveModal] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [bookSearchQuery, setBookSearchQuery] = useState("")
  const [expandedFolders, setExpandedFolders] = useState(new Set())
  const [selectedMoveTarget, setSelectedMoveTarget] = useState(null)
  const [selectedBooks, setSelectedBooks] = useState(new Set())

  // Navigation state
  const [currentView, setCurrentView] = useState("all") // 'all', 'folder', 'nested'
  const [currentFolder, setCurrentFolder] = useState(null)
  const [currentNestedFolder, setCurrentNestedFolder] = useState(null)
  const [breadcrumb, setBreadcrumb] = useState([])

  // Updated sample folder structure with demo books and access control
  const sampleFolders = [
    {
      id: 1,
      name: "Mathematics",
      lastUpdated: "2024-01-15",
      notebookCount: 5,
      subfolders: [
        {
          id: 11,
          name: "Algebra",
          lastUpdated: "2024-01-12",
          notebookCount: 2,
          notebooks: [
            { id: 101, title: "Linear Equations", lastUpdated: "2024-01-10", isLocked: false },
            { id: 102, title: "Quadratic Functions", lastUpdated: "2024-01-12", isLocked: true },
          ],
        },
        {
          id: 12,
          name: "Geometry",
          lastUpdated: "2024-01-15",
          notebookCount: 3,
          notebooks: [
            { id: 103, title: "Triangles", lastUpdated: "2024-01-14", isLocked: false },
            { id: 104, title: "Circles", lastUpdated: "2024-01-15", isLocked: true },
            { id: 105, title: "Polygons", lastUpdated: "2024-01-13", isLocked: false },
          ],
        },
      ],
      notebooks: [
        { id: 106, title: "Advanced Calculus", lastUpdated: "2024-01-15", isLocked: true },
        { id: 107, title: "Statistics Basics", lastUpdated: "2024-01-14", isLocked: false },
      ],
    },
    {
      id: 2,
      name: "Physics",
      lastUpdated: "2024-01-20",
      notebookCount: 3,
      subfolders: [
        {
          id: 21,
          name: "Mechanics",
          lastUpdated: "2024-01-18",
          notebookCount: 2,
          notebooks: [
            { id: 201, title: "Newton's Laws", lastUpdated: "2024-01-16", isLocked: false },
            { id: 202, title: "Energy", lastUpdated: "2024-01-18", isLocked: true },
          ],
        },
      ],
      notebooks: [{ id: 203, title: "Quantum Physics", lastUpdated: "2024-01-20", isLocked: true }],
    },
    {
      id: 3,
      name: "Chemistry",
      lastUpdated: "2024-01-10",
      notebookCount: 2,
      subfolders: [],
      notebooks: [
        { id: 301, title: "Organic Chemistry", lastUpdated: "2024-01-08", isLocked: false },
        { id: 302, title: "Inorganic Chemistry", lastUpdated: "2024-01-10", isLocked: true },
      ],
    },
  ]

  const allFolders = folders.length > 0 ? folders : sampleFolders

  // Get all books from all folders for the select modal
  const getAllBooks = () => {
    const books = []

    const extractBooks = (folders) => {
      folders.forEach((folder) => {
        // Add books from main folder
        if (folder.notebooks) {
          folder.notebooks.forEach((notebook) => {
            books.push({
              ...notebook,
              folderPath: folder.name,
            })
          })
        }

        // Add books from subfolders
        if (folder.subfolders) {
          folder.subfolders.forEach((subfolder) => {
            if (subfolder.notebooks) {
              subfolder.notebooks.forEach((notebook) => {
                books.push({
                  ...notebook,
                  folderPath: `${folder.name} / ${subfolder.name}`,
                })
              })
            }
          })
        }
      })
    }

    extractBooks(allFolders)
    return books
  }

  // Handle folder click to navigate into it
  const handleFolderClick = (folder, isNested = false) => {
    if (isNested) {
      setCurrentView("nested")
      setCurrentNestedFolder(folder)
      setBreadcrumb(["All Folders", currentFolder.name, folder.name])
    } else {
      setCurrentView("folder")
      setCurrentFolder(folder)
      setCurrentNestedFolder(null)
      setBreadcrumb(["All Folders", folder.name])
    }
  }

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index) => {
    if (index === 0) {
      // Navigate to All Folders
      setCurrentView("all")
      setCurrentFolder(null)
      setCurrentNestedFolder(null)
      setBreadcrumb([])
    } else if (index === 1 && currentView === "nested") {
      // Navigate back to main folder
      setCurrentView("folder")
      setCurrentNestedFolder(null)
      setBreadcrumb(["All Folders", currentFolder.name])
    }
  }

  // Handle folder creation
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder?.(newFolderName.trim())
      setNewFolderName("")
      setShowCreateModal(false)
    }
  }

  // Handle book selection
  const handleBookSelection = (bookId) => {
    const newSelected = new Set(selectedBooks)
    if (newSelected.has(bookId)) {
      newSelected.delete(bookId)
    } else {
      newSelected.add(bookId)
    }
    setSelectedBooks(newSelected)
  }

  // Handle adding selected books
  const handleAddSelectedBooks = () => {
    if (selectedBooks.size > 0) {
      const targetFolder = currentView === "nested" ? currentNestedFolder : currentFolder
      const booksToAdd = getAllBooks().filter((book) => selectedBooks.has(book.id))
      onAddExistingBook?.(booksToAdd, targetFolder)
      setSelectedBooks(new Set())
      setShowSelectBookModal(false)
    }
  }

  // Handle three dots menu
  const handleMenuClick = (e, itemId) => {
    e.stopPropagation()
    setActiveDropdown(activeDropdown === itemId ? null : itemId)
  }

  // Handle folder expansion
  const toggleFolderExpansion = (folderId) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  // Handle move modal
  const handleMoveClick = (e, item, isNotebook = false) => {
    e.stopPropagation()
    setShowMoveModal({ ...item, isNotebook })
    setActiveDropdown(null)
    setSelectedMoveTarget(null)
  }

  // Handle share click
  const handleShareClick = (e, item, isNotebook = false) => {
    e.stopPropagation()
    if (isNotebook) {
      onShareNotebook?.(item)
    } else {
      onShareFolder?.(item)
    }
    setActiveDropdown(null)
  }

  // Handle delete click
  const handleDeleteClick = (e, item, isNotebook = false) => {
    e.stopPropagation()
    if (isNotebook) {
      onDeleteNotebook?.(item)
    } else {
      onDeleteFolder?.(item)
    }
    setActiveDropdown(null)
  }

  // Handle move confirmation
  const handleMoveConfirm = () => {
    if (selectedMoveTarget && showMoveModal) {
      if (showMoveModal.isNotebook) {
        onMoveNotebook?.(showMoveModal, selectedMoveTarget)
      } else {
        onMoveFolder?.(showMoveModal, selectedMoveTarget)
      }
      setShowMoveModal(null)
      setSelectedMoveTarget(null)
    }
  }

  // Close dropdowns when clicking outside
  const handleOverlayClick = () => {
    setActiveDropdown(null)
  }

  // Render folder tree for move modal
  const renderFolderTree = (folders, level = 0, isNested = false) => {
    return folders.map((folder, index) => (
      <div key={folder.id} className={`${level > 0 ? "ml-4" : ""}`}>
        <div
          className={`flex items-center p-3 ${
            !isNested ? "border-b border-gray-100" : ""
          } ${selectedMoveTarget?.id === folder.id ? "bg-blue-50 border-blue-200" : ""}`}
        >
          <div className="flex items-center flex-1">
            <button
              onClick={() => toggleFolderExpansion(`move-${folder.id}`)}
              className="p-1 hover:bg-gray-200 rounded transition-colors mr-2"
            >
              <FiChevronRight
                size={12}
                className={`text-gray-700 transition-transform duration-200 ${
                  expandedFolders.has(`move-${folder.id}`) ? "rotate-90" : ""
                }`}
              />
            </button>

            <FiFolder className="text-blue-600 mr-2" size={16} />

            <div className="flex-1 cursor-pointer" onClick={() => toggleFolderExpansion(`move-${folder.id}`)}>
              <span className={`text-sm ${folder.id === showMoveModal?.id ? "text-gray-400" : "text-gray-800"}`}>
                {folder.name}
              </span>
              {folder.id === showMoveModal?.id && <span className="text-xs text-gray-400 ml-2">(current folder)</span>}
            </div>

            {folder.id !== showMoveModal?.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedMoveTarget(folder)
                }}
                className={`w-4 h-4 border-2 rounded-full transition-colors ${
                  selectedMoveTarget?.id === folder.id
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {selectedMoveTarget?.id === folder.id && (
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </button>
            )}
          </div>
        </div>

        {expandedFolders.has(`move-${folder.id}`) && (
          <div className="ml-8">
            {folder.subfolders?.map((subfolder, subIndex) => (
              <div key={`sub-${subfolder.id}`}>
                <div className="flex items-center p-3">
                  <button
                    onClick={() => toggleFolderExpansion(`move-sub-${subfolder.id}`)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors mr-2"
                  >
                    <FiChevronRight
                      size={12}
                      className={`text-gray-700 transition-transform duration-200 ${
                        expandedFolders.has(`move-sub-${subfolder.id}`) ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                  <FiFolder className="text-blue-600 mr-2" size={14} />
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => toggleFolderExpansion(`move-sub-${subfolder.id}`)}
                  >
                    <span
                      className={`text-sm ${subfolder.id === showMoveModal?.id ? "text-gray-400" : "text-gray-800"}`}
                    >
                      {subfolder.name}
                    </span>
                  </div>
                  {subfolder.id !== showMoveModal?.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMoveTarget(subfolder)
                      }}
                      className={`w-4 h-4 border-2 rounded-full transition-colors ${
                        selectedMoveTarget?.id === subfolder.id
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {selectedMoveTarget?.id === subfolder.id && (
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  )}
                </div>

                {expandedFolders.has(`move-sub-${subfolder.id}`) &&
                  subfolder.notebooks?.map((notebook, notebookIndex) => (
                    <div key={`sub-notebook-${notebook.id}`}>
                      <div className="flex items-center p-3 ml-8">
                        <div className="w-6 mr-2"></div>
                        <FiBook className="text-green-600 mr-2" size={14} />
                        <span className="text-sm text-gray-600">{notebook.title}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ))}

            {folder.notebooks?.map((notebook, notebookIndex) => (
              <div key={`notebook-${notebook.id}`}>
                <div className="flex items-center p-3">
                  <div className="w-6 mr-2"></div>
                  <FiBook className="text-green-600 mr-2" size={14} />
                  <span className="text-sm text-gray-600">{notebook.title}</span>
                </div>
              </div>
            ))}

            {(folder.subfolders?.length > 0 || folder.notebooks?.length > 0) && (
              <div className="border-b border-gray-100"></div>
            )}
          </div>
        )}
      </div>
    ))
  }

  // Get current content based on view
  const getCurrentContent = () => {
    if (currentView === "all") {
      return {
        folders: allFolders.filter((folder) => folder.name.toLowerCase().includes(searchQuery.toLowerCase())),
        notebooks: [],
      }
    } else if (currentView === "folder") {
      return {
        folders: currentFolder?.subfolders || [],
        notebooks: currentFolder?.notebooks || [],
      }
    } else if (currentView === "nested") {
      return {
        folders: [],
        notebooks: currentNestedFolder?.notebooks || [],
      }
    }
    return { folders: [], notebooks: [] }
  }

  const { folders: displayFolders, notebooks: displayNotebooks } = getCurrentContent()

  // Get header title
  const getHeaderTitle = () => {
    if (currentView === "all") {
      return "All Folders"
    } else if (breadcrumb.length > 0) {
      return breadcrumb.map((item, index) => (
        <span key={index}>
          {index > 0 && <span className="mx-2 text-gray-400">/</span>}
          <button
            onClick={() => handleBreadcrumbClick(index)}
            className={`${index === breadcrumb.length - 1 ? "text-gray-900" : "text-blue-600 hover:text-blue-800"} transition-colors`}
          >
            {item}
          </button>
        </span>
      ))
    }
    return "All Folders"
  }

  // Filter books for select modal
  const filteredBooks = getAllBooks().filter(
    (book) =>
      book.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
      book.folderPath.toLowerCase().includes(bookSearchQuery.toLowerCase()),
  )

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Overlay for closing dropdowns */}
      {activeDropdown && <div className="fixed inset-0 z-10" onClick={handleOverlayClick} />}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center px-4 py-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2">
            <FiArrowLeft size={20} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900">{getHeaderTitle()}</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search Notebooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Action Buttons */}
        <div className="space-y-2 mb-4">
          {/* Create New Folder Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center justify-center bg-white border border-gray-200 rounded-lg py-3 hover:bg-gray-50 transition-colors"
          >
            <FiPlus className="mr-2 text-gray-600" size={18} />
            <span className="text-gray-700 font-medium">Create New Folder</span>
          </button>

          {/* Add Book Button - Only show when inside a folder */}
          {(currentView === "folder" || currentView === "nested") && (
            <button
              onClick={() => setShowSelectBookModal(true)}
              className="w-full flex items-center justify-center bg-white border border-gray-200 rounded-lg py-3 hover:bg-gray-50 transition-colors"
            >
              <FiBookOpen className="mr-2 text-green-600" size={18} />
              <span className="text-gray-700 font-medium">Add Book</span>
            </button>
          )}
        </div>

        {/* Folders List */}
        <div className="space-y-2">
          {displayFolders.length === 0 && displayNotebooks.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <FiFolder className="mx-auto text-gray-400 mb-3" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {currentView === "all" ? "No Folders Found" : "No Content Found"}
              </h3>
              <p className="text-gray-600">
                {currentView === "all"
                  ? "Create your first folder to organize your notebooks."
                  : "Add folders or books to organize your content."}
              </p>
            </div>
          ) : (
            <>
              {/* Display Folders */}
              {displayFolders.map((folder) => (
                <div
                  key={folder.id}
                  className="bg-white rounded-lg border border-gray-200  cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="flex items-center p-4"
                    onClick={() => handleFolderClick(folder, currentView === "folder")}
                  >
                    <FiFolder className="text-blue-600 mr-3 flex-shrink-0" size={20} />

                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <div className="flex items-center min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 truncate mr-3">{folder.name}</h3>
                        <span className="text-sm text-gray-500 flex-shrink-0">
                          {new Date(folder.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="relative ml-2">
                        <button
                          onClick={(e) => handleMenuClick(e, folder.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <FiMoreVertical size={16} />
                        </button>

                        {activeDropdown === folder.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-30">
                            <button
                              onClick={(e) => handleShareClick(e, folder)}
                              className="w-full flex items-center px-3 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                            >
                              <FiShare2 className="mr-3 text-blue-600" size={14} />
                              <span className="text-sm text-gray-700">Share</span>
                            </button>
                            <button
                              onClick={(e) => handleMoveClick(e, folder)}
                              className="w-full flex items-center px-3 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                            >
                              <svg
                                className="mr-3 w-3.5 h-3.5 text-green-600"
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
                              onClick={(e) => handleDeleteClick(e, folder)}
                              className="w-full flex items-center px-3 py-2.5 text-left hover:bg-gray-50 transition-colors rounded-b-lg"
                            >
                              <FiTrash2 className="mr-3 text-red-600" size={14} />
                              <span className="text-sm text-gray-700">Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <div className="text-sm text-gray-500 space-y-0.5">
                      <div>{folder.notebookCount} notebooks</div>
                      {folder.subfolders && folder.subfolders.length > 0 && (
                        <div>{folder.subfolders.length} folders</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Display Notebooks */}
              {displayNotebooks.map((notebook) => (
                <div key={notebook.id} className="bg-white rounded-lg border border-gray-200 ">
                  <div className="flex items-center p-4">
                    <FiBook className="text-green-600 mr-3 flex-shrink-0" size={20} />

                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <div className="flex items-center min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 truncate mr-3">{notebook.title}</h3>
                        <span className="text-sm text-gray-500 flex-shrink-0">
                          {new Date(notebook.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center ml-2">
                        {notebook.isLocked ? (
                          <FiLock className="text-gray-400 mr-2" size={16} />
                        ) : (
                          <FiUnlock className="text-green-500 mr-2" size={16} />
                        )}

                        <div className="relative">
                          <button
                            onClick={(e) => handleMenuClick(e, `book-${notebook.id}`)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <FiMoreVertical size={16} />
                          </button>

                          {activeDropdown === `book-${notebook.id}` && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-30">
                              <button
                                onClick={(e) => handleShareClick(e, notebook, true)}
                                className="w-full flex items-center px-3 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                              >
                                <FiShare2 className="mr-3 text-blue-600" size={14} />
                                <span className="text-sm text-gray-700">Share</span>
                              </button>
                              <button
                                onClick={(e) => handleMoveClick(e, notebook, true)}
                                className="w-full flex items-center px-3 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                              >
                                <svg
                                  className="mr-3 w-3.5 h-3.5 text-green-600"
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
                                onClick={(e) => handleDeleteClick(e, notebook, true)}
                                className="w-full flex items-center px-3 py-2.5 text-left hover:bg-gray-50 transition-colors rounded-b-lg"
                              >
                                <FiTrash2 className="mr-3 text-red-600" size={14} />
                                <span className="text-sm text-gray-700">Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Create Folder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-sm mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Folder</h3>
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Enter Folder Name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={50}
                  autoFocus
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  {newFolderName.length}/50
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewFolderName("")
                  }}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="flex-1 px-4 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Select Book Modal */}
      {showSelectBookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-20">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[70vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Select Books</h3>
                <button
                  onClick={() => setSelectedBooks(new Set())}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Clear All
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">Choose books to add to this folder</p>

              {/* Search in Select Modal */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search Books..."
                  value={bookSearchQuery}
                  onChange={(e) => setBookSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-96">
              {filteredBooks.length === 0 ? (
                <div className="p-8 text-center">
                  <FiBook className="mx-auto text-gray-400 mb-3" size={32} />
                  <p className="text-gray-600">No books found</p>
                </div>
              ) : (
                filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <FiBook className="text-green-600 mr-3 flex-shrink-0" size={16} />

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{book.title}</h4>

                      <p className="text-xs text-gray-400">{new Date(book.lastUpdated).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center ml-3">
                      {book.isLocked ? (
                        <FiLock className="text-gray-400 mr-3" size={14} />
                      ) : (
                        <FiUnlock className="text-green-500 mr-3" size={14} />
                      )}

                      <button
                        onClick={() => handleBookSelection(book.id)}
                        className={`w-5 h-5 border-2 rounded-full transition-colors ${
                          selectedBooks.has(book.id)
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {selectedBooks.has(book.id) && (
                          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">
                  {selectedBooks.size} book{selectedBooks.size !== 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSelectBookModal(false)
                    setSelectedBooks(new Set())
                    setBookSearchQuery("")
                  }}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSelectedBooks}
                  disabled={selectedBooks.size === 0}
                  className="flex-1 px-4 py-2.5 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Add Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Move Folder Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-20">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[70vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Move {showMoveModal.isNotebook ? "Book" : "Folder"}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Select a destination folder for "{showMoveModal.isNotebook ? showMoveModal.title : showMoveModal.name}"
              </p>

              {/* Search in Move Modal */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search Here..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-96">
              {renderFolderTree(allFolders.filter((f) => f.id !== showMoveModal.id))}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowMoveModal(null)
                    setSelectedMoveTarget(null)
                  }}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMoveConfirm}
                  disabled={!selectedMoveTarget}
                  className="flex-1 px-4 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Move
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
