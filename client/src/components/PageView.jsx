"use client"

import { useState, useEffect, useRef } from "react"
import { FiArrowLeft, FiMoreVertical, FiShare2, FiTrash2, FiEdit, FiBookmark, FiChevronRight, FiChevronLeft, FiX, FiMoreHorizontal } from "react-icons/fi"

export function PageView({ 
  notebook, 
  currentPage, 
  onBack, 
  onPageChange, 
  onDeletePage, 
  onSharePage, 
  onEditPage 
}) {
  const [isScrollMode, setIsScrollMode] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showPageMenu, setShowPageMenu] = useState(false)
  const [showMorePanel, setShowMorePanel] = useState(false)
  const [showNavControls, setShowNavControls] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 })
  const [dragStart, setDragStart] = useState(null)
  const [dragDistance, setDragDistance] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [pageTags, setPageTags] = useState(currentPage?.tags || [])
  const [pageNotes, setPageNotes] = useState(currentPage?.notes || '')
  const [newTag, setNewTag] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  
  const pageRef = useRef(null)
  const containerRef = useRef(null)
  const scrollContainerRef = useRef(null)

  const pages = notebook?.pages || []
  const currentIndex = pages.findIndex(page => page.id === currentPage?.id)

  // Prevent page refresh and handle touch events
  useEffect(() => {
    const preventDefault = (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault()
      }
    }

    const preventRefresh = (e) => {
      if (e.touches && e.touches.length === 1) {
        const touch = e.touches[0]
        const startY = touch.clientY
        
        if (startY < 50 && window.scrollY === 0) {
          e.preventDefault()
        }
      }
    }

    const preventZoom = (e) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchstart', preventDefault, { passive: false })
    document.addEventListener('touchmove', preventRefresh, { passive: false })
    document.addEventListener('gesturestart', preventDefault)
    document.addEventListener('gesturechange', preventDefault)
    document.addEventListener('touchmove', preventZoom, { passive: false })
    
    // Prevent zoom on fixed elements
    const metaViewport = document.querySelector('meta[name=viewport]')
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    }

    return () => {
      document.removeEventListener('touchstart', preventDefault)
      document.removeEventListener('touchmove', preventRefresh)
      document.removeEventListener('gesturestart', preventDefault)
      document.removeEventListener('gesturechange', preventDefault)
      document.removeEventListener('touchmove', preventZoom)
    }
  }, [])

  // Handle drag start
  const handleDragStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    setDragStart({ x: clientX, y: clientY })
    setIsDragging(true)
  }

  // Handle drag move
  const handleDragMove = (e) => {
    if (!dragStart || !isDragging) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    const deltaX = clientX - dragStart.x
    const deltaY = clientY - dragStart.y
    
    setDragDistance({ x: deltaX, y: deltaY })
  }

  // Handle drag end
  const handleDragEnd = (e) => {
    if (!isDragging) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const { x: deltaX, y: deltaY } = dragDistance
    
    // Check for vertical drag up (scroll mode trigger)
    if (Math.abs(deltaY) > 100 && Math.abs(deltaY) > Math.abs(deltaX)) {
      if (deltaY < 0) {
        // Dragged up - enter scroll mode
        setIsScrollMode(true)
        setZoomLevel(0.6)
      }
    }
    
    // Reset drag state
    setDragStart(null)
    setDragDistance({ x: 0, y: 0 })
    setIsDragging(false)
  }

  // Handle page click in scroll mode
  const handlePageClick = (page) => {
    if (isScrollMode) {
      onPageChange(page)
      setIsScrollMode(false)
      setZoomLevel(1)
    }
  }

  // Handle sidebar page click
  const handleSidebarPageClick = (page) => {
    onPageChange(page)
    setShowSidebar(false)
  }

  // Handle page image click to show/hide nav controls
  const handlePageImageClick = (e) => {
    // Close more panel if clicking on page
    if (showMorePanel) {
      setShowMorePanel(false)
    } else {
      setShowNavControls(!showNavControls)
    }
  }

  // Handle zoom only on page content - prevent zoom out below original size
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey || e.touches?.length === 2) {
      e.preventDefault()
      e.stopPropagation()
      
      // Calculate zoom origin based on mouse/touch position relative to page
      const rect = pageRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      
      setZoomOrigin({ x, y })
      
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      const newZoom = Math.max(1, Math.min(3, zoomLevel + delta)) // Changed min from 0.5 to 1
      
      // If trying to zoom below 1, snap back to 1
      if (newZoom < 1) {
        setZoomLevel(1)
      } else {
        setZoomLevel(newZoom)
      }
    }
  }

  // Handle touch zoom for mobile on page only - prevent zoom out below original size
  const handleTouchZoom = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      e.stopPropagation()
      
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      
      // Calculate center point of pinch relative to page
      const rect = pageRef.current.getBoundingClientRect()
      const centerX = ((touch1.clientX + touch2.clientX) / 2 - rect.left) / rect.width * 100
      const centerY = ((touch1.clientY + touch2.clientY) / 2 - rect.top) / rect.height * 100
      
      setZoomOrigin({ x: centerX, y: centerY })
    }
  }

  // Add tag function
  const addTag = (e) => {
    e.stopPropagation()
    if (newTag.trim() && !pageTags.includes(newTag.trim())) {
      setPageTags([...pageTags, newTag.trim()])
      setNewTag('')
    }
  }

  // Remove tag function
  const removeTag = (tagToRemove, e) => {
    e.stopPropagation()
    setPageTags(pageTags.filter(tag => tag !== tagToRemove))
  }

  // Handle notes edit save
  const handleSaveNotes = (e) => {
    e.stopPropagation()
    // Save logic here
    setIsEditingNotes(false)
  }

  // Handle notes edit cancel
  const handleCancelNotesEdit = (e) => {
    e.stopPropagation()
    setPageNotes(currentPage?.notes || '')
    setIsEditingNotes(false)
  }

  // Handle edit notes button click
  const handleEditNotesClick = (e) => {
    e.stopPropagation()
    setIsEditingNotes(true)
  }

  // Close modals on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showPageMenu && !e.target.closest('.page-menu')) {
        setShowPageMenu(false)
      }
      // Handle more panel outside clicks - only close if not clicking on more button or panel
      if (showMorePanel && !e.target.closest('.more-panel') && !e.target.closest('.more-button')) {
        setShowMorePanel(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showPageMenu, showMorePanel])

  // Scroll to current page in scroll mode
  useEffect(() => {
    if (isScrollMode && scrollContainerRef.current && currentIndex >= 0) {
      const pageElements = scrollContainerRef.current.children
      if (pageElements[currentIndex]) {
        pageElements[currentIndex].scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
      }
    }
  }, [isScrollMode, currentIndex])

  // Auto-hide nav controls after 3 seconds
  useEffect(() => {
    if (showNavControls) {
      const timer = setTimeout(() => {
        setShowNavControls(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showNavControls])

  if (!currentPage) return null

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 overflow-hidden">
      {/* Fixed Header */}
      <div className={`fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 ${showSidebar ? 'z-70' : 'z-50'}`} style={{ touchAction: 'manipulation' }}>
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FiArrowLeft className="mr-2" size={20} />
            <span className="font-medium">Back</span>
          </button>
          
          <div className="text-center">
            <h3 className="font-semibold text-gray-800">
              Page {currentPage.pageNumber}
            </h3>
            <p className="text-xs text-gray-500">
              {currentIndex + 1} of {pages.length}
            </p>
          </div>

          <div className="relative page-menu">
            <button
              onClick={() => setShowPageMenu(!showPageMenu)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiMoreVertical size={20} />
            </button>

            {/* Page Menu Dropdown */}
            {showPageMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-60">
                <button
                  onClick={() => {
                    onSharePage(currentPage)
                    setShowPageMenu(false)
                  }}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <FiShare2 className="mr-3 text-blue-600" size={16} />
                  <span className="text-gray-700">Share Page</span>
                </button>
                
                <button
                  onClick={() => {
                    onEditPage(currentPage)
                    setShowPageMenu(false)
                  }}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <FiEdit className="mr-3 text-green-600" size={16} />
                  <span className="text-gray-700">Edit Page</span>
                </button>
                
                <button
                  onClick={() => {
                    // Add to bookmarks logic
                    setShowPageMenu(false)
                  }}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  <FiBookmark className="mr-3 text-yellow-600" size={16} />
                  <span className="text-gray-700">Bookmark</span>
                </button>
                
                <button
                  onClick={() => {
                    onDeletePage(currentPage)
                    setShowPageMenu(false)
                  }}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors rounded-b-lg"
                >
                  <FiTrash2 className="mr-3 text-red-600" size={16} />
                  <span className="text-gray-700">Delete Page</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Sidebar Trigger - Hidden when more panel, sidebar is open, or in scroll mode */}
      {!showMorePanel && !showSidebar && !isScrollMode && (
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed left-0 top-20 z-50 bg-white shadow-lg border border-gray-200 rounded-r-lg p-2 hover:bg-gray-50 transition-colors"
          style={{ borderLeft: 'none', touchAction: 'manipulation' }}
        >
          <FiChevronRight size={20} className="text-gray-600" />
        </button>
      )}

      {/* Main Content Area */}
      <div 
        ref={containerRef}
        className="pt-16 h-full overflow-hidden"
        style={{ backgroundColor: '#f8f9fa' }}
      >
        {!isScrollMode ? (
          /* Single Page View */
          <div className="h-full flex flex-col">
            {/* Page Image Container */}
            <div className="flex-1 flex items-center justify-center p-4 relative">
              <div
                ref={pageRef}
                className="relative bg-white rounded-lg shadow-lg cursor-grab active:cursor-grabbing w-full h-full flex items-center justify-center"
                style={{
                  transform: `scale(${zoomLevel}) translate(${dragDistance.x}px, ${dragDistance.y}px)`,
                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                }}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
                onMouseLeave={handleDragEnd}
                onTouchStart={(e) => {
                  handleTouchZoom(e)
                  if (e.touches.length === 1) {
                    handleDragStart(e)
                  }
                }}
                onTouchMove={(e) => {
                  handleTouchZoom(e)
                  if (e.touches.length === 1) {
                    handleDragMove(e)
                  }
                }}
                onTouchEnd={handleDragEnd}
                onWheel={handleWheel}
                onClick={handlePageImageClick}
              >
                <img
                  src={currentPage.imageUrl || "/api/placeholder/600/800"}
                  alt={`Page ${currentPage.pageNumber}`}
                  className="max-w-full max-h-full object-contain"
                  draggable={false}
                  style={{ userSelect: 'none' }}
                />
                
                {/* Drag Indicators */}
                {isDragging && (
                  <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-3 shadow-lg">
                      <p className="text-sm text-gray-600">
                        {Math.abs(dragDistance.y) > 50 && dragDistance.y < 0 
                          ? "↑ Release to view all pages" 
                          : "Drag up to view all pages"
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* More Button - Hidden when more panel or sidebar is open */}
            {!showMorePanel && !showSidebar && (
              <div className="fixed bottom-6 left-1/2  transform -translate-x-1/2 z-50" style={{ touchAction: 'manipulation' }}>
                <button
                  onClick={() => setShowMorePanel(true)}
                  className="more-button flex flex-col items-center px-4 py-3  text-gray-600 hover:text-gray-800 hover:shadow-xl transition-all "
                >
                  <FiMoreHorizontal size={20} />
                  <span className="text-xs mt-1">More</span>
                </button>
              </div>
            )}

            {/* Enhanced More Panel with overlay to prevent outside interactions */}
            {showMorePanel && (
              <>
                {/* Full screen overlay to capture outside clicks */}
                <div 
                  className="fixed inset-0 z-70 bg-transparent"
                  onClick={() => setShowMorePanel(false)}
                />
                
                <div className="more-panel fixed bottom-0 left-0 right-0 z-80 bg-white shadow-2xl transform transition-all duration-300" 
                     style={{ borderTopLeftRadius: '24px', borderTopRightRadius: '24px', maxHeight: '70vh' }}>
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div 
                      className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer hover:bg-gray-400 transition-colors"
                      onClick={() => setShowMorePanel(false)}
                    ></div>
                    <h3 className="text-xl font-bold text-gray-800 text-center">Page Details</h3>
                  </div>
                  
                  <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 100px)' }}>
                    {/* Tags Section */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Tags</label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addTag(e)}
                          placeholder="Add a tag..."
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={addTag}
                          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                        >
                          Add
                        </button>
                      </div>
                      {pageTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {pageTags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-medium flex items-center"
                            >
                              {tag}
                              <button
                                onClick={(e) => removeTag(tag, e)}
                                className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Notes Section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-gray-700">Notes</label>
                        {!isEditingNotes && (
                          <button
                            onClick={handleEditNotesClick}
                            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                          >
                            <FiEdit size={16} />
                          </button>
                        )}
                      </div>
                      
                      {isEditingNotes ? (
                        <>
                          <textarea
                            value={pageNotes}
                            onChange={(e) => setPageNotes(e.target.value)}
                            placeholder="Add your thoughts about this page..."
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex gap-2 justify-end mt-2">
                            <button
                              onClick={handleCancelNotesEdit}
                              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveNotes}
                              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Save
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-700 min-h-[120px]">
                          {pageNotes || "No notes added yet. Click the edit icon to add notes."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Scroll Mode View */
          <div 
            ref={scrollContainerRef}
            className="h-full overflow-y-auto px-4 py-4"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="space-y-6">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className={`relative mx-auto bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-300 ${
                    page.id === currentPage.id 
                      ? 'ring-4 ring-blue-500 scale-105' 
                      : 'hover:shadow-xl hover:scale-102'
                  }`}
                  style={{ maxWidth: '300px' }}
                  onClick={() => handlePageClick(page)}
                >
                  <div className="absolute -top-3 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Page {page.pageNumber}
                  </div>
                  
                  <img
                    src={page.imageUrl || "/api/placeholder/300/400"}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full h-auto object-contain rounded-lg"
                    style={{ maxHeight: '400px' }}
                  />
                  
                  {page.tags && page.tags.length > 0 && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex flex-wrap gap-1">
                        {page.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span 
                            key={tagIndex}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {page.tags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{page.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Navigation Controls on Page Edges */}
      {showNavControls && !isScrollMode && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPageChange(pages[currentIndex - 1])
                setShowNavControls(false)
              }}
              className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 bg-white bg-opacity-95 text-gray-800 p-4 rounded-full shadow-xl hover:bg-opacity-100 transition-all border border-gray-200"
              style={{ touchAction: 'manipulation' }}
            >
              <FiChevronLeft size={24} />
            </button>
          )}
          
          {currentIndex < pages.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPageChange(pages[currentIndex + 1])
                setShowNavControls(false)
              }}
              className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 bg-white bg-opacity-95 text-gray-800 p-4 rounded-full shadow-xl hover:bg-opacity-100 transition-all border border-gray-200"
              style={{ touchAction: 'manipulation' }}
            >
              <FiChevronRight size={24} />
            </button>
          )}
        </>
      )}

      {/* Exit Scroll Mode Button */}
      {isScrollMode && (
        <div className="fixed bottom-6 right-6 z-50" style={{ touchAction: 'manipulation' }}>
          <button
            onClick={() => {
              setIsScrollMode(false)
              setZoomLevel(1)
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Exit Scroll Mode
          </button>
        </div>
      )}

      {/* Enhanced Sidebar - Higher z-index to override everything */}
      {showSidebar && (
        <>
          {/* Sidebar Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-90"
            onClick={() => setShowSidebar(false)}
          />
          
          {/* Sidebar Content */}
          <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-2xl z-100 transform transition-transform duration-300" 
               style={{ touchAction: 'manipulation', overflow: 'hidden' }}>
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">All Pages</h3>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">{pages.length} pages total</p>
            </div>
            
            <div className="flex-1 p-3" style={{ height: 'calc(100vh - 100px)', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="space-y-3">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className={`relative bg-gray-50 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 flex ${
                      page.id === currentPage.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg' 
                        : 'hover:bg-gray-100 hover:shadow-md'
                    }`}
                    onClick={() => handleSidebarPageClick(page)}
                  >
                    <div className="w-16 h-20 flex-shrink-0 overflow-hidden rounded-l-lg">
                      <img
                        src={page.imageUrl || "/api/placeholder/64/80"}
                        alt={`Page ${page.pageNumber}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    
                    <div className="flex-1 p-3">
                      <p className="text-sm font-bold text-gray-800 mb-1">
                        Page {page.pageNumber}
                      </p>
                      {page.tags && page.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {page.tags[0]}
                          </span>
                          {page.tags.length > 1 && (
                            <span className="text-xs text-gray-500 py-0.5">
                              +{page.tags.length - 1}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {page.id === currentPage.id && (
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}