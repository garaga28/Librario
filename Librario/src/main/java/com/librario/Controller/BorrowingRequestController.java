package com.librario.Controller;

import com.librario.Entity.BorrowingRequest;
import com.librario.Service.BorrowingRequestService;
import com.librario.dto.BorrowingRequestDetailsDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/borrowing-requests")
public class BorrowingRequestController {

    private final BorrowingRequestService borrowingRequestService;

    @Autowired
    public BorrowingRequestController(BorrowingRequestService borrowingRequestService) {
        this.borrowingRequestService = borrowingRequestService;
    }

    @PostMapping("/submit")
    public ResponseEntity<String> submitBorrowingRequest(@RequestBody Map<String, Long> request) {
        Long memberId = request.get("memberId");
        Long bookId = request.get("bookId");
        if (memberId == null || bookId == null) {
            return new ResponseEntity<>("Member ID and Book ID are required.", HttpStatus.BAD_REQUEST);
        }
        try {
            borrowingRequestService.submitRequest(memberId, bookId);
            //Added here

            return new ResponseEntity<>("Borrowing request submitted successfully.", HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to submit request: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<List<BorrowingRequestDetailsDto>> getPendingRequests() {
        List<BorrowingRequestDetailsDto> pendingRequests = borrowingRequestService.getPendingRequests();
        return new ResponseEntity<>(pendingRequests, HttpStatus.OK);
    }

    @PostMapping("/accept/{requestId}")
    public ResponseEntity<String> acceptBorrowingRequest(@PathVariable Long requestId) {
        boolean accepted = borrowingRequestService.acceptRequest(requestId);
        if (accepted) {
            return new ResponseEntity<>("Borrowing request accepted successfully.", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Failed to accept request. It may not exist or its status is not pending.", HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/reject/{requestId}")
    public ResponseEntity<String> rejectBorrowingRequest(@PathVariable Long requestId) {
        boolean rejected = borrowingRequestService.rejectRequest(requestId);
        if (rejected) {
            return new ResponseEntity<>("Borrowing request rejected successfully.", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Failed to reject request. It may not exist or its status is not pending.", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/user/{userId}/pending")
    public ResponseEntity<List<BorrowingRequest>> getPendingRequestsByUserId(@PathVariable Long userId) {
        List<BorrowingRequest> pendingRequests = borrowingRequestService.getPendingRequestsByUserId(userId);
        return new ResponseEntity<>(pendingRequests, HttpStatus.OK);
    }

    @GetMapping("/pending/member/{memberId}")
    public ResponseEntity<List<BorrowingRequest>> getPendingRequestsByMemberId(@PathVariable Long memberId) {
        List<BorrowingRequest> pendingRequests = borrowingRequestService.getPendingRequestsByMemberId(memberId);
        return new ResponseEntity<>(pendingRequests, HttpStatus.OK);
    }

    //added this after service class
    @GetMapping("/user/pending/member/{memberId}")
    public ResponseEntity<List<BorrowingRequestDetailsDto>> getPendingRequestsForUser(@PathVariable Long memberId) {
        List<BorrowingRequestDetailsDto> pendingRequests = borrowingRequestService.getPendingRequestsByMemberIdWithBookDetails(memberId);
        return new ResponseEntity<>(pendingRequests, HttpStatus.OK);
    }
}