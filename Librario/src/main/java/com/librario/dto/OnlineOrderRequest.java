// src/main/java/com/librario/dto/OnlineOrderRequest.java
package com.librario.dto;

import com.librario.Entity.PaymentType;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Optional;

@Data
public class OnlineOrderRequest {
    private Long memberId;
    private BigDecimal amount;
    private PaymentType type;
    private Optional<Long> borrowingRecordId;
}