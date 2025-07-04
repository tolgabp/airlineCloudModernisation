import React from 'react';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
  onBackToHome?: () => void;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children, onBackToHome }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">{title}</h2>
        {children}
        <div className="mt-6 text-center">
          <button 
            onClick={onBackToHome}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 