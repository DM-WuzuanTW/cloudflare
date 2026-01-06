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
                lang_subtitle: "Choose your preferred interface language"
            },
            common: {
                coming_soon: "Coming Soon",
                dev_module: "The {{module}} module is under development."
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
                lang_subtitle: "選擇介面顯示語言"
            },
            common: {
                coming_soon: "敬請期待",
                dev_module: "{{module}} 模組正在開發中。"
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
