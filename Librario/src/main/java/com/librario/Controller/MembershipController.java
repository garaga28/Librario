package com.librario.Controller;

import com.librario.dto.MembershipDetailsDto;
import com.librario.Service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/memberships")
@CrossOrigin(origins = "http://localhost:3000")
public class MembershipController {

    @Autowired
    private MemberService memberService;

    @GetMapping("/user/{memberId}")
    public ResponseEntity<MembershipDetailsDto> getMembershipDetailsByUserId(@PathVariable Long memberId) {
        MembershipDetailsDto details = memberService.getMembershipDetailsByUserId(memberId);
        if (details != null) {
            return new ResponseEntity<>(details, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
