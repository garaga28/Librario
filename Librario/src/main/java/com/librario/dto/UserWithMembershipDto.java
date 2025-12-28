package com.librario.dto;

import com.librario.Entity.Member;
import com.librario.Entity.User;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class UserWithMembershipDto {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String status;
    @JsonProperty("membership")
    private MembershipDetailsDto membershipDetails;

    public UserWithMembershipDto(User user, Member member, String status) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole().getRoleName();
        this.status = status;
        if (member != null) {
            this.membershipDetails = new MembershipDetailsDto(
                    member.getMembershipType(),
                    java.util.Date.from(member.getStartDate()),
                    java.util.Date.from(member.getEndDate())
            );
        }
    }


}