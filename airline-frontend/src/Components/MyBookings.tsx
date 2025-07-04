const MyBookings = ({ bookings, flights }: { bookings: any[], flights: any[] }) => {
    console.log(flights, bookings)
    return (
        <div>
            <h2>My Bookings</h2>
            <ul>
                {bookings.map((booking, idx) => {
                    const flight = flights.find(f => f.id === booking.flight.id);
                    return (
                        <li key={idx}>
                            {flight
                                ? `${flight.origin} → ${flight.destination} at ${flight.time}`
                                : `→ at`}
                        </li>
                    );
                })}
            </ul>
        </div>
    )
}

export default MyBookings;