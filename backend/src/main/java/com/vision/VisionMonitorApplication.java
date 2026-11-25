package com.vision;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Vision Monitor VMS Application
 * Manufacturing AI Monitoring Dashboard
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.vision")
@EnableScheduling
public class VisionMonitorApplication {

    public static void main(String[] args) {
        SpringApplication.run(VisionMonitorApplication.class, args);
    }

}
