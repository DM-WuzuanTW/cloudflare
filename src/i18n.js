import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            login: {
                title: "Cloudflare Mobile",
                subtitle: "Secure API Management",
                email: "Email Address",
                key: "Global API Key",
                btn_verify: "Verifying Credentials...",
                btn_signin: "Sign In securely",
                disclaimer: "Your credentials are encrypted using AES-256 and stored ONLY on your local device. We never see your keys."
            },
            sidebar: {
                dashboard: "Dashboard",
                zones: "Websites (Zones)",
                dns: "DNS",
                security: "Security",
                cache: "Caching",
                workers: "Workers & KV",
                pages: "Pages",
                settings: "Settings",
                logout: "Log Out",
                welcome: "Cloudflare"
            },
            zones: {
                title: "Website Zones",
                subtitle: "Manage your domains and site configurations.",
                refresh: "Refresh",
                plan: "Plan",
                status_active: "ACTIVE",
                status_pending: "PENDING",
                btn_dns: "DNS",
                btn_cache: "Cache",
                loading: "Loading Zones..."
            },
            workers: {
                title: "Workers & KV",
                subtitle: "Deploy serverless code instantly across the globe.",
                account: "'s Account",
                no_workers: "No workers found.",
                btn_logs: "Logs",
                btn_deploy: "Deploy",
                loading: "Loading Workers..."
            },
            pages: {
                title: "Cloudflare Pages",
                subtitle: "Build and deploy full-stack applications.",
                source: "Source",
                direct: "Direct Upload",
                status_active: "Active",
                loading: "Loading Pages..."
            },
            settings: {
                title: "Settings",
                about: "About Application",
                current_ver: "Current Version",
                running_ver: "Running version",
                update_title: "Software Update",
                btn_check: "Check for Updates",
                btn_checking: "Checking...",
                status_latest: "You are on the latest version.",
                status_downloading: "Update v{{version}} is downloading in background...",
                status_error: "Check failed:",
                note: "Updates are automatically downloaded in the background. Restart the app to apply.",
                lang_title: "Language / 語言",
                lang_subtitle: "Choose your preferred interface language",
                troubleshoot: "Troubleshooting Logs",
                troubleshoot_desc: "If you encounter update issues, check the logs here.",
                open_logs: "Open Log Folder",
                download_manual: "Download Manually"
            },
            common: {
                coming_soon: "Coming Soon",
                dev_module: "The {{module}} module is under development."
            },
            dns_mgmt: {
                title: "DNS Management",
                subtitle: "Manage DNS records for your domains with ease.",
                select_zone: "Select Zone",
                total_records: "Total Records",
                proxied: "Proxied",
                dns_only: "DNS Only",
                search_placeholder: "Search records by name, content, or type...",
                add_record: "Add Record",
                table: {
                    type: "Type",
                    name: "Name",
                    content: "Content",
                    proxy_status: "Proxy Status",
                    ttl: "TTL",
                    actions: "Actions",
                    loading: "Loading records...",
                    no_records: "No DNS records found for this zone.",
                    no_match: "No matching records found."
                },
                modal: {
                    add_title: "Add DNS Record",
                    edit_title: "Edit DNS Record",
                    type: "Type",
                    ttl: "TTL",
                    ttl_auto: "Auto",
                    name_label: "Name",
                    name_placeholder: "e.g. www (use @ for root)",
                    content_label: "Content",
                    content_placeholder: "IPv4 address (e.g. 1.2.3.4) or target domain",
                    proxy_status: "Proxy Status",
                    proxied_desc: "Traffic is accelerated and protected by Cloudflare.",
                    dns_only_desc: "Traffic bypasses Cloudflare causing exposure.",
                    cancel: "Cancel",
                    save: "Save Record",
                    saving: "Saving..."
                },
                alerts: {
                    delete_confirm: "Are you sure you want to delete this record? This action cannot be undone.",
                    op_failed: "Operation failed: ",
                    delete_failed: "Delete failed: "
                }
            }
        }
    },
    zh: {
        translation: {
            login: {
                title: "Cloudflare 桌面版",
                subtitle: "安全 API 管理工具",
                email: "Email 信箱",
                key: "Global API 金鑰",
                btn_verify: "正在驗證...",
                btn_signin: "安全登入",
                disclaimer: "您的金鑰使用 AES-256 加密並僅儲存在您的本機裝置上。我們無法查看您的金鑰。"
            },
            sidebar: {
                dashboard: "儀表板",
                zones: "網站 (Zones)",
                dns: "DNS 設定",
                security: "安全性",
                cache: "快取管理",
                workers: "Workers 與 KV",
                pages: "Pages 專案",
                settings: "設定",
                logout: "登出",
                welcome: "Cloudflare"
            },
            zones: {
                title: "網站列表",
                subtitle: "管理您的網域與網站設定。",
                refresh: "重新整理",
                plan: "方案",
                status_active: "啟用中",
                status_pending: "待處理",
                btn_dns: "DNS",
                btn_cache: "快取",
                loading: "載入網站中..."
            },
            workers: {
                title: "Workers 與 KV",
                subtitle: "在全球邊緣網路部署無伺服器程式碼。",
                account: "的帳號",
                no_workers: "找不到 Worker。",
                btn_logs: "日誌",
                btn_deploy: "部署",
                loading: "載入 Workers..."
            },
            pages: {
                title: "Cloudflare Pages",
                subtitle: "建置並部署全端應用程式。",
                source: "來源",
                direct: "直接上傳",
                status_active: "運作中",
                loading: "載入 Pages..."
            },
            settings: {
                title: "設定",
                about: "關於應用程式",
                current_ver: "目前版本",
                running_ver: "正在執行的版本",
                update_title: "軟體更新",
                btn_check: "檢查更新",
                btn_checking: "檢查中...",
                status_latest: "您目前已是最新版本。",
                status_downloading: "更新檔 v{{version}} 正在背景下載中...",
                status_error: "檢查失敗：",
                note: "更新會自動在背景下載。重啟應用程式即可套用。",
                lang_title: "語言 / Language",
                lang_subtitle: "選擇介面顯示語言",
                troubleshoot: "疑難排解記錄",
                troubleshoot_desc: "如果您遇到更新問題，請在此處查看日誌。",
                open_logs: "開啟記錄資料夾",
                download_manual: "手動下載"
            },
            common: {
                coming_soon: "敬請期待",
                dev_module: "{{module}} 模組正在開發中。"
            },
            dns_mgmt: {
                title: "DNS 管理",
                subtitle: "輕鬆管理網域的 DNS 記錄。",
                select_zone: "選擇網站",
                total_records: "總記錄數",
                proxied: "已代理 (Proxied)",
                dns_only: "僅 DNS (DNS Only)",
                search_placeholder: "搜尋名稱、內容或類型...",
                add_record: "新增記錄",
                table: {
                    type: "類型",
                    name: "名稱",
                    content: "內容",
                    proxy_status: "代理狀態",
                    ttl: "TTL",
                    actions: "操作",
                    loading: "正在載入記錄...",
                    no_records: "此網站尚無 DNS 記錄。",
                    no_match: "找不到符合的記錄。"
                },
                modal: {
                    add_title: "新增 DNS 記錄",
                    edit_title: "編輯 DNS 記錄",
                    type: "類型",
                    ttl: "TTL",
                    ttl_auto: "自動 (Auto)",
                    name_label: "名稱",
                    name_placeholder: "例如 www (使用 @ 代表根網域)",
                    content_label: "內容",
                    content_placeholder: "IPv4 位址 (如 1.2.3.4) 或目標網域",
                    proxy_status: "代理狀態",
                    proxied_desc: "流量享有 Cloudflare 加速與防護。",
                    dns_only_desc: "流量繞過 Cloudflare，將直接暴露。",
                    cancel: "取消",
                    save: "儲存記錄",
                    saving: "儲存中..."
                },
                alerts: {
                    delete_confirm: "確定要刪除此記錄嗎？此動作無法復原。",
                    op_failed: "操作失敗：",
                    delete_failed: "刪除失敗："
                }
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
