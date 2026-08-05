package com.vision.exception;

import lombok.Getter;

/**
 * Custom API Exception
 */
@Getter
public class ApiException extends RuntimeException {

    private final String code;
    private final String message;
    private final Object details;

    public ApiException(String code, String message) {
        this(code, message, null);
    }

    public ApiException(String code, String message, Object details) {
        super(message);
        this.code = code;
        this.message = message;
        this.details = details;
    }

}
