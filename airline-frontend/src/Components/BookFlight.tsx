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
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Book Flight</h2>
          <p className="text-sm text-gray-600">Select and book your preferred flight</p>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-lg border bg-green-50 border-green-200 text-green-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {message}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Flight
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={selectedId}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            required
          >
            <option value="">Choose a flight...</option>
            {flights.map((flight) => (
              <option key={flight.id} value={flight.id}>
                {flight.from} → {flight.to} at {flight.time}
              </option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          disabled={selectedId === ""}
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Book Flight
        </button>
      </form>

      {flights.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-sm font-medium text-gray-900 mb-2">No flights available</h3>
            <p className="text-sm text-gray-500">
              Check back later for available flights.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookFlight;