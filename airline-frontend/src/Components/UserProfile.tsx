import React, { useState } from "react";
import axios from "axios";
import { parseApiError, isAuthError } from "../utils/errorHandler";

interface UserProfileProps {
  token: string | null;
  onLogout: () => void;
  email?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ token, onLogout, email: userEmail }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(userEmail || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      return;
    }

    try {
      await axios.put(
        'http://localhost:8081/api/users/profile',
        { email, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Profile updated successfully!");
      setIsEditing(false);
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      const errorMessage = parseApiError(error);
      setMessage(`Update failed: ${errorMessage}`);
      
      // Handle authentication errors
      if (isAuthError(error)) {
        setTimeout(() => {
          onLogout();
        }, 3000);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(
        'http://localhost:8081/api/users/profile',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Account deleted successfully!");
      setTimeout(() => {
        onLogout();
      }, 2000);
    } catch (error: any) {
      const errorMessage = parseApiError(error);
      setMessage(`Delete failed: ${errorMessage}`);
      setIsDeleting(false);
      
      // Handle authentication errors
      if (isAuthError(error)) {
        setTimeout(() => {
          onLogout();
        }, 3000);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-4">User Profile</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {!isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{email}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
          >
            Edit Profile
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="bg-red-600 text-white rounded px-4 py-2 hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setPassword("");
                setConfirmPassword("");
                setMessage("");
              }}
              className="bg-gray-600 text-white rounded px-4 py-2 hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserProfile; 