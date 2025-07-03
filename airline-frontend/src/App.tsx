import './App.css';
import FlightList from './Components/FlightList';
import BookFlight from './Components/BookFlight';
import MyBookings from './Components/MyBookings';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:8081/flights')
      .then(response => response.json())
      .then(data => setFlights(data))
      .catch(error => console.error('Error fetching flights:', error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-4">
          <FlightList flights={flights} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <BookFlight flights={flights} onBook={booking => setBookings([...bookings, booking])} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <MyBookings bookings={bookings} />
        </div>
      </div>
    </div>
  );
}

export default App;
