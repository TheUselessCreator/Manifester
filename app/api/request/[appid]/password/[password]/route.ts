import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { appid: string; password: string } }) {
  try {
    const { appid, password } = params

    const API_PASSWORD = process.env.API_PASSWORD

    if (!API_PASSWORD) {
      console.error("API_PASSWORD environment variable not set")
      return NextResponse.json({ error: "API not configured" }, { status: 500 })
    }

    if (password !== API_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!appid) {
      return NextResponse.json({ error: "App ID is required" }, { status: 400 })
    }

    let gameName = "Unknown Game"
    try {
      const steamApiUrl = `https://store.steampowered.com/api/appdetails?appids=${appid}`
      const steamResponse = await fetch(steamApiUrl)
      const steamData = await steamResponse.json()

      if (steamData[appid]?.success && steamData[appid]?.data?.name) {
        gameName = steamData[appid].data.name
      }
    } catch (error) {
      console.log("Failed to fetch game name from Steam API:", error)
    }

    const downloadUrl = `https://codeload.github.com/ManifestHub/zip/refs/heads/${appid}`

    const response = await fetch(downloadUrl, {
      method: "GET",
      signal: AbortSignal.timeout(60000),
    })

    if (response.status === 200) {
      const body = response.body

      if (!body) {
        return NextResponse.json({ error: "No file content received" }, { status: 500 })
      }

      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="manifest-${appid}.zip"`,
          "Content-Length": response.headers.get("content-length") || "",
          "X-Game-ID": appid,
          "X-Game-Name": gameName,
        },
      })
    } else if (response.status === 404) {
      return NextResponse.json({ error: "AppID Not Found" }, { status: 404 })
    } else {
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
