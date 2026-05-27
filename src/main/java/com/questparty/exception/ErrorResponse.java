package com.questparty.exception;

import java.time.Instant;
import java.util.Map;

public record ErrorResponse(
        Instant timestamp,
        int status,
        ErrorCode code,
        String message,
        String path,
        Map<String, String> fieldErrors
) {
}
