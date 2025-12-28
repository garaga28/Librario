package com.librario.api;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class BorrowedBooksApi {

    private static final String DB_URL = "jdbc:mysql://localhost:3306/librarymanagementsystem";
    private static final String DB_USER = "root";
    private static final String DB_PASSWORD = "abcd@1234";

    public static String getBorrowedBooksByMemberId(int memberId) {
        List<BorrowedBook> borrowedBooks = new ArrayList<>();
        Connection conn = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try {
            // Register JDBC driver
            Class.forName("com.mysql.cj.jdbc.Driver");

            // Open a connection
            conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);

            // SQL query to retrieve borrowed books for a specific member
            String sql = "SELECT b.book_id, b.title, bb.borrow_date, bb.return_date, bb.returned " +
                    "FROM borrowed_books bb " +
                    "JOIN books b ON bb.book_id = b.book_id " +
                    "WHERE bb.member_id = ? AND bb.returned IS NULL";

            // Create and execute the statement
            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, memberId);
            rs = stmt.executeQuery();

            // Process the result set
            while (rs.next()) {
                BorrowedBook book = new BorrowedBook(
                        rs.getInt("book_id"),
                        rs.getString("title"),
                        rs.getString("borrow_date"),
                        rs.getString("return_date"),
                        rs.getString("returned")
                );
                borrowedBooks.add(book);
            }

        } catch (SQLException | ClassNotFoundException e) {
            // Handle errors
            e.printStackTrace();
            return "{\"error\":\"Failed to fetch borrowed books.\"}";
        } finally {
            // Close resources
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }

        // Convert the list of books to a JSON string
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        return gson.toJson(borrowedBooks);
    }

    // A simple class to represent a borrowed book
    private static class BorrowedBook {
        private int bookId;
        private String title;
        private String borrowDate;
        private String returnDate;
        private String returned;

        public BorrowedBook(int bookId, String title, String borrowDate, String returnDate, String returned) {
            this.bookId = bookId;
            this.title = title;
            this.borrowDate = borrowDate;
            this.returnDate = returnDate;
            this.returned = returned;
        }
    }
}

