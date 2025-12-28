import React, { useState, useEffect, useRef  } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Book as BookIcon, Search, User, LogOut, UserCircle, CreditCard, Library, History, ListTodo, Wallet, Loader2, Bell, X } from 'lucide-react';
import { Clock } from 'lucide-react';
import axios from 'axios';
import { FaMoneyBillAlt, FaCreditCard } from 'react-icons/fa';


const MessageModal = ({ message, type, onClose }) => {
    if (!message) return null;
    const bgColor = type === 'success' ? 'bg-emerald-500' : 'bg-rose-500';
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50 p-4">
            <div className={`p-6 rounded-xl shadow-2xl text-white ${bgColor} max-w-sm w-full transition-all duration-300 transform scale-100`}>
                <p className="text-center font-semibold">{message}</p>
                <button
                    onClick={onClose}
                    className="mt-4 w-full py-2 px-4 rounded-full bg-white text-gray-800 font-bold hover:bg-gray-200 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    } catch (e) {
        return 'Invalid Date';
    }
};

// Component for the notification dropdown
const NotificationDropdown = ({ notifications, onClose, onMarkRead, memberId, formatDate }) => {
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 transform translate-x-1">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Notifications ({unreadCount} unread)</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                    <p className="p-4 text-center text-gray-500">No new notifications.</p>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id} 
                            className={`p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${notification.read ? 'text-gray-500' : 'bg-blue-50 text-gray-800 font-medium'}`}
                        >
                            <p className="text-sm leading-snug">{notification.message}</p>
                            <span className="text-xs text-gray-400 mt-1 block">
                                {formatDate(notification.createdAt)} 
                            </span>
                        </div>
                    ))
                )}
            </div>

            {unreadCount > 0 && (
                <div className="p-3 border-t">
                    <button
                        onClick={() => { onMarkRead(memberId); onClose(); }} // Mark read and close dropdown
                        className="w-full py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Mark All as Read
                    </button>
                </div>
            )}
        </div>
    );
};

