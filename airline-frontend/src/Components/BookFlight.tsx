import React, { useState } from "react";

type Flight = { id: number; from: string; to: string; time: string; };

const BookFlight = ({
  flights,
  onBook,
}: {
  flights: Flight[];
  onBook: (booking: Flight) => void;
}) => {
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId === "") return;
    const flight = flights.find((f) => f.id === selectedId);
    if (flight) {
      onBook(flight);
      setSelectedId("");
      setMessage("Flight booked successfully!");
      setTimeout(() => setMessage(""), 2000); // Clear after 2 seconds
    }
  };

    return (
        <div>
      <h2>Book Flight</h2>
      {message && <div className="text-green-600 mb-2">{message}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <select
          className="border rounded p-2"
          value={selectedId}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          required
        >
          <option value="">Select a flight</option>
          {flights.map((flight) => (
            <option key={flight.id} value={flight.id}>
              {flight.from} → {flight.to} at {flight.time}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
        >
          Book
        </button>
      </form>
        </div>
  );
};

export default BookFlight;