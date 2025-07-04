import React, { useState } from "react";
import AuthLayout from "./AuthLayout";

interface RegisterProps {
  onRegister: (name: string, email: string, password: string) => void;
  onBackToHome?: () => void;
  onGoToLogin?: () => void;
}

const Register = ({ onRegister, onBackToHome, onGoToLogin }: RegisterProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(name, email, password);
  };

  return (
    <AuthLayout title="Sign Up" onBackToHome={onBackToHome}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700" type="submit">
          Register
        </button>
      </form>
      <div className="mt-4 text-center">
        <span className="text-sm text-gray-600">Already have an account? </span>
        <button 
          onClick={onGoToLogin}
          className="text-blue-600 hover:underline text-sm"
        >
          Sign In
        </button>
      </div>
    </AuthLayout>
  );
};

export default Register;

