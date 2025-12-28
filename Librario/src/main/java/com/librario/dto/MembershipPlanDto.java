package com.librario.dto;

import lombok.Data;

@Data
public class MembershipPlanDto {
    private String type;
    private Double fees;
    private Integer borrowingLimit;
    private Integer durationInMonths;
}
