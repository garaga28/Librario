package com.librario.Service;

import com.librario.Entity.BorrowingRecord;
import com.librario.Entity.Member;
import com.librario.Entity.MembershipPlan;
import com.librario.Entity.User;
import com.librario.Repo.*;
import com.librario.dto.EmailDetails;
import com.librario.dto.MemberDto;
import com.librario.dto.MembershipDetailsDto;
import com.librario.Controller.MembershipUpdatePayload;
import com.librario.dto.UserWithMembershipDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MemberService {

    @Autowired
    private MemberRepo memberRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private MembershipPlanRepo membershipPlanRepo;

    private final EmailService emailService;

    @Autowired
    private BorrowingRecordRepository borrowingRecordRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BorrowingRequestRepository borrowingRequestRepository;

    @Autowired
    public MemberService(MemberRepo memberRepo, UserRepo userRepo, MembershipPlanRepo membershipPlanRepo, EmailService emailService) {
        this.memberRepo = memberRepo;
        this.userRepo = userRepo;
        this.membershipPlanRepo = membershipPlanRepo;
        this.emailService = emailService;
    }

    public Member createMemberForUser(User user) {
        Member member = new Member();
        member.setUser(user);
        member.setEndDate(Instant.now().plusSeconds(5L * 365 * 24 * 60 * 60));
        member.setStatus(getMemberStatus(member));
        return memberRepo.save(member);
    }

    public Optional<Member> getMemberByUserId(Long userId) {
        return memberRepo.findByUserId(userId);
    }

    @Transactional
    public Member updateMember(Long userId, MembershipUpdatePayload payload) {
        Optional<Member> memberOptional = memberRepo.findByUserId(userId);
        if (memberOptional.isPresent()) {
            Member member = memberOptional.get();
            member.setMembershipType(payload.getMembershipType());
            member.setStartDate(payload.getStartDate().toInstant());
            member.setEndDate(payload.getEndDate().toInstant());
            return memberRepo.save(member);
        } else {
            // Handle case where no member exists for the given userId
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found for ID: " + userId));

            Member newMember = new Member();
            newMember.setUser(user);
            newMember.setMembershipType(payload.getMembershipType());
            newMember.setStartDate(payload.getStartDate().toInstant());
            newMember.setEndDate(payload.getEndDate().toInstant());

            return memberRepo.save(newMember);
        }
    }

    private String getMemberStatus(Member member) {
        if (member.getStartDate() == null || member.getEndDate() == null) {
            return "INACTIVE";
        }

        Instant now = Instant.now();
        Instant inclusiveEndDate = member.getEndDate().plus(Duration.ofDays(1));

        if (!now.isBefore(member.getStartDate()) && now.isBefore(inclusiveEndDate)) {
            return "ACTIVE";
        }

        return "INACTIVE";
    }

    public List<Member> getAllMembers() {
        return memberRepo.findAll();
    }

    public Optional<Member> getMemberById(Long id) {
        return memberRepo.findById(id);
    }

    public MembershipDetailsDto getMembershipDetailsByUserId(Long memberId) {
        Optional<Member> memberOptional = memberRepo.findByUserId(memberId);
        if (memberOptional.isPresent()) {
            Member member = memberOptional.get();
            return new MembershipDetailsDto(
                    member.getMembershipType(),
                    java.util.Date.from(member.getStartDate()),
                    java.util.Date.from(member.getEndDate())
            );
        }
        return null;
    }

    public List<UserWithMembershipDto> getAllUsersWithMembershipDetails() {
        List<User> users = userRepo.findByRole_Id(3L); // Assuming role ID 3 is for MEMBERs
        return users.stream()
                .map(user -> {
                    Optional<Member> memberOptional = memberRepo.findByUserId(user.getId());
                    Member member = memberOptional.orElse(null);
                    String status = (member != null) ? getMemberStatus(member) : "NA";
                    return new UserWithMembershipDto(user, member, status);
                })
                .collect(Collectors.toList());
    }

    public Member addMember(MemberDto memberDto) {
        User user = userRepo.findById(memberDto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found for ID: " + memberDto.getUserId()));

        Member member = new Member();
        member.setUser(user);
        member.setMembershipType(memberDto.getMembershipType());
        member.setStartDate(memberDto.getStartDate());
        member.setEndDate(memberDto.getEndDate());
        member.setStatus(getMemberStatus(member));
        return memberRepo.save(member);
    }

    public Member assignOrUpdateMembership(Long userId, MembershipUpdatePayload payload) {
        Optional<Member> memberOptional = memberRepo.findByUserId(userId);

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found for ID: " + userId));

        Member member;
        if (memberOptional.isPresent()) {
            member = memberOptional.get();
        } else {
            member = new Member();
            member.setUser(user);
        }

        member.setMembershipType(payload.getMembershipType());
        member.setStartDate(payload.getStartDate().toInstant());
        member.setEndDate(payload.getEndDate().toInstant());
        member.setStatus(getMemberStatus(member));

        Member savedMember = memberRepo.save(member);

        // Fetching plan details for email body
        Optional<MembershipPlan> planOptional = membershipPlanRepo.findByTypeIgnoreCase(payload.getMembershipType());
        String membershipDetails = "";
        if (planOptional.isPresent()) {
            MembershipPlan plan = planOptional.get();
            if (plan.getType().equalsIgnoreCase("PREMIUM")) {
                membershipDetails = "<p style='color: #4CAF50;'>With PREMIUM Membership you can borrow up to 10 books and return period is for 30 days</p> <br> <p>Please pay the membership fee of Rs500.</p>";
            } else if (plan.getType().equalsIgnoreCase("BASIC")) {
                membershipDetails = "<p style='color: #2196F3;'>With basic membership you can borrow up to 5 books and due date is 15 days, absolutely free.</p>";
            }
        }

        String emailBodyHtml = String.format(
                "<div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; margin: auto;'>" +
                        "<h2 style='color: #333;'>Hello %s,</h2>" +
                        "<p>Your membership has been updated.</p>" +
                        "<h3 style='color: #555;'>Membership Details:</h3>" +
                        "<ul style='list-style-type: none; padding: 0;'>" +
                        "<li><strong>Type:</strong> <span style='color: #6200EE; font-weight: bold;'>%s</span></li>" +
                        "<li><strong>Start Date:</strong> %s</li>" +
                        "<li><strong>End Date:</strong> %s</li>" +
                        "</ul>" +
                        "%s" +
                        "<p style='margin-top: 20px;'>Thank you,<br/>Librario Team</p>" +
                        "</div>",
                user.getName(), payload.getMembershipType(), payload.getStartDate(), payload.getEndDate(), membershipDetails
        );

        EmailDetails emailDetails = new EmailDetails(
                user.getEmail(),
                "Your Membership Details",
                emailBodyHtml,
                true // isHtml = true
        );

        emailService.sendSimpleMail(emailDetails);

        return savedMember;
    }

    @Transactional
    public void deleteMemberAndUser(Long userId) {
        // First, find and delete the Member record
        Member member = memberRepo.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found for User ID: " + userId));

        // Step 1: Delete payments that directly reference the member
        paymentRepository.deleteByMemberId(member.getId());

        // Get all borrowing records for the member
        List<BorrowingRecord> borrowingRecords = borrowingRecordRepository.findByMemberId(member.getId());

        // Step 2: Delete all payments associated with the borrowing records
        borrowingRecords.forEach(record -> {
            paymentRepository.deleteByBorrowingRecordId(record.getId());
        });

        // Step 3: Delete all associated borrowing records
        borrowingRecordRepository.deleteByMemberId(member.getId());

        // Step 4: Delete all associated borrowing requests
        borrowingRequestRepository.deleteByMemberId(member.getId());

        // Step 5: Delete the Member record
        memberRepo.delete(member);

        // Then, delete the corresponding User record
        userRepo.deleteById(userId);
    }
}