import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send, Bell } from "lucide-react";
import NotificationSettings from "../components/NotificationSettings";
import { useState } from "react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState("appearance");

  const tabs = [
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "notifications", label: "Notifications", icon: "🔔" }
  ];

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-sm text-base-content/70">Customize your chat experience</p>
        </div>

        {/* Tab Navigation */}
        <div className="tabs tabs-boxed bg-base-200 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab gap-2 transition-all ${
                activeTab === tab.id ? "tab-active" : "hover:bg-base-300"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">Theme</h3>
                <p className="text-sm text-base-content/70">Choose a theme for your chat interface</p>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t}
                    className={`
                      group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all duration-200
                      ${theme === t 
                        ? "bg-base-200 ring-2 ring-primary scale-105" 
                        : "hover:bg-base-200/50 hover:scale-105"}
                    `}
                    onClick={() => setTheme(t)}
                  >
                    <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={t}>
                      <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                        <div className="rounded bg-primary"></div>
                        <div className="rounded bg-secondary"></div>
                        <div className="rounded bg-accent"></div>
                        <div className="rounded bg-neutral"></div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium truncate w-full text-center">
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </span>
                  </button>
                ))}
              </div>

              
            </div>
          )}

          {activeTab === "notifications" && (
            <NotificationSettings />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;