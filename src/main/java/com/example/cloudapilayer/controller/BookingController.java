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

	//proxy POST /api/book to legacy POST /book
	@PostMapping("/bookings")
	public ResponseEntity<String> createBooking(@RequestBody @NonNull String bookingRequest) {
		String legacyUrl = legacyBaseUrl + "/bookings";
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);
		HttpEntity<String> entity = new HttpEntity<>(bookingRequest, headers);

		String response = restTemplate.postForObject(legacyUrl, entity, String.class);
		return ResponseEntity.ok(response);
	}
	// Proxy GET /api/bookings/{id} to legacy GET /booking/{id}
	@GetMapping("/bookings/{id}")
	public ResponseEntity<String> getBooking(@PathVariable String id){
		String legacyUrl = legacyBaseUrl + "/booking/" + id;
		String response = restTemplate.getForObject(legacyUrl, String.class);
		return ResponseEntity.ok(response);
	}
}