const PendingBooksContent = ({ pendingRequests }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Pending Borrowing Requests</h2>
            {pendingRequests.length === 0 ? (
                <p className="text-gray-600">You have no pending borrowing requests at this time. Please check back later.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                                    Book Title
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                                    Request Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-900 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {pendingRequests.map(request => (
                                <tr key={request.requestId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{request.bookTitle}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{new Date(request.requestDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <span className="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                                            Pending
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const BookCard = ({ book, onBorrow, borrowedBooks }) => {
    const isAvailable = book.availableCopies > 0;
    const isBorrowedByUser = borrowedBooks.some(
        (borrowedBook) => borrowedBook.bookId === book.id && !borrowedBook.returned
    );
    const canBorrow = isAvailable && !isBorrowedByUser;
    const statusColor = canBorrow ? 'bg-emerald-500' : 'bg-rose-500';

    const handleBorrowClick = (e) => {
        e.stopPropagation();
        onBorrow(book.id);
    };

    return (
        <div className="relative bg-white rounded-2xl shadow-lg p-4 flex flex-col w-64 h-[380px] transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl overflow-hidden">
            
            {/* Image section */}
            <div className="relative w-full h-48 overflow-hidden rounded-lg mb-2">
                <img src={book.imageUrl} alt={book.title} className="w-full h-full object-contain rounded-t-lg" />
            </div>

            <span className={`absolute top-4 right-2 text-xs font-bold uppercase text-white px-3 py-1 rounded-full ${statusColor} shadow-md`}>
                {isBorrowedByUser ? 'Borrowed' : (isAvailable ? 'Available' : 'Unavailable')}
            </span>
            
            {/* Details section */}
            <div className="flex-grow flex flex-col justify-start">
                <h3 className="text-xl font-extrabold text-gray-900 mb-1 leading-tight pr-10">
                    {book.title}
                </h3>
                <p className="text-sm font-medium text-gray-600 mb-1">by {book.author}</p>
                <p className="text-xs text-gray-500">{book.genre}</p>
            </div>
            
            {/* Action section */}
            <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center text-sm font-semibold text-gray-700">
                    <span className="mr-1">Copies:</span>
                    <span className="font-bold text-gray-800">{book.availableCopies}</span>
                </div>
                <button
                    onClick={handleBorrowClick}
                    disabled={!canBorrow}
                    className={`text-white text-sm font-bold py-2 px-4 rounded-full transition-colors ${canBorrow ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                    {isBorrowedByUser ? 'Borrowed' : 'Request Borrow'}
                </button>
            </div>
        </div>
    );
};

const BorrowedBookCard = ({ record, onReturn }) => {
    const [isReturning, setIsReturning] = useState(false);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expectedReturn = new Date(record.expectedReturnDate);
    expectedReturn.setHours(0, 0, 0, 0);

    const isOverdue = today > expectedReturn;
    const overdueDays = isOverdue ? Math.ceil((today - expectedReturn) / (1000 * 60 * 60 * 24)) : 0;
    const penaltyFee = overdueDays * 10;
    const isReturned = record.returned;

    const handleReturnClick = async (e) => {
        e.stopPropagation();
        if (isReturning || isReturned) return;
        setIsReturning(true);
        await onReturn(record.bookId, penaltyFee);
        setIsReturning(false);
    };

    const cardBgColor = isReturned ? 'bg-emerald-50' : isOverdue ? 'bg-rose-50' : 'bg-white';

    return (
        <div className={`relative ${cardBgColor} rounded-2xl shadow-lg p-6 flex flex-col justify-between h-auto transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl overflow-hidden`}>
            <div className="flex-grow flex flex-col justify-start">
                <h4 className="text-xl font-extrabold text-gray-900 mb-1 leading-tight">
                    {record.bookTitle}
                </h4>
                <p className="text-sm font-medium text-gray-600 mb-1">by {record.bookAuthor}</p>
                <p className="text-xs font-semibold text-gray-700">
                    Borrowed on: <span className="font-normal">{formatDate(record.borrowDate)}</span>
                </p>
                <p className="text-xs font-semibold text-gray-700">
                    Due on: <span className="font-normal text-rose-600">{formatDate(record.expectedReturnDate)}</span>
                </p>
                {isOverdue && !isReturned && (
                    <p className="text-xs font-bold text-rose-500 mt-2">
                        Overdue by: {overdueDays} days (₹{penaltyFee} fine)
                    </p>
                )}
                {isReturned && (
                    <>
                        <p className="text-xs font-semibold text-gray-700">
                            Returned on: <span className="font-normal text-emerald-600">{formatDate(record.returnDate)}</span>
                        </p>
                    </>
                )}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end items-center">
                {!isReturned ? (
                    <button
                        onClick={handleReturnClick}
                        disabled={isReturning}
                        className={`text-white text-sm font-bold py-2 px-4 rounded-full transition-colors ${isReturning ? 'bg-gray-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700'}`}
                    >
                        {isReturning ? 'Returning...' : 'Return'}
                    </button>
                ) : (
                    <span className="bg-emerald-600 text-white text-sm font-bold py-2 px-4 rounded-full">
                        Returned
                    </span>
                )}
            </div>
        </div>
    );
};

const HistoryContent = ({ returnedBooksHistory, returnedHistoryLoading }) => {
    if (returnedHistoryLoading) {
        return (
            <div className="flex justify-center items-center h-full text-white">
                <p className="text-xl font-semibold">Loading returned books history...</p>
            </div>
        );
    }

    if (returnedBooksHistory.length === 0) {
        return (
            <div className="text-center p-10 mt-8 text-white">
                <p className="text-lg font-bold">You have not returned any books yet.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full px-4 py-8">
            <h2 className="text-3xl font-bold text-white mb-8">Returned Books History</h2>
            <div className="bg-white rounded-lg shadow-lg w-full mt-6">
                <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xm font-medium text-gray-900 uppercase tracking-wider">
                                    Book Title
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xm font-medium text-gray-900 uppercase tracking-wider">
                                    Author
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xm font-medium text-gray-900 uppercase tracking-wider">
                                    Return Date
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {returnedBooksHistory.map((book) => (
                                <tr key={book.borrowingRecordId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-800">{book.bookTitle}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-800">{book.bookAuthor}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-800">{formatDate(book.returnDate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


const OverdueBooksContent = ({ overdueBooks, overdueBooksLoading }) => {

    if (overdueBooksLoading) {
        return (
            <div className="flex justify-center items-center h-full text-white">
                <p className="text-xl font-semibold">Loading overdue books...</p>
            </div>
        );
    }

    if (!overdueBooks || overdueBooks.length === 0) {
        return (
            <div className="text-center p-10 mt-8 text-white">
                <p className="text-lg font-bold">You have no overdue books. Keep up the good work!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full px-4 py-8">
            <h2 className="text-3xl font-bold text-white mb-8">Overdue Books</h2>
            
            <div className="bg-white rounded-lg shadow-lg w-full mt-6">
                <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xm font-medium text-gray-900 uppercase tracking-wider">
                                    Book Title
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xm font-medium text-gray-900 uppercase tracking-wider">
                                    Due Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xm font-medium text-gray-900 uppercase tracking-wider">
                                    Days Overdue
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xm font-medium text-gray-900 uppercase tracking-wider">
                                    Penalty
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {overdueBooks.map((book) => (
                                <tr key={book.borrowingRecordId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-800">{book.bookTitle}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-800">{book.dueDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-800">{book.overdueDays}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-800">Rs. {book.fineAmount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


const DashboardContent = ({ books, loading, onBorrowBook, searchTerm, overdueBooks, borrowedBooks }) => {
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [booksPerPage] = useState(15); // Show 15 books per page
    

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()));

    // Get current books for pagination
    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full text-white">
                <p className="text-xl font-semibold">Loading books...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full px-4 py-8">
            {overdueBooks.length > 0 && (
                <div className="bg-rose-500 rounded-xl shadow-lg p-6 mb-8 w-full text-white">
                    <div className="flex items-center mb-4">
                        <Clock className="w-8 h-8 mr-3 text-white" />
                        <h3 className="text-2xl font-bold">Overdue Books</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-2">
                        {overdueBooks.map((book) => (
                            <li key={book.borrowingRecordId} className="font-semibold text-lg">
                                {book.bookTitle} (Overdue for {book.overdueDays} days)
                            </li>
                        ))}
                    </ul>
                    
                </div>
            )}
            <h2 className="text-3xl font-bold text-white mb-8">Available Books</h2>
            {filteredBooks.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {currentBooks.map((book) => (
                            <BookCard key={book.id} book={book} onBorrow={onBorrowBook} borrowedBooks={borrowedBooks} />
                        ))}
                    </div>
                    {/* Pagination Controls */}
                    <div className="flex justify-center mt-10">
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                <span className="sr-only">Previous</span>
                                Prev
                            </button>

                            {[...Array(totalPages).keys()].map(number => (
                                <button
                                    key={number + 1}
                                    onClick={() => paginate(number + 1)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md
                                        ${currentPage === number + 1
                                        ? 'z-10 bg-red-600 text-white border-red-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {number + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                                <span className="sr-only">Next</span>
                            </button>
                        </nav>
                    </div>
                </>
            ) : (
                <div className="text-center p-10 mt-8 text-white">
                    <p className="text-lg font-bold">No books found matching your search.</p>
                </div>
            )}
        </div>
    );
};

const MyBooksContent = ({ borrowedBooks, borrowedBooksLoading, memberId, fetchBooks, setMessage, setMessageType }) => {
    const borrowedAndNotReturned = borrowedBooks.filter(book => !book.returned);

    if (borrowedBooksLoading) {
        return (
            <div className="flex justify-center items-center h-full text-white">
                <p className="text-xl font-semibold">Loading your books...</p>
            </div>
        );
    }

    const handleReturn = async (bookId, penaltyFee) => {
        setMessage("Please visit the library and return the book in person.");
        setMessageType("success");
    };

    return (
        <div className="flex flex-col w-full px-4 py-8">
            <h2 className="text-3xl font-bold text-white mb-8">My Borrowed Books</h2>
            {borrowedAndNotReturned.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {borrowedAndNotReturned.map((record) => (
                        <BorrowedBookCard key={record.borrowingRecordId} record={record} onReturn={handleReturn} />
                    ))}
                </div>
            ) : (
                <div className="text-center p-10 mt-8 text-white">
                    <p className="text-lg font-bold">You have no active borrowed books.</p>
                </div>
            )}
        </div>
    );
};

const MembershipDetailsContent = ({ memberId, formatDate }) => {
    const [membershipInfo, setMembershipInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRenewing, setIsRenewing] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        const fetchMembershipDetails = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:8080/api/memberships/user/${memberId}`);
                if (!response.ok) {
                    setMembershipInfo(null);
                } else {
                    const data = await response.json();
                    setMembershipInfo(data);
                }
            } catch (error) {
                console.error("Error fetching membership details:", error);
                setMembershipInfo(null);
            } finally {
                setIsLoading(false);
            }
        };
        if (memberId) {
            fetchMembershipDetails();
        } else {
            setIsLoading(false);
        }
    }, [memberId]);

    const handleRenewalRequest = async () => {
    setIsRenewing(true);

    try {
        // Step 1: Fetch the memberId using the userId
        const memberIdResponse = await axios.get(
            `http://localhost:8080/api/members/by-user/${memberId}`
        );
        const fetchedMemberId = memberIdResponse.data.memberId;

        // Step 2: Use the fetched memberId to send the renewal request
        const renewalResponse = await axios.post(`http://localhost:8080/api/renewals/request/${fetchedMemberId}`,
            {}
        );
        setMessage('Renewal request sent successfully!');
        setMessageType('success');
    } catch (error) {
        console.error('Renewal request failed:', error);
        if (error.response) {
            if (error.response.status === 409) {
                setMessage('A pending renewal request already exists for this member.');
            } else if (error.response.status === 404) {
                setMessage('Member not found. Please contact support.');
            } else {
                setMessage('Failed to send renewal request. Please try again.');
            }
        } else {
            setMessage('Network error. Please check your connection.');
        }
        setMessageType('error');
    } finally {
        setIsRenewing(false);
    }
};

    const premiumBenefits = [
        "Access to a larger collection of exclusive books",
        "Ability to borrow up to 10 books at a time",
        "Extended borrowing period of 30 days",
        "Zero overdue fines",
        "Priority access to new arrivals"
    ];
    const basicBenefits = [
        "Standard access to the library's main collection",
        "Ability to borrow up to 5 books at a time",
        "Standard borrowing period of 15 days",
        "Overdue fines apply"
    ];
    if (isLoading) {
        return (
            <div className="flex justify-center items-center w-full max-w-2xl px-4 py-8 bg-white rounded-xl shadow-lg">
                <p className="text-xl text-gray-700">Loading membership details...</p>
            </div>
        );
    }
    if (!membershipInfo) {
        return (
            <div className="flex flex-col items-center w-full max-w-2xl px-4 py-8 bg-white rounded-xl shadow-lg text-center">
                <CreditCard className="w-16 h-16 mb-4 text-gray-400" />
                <p className="text-xl text-rose-500 mb-2 font-bold">Membership Not Found</p>
                <p className="text-gray-700 text-sm">
                    Please request the administrator to update your membership plan.
                </p>
            </div>
        );
    }
    const { membership_type, start_date, end_date } = membershipInfo;
    const isPremium = membership_type === 'PREMIUM';
    return (
        <div className="flex flex-col items-center w-full max-w-2xl px-4 py-8 bg-white rounded-xl shadow-lg">
            <CreditCard className="w-16 h-16 mb-6 text-blue-500" />
            <h3 className="text-3xl font-extrabold text-gray-800 mb-2">Membership Details</h3>
            <p className="text-gray-600 mb-6 text-center text-sm">Your current membership status and benefits.</p>
            <div className="w-full space-y-6 text-gray-700">
                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-xl">Membership Type:</span>
                        <span className={`font-extrabold text-2xl uppercase ${isPremium ? 'text-blue-600' : 'text-gray-600'}`}>
                            {membership_type}
                        </span>
                    </div>
                    <div className="mt-4 border-t pt-4 border-gray-200">
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Start Date:</span>
                            <span className="font-medium text-gray-700">{formatDate(start_date)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
                            <span>End Date:</span>
                            <span className="font-medium text-gray-700">{formatDate(end_date)}</span>
                        </div>
                    </div>
                    
                    <button
                    onClick={handleRenewalRequest}
                    disabled={isRenewing}
                    className={`mt-6 px-6 py-3 rounded-full font-bold text-white transition-colors duration-200 ${
                        isRenewing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-blue-700'
                    }`}
                >
                    {isRenewing ? (
                        <>
                            <Loader2 className="animate-spin mr-2 inline" /> Requesting...
                        </>
                    ) : (
                        'Request Renewal'
                    )}
                </button>
                </div>
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200">
                    <h4 className="text-2xl font-bold text-blue-700 mb-4">
                        {isPremium ? 'Premium' : 'Basic'} Benefits
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
                        {(isPremium ? premiumBenefits : basicBenefits).map((benefit, index) => (
                            <li key={index} className="flex items-start">
                                <span className="mr-2 text-blue-500"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-8.86" /><path d="M12 2v10" /><path d="M12 12v10" /><path d="m22 7-6 6-4-4" /></svg></span>
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <p className="text-xs text-center text-gray-500 mt-4">Membership type is assigned by the library administrator. Please contact support for any inquiries regarding your membership status.</p>
            </div>
        </div>);
};

const ProfileSettingsContent = ({ user, onUpdateUser, memberId, setMessage, setMessageType }) => {
    const [name, setName] = useState(user.name);
    const [password, setPassword] = useState("");
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!memberId || isNaN(Number(memberId)) || Number(memberId) <= 0) {
            setMessage("Cannot update profile. User ID not found.");
            setMessageType('error');
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/user/update?userId=${memberId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: name, password: password }),
            });
            if (response.ok) {
                const updatedUser = await response.json();
                onUpdateUser(updatedUser);
                localStorage.setItem('userProfile', JSON.stringify(updatedUser));
                setMessage("Profile updated successfully!");
                setMessageType('success');
            } else {
                const error = await response.text();
                setMessage(`Failed to update profile: ${error}`);
                setMessageType('error');
            }
        } catch (error) {
            setMessage("An error occurred while updating the profile. Please try again.");
            setMessageType('error');
        }
    };
    return (
        <div className="flex flex-col items-center w-full max-w-2xl px-4 py-8 bg-white rounded-xl shadow-lg">
            <User className="w-16 h-16 mb-6 text-gray-400" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Profile Settings</h3>
            <p className="text-gray-600 mb-6 text-center">Update your personal information below.</p>
            <form onSubmit={handleUpdateProfile} className="w-full space-y-6">
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Email:</label>
                    <input type="email" value={user.email} disabled className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner bg-gray-100 text-gray-500 cursor-not-allowed" title="Email cannot be edited" />
                </div>
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200" />
                </div>
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">New Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password (optional)" className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:bg-blue-700 transition-colors" > Save Changes </button>
            </form>
        </div>
    );
};

const PaymentsContent = ({ memberId, userProfile, overdueBooks, overdueBooksLoading, setMessage, setMessageType, handleOnlinePayment }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPayments = async () => {
        if (!memberId) {
            setLoading(false);
            console.warn("Member ID not available. Skipping payment history fetch.");
            return;
        }
        setLoading(true);
        try {
            // Get the memberId using the userId from the URL
            const memberIdResponse = await axios.get(`http://localhost:8080/api/members/by-user/${memberId}`);
            const fetchedMemberId = memberIdResponse.data.memberId;

            // Use the fetched memberId to get the payment history
            const response = await axios.get(`http://localhost:8080/api/payments/history/member/${fetchedMemberId}`);
            setPayments(response.data);
            setMessage('Payment history loaded successfully!');
            setMessageType('success');
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [memberId]);
    const getPaymentTypeLabel = (type) => {
        const typeMap = {
            PREMIUM_MEMBERSHIP: 'Premium Membership',
            OVERDUE_CHARGES: 'Overdue Charges'
        };
        return typeMap[type] || type;
    };
    
    return (
        <div className="p-8 bg-white rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Payments</h2>
            <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Overdue Books</h3>
                    {overdueBooksLoading ? (
                        <p className="text-gray-500">Loading overdue books...</p>
                    ) : overdueBooks.length > 0 ? (
                        <div className="space-y-4">
                            {overdueBooks.map(book => (
                                <div key={book.borrowingRecordId} className="flex items-center justify-between p-4 bg-white rounded-md shadow-sm border border-gray-100">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-lg text-gray-900">{book.bookTitle}</h4>
                                        <p className="text-sm text-gray-500">Overdue by {book.overdueDays} days</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-red-600">₹{book.fineAmount}</p>
                                        <button
                                            onClick={() => handleOnlinePayment(book.fineAmount, 'overdue_charges', book.borrowingRecordId)}
                                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors"
                                        >
                                            Pay Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No overdue books found.</p>
                    )}
                </div>

                {userProfile && userProfile.membership_type === 'PREMIUM' ? (
                    <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
                        <p className="text-lg font-semibold text-green-700">You are a Premium Member! 🎉</p>
                        <p className="text-sm text-green-600 mt-1">Your membership expires on {formatDate(userProfile.membership_end_date)}.</p>
                    </div>
                ) : (
                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 text-center">
                        <p className="text-lg font-semibold text-yellow-700">Upgrade to Premium Membership</p>
                        <p className="text-sm text-yellow-600 mt-1">Enjoy extended borrowing periods and more!</p>
                        <button
                            onClick={() => handleOnlinePayment(500, 'premium_membership', null)}
                            className="mt-4 px-6 py-3 bg-yellow-500 text-white rounded-full font-bold shadow-lg hover:bg-yellow-600 transition-colors"
                        >
                            Pay ₹500 Now
                        </button>
                    </div>
                )}
                

                <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Payment History</h3>
                    {loading ? (
                    <p className="text-gray-500 text-center">Loading payment history...</p>
                    ) : payments.length > 0 ? (
                    <div className="space-y-6">
                        {payments.map(payment => (
                            <div key={payment.payment_id} className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-300 ease-in-out">
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`font-semibold ${payment.type === 'OVERDUE_CHARGES' ? 'text-lg text-red-600' : 'text-md text-green-600'}`}>
                                        {getPaymentTypeLabel(payment.type)}
                                    </span>
                                    <span className="text-xl font-extrabold text-blue-700">₹{payment.amount}</span>
                                </div>

                                <div className="flex items-center text-sm text-gray-600 space-x-2">
                                    {payment.paymentMethod === 'online' ? (
                                        <>
                                            <FaCreditCard className="text-blue-500" />
                                            <span className="font-medium">Online Payment</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaMoneyBillAlt className="text-green-500" />
                                            <span className="font-medium">Cash Payment</span>
                                        </>
                                    )}
                                </div>
                            
                                {payment.status === 'completed' ? (
                                <div className="mt-2 text-xs text-green-600 font-bold">
                                    <p>Status: Completed ✅</p>
                                    {payment.razorpayPaymentId && (
                                        <p className="mt-2 text-gray-900">
                                            Payment ID: {payment.razorpayPaymentId}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-2 text-xs text-red-600 font-bold">
                                    <p>Status: Failed ❌</p>
                                </div>
                            )}

                            <div className="mt-2 text-xs text-gray-600">
                                <p>Paid on: {new Date(payment.createdAt).toLocaleString()}</p>
                            </div>
                            </div>
                        ))}
                    </div>
                    ) : (
                        <p className="text-gray-500 text-center">No payment history found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const UserDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { userId } = useParams();
    const [currentView, setCurrentView] = useState('dashboard');
    
    const [userProfile, setUserProfile] = useState(() => {
        const savedProfile = localStorage.getItem('userProfile');
        return savedProfile ? JSON.parse(savedProfile) : { name: 'Guest', email: 'guest@example.com', membershipType: 'Basic' };
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [books, setBooks] = useState([]);
    const [borrowedBooks, setBorrowedBooks] = useState(() => {
        const savedBooks = localStorage.getItem('borrowedBooks');
        return savedBooks ? JSON.parse(savedBooks) : [];
    });

    const [returnedBooksHistory, setReturnedBooksHistory] = useState([]);
    const [returnedHistoryLoading, setReturnedHistoryLoading] = useState(false);
    

    const [overdueBooks, setOverdueBooks] = useState([]);
    const [booksLoading, setBooksLoading] = useState(false);
    const [borrowedBooksLoading, setBorrowedBooksLoading] = useState(false);
    const [overdueBooksLoading, setOverdueBooksLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [pendingRequests, setPendingRequests] = useState([]);
    const pathParts = location.pathname.split('/');
    const memberId = pathParts[pathParts.length - 1];
    const [payments, setPayments] = useState([]);
    const [overdueHistory, setOverdueHistory] = useState([]);
    
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);
    const [setUnreadCount] = useState(0);

    const API_BASE_URL = 'http://localhost:8080/api';
    const fetchNotifications = async (userId) => {
        if (!userId) return;
        try {
        
            const response = await axios.get(
                `${API_BASE_URL}/notifications/member?userId=${userId}&_t=${Date.now()}`
            );
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAllAsRead = async (userId) => {
        if (!userId) return;
        try {
            await axios.post(
                `${API_BASE_URL}/notifications/mark-all-read/member?userId=${userId}&_t=${Date.now()}`
            );
        
            await fetchNotifications(userId); 
        
        } catch (error) {
            console.error('Failed to mark notifications as read:', error);
        
        }
    };

    useEffect(() => {
    
        if (userId) { 
            fetchNotifications(userId); 
        }
        const intervalId = setInterval(() => {
            if (userId) {
                fetchNotifications(userId); 
            }
        }, 60000); // Poll every 60 seconds
    
        return () => clearInterval(intervalId); // Cleanup function
    }, [userId]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [notificationRef]);

    // Calculate unread count for the bell badge
    const unreadCount = notifications.filter(n => !n.read).length;

    const clearMessage = () => {
        setMessage('');
        setMessageType('');
    };

    const fetchBooks = async () => {
        setBooksLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/books');
            if (!response.ok) throw new Error('Failed to fetch books');
            const data = await response.json();
            setBooks(data);
        } catch (error) {
            setMessage("Failed to fetch books.");
            setMessageType('error');
        } finally {
            setBooksLoading(false);
        }
    };

    const fetchBorrowedBooks = async () => {
        if (!memberId || isNaN(Number(memberId)) || Number(memberId) <= 0) {
            setBorrowedBooksLoading(false);
            return;
        }
        setBorrowedBooksLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/borrowings/member/${memberId}`);
            if (!response.ok) throw new Error('Failed to fetch borrowed books');
            const data = await response.json();
            setBorrowedBooks(data);
        } catch (error) {
            setMessage("No books borrowed yet.");
            setMessageType('error');
        } finally {
            setBorrowedBooksLoading(false);
        }
    };

    const fetchOverdueBooks = async () => {
        setOverdueBooksLoading(true);
        try {
            // Get the memberId using the userId from the URL
            const memberIdResponse = await axios.get(`http://localhost:8080/api/members/by-user/${userId}`);
            const memberId = memberIdResponse.data.memberId;

            const response = await fetch(`http://localhost:8080/api/overdue/books/member/${memberId}`);
            if (response.status === 204) {
                setOverdueBooks([]);
                setMessage('');
                setMessageType('');
                return;
            }
            if (!response.ok) {
                throw new Error('Failed to fetch overdue books');
            }
            const data = await response.json();
            setOverdueBooks(data);
        } catch (error) {
            setMessage("Any overdue book will be shown here. Penalty of Rs. 10 per day.");
            setMessageType('error');
        } finally {
            setOverdueBooksLoading(false);
        }
    };

    const fetchPendingRequests = async () => {

        setLoading(true);
        try {
            // Get the memberId using the userId from the URL
            const memberIdResponse = await axios.get(`http://localhost:8080/api/members/by-user/${userId}`);
            const memberId = memberIdResponse.data.memberId;

            //Use the memberId to get the pending requests with book details
            const response = await axios.get(`http://localhost:8080/api/borrowing-requests/user/pending/member/${memberId}`);
            setPendingRequests(response.data);
        } catch (error) {
            console.error('Failed to fetch pending requests:', error);
            //setMessage('Failed to fetch pending requests.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleBorrowRequest = async (bookId) => {
        const pathParts = location.pathname.split('/');
        const userIdFromUrl = pathParts[pathParts.length - 1];

        if (!userIdFromUrl) {
            setMessage('User ID not found in URL. Cannot submit request.');
            setMessageType('error');
            return;
        }

        try {
            // Step 1: Get the correct memberId from the userId
            const memberResponse = await axios.get(`http://localhost:8080/api/members/by-user/${userIdFromUrl}`);
            const memberId = memberResponse.data.memberId;
            
            // Step 2: Use the fetched memberId to submit the borrow request
            const response = await axios.post('http://localhost:8080/api/borrowing-requests/submit', {
                memberId,
                bookId
            });
            setMessage('Borrowing request submitted successfully! It is now under Pending Books.');
            setMessageType('success');
            fetchBooks();
        } catch (error) {
            setMessage('You dont have an active membership plan. The admin will soon assign you with "Basic" Plan. You can upgrade to "Premium" plan anytime you wish.');
            setMessageType('error');
            console.error('Error submitting borrowing request:', error);
            
        }
    };

    const fetchPaymentHistory = async (memberId) => {
        try {
            const memberIdResponse = await axios.get(`http://localhost:8080/api/members/by-user/${userId}`);
            const memberId = memberIdResponse.data.memberId;
            
            const response = await axios.get(`http://localhost:8080/api/payments/history/member/${memberId}`);
            setPayments(response.data);
        } catch (error) {
            setMessage('Failed to fetch payment history.');
            setMessageType('error');
            console.error('Error fetching payment history:', error);
        }
    };

    const fetchOverdueCharges = async (userId) => {
        
        try {
            const response = await axios.get(`http://localhost:8080/api/borrowing/overdue/user/${userId}`);
            setOverdueHistory(response.data);
        } catch (error) {
            setMessage('Failed to fetch overdue charges.');
            setMessageType('error');
            console.error('Error fetching overdue charges:', error);
        }
    };

    const handleOnlinePayment = async (amount, type, borrowingRecordId) => {
        if (!userId) {
            setMessage('User ID not found in URL. Cannot process payment.');
            setMessageType('error');
            return;
        }

        try {
            const memberIdResponse = await axios.get(`http://localhost:8080/api/members/by-user/${userId}`);
            const memberId = memberIdResponse.data.memberId;

            const payload = {
                memberId: memberId,
                amount: amount,
                type: type,
                borrowingRecordId: borrowingRecordId
            };

            const response = await axios.post(`http://localhost:8080/api/payments/createOnlineOrder`, payload);

            if (response.status !== 200) {
                throw new Error(`Failed to create order: ${response.data}`);
            }
            const order = response.data;
            const options = {
                key: 'rzp_test_RGLghtpUjxokLC',
                amount: order.amount,
                currency: order.currency,
                name: "Librario",
                description: type === 'premium_membership' ? "Premium Membership Fee" : "Overdue Charges",
                order_id: order.id,
                handler: async function (paymentResponse) {
                    try {
                        const verificationResponse = await axios.post(
                            `http://localhost:8080/api/payments/verifyPayment?orderId=${paymentResponse.razorpay_order_id}&paymentId=${paymentResponse.razorpay_payment_id}&razorpaySignature=${paymentResponse.razorpay_signature}`
                        );
                        
                        if (verificationResponse.status === 200) {
                            setMessage('Payment successful!');
                            setMessageType('success');
                            fetchPaymentHistory(memberId);
                            fetchOverdueCharges(userId);
                        } else {
                            setMessage(`Payment verification failed: ${verificationResponse.data}`);
                            setMessageType('error');
                        }
                    } catch (error) {
                        setMessage('An error occurred during payment verification.');
                        setMessageType('error');
                    }
                },
                modal: {
                    ondismiss: async function () {
                        try {
                            await axios.post(
                                `http://localhost:8080/api/payments/verifyPayment?orderId=${order.id}&paymentId=&razorpaySignature=`
                            );
                            setMessage('Payment cancelled.');
                            setMessageType('error');
                            fetchPaymentHistory(memberId);
                            fetchOverdueCharges(userId);
                        } catch (error) {
                            console.error("Failed to update payment status to failed:", error);
                        }
                    }
                },
                prefill: {
                    name: userProfile.name,
                },
                theme: {
                    color: "#3B82F6"
                }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            setMessage(`No membership plan is assigned yet. Pay only if you want to avail the benefits of Premium membership.`);
            setMessageType('error');
        }
    };

    const fetchReturnedBooksHistory = async () => {
        setReturnedHistoryLoading(true);
        try {
            // Get the memberId using the userId from the URL
            const memberIdResponse = await axios.get(`http://localhost:8080/api/members/by-user/${userId}`);
            const memberId = memberIdResponse.data.memberId;

            const response = await axios.get(`http://localhost:8080/api/borrowings/returned/${memberId}`);
            setReturnedBooksHistory(response.data);
        } catch (error) {
            console.error("Error fetching returned books history:", error);
        } finally {
            setReturnedHistoryLoading(false);
        }
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!memberId || isNaN(Number(memberId)) || Number(memberId) <= 0) {
                setMessage("Invalid user ID in URL. Please log in again.");
                setMessageType('error');
                setUserProfile({ name: 'Guest', email: 'guest@example.com', membershipType: 'Basic' });
                setLoading(false);
                return;
            }
            try {
                const response = await fetch(`http://localhost:8080/api/user/profile?userId=${memberId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch user profile.");
                }
                const data = await response.json();
                setUserProfile(data);
                localStorage.setItem('userProfile', JSON.stringify(data));
            } catch (err) {
                setMessage("Failed to fetch user profile.");
                setMessageType('error');
                setUserProfile({ name: 'Guest', email: 'guest@example.com', membershipType: 'Basic' });
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [memberId]);

    useEffect(() => {
        if (currentView === 'dashboard') {
            fetchBooks();
            fetchOverdueBooks();
        } else if (currentView === 'myBooks') {
            fetchBorrowedBooks();
        } else if (currentView === 'overdueBooks') {
            fetchOverdueBooks();
        }
        else if (currentView === 'pendingBooks') {
            fetchPendingRequests();
        }
        // No fetch for 'payments' view as the component itself will fetch its data
    }, [currentView, memberId]);

    useEffect(() => {
        localStorage.setItem('borrowedBooks', JSON.stringify(borrowedBooks));
    }, [borrowedBooks]);

    useEffect(() => {
    const fetchData = async () => {
        if (currentView === 'history' && !returnedBooksHistory.length) {
            await fetchReturnedBooksHistory();
        }
    };
    fetchData();
}, [currentView, memberId, returnedBooksHistory.length]);

    if (loading) {
        return (
            <div className="absolute top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl font-semibold text-gray-700">Loading...</p>
            </div>
        );
    }
    const handleUpdateUser = (updatedUser) => {
        setUserProfile(updatedUser);
    };
    const handleLogout = () => {
        localStorage.removeItem('userProfile');
        localStorage.removeItem('borrowedBooks');
        localStorage.removeItem('returnedBooksHistory');
        navigate('/login');
    };

    const handleReturnBook = (borrowingRecordId) => {
    setMessage("Please visit the library and return the book in person.");
    setMessageType("success"); // or "info" if you have it. "success" will show green modal, "error" will show red.
    };

    const renderContent = () => {
        switch (currentView) {
            case 'myBooks':
                return <MyBooksContent borrowedBooks={borrowedBooks} borrowedBooksLoading={borrowedBooksLoading} memberId={memberId} fetchBooks={fetchBooks} setMessage={setMessage} setMessageType={setMessageType} />;
            case 'history':
            return <HistoryContent returnedBooksHistory={returnedBooksHistory} returnedHistoryLoading={returnedHistoryLoading} />;
            case 'profile':
                return <ProfileSettingsContent user={userProfile} onUpdateUser={handleUpdateUser} memberId={memberId} setMessage={setMessage} setMessageType={setMessageType} />;
            case 'membershipDetails':
                return <MembershipDetailsContent memberId={memberId} formatDate={formatDate} />;
            case 'overdueBooks':
                return <OverdueBooksContent overdueBooks={overdueBooks} overdueBooksLoading={overdueBooksLoading} />;
            case 'pendingBooks':
                return <PendingBooksContent pendingRequests={pendingRequests} />;
            case 'payments':
                return <PaymentsContent memberId={memberId} userProfile={userProfile} overdueBooks={overdueBooks} overdueBooksLoading={overdueBooksLoading} setMessage={setMessage} setMessageType={setMessageType} handleOnlinePayment={handleOnlinePayment} />;
            case 'dashboard':
            default:
                return <DashboardContent books={books}
                    loading={booksLoading}
                    onBorrowBook={handleBorrowRequest}
                    searchTerm={searchTerm}
                    overdueBooks={overdueBooks}
                    borrowedBooks={borrowedBooks}
                />;
        }
    };

    return (
        <div className="absolute top-0 left-0 w-screen h-screen flex overflow-hidden font-sans" style={{ backgroundImage: 'url("https://images.squarespace-cdn.com/content/v1/534ad50ae4b04a5110f5ae72/0bb5fac3-bb77-4715-bd1f-e043159b0fb8/Biblioth%C3%A8que+de+l%27Assembl%C3%A9e+Nationale%2C+Paris%2C+1796.jpg?format=1500w")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
            <div className="bg-gray-800 text-white w-72 p-6 space-y-6 flex flex-col justify-between">
                <div>
                    <h2 className="text-2xl font-bold border-b border-gray-700 pb-4">User Panel</h2>
                    <ul className="mt-6 space-y-2">
                        <li>
                            <button onClick={() => setCurrentView('dashboard')} className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                                <Library className="inline-block mr-2 text-blue-300" />Home </button>
                        </li>
                        <li>
                            <button onClick={() => setCurrentView('myBooks')} className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                                <BookIcon className="inline-block mr-2 text-blue-300" /> My Books </button>
                        </li>
                        <li>
                            <button onClick={() => setCurrentView('history')} className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                                <History className="inline-block mr-2 text-blue-300" /> Return History </button>
                        </li>
                        <li>
                            <button onClick={() => setCurrentView('overdueBooks')} className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                                <Clock className="inline-block mr-2 text-red-400" /> Overdue Books </button>
                        </li>
                        <li>
                            <button onClick={() => setCurrentView('pendingBooks')} className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                                <ListTodo className="inline-block mr-2 text-yellow-400" /> Pending Books </button>
                        </li>
                        <li>
                            <button onClick={() => setCurrentView('membershipDetails')} className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                                <CreditCard className="inline-block mr-2 text-blue-300" /> Membership Details </button>
                        </li>
                        <li>
                            <button onClick={() => setCurrentView('payments')} className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                                <Wallet className="inline-block mr-2 text-green-400" /> Payments </button>
                        </li>
                    </ul>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full text-left py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                    <LogOut className="inline-block mr-2" /> Logout </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto relative">
                <div className="w-full max-w-full flex flex-wrap items-center justify-between gap-4 px-10 py-4 bg-white bg-opacity-80 backdrop-blur-md shadow-lg z-10 rounded-b-xl">
                    <div className="flex items-center space-x-4">
                        <UserCircle className="w-10 h-10 text-gray-700" />
                        <h1 className="text-2xl font-extrabold text-gray-900">
                            Welcome, {userProfile.name}!
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 transition-colors text-gray-700"
                                title="Notifications"
                            >
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            
                            {/* Notification Dropdown Component */}
                            {showNotifications && (
                                <NotificationDropdown
                                    notifications={notifications}
                                    onClose={() => setShowNotifications(false)}
                                    onMarkRead={markAllAsRead}
                                    memberId={userId} 
                                    formatDate={formatDate}
                                />
                            )}
                        </div>
                        {/* Notification Bell Icon */}
                        <div className="relative w-full max-w-xs">
                            <input type="text" placeholder="Search for a book..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-full shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200" />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <button onClick={() => setCurrentView('profile')} className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200 transition-colors">
                            <UserCircle className="w-8 h-8 text-gray-700" />
                            <span className="font-semibold text-gray-800 hidden sm:inline">Profile</span>
                        </button>
                    </div>
                </div>
                <div className="pt-10 w-full flex-1">{renderContent()}</div>
            </div>
            <MessageModal message={message} type={messageType} onClose={clearMessage} />
        </div>
    );
};

export default UserDashboard;