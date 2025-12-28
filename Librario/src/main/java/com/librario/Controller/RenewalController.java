// src/main/java/com/librario/Controller/RenewalController.java
package com.librario.Controller;

import com.librario.Service.RenewalService;
import com.librario.dto.RenewalRequestDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/renewals")
@CrossOrigin(origins = "http://localhost:3000")
public class RenewalController {

    @Autowired
    private RenewalService renewalService;

    // Endpoint for a user to request a renewal
    @PostMapping("/request/{memberId}")
    public ResponseEntity<RenewalRequestDto> createRenewalRequest(@PathVariable Long memberId) {
        try {
            RenewalRequestDto request = renewalService.createRenewalRequest(memberId);
            return new ResponseEntity<>(request, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(null, HttpStatus.CONFLICT); // 409 Conflict
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND); // 404 Not Found
        }
    }

    // Endpoint for ADMIN/LIBRARIAN to get all pending requests
    @GetMapping("/pending")
    public ResponseEntity<List<RenewalRequestDto>> getPendingRequests() {
        List<RenewalRequestDto> requests = renewalService.getPendingRequests();
        return new ResponseEntity<>(requests, HttpStatus.OK);
    }

    // Endpoint for ADMIN/LIBRARIAN to process a request
    @PutMapping("/{requestId}/{action}")
    public ResponseEntity<RenewalRequestDto> processRenewalRequest(@PathVariable Long requestId, @PathVariable String action) {
        try {
            RenewalRequestDto updatedRequest = renewalService.processRenewalRequest(requestId, action);
            return new ResponseEntity<>(updatedRequest, HttpStatus.OK);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/pending/{memberId}")
    public ResponseEntity<?> getPendingRequestForMember(@PathVariable Long memberId) {
        Optional<RenewalRequestDto> request = renewalService.getPendingRequestByMemberId(memberId);
        if (request.isPresent()) {
            return new ResponseEntity<>(request.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(null, HttpStatus.NO_CONTENT);
        }
    }
}