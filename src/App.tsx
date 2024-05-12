import { dialog, path, shell } from "@tauri-apps/api";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { useState } from "react";
import Img from "./components/Img";

function App() {
  const [img, setImg] = useState("");
  async function selectFile() {
    const imgPath = (await dialog.open({
      multiple: false, // 是否允许选择多个文件
      directory: false, // 是否选择文件夹而不是文件
      filters: [{ name: "All Files", extensions: ["*"] }], // 文件筛选器
    })) as string | null;

    if (!imgPath) return;
    // resolve 默认位置是 src-tauri 目录
    const shellPath = await path.resolve("../public/ChangeWallpaper.ps1");
    const args = ["-File", shellPath, imgPath];
    setImg(convertFileSrc(imgPath));
    const command = new shell.Command("run-powershell", args);
    await command.execute();
  }

  return (
    <>
      <Img src={img} />
      <button onClick={selectFile}>选择壁纸</button>
    </>
  );
}

export default App;
