// import React from "react";
import "@unocss/reset/tailwind.css"
import ReactDOM from "react-dom/client"
import { enable } from "tauri-plugin-autostart-api"
import "virtual:uno.css"
import App from "./App"

// TODO 开机启动应该在设置页面中, 让用户选择是否开机启动. 根据用户的选择进行函数调用
enable()

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
  <App />,
  // </React.StrictMode>,
)
