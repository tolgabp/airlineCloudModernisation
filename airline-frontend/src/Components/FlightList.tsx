type Flight = { id: number; from: string; to: string; time: string; };
const FlightList = ({ flights }: { flights: Flight[] }) => {
  return (
    <div>
      <h2>Flight List</h2>
      <ul>
        {flights.map(flight => (
          <li key={flight.id}>
            {flight.from} → {flight.to} at {flight.time}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default FlightList;