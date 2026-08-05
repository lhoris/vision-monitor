package com.vision;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

/**
 * Vision Monitor VMS Application
 * Manufacturing AI Monitoring Dashboard
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.vision")
public class VisionMonitorApplication {

    public static void main(String[] args) {
        SpringApplication.run(VisionMonitorApplication.class, args);
    }

}
