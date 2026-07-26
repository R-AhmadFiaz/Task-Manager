// All application logic (auth, task CRUD) lives in the React frontend via
// supabase-js, exactly like the web app — Tauri's Rust side here only needs
// to host the webview window, so there are no custom #[tauri::command]s.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
