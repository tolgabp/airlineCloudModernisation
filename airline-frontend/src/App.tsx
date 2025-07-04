import './App.css';
import FlightList from './Components/FlightList';
import BookFlight from './Components/BookFlight';
import MyBookings from './Components/MyBookings';
import Login from './Components/Login';
import Register from './Components/Register';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [page, setPage] = useState<"login" | "register" | "main">("login");
  const [username, setUsername] = useState<string | null>(null);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (page === "main") {
      axios.get('http://localhost:8081/api/flights')
        .then(response => setFlights(response.data))
        .catch(error => console.error('Error fetching flights:', error));
    }
  }, [page]);

  const handleRegister = (username: string, password: string) => {
    setUsername(username);
    setPage("main");
  };

  const handleLogin = (username: string, password: string) => {
    setUsername(username);
    setPage("main");
  };

  const handleLogout = () => {
    setUsername(null);
    setPage("login");
    setBookings([]);
  };

  if (page === "login") {
    return (
      <div>
        <Login onLogin={handleLogin} />
        <div className="mt-4 text-center">
          <span>Don't have an account? </span>
          <button className="text-blue-600 underline" onClick={() => setPage("register")}>
            Register
          </button>
        </div>
      </div>
    );
  }

  if (page === "register") {
    return (
      <div>
        <Register onRegister={handleRegister} />
        <div className="mt-4 text-center">
          <span>Already have an account? </span>
          <button className="text-blue-600 underline" onClick={() => setPage("login")}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <div>Welcome, <b>{username}</b>!</div>
        <button className="text-red-600 underline" onClick={handleLogout}>Logout</button>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-4">
          <FlightList flights={flights} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <BookFlight
            flights={flights}
            onBook={flight => {
              axios.post('http://localhost:8081/api/bookings', {
                username,
                flight: { id: flight.id }
              })
              .then(response => {
                setBookings([...bookings, response.data]);
              })
              .catch(error => {
                console.error('Error booking flight:', error);
              });
            }}
          />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <MyBookings bookings={bookings} flights={flights} />
        </div>
      </div>
    </div>
  );
}

export default App;
