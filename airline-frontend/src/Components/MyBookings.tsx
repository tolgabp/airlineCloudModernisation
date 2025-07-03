const MyBookings = ({ bookings }: { bookings: any[] }) => {
    return (
        <div>
            <h2>My Bookings</h2>
            <ul>
                {bookings.map((booking, idx) => (
                    <li key={idx}>
                        {booking.from} → {booking.to} at {booking.time}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default MyBookings;