import React, { useState } from 'react';

const SettingsPage = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);

    const handleSave = () => {
        // Save settings logic
        console.log('Settings Saved:', { darkMode, notifications });
    };

    return (
        <div>
            <h1>Settings Page</h1>
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                    />
                    Enable Dark Mode
                </label>
            </div>
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={notifications}
                        onChange={() => setNotifications(!notifications)}
                    />
                    Enable Notifications
                </label>
            </div>
            <button onClick={handleSave}>Save Settings</button>
        </div>
    );
};

export default SettingsPage;
