// src/main/java/com/librario/Service/RenewalService.java
package com.librario.Service;

import com.librario.Entity.Member;
import com.librario.Entity.MembershipRenewalRequest;
import com.librario.Repo.MemberRepo;
import com.librario.Repo.MembershipRenewalRequestRepo;
import com.librario.dto.RenewalRequestDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RenewalService {

    @Autowired
    private MembershipRenewalRequestRepo renewalRequestRepo;

    @Autowired
    private MemberRepo memberRepo;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public RenewalRequestDto createRenewalRequest(Long memberId) {
        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found"));

        Optional<MembershipRenewalRequest> existingRequest = renewalRequestRepo.findByMemberIdAndStatus(memberId, "PENDING");
        if (existingRequest.isPresent()) {
            throw new IllegalStateException("A pending renewal request already exists for this member.");
        }

        MembershipRenewalRequest newRequest = new MembershipRenewalRequest();
        newRequest.setMember(member);
        newRequest.setStatus("PENDING");
        newRequest.setRequestedDate(Instant.now());

        MembershipRenewalRequest savedRequest = renewalRequestRepo.save(newRequest);

        notificationService.createNotification(
                "A new renewal request has been submitted by " + member.getUser().getName() + ".",
                "renewalRequest"
        );
        return convertToDto(savedRequest);
    }

    @Transactional
    public RenewalRequestDto processRenewalRequest(Long requestId, String action) {
        MembershipRenewalRequest request = renewalRequestRepo.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Renewal request not found"));

        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException("Request is not in PENDING state.");
        }

        Member member = request.getMember();
        Instant newEndDate;

        if ("APPROVE".equalsIgnoreCase(action)) {
            String membershipType = member.getMembershipType();
            if ("BASIC".equalsIgnoreCase(membershipType)) {
                newEndDate = Instant.now().plus(90, ChronoUnit.DAYS);
                notificationService.createNotification(
                        "The renewal request from " + request.getMember().getUser().getName() + " for BASIC plan has been approved.",
                        "renewalRequest"
                );
                notificationService.createNotificationForUser(
                        request.getMember().getUser(),
                        "Your membership date renewal request has been approved.",
                        "renewalRequest"
                );
            } else if ("PREMIUM".equalsIgnoreCase(membershipType)) {
                newEndDate = Instant.now().plus(180, ChronoUnit.DAYS);
                notificationService.createNotification(
                        "The renewal request from " + request.getMember().getUser().getName() + " for PREMIUM plan has been approved.",
                        "renewalRequest"
                );
                notificationService.createNotificationForUser(
                        request.getMember().getUser(),
                        "Your membership date renewal request has been approved.",
                        "renewalRequest"
                );
            } else {
                throw new IllegalStateException("Unknown membership type.");
            }

            member.setStartDate(Instant.now());
            member.setEndDate(newEndDate);
            memberRepo.save(member);
            request.setStatus("APPROVED");
        } else if ("REJECT".equalsIgnoreCase(action)) {
            request.setStatus("REJECTED");
            notificationService.createNotification(
                    "The renewal request from " + request.getMember().getUser().getName() + " has been rejected.",
                    "renewalRequest"
            );
            notificationService.createNotificationForUser(
                    request.getMember().getUser(),
                    "Your membership renewal request has been rejected.",
                    "renewalRequest"
            );
        } else {
            throw new IllegalArgumentException("Invalid action: must be APPROVE or REJECT.");
        }

        request.setProcessedDate(Instant.now());
        MembershipRenewalRequest updatedRequest = renewalRequestRepo.save(request);
        return convertToDto(updatedRequest);
    }

    public List<RenewalRequestDto> getPendingRequests() {
        return renewalRequestRepo.findByStatus("PENDING").stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<RenewalRequestDto> getPendingRequestByMemberId(Long memberId) {
        return renewalRequestRepo.findByMemberIdAndStatus(memberId, "PENDING")
                .map(this::convertToDto);
    }

    private RenewalRequestDto convertToDto(MembershipRenewalRequest request) {
        RenewalRequestDto dto = new RenewalRequestDto();
        dto.setId(request.getId());
        dto.setMemberId(request.getMember().getId());
        dto.setMemberName(request.getMember().getUser().getName());
        dto.setStatus(request.getStatus());
        dto.setRequestedDate(request.getRequestedDate());
        return dto;
    }
}