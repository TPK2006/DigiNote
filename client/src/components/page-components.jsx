"use client"

import { useState } from "react"
import { FiPlus, FiShare2, FiEye, FiTrash2, FiClock } from "react-icons/fi"

// Page View Component
export function PageView({ notebook, page, onBack, onAddTag, onAddNote }) {
  const [newTag, setNewTag] = useState("")
  const [isEditingNote, setIsEditingNote] = useState(false)
  const [noteText, setNoteText] = useState(page.notes || "")

  const handleAddTag = () => {
    if (newTag.trim() && !page.tags.includes(newTag.trim())) {
      onAddTag(newTag.trim())
      setNewTag("")
    }
  }

  const handleSaveNote = () => {
    onAddNote(noteText)
    setIsEditingNote(false)
  }

  return (
    <div>
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
        Back to {notebook.title}
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  {notebook.title} - Page {page.pageNumber}
                </h3>
                <div className="flex items-center text-sm text-gray-500">
                  <FiClock className="mr-1" />
                  {new Date(page.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="p-6 flex justify-center">
              <img
                src={page.imageUrl || "/placeholder.svg"}
                alt={`Page ${page.pageNumber}`}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Page Information</h4>

            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-2">Tags</h5>
                <div className="flex flex-wrap gap-2 mb-3">
                  {page.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddTag}
                    className="bg-blue-600 text-white px-3 py-2 rounded-r-lg hover:bg-blue-700"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-gray-600">Notes</h5>
                  {!isEditingNote && (
                    <button
                      onClick={() => setIsEditingNote(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {page.notes ? "Edit" : "Add Note"}
                    </button>
                  )}
                </div>

                {isEditingNote ? (
                  <div>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add notes about this page..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                    ></textarea>
                    <div className="flex justify-end mt-2 space-x-2">
                      <button
                        onClick={() => {
                          setIsEditingNote(false)
                          setNoteText(page.notes || "")
                        }}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNote}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg min-h-[100px]">
                    {page.notes ? (
                      <p className="text-gray-700">{page.notes}</p>
                    ) : (
                      <p className="text-gray-400 italic">No notes added yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Actions</h4>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-center bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition duration-150">
                <FiShare2 className="mr-2" />
                Share Page
              </button>

              <button className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-50 transition duration-150">
                <FiEye className="mr-2" />
                View Full Screen
              </button>

              <button className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-50 transition duration-150">
                <FiTrash2 className="mr-2" />
                Delete Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Order Portal View Component
export function OrderPortalView({ formData, setFormData, onSubmit, onBack }) {
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  return (
    <div>
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

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-blue-600">
            <h2 className="text-2xl font-bold text-white">Order Smart Notebooks</h2>
            <p className="text-blue-100 mt-2">
              Get your own physical Smart Notebooks with unique QR codes for each page.
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Notebook Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Premium quality paper (100 gsm)</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Unique QR code on each page</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Hardcover with durable binding</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">100 pages per notebook</span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Available in lined, grid, or blank pages</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Pricing</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">1 Notebook</span>
                    <span className="font-medium text-gray-900">$24.99</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">5+ Notebooks</span>
                    <span className="font-medium text-gray-900">$19.99 each</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">10+ Notebooks</span>
                    <span className="font-medium text-gray-900">$17.99 each</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                    <span className="text-gray-700">Customization</span>
                    <span className="font-medium text-gray-900">+$5.00 per notebook</span>
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                onSubmit()
              }}
            >
              <h3 className="text-lg font-medium text-gray-800 mb-4">Order Details</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <select
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 10, 15, 20].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Notebook" : "Notebooks"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="customization" className="block text-sm font-medium text-gray-700 mb-1">
                    Customization (Optional)
                  </label>
                  <textarea
                    id="customization"
                    name="customization"
                    value={formData.customization}
                    onChange={handleChange}
                    placeholder="Describe any customization you'd like (e.g., logo, name, color preferences)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                  ></textarea>
                </div>

                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 transition duration-150"
                  >
                    <FiShoppingCart className="mr-2" />
                    Submit Order Request
                  </button>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    We'll contact you with payment details and shipping information.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

import { FiShoppingCart } from "react-icons/fi"
