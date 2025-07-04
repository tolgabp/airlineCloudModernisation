import React, { useState } from "react";

const Register = ({ onRegister }: { onRegister: (name: string, email: string, password: string) => void }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(name, email, password);
  };

  return (
    <div className="max-w-sm mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl mb-4">Register</h2>
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
    </div>
  );
};

export default Register;

