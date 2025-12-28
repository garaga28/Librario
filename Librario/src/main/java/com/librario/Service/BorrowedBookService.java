package com.librario.Service;

import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.*;

@Service
public class BorrowedBookService {


    private Connection connect() {
        String url = "jdbc:mysql://localhost:3306/librarymanagementsystem";
        String user = "root";
        String password = "abcd@1234";
        try {
            return DriverManager.getConnection(url, user, password);
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<Map<String, Object>> getBorrowedBooks() {
        String sql = "SELECT " +
                "br.id, br.borrow_date, br.return_date, br.returned, " +
                "b.title AS book_title, " +
                "u.name AS member_name, " +
                "m.membership_type, " +
                "u.id AS user_id " +
                "FROM borrowing_records br " +
                "JOIN books b ON br.book_id = b.id " +
                "JOIN members m ON br.member_id = m.id " +
                "JOIN users u ON m.user_id = u.id " +
                "WHERE br.returned = 0";

        List<Map<String, Object>> borrowedBooks = new ArrayList<>();

        try (Connection conn = this.connect();
             PreparedStatement pstmt = conn.prepareStatement(sql);
             ResultSet rs = pstmt.executeQuery()) {

            while (rs.next()) {
                Map<String, Object> record = new HashMap<>();
                Map<String, Object> book = new HashMap<>();
                Map<String, Object> user = new HashMap<>();

                book.put("title", rs.getString("book_title"));

                user.put("name", rs.getString("member_name"));
                user.put("id", rs.getInt("user_id"));

                record.put("id", rs.getInt("id"));
                record.put("borrowDate", rs.getString("borrow_date"));
                record.put("dueDate", calculateDueDate(rs.getString("borrow_date"), rs.getString("membership_type")));
                record.put("book", book);
                record.put("user", user);

                borrowedBooks.add(record);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return borrowedBooks;
    }

    private String calculateDueDate(String borrowDate, String membershipType) {
        if (borrowDate == null || membershipType == null) {
            return null;
        }

        try {
            java.util.Date date = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSSSS").parse(borrowDate);
            java.util.Calendar cal = java.util.Calendar.getInstance();
            cal.setTime(date);

            if ("PREMIUM".equalsIgnoreCase(membershipType)) {
                cal.add(java.util.Calendar.DAY_OF_MONTH, 30);
            } else {
                cal.add(java.util.Calendar.DAY_OF_MONTH, 15);
            }

            return new java.text.SimpleDateFormat("dd-MM-yyyy").format(cal.getTime());
        } catch (java.text.ParseException e) {
            e.printStackTrace();
            return null;
        }
    }
}