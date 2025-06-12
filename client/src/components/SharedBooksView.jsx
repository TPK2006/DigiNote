"use client"

import { useState } from "react"
import {
  FiArrowLeft,
  FiSearch,
  FiMoreVertical,
  FiShare2,
  FiTrash2,
  FiUser,
  FiUsers,
  FiFolder,
  FiBook,
  FiLock,
  FiUnlock,
} from "react-icons/fi"

export function SharedBooksView({
  onBack,
  sharedUsers = [],
  onShareUser,
  onRemoveUser,
}) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeDropdown, setActiveDropdown] = useState(null)
  
  // Navigation state
  const [currentView, setCurrentView] = useState("users") // 'users', 'folders', 'folder', 'nested'
  const [currentUser, setCurrentUser] = useState(null)
  const [currentFolder, setCurrentFolder] = useState(null)
  const [currentNestedFolder, setCurrentNestedFolder] = useState(null)
  const [breadcrumb, setBreadcrumb] = useState([])

  // Sample shared users data with nested folder structure
  const sampleSharedUsers = [
    {
      id: 1,
      name: "Tadala Prasanth Kumar",
      avatar: null,
      folderCount: 4,
      bookCount: 2,
      sharedDate: "2024-01-15",
      permissions: "view",
      folders: [
        {
          id: 11,
          name: "Algebra",
          lastUpdated: "2024-01-12",
          notebookCount: 2,
          subfolders: [
            {
              id: 111,
              name: "Basic Algebra",
              lastUpdated: "2024-01-10",
              notebookCount: 1,
              notebooks: [
                { id: 1001, title: "Simple Equations", isLocked: false },
              ],
            },
            {
              id: 112,
              name: "Advanced Algebra",
              lastUpdated: "2024-01-12",
              notebookCount: 1,
              notebooks: [
                { id: 1002, title: "Complex Numbers", isLocked: true },
              ],
            },
          ],
          notebooks: [
            { id: 101, title: "Linear Equations", isLocked: false },
            { id: 102, title: "Quadratic Functions", isLocked: true },
          ],
        },
        {
          id: 12,
          name: "Geometry", 
          lastUpdated: "2024-01-15",
          notebookCount: 3,
          subfolders: [
            {
              id: 121,
              name: "2D Geometry",
              lastUpdated: "2024-01-14",
              notebookCount: 2,
              notebooks: [
                { id: 1003, title: "Coordinate Geometry", isLocked: false },
                { id: 1004, title: "Area and Perimeter", isLocked: true },
              ],
            },
          ],
          notebooks: [
            { id: 103, title: "Triangles", isLocked: false },
            { id: 104, title: "Circles", isLocked: true },
            { id: 105, title: "Polygons", isLocked: false },
          ],
        },
      ],
      notebooks: [
        { id: 106, title: "Advanced Calculus", isLocked: true },
        { id: 107, title: "Statistics Basics", isLocked: false },
      ],
    },
    {
      id: 2,
      name: "Anji",
      avatar: null,
      folderCount: 4,
      bookCount: 2,
      sharedDate: "2024-01-20",
      permissions: "edit",
      folders: [
        {
          id: 21,
          name: "Physics",
          lastUpdated: "2024-01-18",
          notebookCount: 2,
          subfolders: [
            {
              id: 211,
              name: "Classical Physics",
              lastUpdated: "2024-01-17",
              notebookCount: 1,
              notebooks: [
                { id: 2001, title: "Mechanics", isLocked: false },
              ],
            },
          ],
          notebooks: [
            { id: 201, title: "Newton's Laws", isLocked: false },
            { id: 202, title: "Energy", isLocked: true },
          ],
        },
      ],
      notebooks: [
        { id: 203, title: "Quantum Physics", isLocked: true }
      ],
    },
    {
      id: 3,
      name: "Rajesh Kumar",
      avatar: null,
      folderCount: 2,
      bookCount: 5,
      sharedDate: "2024-01-10",
      permissions: "view",
      folders: [
        {
          id: 31,
          name: "Chemistry",
          lastUpdated: "2024-01-10",
          notebookCount: 2,
          subfolders: [],
          notebooks: [
            { id: 301, title: "Organic Chemistry", isLocked: false },
            { id: 302, title: "Inorganic Chemistry", isLocked: true },
          ],
        },
      ],
      notebooks: [
        { id: 303, title: "Physical Chemistry", isLocked: false },
        { id: 304, title: "Analytical Chemistry", isLocked: true },
        { id: 305, title: "Biochemistry", isLocked: false },
      ],
    },
    {
      id: 4,
      name: "Priya Sharma",
      avatar: null,
      folderCount: 6,
      bookCount: 3,
      sharedDate: "2024-01-25",
      permissions: "edit",
      folders: [
        {
          id: 41,
          name: "Biology",
          lastUpdated: "2024-01-25",
          notebookCount: 1,
          subfolders: [
            {
              id: 411,
              name: "Cell Biology",
              lastUpdated: "2024-01-24",
              notebookCount: 2,
              notebooks: [
                { id: 4001, title: "Cell Structure", isLocked: false },
                { id: 4002, title: "Cell Division", isLocked: true },
              ],
            },
          ],
          notebooks: [
            { id: 401, title: "General Biology", isLocked: false },
          ],
        },
        {
          id: 42,
          name: "Botany",
          lastUpdated: "2024-01-24",
          notebookCount: 2,
          subfolders: [],
          notebooks: [
            { id: 402, title: "Plant Anatomy", isLocked: true },
            { id: 403, title: "Plant Physiology", isLocked: false },
          ],
        },
      ],
      notebooks: [],
    },
  ]

  const allSharedUsers = sharedUsers.length > 0 ? sharedUsers : sampleSharedUsers

  // Handle user click to show their folders
  const handleUserClick = (user) => {
    setCurrentView("folders")
    setCurrentUser(user)
    setBreadcrumb(["Shared", user.name])
  }

  // Handle folder click to navigate into it
  const handleFolderClick = (folder, isNested = false) => {
    if (isNested) {
      setCurrentView("nested")
      setCurrentNestedFolder(folder)
      setBreadcrumb(["Shared", currentUser.name, currentFolder.name, folder.name])
    } else {
      setCurrentView("folder")
      setCurrentFolder(folder)
      setCurrentNestedFolder(null)
      setBreadcrumb(["Shared", currentUser.name, folder.name])
    }
  }

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index) => {
    if (index === 0) {
      // Navigate back to users list
      setCurrentView("users")
      setCurrentUser(null)
      setCurrentFolder(null)
      setCurrentNestedFolder(null)
      setBreadcrumb([])
    } else if (index === 1) {
      // Navigate back to user's folders
      setCurrentView("folders")
      setCurrentFolder(null)
      setCurrentNestedFolder(null)
      setBreadcrumb(["Shared", currentUser.name])
    } else if (index === 2 && currentView === "nested") {
      // Navigate back to main folder
      setCurrentView("folder")
      setCurrentNestedFolder(null)
      setBreadcrumb(["Shared", currentUser.name, currentFolder.name])
    }
  }

  // Handle three dots menu (only for users list view)
  const handleMenuClick = (e, userId) => {
    e.stopPropagation()
    setActiveDropdown(activeDropdown === userId ? null : userId)
  }

  // Handle share click
  const handleShareClick = (e, user) => {
    e.stopPropagation()
    onShareUser?.(user)
    setActiveDropdown(null)
  }

  // Handle remove click
  const handleRemoveClick = (e, user) => {
    e.stopPropagation()
    onRemoveUser?.(user)
    setActiveDropdown(null)
  }

  // Close dropdowns when clicking outside
  const handleOverlayClick = () => {
    setActiveDropdown(null)
  }

  // Get user initials for avatar
  const getUserInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Get header title
  const getHeaderTitle = () => {
    if (currentView === "users") {
      return "Shared Books"
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
    return "Shared Books"
  }

  // Get current content based on view
  const getCurrentContent = () => {
    if (currentView === "users") {
      return { users: allSharedUsers.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase())) }
    } else if (currentView === "folders") {
      return {
        folders: currentUser?.folders || [],
        notebooks: currentUser?.notebooks || []
      }
    } else if (currentView === "folder") {
      return {
        folders: currentFolder?.subfolders || [],
        notebooks: currentFolder?.notebooks || []
      }
    } else if (currentView === "nested") {
      return {
        folders: [],
        notebooks: currentNestedFolder?.notebooks || []
      }
    }
    return { users: [], folders: [], notebooks: [] }
  }

  const { users: displayUsers, folders: displayFolders, notebooks: displayNotebooks } = getCurrentContent()

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
        {/* Users List View */}
        {currentView === "users" && (
          <div className="space-y-2">
            {displayUsers.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <FiUsers className="mx-auto text-gray-400 mb-3" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Shared Books Found</h3>
                <p className="text-gray-600">
                  {searchQuery ? "No users match your search criteria." : "No books have been shared with you yet."}
                </p>
              </div>
            ) : (
              displayUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleUserClick(user)}
                >
                  <div className="flex items-center p-4">
                    {/* User Avatar */}
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-gray-600 font-medium text-sm">{getUserInitials(user.name)}</span>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 truncate">{user.name}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                            <div className="flex items-center">
                              <FiFolder className="mr-1" size={12} />
                              <span>{user.folderCount} folders</span>
                            </div>
                            <div className="flex items-center">
                              <FiBook className="mr-1" size={12} />
                              <span>{user.bookCount} books</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Shared on {new Date(user.sharedDate).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Three Dots Menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => handleMenuClick(e, user.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <FiMoreVertical size={16} />
                          </button>

                          {activeDropdown === user.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-30">
                              <button
                                onClick={(e) => handleShareClick(e, user)}
                                className="w-full flex items-center px-3 py-2.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                              >
                                <FiShare2 className="mr-3 text-blue-600" size={14} />
                                <span className="text-sm text-gray-700">Share</span>
                              </button>
                              <button
                                onClick={(e) => handleRemoveClick(e, user)}
                                className="w-full flex items-center px-3 py-2.5 text-left hover:bg-gray-50 transition-colors rounded-b-lg"
                              >
                                <FiTrash2 className="mr-3 text-red-600" size={14} />
                                <span className="text-sm text-gray-700">Remove</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Stats Summary - Only show in users view */}
            {displayUsers.length > 0 && (
              <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-medium text-gray-900 mb-3">Sharing Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-blue-600">{displayUsers.length}</div>
                    <div className="text-sm text-gray-600">People</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-green-600">
                      {displayUsers.reduce((total, user) => total + user.bookCount, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Books</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Folders and Books View */}
        {(currentView === "folders" || currentView === "folder" || currentView === "nested") && (
          <div className="space-y-2">
            {displayFolders.length === 0 && displayNotebooks.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <FiFolder className="mx-auto text-gray-400 mb-3" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Found</h3>
                <p className="text-gray-600">This folder is empty.</p>
              </div>
            ) : (
              <>
                {/* Display Folders */}
                {displayFolders.map((folder) => (
                  <div
                    key={folder.id}
                    className="bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleFolderClick(folder, currentView === "folder")}
                  >
                    <div className="flex items-center p-4">
                      <FiFolder className="text-blue-600 mr-3 flex-shrink-0" size={20} />
                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <div className="flex items-center min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 truncate mr-3">{folder.name}</h3>
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
                  <div key={notebook.id} className="bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center p-4">
                      <FiBook className="text-green-600 mr-3 flex-shrink-0" size={20} />

                      <div className="flex items-center justify-between flex-1 min-w-0">
                        <div className="flex items-center min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 truncate mr-3">{notebook.title}</h3>
                        </div>

                        <div className="flex items-center ml-2">
                          {notebook.isLocked ? (
                            <FiLock className="text-gray-400" size={16} />
                          ) : (
                            <FiUnlock className="text-green-500" size={16} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}