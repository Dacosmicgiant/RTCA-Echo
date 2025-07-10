import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, or GIF)");
      return;
    }
  
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Image size must be less than 5MB");
      return;
    }
  
    const reader = new FileReader();
  
    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      try {
        await updateProfile({ profilePic: base64Image });
      } catch (err) {
        setSelectedImg(null); // Reset on error
        alert(err.message || "Failed to update profile picture");
      }
    };
  
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-screen pt-16 bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      <div className="max-w-2xl mx-auto p-2 h-[calc(100vh-4rem)] flex items-center">
        <div className="bg-base-100/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-base-300/30 p-4 space-y-4 w-full max-h-full overflow-y-auto">
          <div className="text-center">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Profile</h1>
            <p className="mt-1 text-base-content/70">Your profile information</p>
          </div>

          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-24 rounded-full object-cover border-4 border-base-300/50 shadow-lg"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-primary/90 hover:bg-primary hover:scale-105
                  p-1.5 rounded-full cursor-pointer 
                  transition-all duration-300 shadow-lg
                  border-2 border-base-100
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-4 h-4 text-primary-content" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-xs text-base-content/60">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-xs text-base-content/60 flex items-center gap-2">
                <User className="w-3 h-3" />
                Full Name
              </div>
              <p className="px-3 py-2 bg-base-200/80 backdrop-blur-sm rounded-lg border border-base-300/50 shadow-sm text-sm">
                {authUser?.fullName}
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-base-content/60 flex items-center gap-2">
                <Mail className="w-3 h-3" />
                Email Address
              </div>
              <p className="px-3 py-2 bg-base-200/80 backdrop-blur-sm rounded-lg border border-base-300/50 shadow-sm text-sm">
                {authUser?.email}
              </p>
            </div>
          </div>

          <div className="bg-base-200/80 backdrop-blur-sm rounded-xl p-4 border border-base-300/50 shadow-sm">
            <h2 className="text-base font-medium mb-3">Account Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1.5 border-b border-base-300/50">
                <span>Member Since</span>
                <span className="font-medium">{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span>Account Status</span>
                <span className="text-success font-medium flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;