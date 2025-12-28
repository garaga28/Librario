import { GoogleGenerativeAI } from '@google/generative-ai';
import { chatbotDataService } from './chatbotDataService';

// This is a dummy API key. You must replace it with your actual Gemini API key.
const API_KEY = 'AIzaSyCL1IdUx7l2DhY4VJ6BMH3t_3tB2vU52h4';

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  // New function to handle pre-defined, static questions
  handleStaticQueries(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('how to register') || lowerMessage.includes('sign up')) {
      return "To register on this website, just go to the 'Sign Up' page, enter your name, email, and password. You'll receive an email with your new account credentials!";
    }

    if (lowerMessage.includes('how to login') || lowerMessage.includes('log in')) {
      return "You can log in by entering your email and password on the login page.";
    }

    if (lowerMessage.includes('how to borrow a book')) {
       return "To borrow a book, you must be a registered member. Log in to your dashboard, search for the book, and click the 'Request Borrow' button. Soon, the librarian will accept your request.";
    }

    if (lowerMessage.includes('library timings')) {
       return "Monday to Saturday from 9AM to 9PM. On Sundays the library will be closed.";
    }

    if (lowerMessage.includes('benefits of premium') || lowerMessage.includes('benefits of basic') || lowerMessage.includes('what are the membership plans')) {
       return "There are 2 plans: BASIC and PREMIUM. While Basic plan gives 15 days return period for 3 months, Premium plan gives 30 days return period for 6 months in just Rs.500";
    }

    return null;
  }

  async handleDataSpecificQuery(message, userId) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('membership plan') || lowerMessage.includes('my plan') || lowerMessage.includes('membership type')) {
      const membershipDetails = await chatbotDataService.getMembershipDetails(userId);
      const membershipType = membershipDetails ? membershipDetails.membershipType : 'BASIC';
      return `Your current membership plan is ${membershipType}.`;
    }

    // Handling overdue charges query
    if (lowerMessage.includes('my overdue charges') || lowerMessage.includes('my fines') || lowerMessage.includes('total fine i need to pay') || lowerMessage.includes('total overdue amount')) {
      const overdueBooks = await chatbotDataService.getOverdueBooks(userId);
      if (overdueBooks && overdueBooks.length > 0) {
        let totalFine = 0;
        console.log("Fetching membership for userId:", userId);
        const membershipDetails = await chatbotDataService.getMembershipDetails(userId);
        const today = new Date();

        overdueBooks.forEach(book => {
          const borrowDate = new Date(book.borrowDate);
          const membershipType = membershipDetails ? membershipDetails.membershipType : 'BASIC';
          let returnPeriodInDays = membershipType === 'PREMIUM' ? 30 : 15;


          const expectedReturnDate = new Date(borrowDate);
          expectedReturnDate.setDate(borrowDate.getDate() + returnPeriodInDays);

          const diffTime = today.getTime() - expectedReturnDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays > 0) {
            totalFine += diffDays * 10; // 10 Rs. per day
          }
        });
        return `Your total overdue charges are Rs. ${totalFine.toFixed(2)}.`;
      } else {
        return "You currently have no overdue books, so there are no overdue charges.";
      }
    }

    // Handling overdue books query
    if (lowerMessage.includes('my overdue books') || lowerMessage.includes('what are my overdue books')) {
      const overdueBooks = await chatbotDataService.getOverdueBooks(userId);
      if (overdueBooks && overdueBooks.length > 0) {
        // Updated to only include the book title
        const bookList = overdueBooks.map(book => `- ${book.bookTitle}`).join('\n');
        return `You have ${overdueBooks.length} overdue books:\n\n${bookList}`;
      } else {
        return "You currently have no overdue books.";
      }
    }

    // Handling borrowed books query
    if (lowerMessage.includes('what are my borrowed books') || lowerMessage.includes('active borrowing record') || lowerMessage.includes('my borrowed books')) {
      const borrowedBooks = await chatbotDataService.getBorrowedBooks(userId);
      if (borrowedBooks && borrowedBooks.length > 0) {
        // Corrected property names to match the backend DTO
        const bookList = borrowedBooks.map(book => `- ${book.bookTitle} (Due: ${this.formatDate(book.expectedReturnDate)})`).join('\n');
        return `You have the following books currently borrowed:\n\n${bookList}`;
      } else {
        return "You currently have no books borrowed.";
      }
    }
    return null;
  }

  async getChatbotResponse(message, userId) {
    const staticResponse = this.handleStaticQueries(message);
    if (staticResponse) {
      return staticResponse;
    }

    const dataResponse = await this.handleDataSpecificQuery(message, userId);
    if (dataResponse) {
      return dataResponse;
    }

    try {
      const result = await this.model.generateContent(message);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API call failed:', error);
      return "I'm currently experiencing technical difficulties. Please try again later.";
    }
  }

  getInitialResponse(context) {
    const timeBasedGreeting = this.getTimeBasedGreeting();
    const initialPrompt = context === 'member'
      ? `${timeBasedGreeting}! I'm the Librario Chatbot, here to help you manage your library account. You can ask me about your active transactions, overdue books, or outstanding fines.`
      : `${timeBasedGreeting}! I'm the Librario Chatbot. I can help you with questions about our Library Management System. Ask me anything about registration or logging in!`;

    return initialPrompt;
  }

  getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  // NOTE: This helper function is needed for the book list formatting
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}

const geminiService = new GeminiService();
export { geminiService };