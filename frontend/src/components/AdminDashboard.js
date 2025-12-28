import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Book, BookPlus,Bell, Users, BookMarked,PlusCircle,LogOut, CheckCircle,Search,Loader2, LayoutDashboard, Pencil, Trash2, User, History, ListTodo } from 'lucide-react';
import librarian from '../library.png';
import librarian_addBooks from '../library_addBooks.png';
import ManageBooksContent from './ManageBooksContent';

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

// Component for the "Add Book" form
const AddBookForm = () => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [genre, setGenre] = useState('');
    const [publisher, setPublisher] = useState('');
    const [publicationYear, setPublicationYear] = useState('');
    const [isbn, setIsbn] = useState('');
    const [totalCopies, setTotalCopies] = useState('');
    const [availableCopies, setAvailableCopies] = useState('');
    const [shelfLocation, setShelfLocation] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [message, setMessage] = useState('');

    const handleAddBook = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const bookData = {
                title,
                author,
                genre,
                publisher,
                publicationYear: parseInt(publicationYear, 10), // Ensure year is a number
                isbn,
                totalCopies: parseInt(totalCopies, 10), // Ensure copies are numbers
                availableCopies: parseInt(availableCopies, 10),
                shelfLocation,
                imageUrl
            };

            console.log('Sending book data:', bookData);

            const response = await axios.post('http://localhost:8080/api/books', bookData);
            console.log(response.data);

            setMessage('Book added successfully!');
            // Reset form fields
            setTitle('');
            setAuthor('');
            setGenre('');
            setPublisher('');
            setPublicationYear('');
            setIsbn('');
            setTotalCopies('');
            setAvailableCopies('');
            setShelfLocation('');
            setImageUrl('');

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add book. Please try again.';
            setMessage(errorMessage);
            console.error('Book addition failed:', error.response?.data || error);
        }
    };

    return (
        <div className="flex bg-white bg-opacity-90 shadow-2xl border border-gray-100 rounded-3xl p-10 w-full max-w-6xl backdrop-blur-md transform transition-all duration-300 hover:scale-[1.01] hover:shadow-3xl">
            <div className="flex-1 min-w-0 pr-8">
                <h3 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Add New Book</h3>
                <p className="text-gray-600 text-center mb-8">Fill out all the details below to add a new book to the library collection.</p>
                <form onSubmit={handleAddBook} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                            placeholder="Enter book title"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Author:</label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                            placeholder="Enter author's name"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Genre:</label>
                        <input
                            type="text"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                            placeholder="Enter genre (e.g., Fiction, Fantasy)"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Publisher:</label>
                        <input
                            type="text"
                            value={publisher}
                            onChange={(e) => setPublisher(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                            placeholder="Enter publisher's name"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Publication Year:</label>
                        <input
                            type="number"
                            value={publicationYear}
                            onChange={(e) => setPublicationYear(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                            placeholder="e.g., 2023"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">ISBN:</label>
                        <input
                            type="text"
                            value={isbn}
                            onChange={(e) => setIsbn(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                            placeholder="Enter ISBN"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Total Copies:</label>
                        <input
                            type="number"
                            value={totalCopies}
                            onChange={(e) => setTotalCopies(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                            placeholder="Number of total copies"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Available Copies:</label>
                        <input
                            type="number"
                            value={availableCopies}
                            onChange={(e) => setAvailableCopies(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                            placeholder="Number of available copies"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Shelf Location:</label>
                        <input
                            type="text"
                            value={shelfLocation}
                            onChange={(e) => setShelfLocation(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                            placeholder="e.g., Aisle 3, Shelf 12 (A3-12)"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="imageUrl">Image URL</label>
                        <input
                            id="imageUrl"
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                            placeholder="Enter image URL"
                        />
                    </div>
                    <div className="md:col-span-2 flex justify-center">
                        <button
                            type="submit"
                            className="w-full md:w-1/2 bg-blue-600 text-white font-bold text-lg py-3 rounded-xl shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                        >
                            Add Book
                        </button>
                    </div>
                </form>
                {message && (
                    <p className={`mt-6 text-center text-sm font-medium ${message.includes('successful') ? 'text-green-600' : 'text-red-500'}`}>
                        {message}
                    </p>
                )}
            </div>
            <div className="flex-1 flex items-center justify-center min-w-0">
                <img
                    src={librarian_addBooks}
                    alt="Books"
                    className="rounded-2xl w-full h-auto object-cover shadow-lg"
                />
            </div>
        </div>
    );
};

// Component for the "Add Librarian" form with enhanced design
const AddLibrarianForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleCreateLibrarian = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage('You are not authorized. Please log in again.');
                return;
            }
            const registrationData = { name, email, password, roleId: 2 }; // roleId 2 for Librarian

            console.log('Sending librarian registration data:', registrationData);

            const response = await axios.post('http://localhost:8080/api/auth/register', registrationData, {
                
            });
            console.log(response.data);

            setMessage('Librarian created successfully!');
            setName('');
            setEmail('');
            setPassword('');

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create librarian. Please try again.';
            setMessage(errorMessage);
            console.error('Librarian creation failed:', error.response?.data || error);
        }
    };

    return (
        // Main container
        <div className="flex bg-white bg-opacity-90 shadow-2xl border border-gray-100 rounded-3xl p-10 w-full max-w-4xl backdrop-blur-md transform transition-all duration-300 hover:scale-[1.01] hover:shadow-3xl">
            {/* Left side: Form fields */}
            <div className="flex-1 min-w-0 pr-8">
                <h3 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Add New Librarian</h3>
                <p className="text-gray-600 text-center mb-8">Fill out the details below to register a new librarian account.</p>
                <form onSubmit={handleCreateLibrarian} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Name:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                            placeholder="Enter full name"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                            placeholder="Enter email address"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200"
                            placeholder="Create a strong password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold text-lg py-3 rounded-xl shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                    >
                        Create Librarian
                    </button>
                </form>
                {message && (
                    <p className={`mt-6 text-center text-sm font-medium ${message.includes('successful') ? 'text-green-600' : 'text-red-500'}`}>
                        {message}
                    </p>
                )}
            </div>

            {/* Right side: Image display */}
            <div className="flex-1 flex items-center justify-center min-w-0">
                <img
                    src={librarian}
                    alt="Library themed graphic"
                    className="rounded-2xl w-full h-auto object-cover shadow-lg"
                />
            </div>
        </div>
    );
};

const ManageLibrariansContent = () => {
    const [librarians, setLibrarians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchLibrarians();
    }, []);

    const fetchLibrarians = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:8080/api/user/librarians', {
                withCredentials: true,
            });
            setLibrarians(response.data);
        } catch (err) {
            setError('Failed to fetch librarians.');
            console.error('Failed to fetch librarians:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLibrarian = async (librarianId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this librarian? This action is irreversible.");
        if (!confirmDelete) return;

        setMessage('');
        try {
            await axios.delete(`http://localhost:8080/api/user/librarians/${librarianId}`, {
                withCredentials: true,
            });
            setMessage('Librarian deleted successfully.');
            // Refetch the list to update the UI
            fetchLibrarians();
        } catch (err) {
            setMessage('Failed to delete librarian.');
            console.error('Failed to delete librarian:', err);
        }
    };

    if (loading) {
        return <p className="text-center text-gray-500">Loading librarians...</p>;
    }

    return (
        <div className="w-full max-w-4xl p-8 bg-white rounded-xl shadow-lg border border-gray-200 mt-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Manage Librarians</h2>
            {message && <div className={`p-4 mb-4 text-center rounded-lg ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
            {error && <div className="p-4 mb-4 text-center rounded-lg bg-red-100 text-red-700">{error}</div>}
            
            {librarians.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                <th className="py-3 px-6 text-center text-sm font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {librarians.map(librarian => (
                                <tr key={librarian.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-6 whitespace-nowrap text-gray-800">{librarian.name}</td>
                                    <td className="py-4 px-6 whitespace-nowrap text-gray-800">{librarian.email}</td>
                                    <td className="py-4 px-6 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => handleDeleteLibrarian(librarian.id)}
                                            className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-500">No librarians found.</p>
            )}
        </div>
    );
};

//Component for User List
const BASE_URL = 'http://localhost:8080/api';
const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [membershipType, setMembershipType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateStatus, setUpdateStatus] = useState(null);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/members/all-with-details`);
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch user list:", err);
            setError("Failed to load user list. Please try again later.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleManageMembership = (user) => {
        setEditingUser(user);
        setMembershipType(user.membership?.membership_type || '');
        // Convert ISO string to YYYY-MM-DD for date input
        setStartDate(user.membership?.start_date ? new Date(user.membership.start_date).toISOString().split('T')[0] : '');
        setEndDate(user.membership?.end_date ? new Date(user.membership.end_date).toISOString().split('T')[0] : '');
        setIsModalOpen(true);
        setUpdateStatus(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setMembershipType('');
        setStartDate('');
        setEndDate('');
        setUpdateStatus(null);
    };

    const handleUpdateMembership = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setUpdateStatus(null);

        const payload = {
            membershipType,
            startDate: startDate ? new Date(startDate).toISOString() : null,
            endDate: endDate ? new Date(endDate).toISOString() : null,
        };

        try {
            const response = await axios.put(`${BASE_URL}/members/${editingUser.id}`, payload);
            if (response.status === 200) {
                setUpdateStatus({ type: 'success', message: 'Membership updated successfully!' });
                fetchUsers(); // Refresh the user list
            }
        } catch (err) {
            console.error('Error updating membership:', err);
            setUpdateStatus({ type: 'error', message: 'Failed to update membership. Please try again.' });
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <div className="text-gray-600">Loading user list...</div>;
    if (error) return <div className="text-red-500 font-semibold">{error}</div>;

    return (
        <div className="w-full max-w-6xl">
            {updateStatus && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${updateStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} role="alert">
                    {updateStatus.message}
                </div>
            )}
            <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
                <h2 className="text-3xl font-bold mb-6 text-gray-950 text-center">User List</h2>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">                  
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Membership Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {user.membership?.membership_type || 'NA'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleManageMembership(user)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal for managing membership */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-2xl leading-6 font-medium text-gray-900" id="modal-title">
                                            Manage Membership for {editingUser?.name}
                                        </h3>
                                        <div className="mt-4">
                                            {updateStatus && (
                                                <div className={`p-3 mb-4 text-sm rounded-lg ${updateStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} role="alert">
                                                    {updateStatus.message}
                                                </div>
                                            )}
                                            <form onSubmit={handleUpdateMembership} className="space-y-4">
                                                <div>
                                                    <label htmlFor="membershipType" className="block text-sm font-medium text-gray-700">Membership Type</label>
                                                    <select
                                                        id="membershipType"
                                                        value={membershipType}
                                                        onChange={(e) => setMembershipType(e.target.value)}
                                                        required
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                    >
                                                        <option value="">Select a plan</option>
                                                        <option value="BASIC">BASIC</option>
                                                        <option value="PREMIUM">PREMIUM</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                                                    <input
                                                        type="date"
                                                        id="startDate"
                                                        value={startDate}
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                        required
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                                                    <input
                                                        type="date"
                                                        id="endDate"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        required
                                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                </div>
                                                <div className="flex justify-end space-x-4 mt-6">
                                                    <button
                                                        type="button"
                                                        onClick={handleCloseModal}
                                                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                                                        disabled={isUpdating}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? 'Saving...' : 'Save Changes'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MembershipRenewalRequestsContent = () => {
    const [renewalRequests, setRenewalRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchRenewalRequests();
    }, []);

    const fetchRenewalRequests = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:8080/api/renewals/pending', {
                withCredentials: true
            });
            setRenewalRequests(response.data);
        } catch (err) {
            setError('Failed to fetch membership renewal requests.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessRequest = async (requestId, action) => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await axios.put(`http://localhost:8080/api/renewals/${requestId}/${action}`, {}, {
                withCredentials: true
            });
            if (response.data.status === 'APPROVED') {
                setMessage('Membership renewed successfully!');
            } else if (response.data.status === 'REJECTED') {
                setMessage('Renewal request rejected.');
            }
            fetchRenewalRequests(); // Refresh the list
        } catch (err) {
            setError('Failed to process request. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 w-full">
            <h2 className="text-3xl font-bold text-white mb-6">Membership Renewal Requests</h2>
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin text-gray-500" size={48} />
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Request ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Member Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Requested Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {renewalRequests.length > 0 ? (
                                    renewalRequests.map((request) => (
                                        <tr key={request.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{request.memberName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{new Date(request.requestedDate).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}`}>
                                                    {request.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button onClick={() => handleProcessRequest(request.id, 'APPROVE')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                                    Accept
                                                </button>
                                                <button onClick={() => handleProcessRequest(request.id, 'REJECT')} className="px-4 py-2 ml-2 bg-rose-600 text-white rounded-lg hover:text-rose-900 transition-colors">
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                            No pending membership renewal requests.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <MessageModal message={message} type="success" onClose={() => setMessage('')} />
        </div>
    );
};

// Component for the dashboard cards
const DashboardCards = () => {
    const cards = [
        {
            title: "Total Books",
            value: "8",
            icon: <Book className="w-8 h-8" />,
            color: "bg-blue-500",
        },
        {
            title: "Total Users",
            value: "11",
            icon: <Users className="w-8 h-8" />,
            color: "bg-green-500",
        },
        {
            title: "Books Borrowed",
            value: "25",
            icon: <BookMarked className="w-8 h-8" />,
            color: "bg-yellow-500",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl p-4">
            {cards.map((card, index) => (
                <div key={index} className={`flex items-center justify-between p-6 rounded-2xl shadow-2xl text-white ${card.color}`}>
                    <div>
                        <div className="text-3xl font-bold">{card.value}</div>
                        <div className="text-sm mt-1">{card.title}</div>
                    </div>
                    <div>
                        {card.icon}
                    </div>
                </div>
            ))}
        </div>
    );
};

const PaymentHistoryContent = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [paymentsPerPage] = useState(10); // You can adjust this number

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredPayments, setFilteredPayments] = useState([]);

    

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:8080/api/payments/history/all', {
                withCredentials: true
            });
            setPayments(response.data);
            setFilteredPayments(response.data);
        } catch (err) {
            setError('Failed to fetch payment history.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const results = payments.filter(payment =>
            (payment.memberName || '').toLowerCase().includes(lowercasedQuery) ||
            (payment.paymentMethod || '').toLowerCase().includes(lowercasedQuery) ||
            (payment.type || '').toLowerCase().includes(lowercasedQuery) ||
            (payment.razorpayOrderId || '').toLowerCase().includes(lowercasedQuery) ||
            (payment.razorpayPaymentId || '').toLowerCase().includes(lowercasedQuery)
        );
        setFilteredPayments(results);
    }, [searchQuery, payments]);

    // Get current payments for pagination
    const indexOfLastPayment = currentPage * paymentsPerPage;
    const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
    const currentPayments = filteredPayments.slice(indexOfFirstPayment, indexOfLastPayment);

    // Calculate total pages
    const totalPages = Math.ceil(filteredPayments.length / paymentsPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="flex flex-col p-8 bg-gray-50 min-h-screen" style={{ backgroundImage: 'url("https://images.squarespace-cdn.com/content/v1/534ad50ae4b04a5110f5ae72/0bb5fac3-bb77-4715-bd1f-e043159b0fb8/Biblioth%C3%A8que+de+l%27Assembl%C3%A9e+Nationale%2C+Paris%2C+1796.jpg?format=1500w")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
            <div className="bg-white p-8 rounded-xl shadow-lg w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Payment History</h3>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1); // Reset to first page on new search
                            }}
                            className="p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="animate-spin text-blue-500" size={48} />
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">{error}</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
   
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentPayments.map((payment) => (
                                    <tr key={payment.paymentId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.paymentId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.memberName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{payment.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.paymentMethod}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                     
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                            {payment.razorpayOrderId ? payment.razorpayOrderId : '---'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {payment.razorpayPaymentId ? payment.razorpayPaymentId : '---'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

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
                    </div>
                )}
            </div>
        </div>
    );
};

// Main Admin Dashboard Component with Sidebar and token check
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [totalBooks, setTotalBooks] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalLibrarians, setTotalLibrarians] = useState(0);
    const [currentView, setCurrentView] = useState('dashboard');
    const [isAuth, setIsAuth] = useState(false);
    const [payments, setPayments] = useState([]); // New state for payments
    const [paymentsLoading, setPaymentsLoading] = useState(false); // New state for payments loading
    const [paymentsError, setPaymentsError] = useState('');
    const [bookToEdit, setBookToEdit] = useState(null);

    const fetchPayments = async () => {
        setPaymentsLoading(true);
        setPaymentsError('');
        try {
            const response = await axios.get('http://localhost:8080/api/payments/all', { withCredentials: true });
            setPayments(response.data);
            
        } catch (err) {
            setPaymentsError('Failed to fetch payment history.');
            console.error('Failed to fetch payments:', err);
        } finally {
            setPaymentsLoading(false);
        }
    };

    useEffect(() => {
        // Check for token on component mount
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin');
        } else {
            setIsAuth(true);
        }
    }, [navigate]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch total books
                const booksResponse = await axios.get('http://localhost:8080/api/books');
                setTotalBooks(booksResponse.data.length); // Length of the list for the total count

                // Fetch total users
                const usersResponse = await axios.get('http://localhost:8080/api/user/members', { withCredentials: true });
                setTotalUsers(usersResponse.data.length);

                // Fetch total librarians
                const librariansResponse = await axios.get('http://localhost:8080/api/user/librarians', { withCredentials: true });
                setTotalLibrarians(librariansResponse.data.length);


            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, []); // Empty dependency array means this effect runs once on mount

    // Handle logout functionality
    const handleLogout = () => {
        console.log("Admin logged out.");
        localStorage.removeItem('token');
        navigate('/admin'); // Redirect to admin login page
    };

    // New handler function to manage editing books
    const handleEditBook = (book) => {
        setBookToEdit(book);
        setCurrentView('addBook');
    };

    const renderContent = () => {
        switch (currentView) {
            case 'addLibrarian':
                return <AddLibrarianForm />;
            case 'manageLibrarians':
                return <ManageLibrariansContent />;
            case 'addBook':
                return <AddBookForm />;
            case 'manageBooks': 
                return <ManageBooksContent onEditBook={handleEditBook}/>;
            case 'userList':
                return <UserList />;
            case 'membership-renewal-requests':
                return <MembershipRenewalRequestsContent />;
            case 'paymentsHistory':
                return <PaymentHistoryContent />;
            case 'dashboard':
            default:
                return (
                    <div className="flex flex-col lg:flex-row justify-between items-center w-full max-w-6xl space-y-8 lg:space-y-0 lg:space-x-8">
                        {/* Total Books Card */}
                        <div className="flex-1 w-full bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl shadow-xl p-6 transform transition-all duration-300 hover:scale-105">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Total Books</h3>
                                <Book size={36} />
                            </div>
                            <span className="text-5xl font-extrabold">{totalBooks}</span>
                        </div>

                        {/* Total Users Card */}
                        <div className="flex-1 w-full bg-gradient-to-br from-green-500 to-green-700 text-white rounded-2xl shadow-xl p-6 transform transition-all duration-300 hover:scale-105">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Total Users</h3>
                                <Users size={36} />
                            </div>
                            <span className="text-5xl font-extrabold">{totalUsers}</span>
                        </div>

                        {/*Total Librarians Card*/}
                        <div className="flex-1 w-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-2xl shadow-xl p-6 transform transition-all duration-300 hover:scale-105">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Total Librarians</h3>
                                <User size={36} />
                                </div>
                            <span className="text-5xl font-extrabold">{totalLibrarians}</span>
                        </div>


                    </div>
                );
        }
    };

    if (!isAuth) {
        // Return null or a loading indicator while the check happens
        return null;
    }

    return (
        <div className="absolute top-0 left-0 w-screen h-screen bg-gray-100 flex overflow-hidden" style={{ backgroundImage: 'url("https://images.squarespace-cdn.com/content/v1/534ad50ae4b04a5110f5ae72/0bb5fac3-bb77-4715-bd1f-e043159b0fb8/Biblioth%C3%A8que+de+l%27Assembl%C3%A9e+Nationale%2C+Paris%2C+1796.jpg?format=1500w")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
            {/* Sidebar */}
            <div className="bg-gray-800 text-white w-64 p-6 space-y-6">
                <h2 className="text-2xl font-bold border-b border-gray-700 pb-4">Admin Panel</h2>
                <ul className="space-y-2 mt-6">
                    <li>
                        <button
                            onClick={() => setCurrentView('dashboard')}
                                className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                                >
                                <LayoutDashboard className="mr-2" />
                                Dashboard
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setCurrentView('addLibrarian')}
                            className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                        >
                            <PlusCircle className="mr-2" size={20} /> Add Librarian
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setCurrentView('manageLibrarians')}
                            className={`w-full text-left py-2 px-4 rounded-lg  transition-colors flex items-center ${currentView === 'manageLibrarians' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                        >
                            <Users className="mr-2" />Manage Librarians
                        </button>
                    </li>

                    <li>
                        <button
                            onClick={() => setCurrentView('addBook')}
                            className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                        >
                            <PlusCircle className="mr-2" size={20} /> Add Book
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setCurrentView('manageBooks')}
                            className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                        >
                            <Book className="mr-2" size={20} /> Manage Books
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setCurrentView('userList')}
                            className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                        >
                            <ListTodo className="mr-2" size={20} /> User List
                        </button>
                    </li>
                    <li>
                        <button
                        onClick={() => setCurrentView('membership-renewal-requests')}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 hover:bg-gray-700 `}>
                        <Bell className="h-6 w-6" />
                        <span>Renewal Requests</span>
                    </button>
                    </li>
                    <li className="mb-2">
                        <a href="#"
                            onClick={() => setCurrentView('paymentsHistory')}
                            className={`w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center `}>
                            <History className="mr-2" size={24} />
                            Payment History
                        </a>
                    </li>
                    <li>
                        <button
                        onClick={handleLogout}
                        className="w-full text-left py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center"
                    >
                        <LogOut className="mr-2" />
                        Logout
                    </button>
                    </li>
                </ul>
            </div>

            {/* Main Content Area */}
            <div
                className="flex-1 p-10 flex flex-col items-center justify-start pt-40 overflow-y-auto"
            >
                {/* Navbar for Admin */}
                <nav className="fixed top-0 left-64 right-0 bg-gray-300  text-black p-4 shadow-md z-10 flex justify-between items-center w-full mx-auto">
                    <h1 className="text-3xl font-semibold">Welcome, Admin! 👋</h1>
                </nav>
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminDashboard;
