import { shell } from "@tauri-apps/api"
import { platform } from "@tauri-apps/api/os"
import { resolveResource } from "@tauri-apps/api/path"

type Platform = "linux" | "darwin" | "ios" | "freebsd" | "dragonfly" | "netbsd" | "openbsd" | "solaris" | "android" | "win32"

async function getFilePath() {
  const paths: Record<string, string> = {
    win32: "../public/windows-wallpaper-x86-64.exe",
    darwin: "../public/macos-wallpaper",
  }
  const currentPlatform: Platform = await platform()
  // const filePath = await path.resolve(paths[currentPlatform])
  const filePath = await resolveResource(paths[currentPlatform])
  return filePath
}

// TODO: 目前只适用于 win. mac 需要改一些代码
export async function setWallpaper(imgPath: string, { scale = "fill" } = {}) {
  const filePath = await getFilePath()
  const args = [filePath, "set", imgPath!, "--scale", scale]
  const command = new shell.Command("run-powershell", args)
  await command.execute()
}

export async function getWallpaper() {
  const filePath = await getFilePath()
  const args = [filePath, "get"]
  const command = new shell.Command("run-powershell", args)
  const { stdout } = await command.execute()
  return stdout.trim()
}
