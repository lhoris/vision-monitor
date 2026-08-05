package com.vision.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Database Configuration
 */
@Configuration
@EnableJpaRepositories(basePackages = "com.vision.repository")
@EnableTransactionManagement
public class DatabaseConfig {

    // Hibernate/JPA configuration is handled by Spring Boot auto-configuration
    // MariaDB connection is configured in application.yml

}
