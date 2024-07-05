// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }
use tauri::{Manager, SystemTray, CustomMenuItem, SystemTrayMenu, SystemTrayMenuItem, SystemTrayEvent, AppHandle, Wry};
use tauri_plugin_autostart::MacosLauncher;

// 创建系统托盘
pub fn create_system_tray() -> SystemTray {
    let quit = CustomMenuItem::new("quit".to_string(), "退出应用");
    let hide = CustomMenuItem::new("hide".to_string(), "保持后台运行");
    let tray_menu = SystemTrayMenu::new()
      .add_item(hide)
      .add_native_item(SystemTrayMenuItem::Separator) // 添加项目间分隔线
      .add_item(quit);
    SystemTray::new().with_menu(tray_menu)
}

// 处理托盘事件
pub fn handle_system_tray_event(app: &AppHandle<Wry>, event: SystemTrayEvent) {
    match event {
        // 匹配项目双击事件
        SystemTrayEvent::DoubleClick { position: _ , size: _, .. } => {
            let window = app.get_window("main").unwrap();
            window.unminimize().unwrap();
            window.show().unwrap(); 
            window.set_focus().unwrap();
        },
        SystemTrayEvent::MenuItemClick { id, ..} => {
            match id.as_str() {
              "quit" => {
                // app.get_window("main").unwrap().hide().unwrap();
                app.get_window("main").unwrap().close().unwrap();
                app.emit_all("close", {}).unwrap();
                // debug!("System tray try to close");
              }
              "hide" => {
                app.get_window("main").unwrap().hide().unwrap();
                app.emit_all("hide", {}).unwrap();
                // debug!("System tray try to hide/show");
              }
              _ => {}
            }
        }
        _ => {}
    }
}

#[derive(Clone, serde::Serialize)]
struct Payload {
  args: Vec<String>,
  cwd: String,
}

fn main() {
    // tauri::Builder::default()
    //     .invoke_handler(tauri::generate_handler![greet])
    //     .run(tauri::generate_context!())
    //     .expect("error while running tauri application");

    // 保持后端在后台运行
    // tauri::Builder::default()
    //     .build(tauri::generate_context!())
    //     .expect("error while running tauri application")
    //     .run(|_app_handle, event| match event {
    //         tauri::RunEvent::ExitRequested { api, .. } => {
    //             api.prevent_exit();
    //         }
    //         _ => {}
    //     })

    // 保持前端在后台运行
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![]) /* arbitrary number of args to pass to your app */))
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            // println!("{}, {argv:?}, {cwd}", app.package_info().name);
            app.emit_all("single-instance", Payload { args: argv, cwd }).unwrap();

            app.get_window("main").unwrap().show().unwrap();
        }))
        .system_tray(create_system_tray())
    	.on_system_tray_event(handle_system_tray_event)
        // .setup(|app| {
        //     app.get_window("main").unwrap().hide().unwrap();
        //     Ok(())
        // })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
