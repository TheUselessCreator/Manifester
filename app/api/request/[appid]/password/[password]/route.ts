import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { appid: string; password: string } }) {
  try {
    const { appid, password } = params

    console.log("API Request received for appid:", appid)

    const API_PASSWORD = process.env.API_PASSWORD

    if (!API_PASSWORD) {
      console.error("API_PASSWORD environment variable not set")
      return NextResponse.json({ error: "API not configured" }, { status: 500 })
    }

    if (password !== API_PASSWORD) {
      console.log("Password mismatch")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!appid) {
      return NextResponse.json({ error: "App ID is required" }, { status: 400 })
    }

    let gameName = "Unknown Game"
    try {
      const steamDbUrl = `https://api.steamdb.info/v1/app/${appid}/`
      const steamController = new AbortController()
      const steamTimeout = setTimeout(() => steamController.abort(), 3000)

      const steamResponse = await fetch(steamDbUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
        signal: steamController.signal,
      }).catch(() => null)

      clearTimeout(steamTimeout)

      if (steamResponse?.ok) {
        const steamData = await steamResponse.json().catch(() => null)
        if (steamData?.data?.name) {
          gameName = steamData.data.name
          console.log("Game name fetched:", gameName)
        }
      }
    } catch {
      // Silently ignore all Steam API errors
    }

    const downloadUrl = `https://codeload.github.com/SteamAutoCracks/ManifestHub/zip/refs/heads/${appid}`
    console.log("Fetching from GitHub:", downloadUrl)

    const response = await fetch(downloadUrl, {
      method: "GET",
      signal: AbortSignal.timeout(60000),
    })

    console.log("GitHub response status:", response.status)

    if (response.status === 200) {
      const arrayBuffer = await response.arrayBuffer()
      console.log("File size:", arrayBuffer.byteLength, "bytes")

      return new NextResponse(arrayBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="manifest-${appid}.zip"`,
          "Content-Length": arrayBuffer.byteLength.toString(),
          "X-Game-ID": appid,
          "X-Game-Name": gameName,
          "Cache-Control": "no-cache",
        },
      })
    } else if (response.status === 404) {
      console.log("AppID not found on GitHub")
      return NextResponse.json({ error: "AppID Not Found" }, { status: 404 })
    } else {
      console.log("GitHub fetch failed with status:", response.status)
      return NextResponse.json({ error: "Failed to fetch manifest" }, { status: response.status })
    }
  } catch (error: any) {
    console.error("Download error:", error)

    if (error.name === "TimeoutError") {
      return NextResponse.json({ error: "Download timeout. Please try again." }, { status: 408 })
    }

    return NextResponse.json({ error: `Failed to download manifest: ${error.message}` }, { status: 500 })
  }
}
