"use client"

import type React from "react"

import { useState } from "react"
import axios from "axios"

export default function Home() {
  const [appId, setAppId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")

  const handleDownload = async () => {
    if (!appId.trim()) {
      setMessage("Please enter a valid App ID")
      setMessageType("error")
      return
    }

    setIsLoading(true)
    setMessage("")
    setMessageType("")

    try {
      // Check if manifest exists and get download URL
      const response = await axios.post(
        "/api/download",
        { appId },
        {
          timeout: 10000, // Quick check only
        },
      )

      if (response.status === 200 && response.data.success) {
        // Direct download from GitHub
        const link = document.createElement("a")
        link.href = response.data.downloadUrl
        link.download = response.data.filename
        link.target = "_blank"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setMessage(`Successfully initiated download of ${response.data.filename}`)
        setMessageType("success")
      }
    } catch (error: any) {
      console.error("Download error details:", error)
      console.error("Error response:", error.response)
      console.error("Error status:", error.response?.status)
      console.error("Error data:", error.response?.data)

      if (error.response?.status === 404) {
        setMessage("AppID Not Found")
        setMessageType("error")
      } else if (error.response?.status === 408) {
        setMessage("Download timeout. Please try again.")
        setMessageType("error")
      } else if (error.response?.status === 500) {
        setMessage("Server error. Please try again later.")
        setMessageType("error")
      } else if (error.code === "ECONNABORTED") {
        setMessage("Request timeout. Please try again.")
        setMessageType("error")
      } else {
        setMessage(`Error: ${error.response?.data?.error || error.message || "Unknown error occurred"}`)
        setMessageType("error")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleDownload()
    }
  }

  return (
    <div className="min-h-screen steam-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl mb-4 overflow-hidden shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Steam Manifest Downloader</h1>
          <p className="text-gray-400">Download Steam game manifests from ManifestHub</p>
        </div>

        {/* Main Card */}
        <div className="glass-effect rounded-2xl p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Input Section */}
            <div>
              <label htmlFor="appId" className="block text-sm font-medium text-gray-300 mb-2">
                Steam App ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="appId"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Steam App ID (e.g., 730)"
                  className="w-full px-4 py-3 pr-12 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (appId.trim()) {
                      // Clear the input if it has content
                      setAppId("")
                    } else {
                      // Paste from clipboard if input is empty
                      try {
                        const text = await navigator.clipboard.readText()
                        setAppId(text.trim())
                      } catch (err) {
                        console.error("Failed to read clipboard:", err)
                      }
                    }
                  }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300 transition-colors duration-200"
                  disabled={isLoading}
                >
                  {appId.trim() ? (
                    // Clear icon when input has content
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    // Paste icon when input is empty
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isLoading || !appId.trim()}
              className="w-full download-button text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Download Manifest</span>
                </>
              )}
            </button>

            {/* Message Display */}
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  messageType === "success"
                    ? "bg-green-500/20 border border-green-500/30 text-green-200"
                    : "bg-red-500/20 border border-red-500/30 text-red-200"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {messageType === "success" ? (
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="text-sm">{message}</span>
                </div>
              </div>
            )}

            {/* Info Section */}
            <div className="bg-black/20 rounded-lg p-4 border border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-2">How to use:</h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Enter the Steam App ID (found in Steam store URL)</li>
                <li>• Click "Download Manifest" to get the game manifest</li>
                <li>• The manifest will be downloaded as a ZIP file</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
