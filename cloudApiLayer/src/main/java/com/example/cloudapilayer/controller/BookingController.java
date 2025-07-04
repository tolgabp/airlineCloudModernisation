package com.example.cloudapilayer.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;

@RestController
@RequestMapping("/api")
public class BookingController {

	private final RestTemplate restTemplate;

	@Value("${legacy.system.base-url}")
	private String legacyBaseUrl;

	@Autowired
	public BookingController(RestTemplate restTemplate) {
		this.restTemplate = restTemplate;
	}

	//proxy POST /api/bookings to legacy POST /api/bookings
	@PostMapping("/bookings")
	public ResponseEntity<String> createBooking(@RequestBody @NonNull String bookingRequest, @RequestHeader(value = "Authorization", required = false) String authorization) {
		try {
			String legacyUrl = legacyBaseUrl + "/api/bookings";
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			if (authorization != null) {
				headers.set("Authorization", authorization);
			}
			HttpEntity<String> entity = new HttpEntity<>(bookingRequest, headers);

			String response = restTemplate.postForObject(legacyUrl, entity, String.class);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			throw e; // Let the global exception handler deal with it
		}
	}
	
	// Proxy GET /api/bookings/{id} to legacy GET /api/bookings/{id}
	@GetMapping("/bookings/{id}")
	public ResponseEntity<String> getBooking(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String authorization) {
		try {
			String legacyUrl = legacyBaseUrl + "/api/bookings/" + id;
			HttpHeaders headers = new HttpHeaders();
			if (authorization != null) {
				headers.set("Authorization", authorization);
			}
			HttpEntity<Void> entity = new HttpEntity<>(headers);
			ResponseEntity<String> response = restTemplate.exchange(legacyUrl, HttpMethod.GET, entity, String.class);
			return ResponseEntity.ok(response.getBody());
		} catch (Exception e) {
			throw e; // Let the global exception handler deal with it
		}
	}
	
	// Proxy GET /api/bookings/my to legacy GET /api/bookings/my
	@GetMapping("/bookings/my")
	public ResponseEntity<String> getMyBookings(@RequestHeader(value = "Authorization", required = false) String authorization) {
		try {
			String legacyUrl = legacyBaseUrl + "/api/bookings/my";
			HttpHeaders headers = new HttpHeaders();
			if (authorization != null) {
				headers.set("Authorization", authorization);
			}
			HttpEntity<Void> entity = new HttpEntity<>(headers);
			ResponseEntity<String> response = restTemplate.exchange(legacyUrl, HttpMethod.GET, entity, String.class);
			return ResponseEntity.ok(response.getBody());
		} catch (Exception e) {
			throw e; // Let the global exception handler deal with it
		}
	}
	
	// Proxy POST /api/bookings/{id}/cancel to legacy POST /api/bookings/{id}/cancel
	@PostMapping("/bookings/{id}/cancel")
	public ResponseEntity<String> cancelBooking(@PathVariable String id, @RequestHeader(value = "Authorization", required = false) String authorization) {
		try {
			String legacyUrl = legacyBaseUrl + "/api/bookings/" + id + "/cancel";
			HttpHeaders headers = new HttpHeaders();
			if (authorization != null) {
				headers.set("Authorization", authorization);
			}
			HttpEntity<Void> entity = new HttpEntity<>(headers);
			ResponseEntity<String> response = restTemplate.exchange(legacyUrl, HttpMethod.POST, entity, String.class);
			return ResponseEntity.ok(response.getBody());
		} catch (Exception e) {
			throw e; // Let the global exception handler deal with it
		}
	}

	// Proxy PUT /api/bookings/{id} to legacy PUT /api/bookings/{id}
	@PutMapping("/bookings/{id}")
	public ResponseEntity<String> updateBooking(@PathVariable String id, @RequestBody @NonNull String updateRequest, @RequestHeader(value = "Authorization", required = false) String authorization) {
		try {
			String legacyUrl = legacyBaseUrl + "/api/bookings/" + id;
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);
			if (authorization != null) {
				headers.set("Authorization", authorization);
			}
			HttpEntity<String> entity = new HttpEntity<>(updateRequest, headers);
			ResponseEntity<String> response = restTemplate.exchange(legacyUrl, HttpMethod.PUT, entity, String.class);
			return ResponseEntity.ok(response.getBody());
		} catch (Exception e) {
			throw e; // Let the global exception handler deal with it
		}
	}
}