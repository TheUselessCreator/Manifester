import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { appId } = await request.json()

    if (!appId) {
      return NextResponse.json(
        { error: 'App ID is required' },
        { status: 400 }
      )
    }

    console.log(`Attempting to download manifest for AppID: ${appId}`)
    const downloadUrl = `https://codeload.github.com/SteamAutoCracks/ManifestHub/zip/refs/heads/${appId}`
    console.log(`Download URL: ${downloadUrl}`)

    // Stream the file directly from GitHub
    const response = await fetch(downloadUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(60000), // 60 second timeout
    })
    
    console.log(`Response status: ${response.status}`)
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()))

    if (response.status === 200) {
      // Return the direct download URL instead of proxying
      return NextResponse.json({
        success: true,
        downloadUrl: downloadUrl,
        filename: `manifest-${appId}.zip`
      })
    } else if (response.status === 404) {
      console.log('AppID not found (404)')
      return NextResponse.json(
        { error: 'AppID Not Found' },
        { status: 404 }
      )
    }
  } catch (error: any) {
    console.error('Download error:', error)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    
    if (error.name === 'TimeoutError') {
      console.log('Request timeout')
      return NextResponse.json(
        { error: 'Download timeout. Please try again.' },
        { status: 408 }
      )
    }

    console.log('Unknown error occurred')
    return NextResponse.json(
      { error: `Failed to download manifest: ${error.message}` },
      { status: 500 }
    )
  }
}
