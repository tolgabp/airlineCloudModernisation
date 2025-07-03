package com.example.cloudapilayer.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api")
public class FlightsController {

	private final RestTemplate restTemplate;

	@Value("${legacy.system.base-url}")//instead of hardcoding the URL, we use the value from the application.properties file
	private String legacyBaseUrl;

	@Autowired
	public FlightsController(RestTemplate restTemplate){
		this.restTemplate = restTemplate;
	}
	
	@GetMapping("/flights")
	public ResponseEntity<String> getFlights(){
		//URL of the legacy reservation system's flights endpoint
		String legacyUrl = legacyBaseUrl + "/flights";
		String response = restTemplate.getForObject(legacyUrl, String.class);
		return ResponseEntity.ok(response);
	}
}
