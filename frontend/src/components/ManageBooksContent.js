import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit, Search, Loader2, Save, XCircle } from 'lucide-react';

// Confirmation Modal Component
const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
    if (!message) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transition-all duration-300 transform scale-100">
                <p className="text-center text-lg font-semibold text-gray-800 mb-4">{message}</p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onConfirm}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                    >
                        <Trash2 size={18} />
                        <span>Delete</span>
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        <XCircle size={18} />
                        <span>Cancel</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const ManageBooksContent = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // State for inline editing
    const [editingBook, setEditingBook] = useState(null);
    const [updatedBookData, setUpdatedBookData] = useState({
        title: '',
        author: '',
        genre: '',
        publisher: '',
        publicationYear: '',
        isbn: '',
        totalCopies: '',
        availableCopies: '',
        shelfLocation: '',
        imageUrl: '',
    });

    // States for the confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bookToDeleteId, setBookToDeleteId] = useState(null);

    // Pagination and search states
    const [currentPage, setCurrentPage] = useState(1);
    const [booksPerPage] = useState(6);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredBooks, setFilteredBooks] = useState([]);

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const results = books.filter(book =>
            book.title.toLowerCase().includes(lowercasedQuery) ||
            book.author.toLowerCase().includes(lowercasedQuery) ||
            book.isbn.toLowerCase().includes(lowercasedQuery)
        );
        setFilteredBooks(results);
    }, [searchQuery, books]);

    const fetchBooks = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:8080/api/books', {
                withCredentials: true
            });
            setBooks(response.data);
            setMessage('');
        } catch (err) {
            setError('Failed to fetch books.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const confirmDeleteClick = (bookId) => {
        setBookToDeleteId(bookId);
        setShowDeleteModal(true);
    };

    const handleDeleteClick = async () => {
        if (!bookToDeleteId) return;

        setLoading(true);
        setError('');
        setShowDeleteModal(false);

        try {
            await axios.delete(`http://localhost:8080/api/books/${bookToDeleteId}`, {
                withCredentials: true
            });
            setMessage('Book deleted successfully!');
            fetchBooks();
        } catch (err) {
            setError('Failed to delete book.');
            console.error('Failed to delete book:', err);
        } finally {
            setLoading(false);
            setBookToDeleteId(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setBookToDeleteId(null);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        if (!editingBook) return;

        setLoading(true);

        try {
            const formattedData = {
                ...updatedBookData,
                publicationYear: parseInt(updatedBookData.publicationYear, 10),
                totalCopies: parseInt(updatedBookData.totalCopies, 10),
                availableCopies: parseInt(updatedBookData.availableCopies, 10),
            };

            await axios.put(`http://localhost:8080/api/books/${editingBook.id}`, formattedData, {
                withCredentials: true
            });
            setMessage('Book updated successfully!');
            setEditingBook(null); // Exit edit mode
            fetchBooks(); // Refresh the list
        } catch (err) {
            setError('Failed to update book.');
            console.error('Failed to update book:', err);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (book) => {
        setEditingBook(book);
        setUpdatedBookData({
            title: book.title,
            author: book.author,
            genre: book.genre,
            publisher: book.publisher,
            publicationYear: book.publicationYear,
            isbn: book.isbn,
            totalCopies: book.totalCopies,
            availableCopies: book.availableCopies,
            shelfLocation: book.shelfLocation,
            imageUrl: book.imageUrl,
        });
    };

    const cancelEdit = () => {
        setEditingBook(null);
        setUpdatedBookData({
            title: '',
            author: '',
            genre: '',
            publisher: '',
            publicationYear: '',
            isbn: '',
            totalCopies: '',
            availableCopies: '',
            shelfLocation: '',
            imageUrl: '',
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedBookData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Existing Books</h3>
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Search by title or author..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80 transition-shadow duration-200"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="animate-spin text-blue-500" size={48} />
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Image</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Title</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Author</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">ISBN</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Copies</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentBooks.map((book) => (
                                    <React.Fragment key={book.id}>
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {book.imageUrl ? (
                                                    <img src={book.imageUrl} alt={book.title} className="h-16 w-16 object-cover rounded-lg shadow-md" />
                                                ) : (
                                                    <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">No Image</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{book.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{book.author}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{book.isbn}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{book.availableCopies} / {book.totalCopies}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    book.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {book.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {editingBook && editingBook.id === book.id ? (
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="text-red-600 hover:text-red-900 transition-colors"
                                                        title="Cancel Edit"
                                                    >
                                                        <XCircle className="w-5 h-5 inline-block" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => startEdit(book)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                                                        title="Edit Book"
                                                    >
                                                        <Edit className="w-5 h-5 inline-block" />
                                                    </button>
                                                )}
                                                <button onClick={() => confirmDeleteClick(book.id)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                        {/* Inline edit form row */}
                                        {editingBook && editingBook.id === book.id && (
                                            <tr className="bg-gray-50">
                                                <td colSpan="7" className="p-4">
                                                    <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <input type="text" name="title" value={updatedBookData.title} onChange={handleChange} required placeholder="Title" className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                        <input type="text" name="author" value={updatedBookData.author} onChange={handleChange} required placeholder="Author" className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                        <input type="text" name="genre" value={updatedBookData.genre} onChange={handleChange} required placeholder="Genre" className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                        <input type="text" name="publisher" value={updatedBookData.publisher} onChange={handleChange} required placeholder="Publisher" className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                        <input type="number" name="publicationYear" value={updatedBookData.publicationYear} onChange={handleChange} required placeholder="Publication Year" className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                        <input type="text" name="isbn" value={updatedBookData.isbn} onChange={handleChange} required placeholder="ISBN" className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                        <input type="text" name="totalCopies" value={updatedBookData.totalCopies} onChange={handleChange} required placeholder="Total Copies" className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                        <input type="text" name="availableCopies" value={updatedBookData.availableCopies} onChange={handleChange} required placeholder="Available Copies" className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                        <input type="text" name="shelfLocation" value={updatedBookData.shelfLocation} onChange={handleChange} required placeholder="Shelf Location" className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                                        <input type="text" name="imageUrl" value={updatedBookData.imageUrl} onChange={handleChange} required placeholder="Image URL" className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring-blue-500" />
                                                        <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-2 mt-4">
                                                            <button type="submit" className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                                                                <Save size={18} className="inline-block mr-2" />Save
                                                            </button>
                                                            <button type="button" onClick={cancelEdit} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                                                                <XCircle size={18} className="inline-block mr-2" />Cancel
                                                            </button>
                                                        </div>
                                                    </form>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination controls */}
                    <div className="flex justify-center mt-4">
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                        currentPage === i + 1
                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                    {message && <div className="mt-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg">{message}</div>}
                    {error && <div className="mt-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
                </>
            )}
            <ConfirmationModal
                message={showDeleteModal ? "Are you sure you want to delete this book? This action cannot be undone." : ""}
                onConfirm={handleDeleteClick}
                onCancel={cancelDelete}
            />
        </div>
    );
};

export default ManageBooksContent;
