import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="h-screen container mx-auto px-2 pt-16 max-w-5xl bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      <div className="space-y-4 bg-base-100/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-base-300/30 p-4 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Theme</h2>
          <p className="text-xs text-base-content/70">Choose a theme for your chat interface</p>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {THEMES.map((t) => (
            <button
              key={t}
              className={`
                group flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300
                border border-base-300/30 shadow-sm hover:shadow-md
                ${theme === t ? "bg-primary/10 border-primary/30 shadow-lg" : "bg-base-200/50 hover:bg-base-200/80"}
              `}
              onClick={() => setTheme(t)}
            >
              <div className="relative h-6 w-full rounded-md overflow-hidden shadow-sm" data-theme={t}>
                <div className="absolute inset-0 grid grid-cols-4 gap-px p-0.5">
                  <div className="rounded bg-primary"></div>
                  <div className="rounded bg-secondary"></div>
                  <div className="rounded bg-accent"></div>
                  <div className="rounded bg-neutral"></div>
                </div>
              </div>
              <span className={`text-[10px] font-medium truncate w-full text-center transition-colors duration-200 
                ${theme === t ? "text-primary" : "text-base-content/80"}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            </button>
          ))}
        </div>

        {/* Preview Section */}
        <h3 className="text-base font-semibold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Preview</h3>
        <div className="rounded-2xl border border-base-300/50 overflow-hidden bg-base-100/80 backdrop-blur-sm shadow-xl">
          <div className="p-3 bg-base-200/80 backdrop-blur-sm">
            <div className="max-w-lg mx-auto">
              {/* Mock Chat UI */}
              <div className="bg-base-100/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-base-300/30">
                {/* Chat Header */}
                <div className="px-3 py-2 border-b border-base-300/50 bg-base-100/80 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium shadow-sm text-xs">
                      J
                    </div>
                    <div>
                      <h3 className="font-medium text-xs">John Doe</h3>
                      <p className="text-[10px] text-base-content/70 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                        Online
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-3 space-y-2 h-24 overflow-y-auto bg-base-100/50 backdrop-blur-sm">
                  {PREVIEW_MESSAGES.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`
                          max-w-[80%] rounded-lg p-2 shadow-sm backdrop-blur-sm
                          ${message.isSent ? "bg-primary text-primary-content" : "bg-base-200/80"}
                        `}
                      >
                        <p className="text-xs">{message.content}</p>
                        <p
                          className={`
                            text-[9px] mt-1
                            ${message.isSent ? "text-primary-content/70" : "text-base-content/70"}
                          `}
                        >
                          12:00 PM
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-2 border-t border-base-300/50 bg-base-100/80 backdrop-blur-sm">
                  <div className="flex gap-1">
                    <input
                      type="text"
                      className="input flex-1 text-xs h-8 bg-base-200/50 border-base-300/50"
                      placeholder="Type a message..."
                      value="This is a preview"
                      readOnly
                    />
                    <button className="btn btn-primary h-8 min-h-0 w-8 p-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <Send size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;