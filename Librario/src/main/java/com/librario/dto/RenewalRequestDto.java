// src/main/java/com/librario/dto/RenewalRequestDto.java
package com.librario.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class RenewalRequestDto {
    private Long id;
    private Long memberId;
    private String memberName;
    private String status;
    private Instant requestedDate;
}