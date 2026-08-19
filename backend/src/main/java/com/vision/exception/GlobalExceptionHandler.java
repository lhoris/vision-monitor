package com.vision.exception;

import com.vision.util.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Global Exception Handler
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Object>> handleApiException(ApiException ex) {
        return ResponseEntity
                .status(resolveStatus(ex.getCode()))
                .body(ApiResponse.error(ex.getCode(), ex.getMessage(), ex.getDetails()));
    }

    private HttpStatus resolveStatus(String code) {
        return switch (code) {
            case "UNAUTHENTICATED" -> HttpStatus.UNAUTHORIZED;
            case "FORBIDDEN" -> HttpStatus.FORBIDDEN;
            case "USER_NOT_FOUND", "ORG_UNIT_NOT_FOUND" -> HttpStatus.NOT_FOUND;
            case "DUPLICATE_USERNAME", "LAST_ADMIN_RISK", "SELF_LOCKOUT_RISK", "VERSION_CONFLICT", "USERNAME_IMMUTABLE" -> HttpStatus.CONFLICT;
            case "VALIDATION_ERROR", "ORG_UNIT_INACTIVE", "CONFIRMATION_REQUIRED" -> HttpStatus.UNPROCESSABLE_ENTITY;
            default -> HttpStatus.BAD_REQUEST;
        };
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneralException(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("INTERNAL_ERROR", "An unexpected error occurred", ex.getMessage()));
    }

}
