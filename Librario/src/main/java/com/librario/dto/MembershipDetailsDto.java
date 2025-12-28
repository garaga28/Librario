package com.librario.dto;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class MembershipDetailsDto {
    @JsonProperty("membership_type")
    private String membershipType;

    @JsonProperty("start_date")
    private Date startDate;

    @JsonProperty("end_date")
    private Date endDate;

    public MembershipDetailsDto(String membershipType, Date startDate, Date endDate) {
        this.membershipType = membershipType;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getters and Setters
    public String getMembershipType() {
        return membershipType;
    }

    public void setMembershipType(String membershipType) {
        this.membershipType = membershipType;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }
}
