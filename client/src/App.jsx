"use client"

import { useState, useEffect } from "react"
import { Header, LoginView } from "./components/auth-components"
import { DashboardView, NotebookDetailView } from "./components/notebook-components"
import { PageView, OrderPortalView } from "./components/page-components"
import { PinInputView, ScanningOverlay, ScanResultModal } from "./components/modal-components"

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [notebooks, setNotebooks] = useState([])
  const [activeView, setActiveView] = useState("dashboard")
  const [activeNotebook, setActiveNotebook] = useState(null)
  const [activePage, setActivePage] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [pinInput, setPinInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [orderFormData, setOrderFormData] = useState({
    quantity: 1,
    customization: "",
    contactEmail: "",
    contactPhone: "",
  })

  // Fetch user books on login
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchUserBooks = async () => {
        try {
          const response = await fetch(`http://localhost:5005/api/books/user/${user.googleId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })

          if (response.ok) {
            const books = await response.json()
            console.log("Fetched user books:", books)
            setNotebooks(books.map(book => ({
              id: book.id,
              title: book.title,
              isPublic: book.isPublic,
              pages: book.pages || [],
              totalPages: book.totalPages || 0,
              lastUpdated: book.lastUpdated,
              coverImage: book.coverImage,
              qrId: book.qrId,
              createdBy: book.createdBy,
              qrCode: `/api/placeholder/40/40`,
            })))
          } else {
            console.error("Failed to fetch user books:", response.statusText)
          }
        } catch (err) {
          console.error("Error fetching user books:", err)
        }
      }

      fetchUserBooks()
    }
  }, [isAuthenticated, user])

  const handleLogin = (userData) => {
    console.log("App.jsx handleLogin:", userData)
    setUser(userData)
    setIsAuthenticated(true)
    setActiveView("dashboard")
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setNotebooks([])
    setActiveNotebook(null)
    setActivePage(null)
    setActiveView("dashboard")
  }

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      alert("No notebooks available. Please add notebooks to scan.")
      setScanResult(null)
    }, 2000)
  }

  const confirmScan = () => {
    if (scanResult) {
      alert("No notebooks available. Please add notebooks to scan.")
      setScanResult(null)
    }
  }

  const handlePinSubmit = () => {
    alert("No notebooks available. Please add notebooks to scan.")
    setPinInput("")
    setScanResult(null)
    setActiveView("dashboard")
  }

  const toggleNotebookAccess = (notebookId) => {
    setNotebooks(notebooks.map((nb) => (nb.id === notebookId ? { ...nb, isPublic: !nb.isPublic } : nb)))
  }

  const updateNotebookPin = (notebookId, newPin) => {
    setNotebooks(notebooks.map((nb) => (nb.id === notebookId ? { ...nb, pin: newPin } : nb)))
  }

  const addTagToPage = (notebookId, pageId, newTag) => {
    setNotebooks(
      notebooks.map((nb) =>
        nb.id === notebookId
          ? {
              ...nb,
              pages: nb.pages.map((page) => (page.id === pageId ? { ...page, tags: [...page.tags, newTag] } : page)),
            }
          : nb,
      ),
    )
  }

  const addNoteToPage = (notebookId, pageId, note) => {
    setNotebooks(
      notebooks.map((nb) =>
        nb.id === notebookId
          ? {
              ...nb,
              pages: nb.pages.map((page) => (page.id === pageId ? { ...page, notes: note } : page)),
            }
          : nb,
      ),
    )
  }

  const handleNotebookSelect = (notebook) => {
    setNotebooks((prev) => {
      const exists = prev.find((nb) => nb.id === notebook.id)
      if (!exists) {
        return [...prev, notebook]
      }
      return prev.map((nb) => (nb.id === notebook.id ? notebook : nb))
    })
    setActiveNotebook(notebook)
    setActiveView("notebookDetail")
  }

  const handleDeleteNotebook = (notebookId) => {
    setNotebooks(notebooks.filter((nb) => nb.id !== notebookId))
    if (activeNotebook && activeNotebook.id === notebookId) {
      setActiveNotebook(null)
      setActiveView("dashboard")
    }
  }

  const filteredNotebooks = notebooks.filter((notebook) =>
    notebook.title ? notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) : false,
  )

  const renderContent = () => {
    if (!isAuthenticated) {
      return <LoginView onLogin={handleLogin} />
    }

    switch (activeView) {
      case "dashboard":
        return (
          <DashboardView
            notebooks={filteredNotebooks}
            onNotebookSelect={handleNotebookSelect}
            onScan={handleScan}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onDeleteNotebook={handleDeleteNotebook}
            onToggleNotebookAccess={toggleNotebookAccess}
            onShareNotebook={(notebook) => console.log("Sharing notebook:", notebook)}
            user={user}
          />
        )
      case "notebookDetail":
        return (
          <NotebookDetailView
            notebook={activeNotebook}
            onBack={() => setActiveView("dashboard")}
            onPageSelect={(page) => {
              setActivePage(page)
              setActiveView("pageView")
            }}
            onToggleAccess={() => toggleNotebookAccess(activeNotebook.id)}
            onUpdatePin={(pin) => updateNotebookPin(activeNotebook.id, pin)}
          />
        )
      case "pageView":
        return (
          <PageView
            notebook={activeNotebook}
            page={activePage}
            onBack={() => setActiveView("notebookDetail")}
            onAddTag={(tag) => addTagToPage(activeNotebook.id, activePage.id, tag)}
            onAddNote={(note) => addNoteToPage(activeNotebook.id, activePage.id, note)}
          />
        )
      case "orderPortal":
        return (
          <OrderPortalView
            formData={orderFormData}
            setFormData={setOrderFormData}
            onSubmit={() => {
              alert("Order submitted successfully! We will contact you soon.")
              setOrderFormData({
                quantity: 1,
                customization: "",
                contactEmail: "",
                contactPhone: "",
              })
              setActiveView("dashboard")
            }}
            onBack={() => setActiveView("dashboard")}
          />
        )
      case "pinInput":
        return (
          <PinInputView
            pinInput={pinInput}
            setPinInput={setPinInput}
            onSubmit={handlePinSubmit}
            onCancel={() => {
              setPinInput("")
              setScanResult(null)
              setActiveView("dashboard")
            }}
          />
        )
      default:
        return (
          <DashboardView
            notebooks={filteredNotebooks}
            onNotebookSelect={handleNotebookSelect}
            onScan={handleScan}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onDeleteNotebook={handleDeleteNotebook}
            onToggleNotebookAccess={toggleNotebookAccess}
            onShareNotebook={(notebook) => console.log("Sharing notebook:", notebook)}
            user={user}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && (
        <Header
          user={user}
          onLogout={handleLogout}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          activeView={activeView}
          setActiveView={setActiveView}
        />
      )}

      <main className="container mx-auto px-4 py-8">{renderContent()}</main>

      {isScanning && <ScanningOverlay onClose={() => setIsScanning(false)} />}

      {scanResult && !isScanning && (
        <ScanResultModal result={scanResult} onConfirm={confirmScan} onCancel={() => setScanResult(null)} />
      )}
    </div>
  )
}

export default App