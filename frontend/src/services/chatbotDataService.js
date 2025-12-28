import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

class ChatbotDataService {
  async getMemberId(userId) {
    if (!userId) {
      console.error("userId is not available. Cannot fetch member data.");
      return null;
    }
    try {
      const memberResponse = await axios.get(`${API_URL}/members/by-user/${userId}`);
      const memberId = memberResponse.data.memberId;
      console.log(`Found memberId: ${memberId} for userId: ${userId}`);
      return memberId;
    } catch (error) {
      console.error("Failed to get memberId:", error);
      return null;
    }
  }

  async getMembershipDetails(userId) {
    const memberId = await this.getMemberId(userId);
    if (!memberId) {
      console.error("No memberId found for user. Cannot fetch membership details.");
      return null;
    }
    try {
      const response = await axios.get(`${API_URL}/memberships/user/${memberId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch membership details:", error);
      return null;
    }
  }

  async getBorrowedBooks(userId) {
  
    if (!userId) {
      console.error("userId is not available. Cannot fetch borrowed books.");
      return null;
    }
    try {
     
      const response = await axios.get(`${API_URL}/borrowings/member/${userId}`);
      // Filter out books that have a return date, as they are no longer borrowed
      const borrowedBooks = response.data.filter(book => book.returnDate === null);
      return borrowedBooks;
    } catch (error) {
      console.error("Failed to fetch borrowed books:", error);
      return null;
    }
  }


  async getOverdueBooks(userId) {
    const memberId = await this.getMemberId(userId);
    if (!memberId) return null;
    try {
     
      const response = await axios.get(`${API_URL}/overdue/books/member/${memberId}`);
   
      return response.data;
    } catch (error) {
      console.error("Failed to fetch overdue books:", error);
      return null;
    }
  }

  
}

const chatbotDataService = new ChatbotDataService();
export { chatbotDataService };