import React from 'react';

const ProfilePage = ({ user }) => {
    return (
        <div>
            <h1>Profile Page</h1>
            <div>
                <h2>Welcome, {user?.name || 'User'}!</h2>
                <p>Email: {user?.email || 'user@example.com'}</p>
                <p>Member since: {user?.joinedDate || 'January 2023'}</p>
            </div>
        </div>
    );
};

export default ProfilePage;
