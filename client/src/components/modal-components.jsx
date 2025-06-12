"use client"

import { FiCheck } from "react-icons/fi"

// PIN Input View Component
export function PinInputView({ pinInput, setPinInput, onSubmit, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Enter PIN</h3>
        <p className="text-gray-600 mb-6">This notebook is protected. Please enter the 4-digit PIN to access it.</p>

        <div className="mb-6">
          <input
            type="password"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            maxLength={4}
            placeholder="Enter 4-digit PIN"
            className="w-full px-4 py-3 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-150"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}

// Scanning Overlay Component
export function ScanningOverlay({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
      <div className="relative w-64 h-64 mb-8">
        <div className="absolute inset-0 border-2 border-white/30 rounded-lg"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-0.5 bg-blue-500 animate-[scan_2s_ease-in-out_infinite]"></div>
        </div>
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500 rounded-tl-lg"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500 rounded-tr-lg"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500 rounded-bl-lg"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500 rounded-br-lg"></div>
      </div>

      <p className="text-white text-lg mb-8">Scanning QR Code...</p>

      <button
        onClick={onClose}
        className="px-6 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition duration-150"
      >
        Cancel
      </button>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(-50%) translateY(-60px);
          }
          50% {
            transform: translateY(-50%) translateY(60px);
          }
          100% {
            transform: translateY(-50%) translateY(-60px);
          }
        }
      `}</style>
    </div>
  )
}

// Scan Result Modal Component
export function ScanResultModal({ result, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <FiCheck className="text-green-600 text-3xl" />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">QR Code Scanned</h3>
        <p className="text-gray-600 mb-6 text-center">Successfully scanned page {result.pageNumber} from notebook.</p>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-150"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150"
          >
            View Page
          </button>
        </div>
      </div>
    </div>
  )
}
