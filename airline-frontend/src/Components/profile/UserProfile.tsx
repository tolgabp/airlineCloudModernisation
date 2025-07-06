import React, { useState } from "react";
import axios from "axios";
import { parseApiError, isAuthError } from "../../utils/errorHandler";

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
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://cloud-api-layer-eu-906b86b9ff06.herokuapp.com';
      await axios.put(
        `${API_BASE_URL}/api/users/profile`,
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
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://cloud-api-layer-eu-906b86b9ff06.herokuapp.com';
      await axios.delete(
        `${API_BASE_URL}/api/users/profile`,
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
    <div className="card p-6">
      <div className="flex items-center mb-6">
        <div className="bg-airline-100 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
          <svg className="w-6 h-6 text-airline-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
          <p className="text-sm text-gray-600">Manage your account settings</p>
        </div>
      </div>
      
      {message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          message.includes('successfully') 
            ? 'bg-success-50 border-success-200 text-success-800' 
            : 'bg-error-50 border-error-200 text-error-800'
        }`}>
          <div className="flex items-center">
            {message.includes('successfully') ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm font-medium">{message}</span>
          </div>
        </div>
      )}

      {!isEditing ? (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <p className="text-gray-900 font-medium">{email}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 btn-primary py-3 font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
            <button
              onClick={onLogout}
              className="flex-1 btn-secondary py-3 font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="w-full bg-error-600 text-white rounded-xl px-4 py-3 hover:bg-error-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center"
            >
              {isDeleting ? (
                <>
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Account
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-3 text-center">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              minLength={6}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              required
              minLength={6}
              placeholder="Confirm new password"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 btn-primary py-3 font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
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
              className="flex-1 btn-secondary py-3 font-medium"
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