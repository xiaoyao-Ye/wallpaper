import { exec } from "child_process";

function changeWallpaper(path) {
  exec(`powershell.exe -File ./ChangeWallpaper.ps1 ${wallpaperPath}`);
}

const wallpaperPath = "G:\\壁纸\\picture\\wallhaven-vq5odm_3840x2160.png";
changeWallpaper(wallpaperPath);
