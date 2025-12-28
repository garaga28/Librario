package com.librario.Controller;

import com.librario.Entity.Member;
import com.librario.Service.MemberService;
import com.librario.Service.UserService;
import com.librario.dto.MemberDto;
import com.librario.dto.UserWithMembershipDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "http://localhost:3000") // This allows requests from your frontend
    public class MemberController {

    @Autowired
    private MemberService memberService;

    @Autowired
    private UserService userService;

    // Endpoint to create a new member (used during user registration)
    @PostMapping
    public ResponseEntity<Member> addMember(@RequestBody MemberDto memberDto) {
        Member newMember = memberService.addMember(memberDto);
        if (newMember != null) {
            return new ResponseEntity<>(newMember, HttpStatus.CREATED);
        }
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    // New endpoint to update an existing member's subscription details by userId
    @PutMapping("/{userId}")
    public ResponseEntity<?> assignOrUpdateMembership(@PathVariable Long userId, @RequestBody MembershipUpdatePayload payload) {
        try {
            Member updatedMember = memberService.assignOrUpdateMembership(userId, payload);
            return new ResponseEntity<>(updatedMember, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to assign or update membership: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{userId}/membership")
    public ResponseEntity<String> deleteMembershipAndUser(@PathVariable Long userId) {
        try {
            memberService.deleteMemberAndUser(userId);
            return new ResponseEntity<>("Membership and user deleted successfully.", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to delete membership and user: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/all-with-details")
    public ResponseEntity<List<UserWithMembershipDto>> getAllUsersWithMembershipDetails() {
        List<UserWithMembershipDto> users = memberService.getAllUsersWithMembershipDetails();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    // NEW ENDPOINT TO GET MEMBER ID BY USER ID
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<?> getMemberByUserId(@PathVariable Long userId) {
        Optional<Member> memberOptional = memberService.getMemberByUserId(userId);
        if (memberOptional.isPresent()) {
            Map<String, Long> response = new HashMap<>();
            response.put("memberId", memberOptional.get().getId());
            return new ResponseEntity<>(response, HttpStatus.OK);
        }
        return new ResponseEntity<>("Member not found for user ID: " + userId, HttpStatus.NOT_FOUND);
    }


}
