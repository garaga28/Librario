package com.librario.Controller;

import java.util.Date;

// This is a Data Transfer Object (DTO) to represent the incoming request body
// It must match the data sent from your React component.
public class MembershipUpdatePayload {
    private String membershipType;
    private Date startDate;
    private Date endDate;

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
