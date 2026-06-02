package com.dressrosa.dressrosa_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DressrosaBackendApplication {
	public static void main(String[] args) {
		SpringApplication.run(DressrosaBackendApplication.class, args);
	}

}
