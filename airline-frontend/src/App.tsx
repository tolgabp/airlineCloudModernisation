import './App.css';
import FlightList from './Components/FlightList';
import BookFlight from './Components/BookFlight';
import MyBookings from './Components/MyBookings';
import UserProfile from './Components/UserProfile';
import Login from './Components/Login';
import Register from './Components/Register';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { parseApiError } from './utils/errorHandler';

function App() {
  const [page, setPage] = useState<"login" | "register" | "main">("login");
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (page === "main" && token) {
      axios.get('http://localhost:8081/api/flights')
        .then(response => {
          const mappedFlights = response.data.map((f: any) => ({
            id: f.id,
            from: f.origin,
            to: f.destination,
            time: new Date(f.departureTime).toLocaleString()
          }));
          setFlights(mappedFlights);
        })
        .catch(error => {
          // Silently handle flight fetching errors - flights will remain empty
        });
      // Fetch bookings for the logged-in user
      axios.get('http://localhost:8081/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => setBookings(response.data))
        .catch(error => setBookings([]));
    }
  }, [page, token]);

  const handleRegister = (name: string, email: string, password: string) => {
    axios.post('http://localhost:8081/api/register', { name, email, password })
      .then(response => {
        alert('Registration successful! Please login.');
        setPage("login");
      })
      .catch(error => {
        const errorMessage = parseApiError(error);
        alert(`Registration failed: ${errorMessage}`);
      });
  };

  const handleLogin = (email: string, password: string) => {
    axios.post('http://localhost:8081/api/login', { email, password })
      .then(response => {
        setEmail(email);
        setToken(response.data.token);
        setPage("main");
      })
      .catch(error => {
        const errorMessage = parseApiError(error);
        alert(`Login failed: ${errorMessage}`);
      });
  };

  const handleLogout = () => {
    setEmail(null);
    setToken(null);
    setPage("login");
    setBookings([]);
  };

  const refreshBookings = () => {
    if (token) {
      axios.get('http://localhost:8081/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => setBookings(response.data))
        .catch(error => setBookings([]));
    }
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
        <div>Welcome, <b>{email}</b>!</div>
        <button className="text-red-600 underline" onClick={handleLogout}>Logout</button>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-4">
          <FlightList flights={flights} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <BookFlight
            flights={flights}
            onBook={flight => {
              if (!token) {
                alert('You must be logged in to book a flight.');
                return;
              }
              axios.post('http://localhost:8081/api/bookings', {
                flightId: flight.id
              }, {
                headers: { Authorization: `Bearer ${token}` }
              })
              .then(() => {
                alert('Flight booked successfully!');
                // Refresh bookings after successful booking
                refreshBookings();
              })
              .catch(error => {
                const errorMessage = parseApiError(error);
                alert(`Booking failed: ${errorMessage}`);
              });
            }}
          />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <MyBookings 
            bookings={bookings} 
            flights={flights} 
            token={token}
            onBookingUpdate={refreshBookings}
            onLogout={handleLogout}
          />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <UserProfile 
            token={token}
            onLogout={handleLogout}
            email={email || undefined}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
