import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Book, User, PlusCircle,UserCircle, LogOut, LayoutDashboard, Trash2, Edit, Search, ArrowRightLeft, Pencil, Bell, MailOpen } from 'lucide-react';
import { RefreshCw, XCircle, CheckCircle, Loader2, ListTodo, History } from 'lucide-react';
import axios from 'axios';
import librarian from '../profile.png';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const ProfileContent = () => {
    const { userId } = useParams(); // Get userId from URL
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isPasswordChangeSuccess, setIsPasswordChangeSuccess] = useState(false);

    const fetchUserProfile = useCallback(async () => {
        if (!userId) {
            setError('User ID not found in URL.');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8080/api/user/profile?userId=${userId}`);
            setProfile(response.data);
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            setError('Failed to load profile data.');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsPasswordChangeSuccess(false);

        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        try {
            const response = await axios.put(
                `http://localhost:8080/api/user/update?userId=${userId}`,
                { password: newPassword },
                { withCredentials: true }
            );

            if (response.status === 200) {
                setMessage('Password updated successfully!');
                setIsPasswordChangeSuccess(true);
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            const errorMessage = error.response?.data || 'Password update failed.';
            setMessage(errorMessage);
            setIsPasswordChangeSuccess(false);
            console.error('Password update failed:', error.response?.data || error);
        }
    };

    if (loading) return <div className="text-center py-10">Loading profile...</div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">Librarian Profile</h2>
            {profile && (
                <div className="space-y-4">
                    <p className="text-gray-600"><strong>Name:</strong> {profile.name}</p>
                    <p className="text-gray-600"><strong>Email:</strong> {profile.email}</p>
                </div>
            )}
            <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Change Password</h3>
                {message && (
                    <div className={`p-4 rounded-lg mb-4 ${isPasswordChangeSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="new-password">New Password</label>
                        <input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password">Confirm New Password</label>
                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full focus:outline-none focus:shadow-outline transition duration-300"
                    >
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
};

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

const PendingRequestsContent = () => {
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:8080/api/borrowing-requests/pending', {
                withCredentials: true
            });
            setPendingRequests(response.data);
        } catch (err) {
            setError('Failed to fetch pending requests.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await axios.post(`http://localhost:8080/api/borrowing-requests/accept/${requestId}`, {}, {
                withCredentials: true
            });
            showTemporaryMessage('Request accepted successfully!', false);
            fetchPendingRequests();
        } catch (err) {
            setError('Failed to accept request.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRejectRequest = async (requestId) => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await axios.post(`http://localhost:8080/api/borrowing-requests/reject/${requestId}`, {}, {
                withCredentials: true
            });
            showTemporaryMessage('Request rejected successfully!', false);
            fetchPendingRequests();
        } catch (err) {
            setError('Failed to reject request.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showTemporaryMessage = (msg, isError) => {
        if (isError) {
            setError(msg);
        } else {
            setMessage(msg);
        }
        setTimeout(() => {
            setError('');
            setMessage('');
        }, 3000);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-700">Pending Borrowing Requests</h2>
                <button
                    onClick={fetchPendingRequests}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <RefreshCw size={24} />
                </button>
            </div>
            {message && <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4 flex items-center"><CheckCircle className="mr-2" />{message}</div>}
            {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 flex items-center"><XCircle className="mr-2" />{error}</div>}
            {loading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="animate-spin text-gray-500" size={48} />
                </div>
            ) : pendingRequests.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-100 text-gray-600">
                                <th className="px-4 py-3 font-semibold">Request ID</th>
                                <th className="px-4 py-3 font-semibold">Member Name</th>
                                <th className="px-4 py-3 font-semibold">Book Title</th>
                                <th className="px-4 py-3 font-semibold">Request Date</th>
                                <th className="px-4 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingRequests.map(request => (
                                <tr key={request.requestId} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="px-4 py-3">{request.requestId}</td>
                                    <td className="px-4 py-3">{request.memberName}</td>
                                    <td className="px-4 py-3">{request.bookTitle}</td>
                                    <td className="px-4 py-3">{new Date(request.requestDate).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button
                                            onClick={() => handleAcceptRequest(request.requestId)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleRejectRequest(request.requestId)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-500 text-center py-10">No pending requests at the moment.</p>
            )}
        </div>
    );
};

// Component for Adding a User
const AddUserForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        setLoading(true);

        try {
            const registrationData = { name, email, password, roleId: 3 }; // Role ID 3 for a new member
            const response = await axios.post('http://localhost:8080/api/auth/register', registrationData);

            if (response.status === 201) {
                setMessage('User registered successfully!');
                setName('');
                setEmail('');
                setPassword('');
            } else {
                setMessage('User registration failed. Please try again.');
                setIsError(true);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'User registration failed. Please try again.';
            setMessage(errorMessage);
            setIsError(true);
            console.error('Registration failed:', error.response?.data || error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <div className="flex flex-col md:flex-row max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Left side: Form */}
                <div className="w-full md:w-1/2 p-8">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register New User</h2>
                    {message && (
                        <div className={`p-4 rounded-lg mb-4 ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {message}
                        </div>
                    )}
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Name</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Full Name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Email Address"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Password"
                                required
                            />
                        </div>
                        <div className="flex items-center justify-center">
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full focus:outline-none focus:shadow-outline transition duration-300 flex items-center justify-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={18} />
                                        Registering...
                                    </>
                                ) : (
                                    'Register User'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                {/* Right side: Image display */}
                <div className="hidden md:block md:w-1/2 p-6 flex items-center justify-center bg-gray-50">
                    <img
                        src={librarian}
                        alt="Library themed graphic"
                        className="rounded-xl shadow-lg w-full h-auto max-h-96 object-contain"
                    />
                </div>
            </div>
        </div>
    );
};

const BASE_URL = 'http://localhost:8080/api';

const ManageUsersContent = () => {
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
    const [searchQuery, setSearchQuery] = useState('');

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
                fetchUsers();
            }
        } catch (err) {
            console.error('Error updating membership:', err);
            setUpdateStatus({ type: 'error', message: 'Failed to update membership. Please try again.' });
        } finally {
            setIsUpdating(false);
        }
    };
    
    const handleDeleteMembership = async () => {
        setIsUpdating(true);
        setUpdateStatus(null);
        try {
            const response = await axios.delete(`${BASE_URL}/members/${editingUser.id}/membership`);
            if (response.status === 200) {
                setUpdateStatus({ type: 'success', message: 'Membership deleted successfully!' });
                fetchUsers();
                handleCloseModal();
            }
        } catch (err) {
            console.error('Error deleting membership:', err);
            setUpdateStatus({ type: 'error', message: 'Failed to delete membership. Please try again.' });
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="text-gray-600">Loading user list...</div>;
    if (error) return <div className="text-red-500 font-semibold">{error}</div>;

    return (
        <div className="w-full max-w-6xl mx-auto">
            {updateStatus && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${updateStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} role="alert">
                    {updateStatus.message}
                </div>
            )}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-8 overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold text-gray-950">User List</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                </div>
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
                        {filteredUsers.map((user) => (
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
                                    <button onClick={() => handleManageMembership(user)} className="text-indigo-600 hover:text-indigo-900">
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
                                                <div className="flex justify-end space-x-2 mt-4">
                                                    <button
                                                        type="submit"
                                                        className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:w-auto sm:text-sm"
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? 'Updating...' : 'Update Membership'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCloseModal}
                                                        className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                            {editingUser?.membership && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <button
                                                        onClick={handleDeleteMembership}
                                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:text-sm"
                                                        disabled={isUpdating}
                                                    >
                                                        {isUpdating ? 'Deleting...' : 'Delete Membership'}
                                                    </button>
                                                </div>
                                            )}
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

const LibrarianProfileContent = ({ user }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        if (newPassword !== confirmNewPassword) {
            setMessage('New passwords do not match.');
            setIsError(true);
            return;
        }

        setLoading(true);
        try {
            await axios.put(`${BASE_URL}/librarian/change-password`, { oldPassword, newPassword }, { withCredentials: true });
            setMessage('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            setIsError(false);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to change password. Please try again.';
            setMessage(errorMessage);
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div className="text-gray-600 text-center">Loading profile...</div>;
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Librarian Profile</h2>
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-lg font-semibold text-gray-700">Name: <span className="font-normal">{user.name}</span></p>
                    <p className="text-lg font-semibold text-gray-700">Email: <span className="font-normal">{user.email}</span></p>
                </div>
                <div className="bg-white rounded-xl p-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Change Password</h3>
                    {message && (
                        <div className={`p-4 rounded-lg mb-4 ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {message}
                        </div>
                    )}
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="oldPassword">Old Password</label>
                            <input
                                id="oldPassword"
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">New Password</label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmNewPassword">Confirm New Password</label>
                            <input
                                id="confirmNewPassword"
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full focus:outline-none focus:shadow-outline transition duration-300 flex items-center justify-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={18} />
                                    Changing...
                                </>
                            ) : (
                                'Change Password'
                            )}
                        </button>
                    </form>
                </div>
            </div>
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
            // JWT token usage removed here
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
            // JWT token usage removed here
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
        <div className="p-8">
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {renewalRequests.length > 0 ? (
                                    renewalRequests.map((request) => (
                                        <tr key={request.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.memberName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(request.requestedDate).toLocaleString()}</td>
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

const ProfileSettingsContent = ({ user, userId, onUpdateUser, setMessage, setMessageType }) => {
    const [name, setName] = useState(user.name || '');
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (user && user.name) {
            setName(user.name);
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!userId) {
            setMessage("Cannot update profile. User ID not found.");
            setMessageType('error');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:8080/api/user/update?userId=${userId}`, {
                name: name,
                password: password || undefined, // Only send password if it's not empty
            });
            
            if (response.status === 200) {
                const updatedUser = response.data;
                onUpdateUser(updatedUser);
                localStorage.setItem('userProfile', JSON.stringify(updatedUser));
                alert("Profile updated successfully!")
                setMessage("Profile updated successfully!");
                setMessageType('success');
            } else {
                const error = response.data.message || "Failed to update profile.";
                setMessage(`Failed to update profile: ${error}`);
                setMessageType('error');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "An error occurred while updating the profile. Please try again.";
            setMessage(errorMessage);
            setMessageType('error');
            console.error("Profile update failed:", error);
        }
    };

    return (
            <div className="bg-white p-8 mt-11 rounded-xl shadow-lg w-full max-w-2xl">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Profile Settings</h2>
                <div className="mb-6 text-center">
                    <div className="flex justify-center mb-4">
                       <UserCircle size={96} className="text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                </div>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                            type="password"
                            placeholder="New Password(Optional)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                    >
                        Update Profile
                    </button>
                </form>
            </div>
       
    );
};

const NotificationComponent = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const stompClientRef = useRef(null);
    const notificationsRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return; 
        try {
            const response = await axios.get(`http://localhost:8080/api/notifications/librarian?librarianId=${userId}`, { withCredentials: true });
            setNotifications(response.data);
            const unread = response.data.filter(n => !n.read).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, [userId]);

    const markAllAsRead = async () => {
        try {
            await axios.post(`http://localhost:8080/api/notifications/mark-all-read?librarianId=${userId}`, {}, { withCredentials: true });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };
    
    useEffect(() => {
        fetchNotifications();
    
        if (!userId) return; 

        const socket = new SockJS('http://localhost:8080/websocket');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                stompClient.subscribe(`/topic/notifications`, (message) => {
                    fetchNotifications();
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });
    
        stompClient.activate();
        stompClientRef.current = stompClient;
    
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [userId, fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsPanelOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [notificationsRef]);


    return (
        <div className="relative" ref={notificationsRef}>
            <button
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-ping"></span>
                )}
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
            </button>
            {isPanelOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Mark all as read
                        </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-100 last:border-b-0 ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}
                                >
                                    <p className="text-sm text-gray-800">{notification.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-center text-gray-500 text-sm">No new notifications.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};  


const LibrarianDashboard = () => {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState('dashboard');
    const [isAuth, setIsAuth] = useState(false);
    const [user, setUser] = useState(null);
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [overdueBooks, setOverdueBooks] = useState([]);
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [activeContent, setActiveContent] = useState('dashboard');
    const [payments, setPayments] = useState([]);
    const [paymentsLoading, setPaymentsLoading] = useState(false);
    const [paymentsError, setPaymentsError] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmModalData, setConfirmModalData] = useState({ id: null, type: null, action: null });

    const [notifications, setNotifications] = useState([]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationsRef = useRef(null);

    const { userId } = useParams();
    const [messageType, setMessageType] = useState('');
    const stompClientRef = useRef(null);
        
    const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile) : { name: 'Guest', email: 'guest@example.com', membershipType: 'Basic' };
    });

    const handleUpdateUser = (updatedUser) => {
    setUserProfile(updatedUser);
    };
    const onUpdateUser = (updatedUser) => {
        setUser(updatedUser);
        setMessage('Profile updated successfully!');
        setMessageType('success');
    }

    // WebSocket connection and subscription logic
    useEffect(() => {
        // Create a new STOMP client instance
        const stompClient = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: (frame) => {
                console.log('Connected to WebSocket: ' + frame);

                // Subscribe to the generic notifications topic
                stompClient.subscribe('/topic/notifications', (notification) => {
                    const newNotification = notification.body;
                    console.log("New Notification Received:", newNotification);
                    // Update the state with the new notification
                    setNotifications(prevNotifications => [...prevNotifications, newNotification]);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
            // The client will automatically try to reconnect
            reconnectDelay: 5000,
        });

        // Activate the client to start the connection
        stompClient.activate();

        // Store the client in a ref to be used in the cleanup function
        stompClientRef.current = stompClient;

        // Cleanup function to disconnect the WebSocket when the component unmounts
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, []); // Empty dependency array ensures this effect runs only once on mount


    useEffect(() => {
        const fetchUserProfile = async (userId) => {
            try {
                // Fetch the actual user data from the backend
                const response = await axios.get(`http://localhost:8080/api/user/profile?userId=${userId}`);
                setUser(response.data);
                setIsAuth(true);
                setLoading(false);
                fetchDashboardData();
            } catch (err) {
                console.error("Failed to fetch user profile:", err);
                setIsAuth(false);
                setLoading(false);
                navigate('/librarian'); // Redirect on API failure
            }
        };

        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (token && userId) {
            fetchUserProfile(userId);
        } else {
            setLoading(false);
            navigate('/librarian'); // Redirect if no token or userId
        }
    }, [navigate]);
    
    useEffect(() => {
        if (isAuth) {
            fetchDashboardData();
        }
    }, [isAuth]);
    
    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [booksResponse, usersResponse, borrowedResponse] = await Promise.all([
                fetch('http://localhost:8080/api/books'),
                fetch('http://localhost:8080/api/user/members'),
                fetch('http://localhost:8080/api/librarian/borrowed-books'),
                
            ]);
            if (!booksResponse.ok || !usersResponse.ok || !borrowedResponse.ok) {
                throw new Error('Failed to fetch dashboard data');
            }
            const booksData = await booksResponse.json();
            const usersData = await usersResponse.json();
            const borrowedData = await borrowedResponse.json();
            setBooks(booksData);
            setUsers(usersData);
            setBorrowedBooks(borrowedData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const markAllAsRead = async () => {
        try {
            await axios.post(`${BASE_URL}/notifications/mark-all-read`, {}, { withCredentials: true });
            setNotifications(notifications.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark notifications as read:", err);
        }
    };
    const fetchBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8080/api/books');
            if (!response.ok) {
                throw new Error('Failed to fetch books');
            }
            const data = await response.json();
            setBooks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8080/api/user/members');
            if (!response.ok) {
                throw new Error('Failed to fetch members');
            }
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const fetchOverdueBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8080/api/overdue/books');
            if (response.status === 204) {
                setOverdueBooks([]);
                return;
            }
            if (!response.ok) {
                throw new Error('Failed to fetch overdue books');
            }
            const data = await response.json();
            setOverdueBooks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const fetchBorrowedBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8080/api/librarian/borrowed-books');
            if (!response.ok) {
                throw new Error('Failed to fetch borrowed books');
            }
            const data = await response.json();
            setBorrowedBooks(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    const handleReturnBook = async (recordId) => {
        setMessage('');
        setError('');
        setLoading(true);
        try {
            await axios.put(`http://localhost:8080/api/borrowings/librarian/return/${recordId}`, null, { withCredentials: true });
            setMessage('Book returned successfully!');
            fetchBorrowedBooks();
        } catch (err) {
            setError('Failed to return book.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (currentView === 'manageBooks') {
            fetchBooks();
        } else if (currentView === 'overdueBooks') {
            fetchOverdueBooks();
        } else if (currentView === 'manageUsers') {
            fetchUsers();
        } else if (currentView === 'borrowedBooks') {
            fetchBorrowedBooks();
        }
    }, [currentView]);
    const handleLogout = () => {
        console.log("Librarian logged out.");
        localStorage.removeItem('token');
        navigate('/librarian');
    };
    const showTemporaryMessage = (msg, isError = false) => {
        setMessage({ text: msg, isError });
        setTimeout(() => setMessage(null), 3000);
    };
    const DashboardContent = () => {
        return (
            <div className="flex flex-col w-full p-8 text-white">
                <h2 className="text-4xl font-extrabold mb-8">Dashboard Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-purple-600 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
                        <h3 className="text-2xl font-bold mb-2 text-black">Total Books</h3>
                        <span className="text-5xl font-extrabold text-white">{books.length}</span>
                    </div>
                    <div className="bg-green-500 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
                        <h3 className="text-2xl font-bold mb-2 text-black">Total Users</h3>
                        <span className="text-5xl font-extrabold text-white">{users.length}</span>
                    </div>
                    <div className="bg-blue-400 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
                        <h3 className="text-2xl font-bold mb-2 text-black">Books Borrowed</h3>
                        <span className="text-5xl font-extrabold text-white">{borrowedBooks.length}</span>
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
    const [isEditing, setIsEditing] = useState(false);
    const [editingBookId, setEditingBookId] = useState(null);
    const [bookData, setBookData] = useState({
        title: '',
        author: '',
        genre: '',
        publisher: '',
        publicationYear: '',
        isbn: '',
        totalCopies: '',
        availableCopies: '',
        shelfLocation: '',
        imageUrl: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [booksPerPage] = useState(6);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredBooks, setFilteredBooks] = useState([]);
    useEffect(() => {
        fetchBooks();
    }, []);
    const fetchBooks = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:8080/api/books', {
                withCredentials: true
            });
            setBooks(response.data);
        } catch (err) {
            setError('Failed to fetch books.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookData({ ...bookData, [name]: value });
    };
    const handleAddOrUpdateBook = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        const url = isEditing ? `http://localhost:8080/api/books/${editingBookId}` : 'http://localhost:8080/api/books';
        const method = isEditing ? 'put' : 'post';
        const payload = {
            ...bookData,
            publicationYear: Number(bookData.publicationYear),
            totalCopies: Number(bookData.totalCopies),
            availableCopies: Number(bookData.totalCopies)
        };
        try {
            const response = await axios[method](url, payload, {
                withCredentials: true
            });
            setMessage('Book saved successfully!');
            // After successful add/update, fetch the books again to refresh the list
            fetchBooks();
            // Reset the form
            resetForm();
        } catch (err) {
            setError('Failed to save book. Please check your data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const handleEditClick = (book) => {
        setIsEditing(true);
        setEditingBookId(book.id);
        setBookData({
            title: book.title,
            author: book.author,
            genre: book.genre,
            publisher: book.publisher,
            publicationYear: book.publicationYear,
            isbn: book.isbn,
            totalCopies: book.totalCopies,
            availableCopies: book.availableCopies,
            shelfLocation: book.shelfLocation,
            imageUrl: book.imageUrl || '' 
        });
    };
    const handleDeleteClick = async (bookId) => {
        setLoading(true);
        setError('');
        try {
            await axios.delete(`http://localhost:8080/api/books/${bookId}`, {
                withCredentials: true
            });
            setMessage('Book deleted successfully!');
            fetchBooks();
        } catch (err) {
            setError('Failed to delete book.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const resetForm = () => {
        setIsEditing(false);
        setEditingBookId(null);
        setBookData({
            title: '',
            author: '',
            genre: '',
            publisher: '',
            publicationYear: '',
            isbn: '',
            totalCopies: '',
            availableCopies: '',
            shelfLocation: '',
            imageUrl: ''
        });
    };
    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const results = books.filter(book =>
            book.title.toLowerCase().includes(lowercasedQuery) ||
            book.author.toLowerCase().includes(lowercasedQuery)
        );
        setFilteredBooks(results);
    }, [searchQuery, books]);
    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    return (
        <div className="flex flex-col p-8 bg-gray-50 min-h-screen" style={{ backgroundImage: 'url("https://images.squarespace-cdn.com/content/v1/534ad50ae4b04a5110f5ae72/0bb5fac3-bb77-4715-bd1f-e043159b0fb8/Biblioth%C3%A8que+de+l%27Assembl%C3%A9e+Nationale%2C+Paris%2C+1796.jpg?format=1500w")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
            <h2 className="text-3xl font-bold text-white mb-8">Manage Books</h2>
            <div className="bg-white p-8 rounded-xl shadow-lg w-full mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{isEditing ? 'Update Book' : 'Add New Book'}</h3>
                <form onSubmit={handleAddOrUpdateBook} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="title"
                            value={bookData.title}
                            onChange={handleInputChange}
                            placeholder="Title"
                            required
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            name="author"
                            value={bookData.author}
                            onChange={handleInputChange}
                            placeholder="Author"
                            required
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            name="genre"
                            value={bookData.genre}
                            onChange={handleInputChange}
                            placeholder="Genre"
                            required
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            name="publisher"
                            value={bookData.publisher}
                            onChange={handleInputChange}
                            placeholder="Publisher"
                            required
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="number"
                            name="publicationYear"
                            value={bookData.publicationYear}
                            onChange={handleInputChange}
                            placeholder="Publication Year"
                            required
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            name="isbn"
                            value={bookData.isbn}
                            onChange={handleInputChange}
                            placeholder="ISBN"
                            required
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="number"
                            name="totalCopies"
                            value={bookData.totalCopies}
                            onChange={handleInputChange}
                            placeholder="Total Copies"
                            required
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            name="shelfLocation"
                            value={bookData.shelfLocation}
                            onChange={handleInputChange}
                            placeholder="Shelf Location"
                            required
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="url"
                            name="imageUrl"
                            value={bookData.imageUrl}
                            onChange={handleInputChange}
                            placeholder="Image URL"
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-1 md:col-span-2"
                        />
                    </div>
                    <div className="flex justify-end space-x-4 mt-4">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (isEditing ? 'Update Book' : 'Add Book')}
                        </button>
                    </div>
                </form>
                {message && <div className="mt-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg">{message}</div>}
                {error && <div className="mt-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg w-full ">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Existing Books</h3>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by title or author..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1); 
                        }}
                        className="p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="animate-spin text-blue-500" size={48} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Copies</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentBooks.map((book) => (
                                    <tr key={book.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {book.imageUrl ? (
                                                <img src={book.imageUrl} alt={book.title} className="h-16 w-16 object-cover rounded-lg" />
                                            ) : (
                                                <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">No Image</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{book.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.author}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.isbn}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.availableCopies} / {book.totalCopies}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                book.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {book.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEditClick(book)} className="text-blue-600 hover:text-blue-900 mr-4">
                                                <Edit size={20} />
                                            </button>
                                            <button onClick={() => handleDeleteClick(book.id)} className="text-red-600 hover:text-red-900">
                                                <Trash2 size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

    const BorrowedBooksContent = ({ borrowedBooks, handleReturnBook, message, loading, error }) => {
    const [borrowedBooksSearchQuery, setBorrowedBooksSearchQuery] = useState('');
    const [showBorrowModal, setShowBorrowModal] = useState(false);
    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([]);
    const [selectedBookId, setSelectedBookId] = useState('');
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [borrowLoading, setBorrowLoading] = useState(false);
    const [borrowError, setBorrowError] = useState('');
    useEffect(() => {
        if (showBorrowModal) {
            fetchMembers();
            fetchBooks();
        }
    }, [showBorrowModal]);
    const fetchMembers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/members/all-with-details', { withCredentials: true });
            setMembers(response.data);
        } catch (err) {
            console.error('Failed to fetch members:', err);
        }
    };
    const fetchBooks = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/books', { withCredentials: true });
            setBooks(response.data.filter(book => book.availableCopies > 0));
        } catch (err) {
            console.error('Failed to fetch books:', err);
        }
    };
    const handleBorrowBook = async (e) => {
        e.preventDefault();
        setBorrowLoading(true);
        setBorrowError('');
        if (!selectedBookId || !selectedMemberId) {
            setBorrowError('Please select a book and a member.');
            setBorrowLoading(false);
            return;
        }
        try {
            const borrowData = {
                bookId: parseInt(selectedBookId),
                memberId: parseInt(selectedMemberId)
            };
            const response = await axios.post('http://localhost:8080/api/borrowings/borrow', borrowData, {
                withCredentials: true
            });
            if (response.status === 201) {
                alert('Book borrowed successfully!');
                setShowBorrowModal(false);
                setSelectedBookId('');
                setSelectedMemberId('');
                window.location.reload(); 
            } else {
                setBorrowError('Failed to borrow book. Please try again.');
            }
        } catch (err) {
            console.error('Borrowing failed:', err);
            if (err.response && err.response.data) {
                setBorrowError(err.response.data.message || 'An unexpected error occurred during borrowing.');
            } else {
                setBorrowError('An unexpected network error occurred.');
            }
        } finally {
            setBorrowLoading(false);
        }
    };
    const filteredBorrowedBooks = borrowedBooks.filter(record =>
        record.book.title.toLowerCase().includes(borrowedBooksSearchQuery.toLowerCase()) ||
        record.user.name.toLowerCase().includes(borrowedBooksSearchQuery.toLowerCase())
    );
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Borrowed Books</h2>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by book or member..."
                            value={borrowedBooksSearchQuery}
                            onChange={(e) => setBorrowedBooksSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                    <button
                        onClick={() => setShowBorrowModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                    >
                        <ArrowRightLeft size={18} />
                        <span>Borrow Book</span>
                    </button>
                </div>
            </div>
            {loading && <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin text-blue-600" size={48} /></div>}
            {error && <p className="text-center text-red-600">{error}</p>}
            {message && <p className="text-center text-green-600 mb-4">{message}</p>}
            {!loading && filteredBorrowedBooks.length === 0 && (
                <p className="text-center text-gray-500">No borrowed books found.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBorrowedBooks.map(record => (
                    <div key={record.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-gray-800">
                                <Book size={20} />
                                <h3 className="font-bold text-lg">{record.book.title}</h3>
                            </div>
                            
                            <div className="flex items-center space-x-2 text-gray-800">
                                <User size={20} />
                                <p className="font-medium">{record.user.name}</p>
                            </div>
                            <p className="text-sm text-gray-500">Borrowed on: {new Date(record.borrowDate).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-500 font-semibold">Due Date: {record.dueDate}</p>
                        </div>
                        <div className="mt-4">
                            {!record.returned && (
                                <button
                                    onClick={() => handleReturnBook(record.id)}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
                                >
                                    Mark as Returned
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {showBorrowModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Borrow a Book</h3>
                            <button onClick={() => setShowBorrowModal(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleBorrowBook}>
                            <div className="mb-4">
                                <label htmlFor="book-select" className="block text-sm font-medium text-gray-700">Select Book</label>
                                <select
                                    id="book-select"
                                    name="book"
                                    value={selectedBookId}
                                    onChange={(e) => setSelectedBookId(e.target.value)}
                                    required
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    <option value="">-- Select a book --</option>
                                    {books.map(book => (
                                        <option key={book.id} value={book.id}>
                                            {book.title} by {book.author} ({book.availableCopies} available)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-6">
                                <label htmlFor="member-select" className="block text-sm font-medium text-gray-700">Select Member</label>
                                <select
                                    id="member-select"
                                    name="member"
                                    value={selectedMemberId}
                                    onChange={(e) => setSelectedMemberId(e.target.value)}
                                    required
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    <option value="">-- Select a member --</option>
                                    {members.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} ({member.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {borrowError && <p className="text-red-600 text-center mb-4">{borrowError}</p>}
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:opacity-50"
                                    disabled={borrowLoading}
                                >
                                    {borrowLoading ? 'Borrowing...' : 'Confirm Borrow'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

    const OverdueBooksContent = () => {
    const [overdueBooks, setOverdueBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchOverdueBooks = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:8080/api/overdue/books', {
                withCredentials: true
            });
            setOverdueBooks(response.data);
        } catch (err) {
            setError('Failed to fetch overdue books.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleUpdatePaymentStatus = async (book) => {
        setMessage('');
        try {
            await axios.post('http://localhost:8080/api/payments/recordCashPayment', null, {
                params: {
                    memberId: book.memberId,
                    amount: book.fineAmount,
                    type: 'overdue_charges',
                    borrowingRecordId: book.id
                },
                withCredentials: true
            });
            setMessage('Cash payment recorded successfully!');
            // Re-fetch the list to show the updated status
            fetchOverdueBooks();
        } catch (err) {
            setMessage('Failed to update payment status.');
            console.error(err);
        }
    };


    useEffect(() => {
        fetchOverdueBooks();
    }, [fetchOverdueBooks]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" size={48} /></div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-6xl mx-auto mt-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Overdue Books</h2>
            {message && <div className={`mb-4 p-3 rounded text-white ${message.includes('successfully') ? 'bg-green-500' : 'bg-red-500'}`}>{message}</div>}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white divide-y divide-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue Days</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fine Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 ">
                        {overdueBooks.length > 0 ? (
                            overdueBooks.map((book) => (
                                <tr key={book.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{book.borrowingRecordId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.bookTitle}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.memberName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.overdueDays}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{book.fineAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${book.paymentStatus === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {book.paymentStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleUpdatePaymentStatus(book)}
                                            disabled={book.paymentStatus === 'Completed'}
                                            className={`py-1 px-3 rounded-lg text-sm transition-colors ${book.paymentStatus === 'Completed' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                        >
                                            Mark as Paid
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">No overdue books found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
    const renderContent = () => {
        if (!user) {
            return (
                <div className="flex items-center justify-center h-full text-gray-800 text-lg">
                    Loading librarian data...
                </div>
            );
        }
        switch (currentView) {
            case 'addUser':
                return <AddUserForm />;
            case 'manageBooks':
                return <ManageBooksContent />;
            case 'manageUsers':
                return (
                    <ManageUsersContent
                        users={users}
                        handleDeleteUser={handleDeleteUser}
                        message={message}
                        loading={loading}
                        error={error}
                    />
                );
            case 'borrowedBooks':
                return (
                    <BorrowedBooksContent
                        borrowedBooks={borrowedBooks}
                        handleReturnBook={handleReturnBook}
                        message={message}
                        loading={loading}
                        error={error}
                    />
                );
            case 'overdueBooks':
                return <OverdueBooksContent />;
            case 'membership-renewal-requests':
                return <MembershipRenewalRequestsContent />;
            case 'pendingRequests':
            return <PendingRequestsContent />;
            case 'paymentsHistory':
                return <PaymentHistoryContent />;
            case 'profile':
                return (
                    <ProfileSettingsContent
                        user={user}
                        userId={userId}
                        onUpdateUser={onUpdateUser}
                        setMessage={setMessage}
                        setMessageType={setMessageType}
                    />
                );
            case 'dashboard':
            default:
                return <DashboardContent />;
        }
    };
    const handleDeleteUser = (id) => {
        const updatedUsers = users.filter(user => user.id !== id);
        setUsers(updatedUsers);
        showTemporaryMessage('User deleted successfully!', false);
    };
    const handleConfirmAction = () => {
        if (confirmModalData.action) {
            confirmModalData.action();
        }
        setShowConfirmModal(false);
        setConfirmModalData({ id: null, type: null, action: null });
    };
    if (!isAuth) {
        return (
            <div className="absolute top-0 left-0 w-screen h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl font-semibold text-gray-700">Loading...</p>
            </div>
        );
    }
    return (
    <div className="absolute top-0 left-0 w-screen h-screen flex overflow-hidden font-sans bg-gray-100" style={{ backgroundImage: 'url("https://images.squarespace-cdn.com/content/v1/534ad50ae4b04a5110f5ae72/0bb5fac3-bb77-4715-bd1f-e043159b0fb8/Biblioth%C3%A8que+de+l%27Assembl%C3%A9e+Nationale%2C+Paris%2C+1796.jpg?format=1500w")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div className="bg-gray-900 text-white w-64 p-6 space-y-6 flex flex-col justify-between">
            <div>
                <h2 className="text-2xl font-bold border-b border-gray-700 pb-4">Librarian Panel</h2>
                <ul className="mt-6 space-y-2">
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
                            onClick={() => setCurrentView('addUser')}
                            className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                        >
                            <PlusCircle className="mr-2" size={20} /> Add User
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setCurrentView('manageUsers')}
                            className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                        >
                            <User className="mr-2" />
                            Manage Users
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
                    <li>
                        <button
                            onClick={() => setCurrentView('manageBooks')}
                            className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                        >
                            <Book className="mr-2" />
                            Manage Books
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setCurrentView('pendingRequests')}
                            className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                        >
                            <ListTodo className="mr-2" />
                            Pending Requests
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setCurrentView('borrowedBooks')}
                            className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                        >
                            <ArrowRightLeft className="mr-2" />
                            Borrowed Books
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={() => setCurrentView('overdueBooks')}
                            className="w-full text-left py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                        >
                            <Trash2 className="mr-2" />
                            Overdue Books
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
                </ul>
            </div>
            <div className="mt-auto">
                {user && (
                    <div className="flex items-center text-gray-300 mb-4 border-t border-gray-700 pt-4">
                        <span className="mr-2">{user.name}</span>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="w-full text-left py-2 px-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center"
                >
                    <LogOut className="mr-2" />
                    Logout
                </button>
            </div>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
            <header className="flex justify-between items-center p-4 bg-white border-b border-gray-200 shadow-md">
                <h1 className="text-xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
                <div className="flex items-center space-x-4">
                    <NotificationComponent userId={userId} /> 
                    <button
                        onClick={() => setCurrentView('profile')}
                        className="flex items-center space-x-2 py-2 px-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <UserCircle size={24} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Profile</span>
                    </button>
                </div>
            </header>
            <div className="p-6 pt-6 flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
        {showConfirmModal && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm text-center">
                    <Trash2 className="mx-auto text-red-500 mb-4" size={48} />
                    <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Deletion</h3>
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to delete this {confirmModalData.type}? This action cannot be undone.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="px-6 py-2 rounded-lg text-gray-800 border border-gray-300 hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmAction}
                            className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
};

const PaymentHistoryContent = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [paymentsPerPage] = useState(10); 

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
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Payment ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Member Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Method</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
   
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Order ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Payment ID</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentPayments.map((payment) => (
                                    <tr key={payment.paymentId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.paymentId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{payment.memberName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">₹{payment.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{payment.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{payment.paymentMethod}</td>
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
<td className="px-6 py-4 whitespace-nowrap text-sm text-black">
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

export default LibrarianDashboard;   