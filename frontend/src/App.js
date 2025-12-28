import './index.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation , useParams} from 'react-router-dom';
import axios from 'axios';
import AdminDashboard from './components/AdminDashboard';
import LibrarianDashboard from './components/LibrarianDashboard';
import UserDashboard from './components/UserDashboard';
import ForgotPassword from './components/ForgotPassword';
import { motion } from "framer-motion";
import logo from './logo_library.png';
import Chatbot from './components/Chatbot'; 

// New Landing Page Component
const LandingPage = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    "https://www.voicesofruralindia.org/wp-content/uploads/2020/11/ylswjsy7stw-1536x901.jpg",
    "https://im.hunt.in/cg/coimbatore/City-Guide/District-central-library.jpg",
    "https://cms.thewire.in/wp-content/uploads/2016/05/tb5.jpeg",
    "https://images.pexels.com/photos/16504591/pexels-photo-16504591.jpeg?cs=srgb&dl=pexels-theshantanukr-16504591.jpg&fm=jpg"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(timer);
  }, []);

  const smoothScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop,
        behavior: 'smooth'
      });
    }
  };

  const bookCovers = [
    "https://m.media-amazon.com/images/I/81BE7eeKzAL.jpg",
    "https://m.media-amazon.com/images/I/71XEsXS5RlL.jpg",
    "https://m.media-amazon.com/images/I/719oHU9kiFL.jpg",
    "https://m.media-amazon.com/images/I/81gTwYAhU7L.jpg",
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start overflow-auto bg-gray-50">
      {/* Tailwind CSS and custom font link */}
      <style>
        {`
        @import url('https://rsms.me/inter/inter.css');
        body {
          font-family: 'Inter', sans-serif;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .hero-slider-enter {
          opacity: 0;
          transition: opacity 1s ease-in-out;
        }

        .hero-slider-enter-active {
          opacity: 1;
        }

        .cta-btn {
          @apply transition-all duration-300 transform hover:scale-105 hover:shadow-xl;
        }
        `}
      </style>
      <script src="https://cdn.tailwindcss.com"></script>

      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-white bg-opacity-70 backdrop-blur-lg shadow-lg py-4 px-8 flex justify-between items-center transition-all duration-300">
        <div className="flex-shrink-0">
          <img src={logo} alt="Librario Logo" className="h-14" />
        </div>
        <div className="flex items-center space-x-8">
          <button onClick={() => smoothScroll('features')} className="text-gray-700 hover:text-blue-500 transition-colors font-medium">Features</button>
          <button onClick={() => smoothScroll('books')} className="text-gray-700 hover:text-blue-500 transition-colors font-medium">Books</button>
          <button onClick={() => smoothScroll('contact')} className="text-gray-700 hover:text-blue-500 transition-colors font-medium">Contact</button>
          <button onClick={() => navigate('/login')} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 hover:bg-blue-700 cta-btn">
            Login
          </button>
          <button onClick={() => navigate('/register')} className="border-2 border-blue-600 text-blue-600 font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 hover:bg-blue-600 hover:text-white cta-btn">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative w-full h-screen flex items-center justify-center p-4 pt-20 overflow-hidden">
        {heroImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt="Library background"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        <div className="absolute inset-0 z-0 bg-black opacity-30"></div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 w-full max-w-7xl flex flex-col items-center p-8 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-2xl tracking-tight text-white">
            Your gateway to knowledge and imagination
          </h1>
          <p className="text-lg md:text-xl text-blue-200 mb-8 max-w-xl font-semibold">
            Unlock a world of stories. Dive into a new chapter. . Your journey begins here.
          </p>
          <div className="flex justify-center space-x-4">
            <button onClick={() => navigate('/register')} className="bg-yellow-400 text-gray-900 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-yellow-500 transition-colors cta-btn">
              Get Started
            </button>
            <button onClick={() => smoothScroll('features')} className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-white hover:text-gray-900 transition-colors cta-btn">
              Learn More
            </button>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <section id="features" className="w-full bg-gray-100 py-24 px-4 sm:px-8 ">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto max-w-7xl"
        >
          <h2 className="text-5xl font-extrabold text-center text-gray-900 mb-16">
            <span className="text-blue-600">Key</span> Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-indigo-500 text-white rounded-full shadow-lg">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Book Management</h3>
              <p className="text-gray-600 font-light">Easily add, edit, and track books with our intuitive system.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-teal-500 text-white rounded-full shadow-lg">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Advanced Search</h3>
              <p className="text-gray-600 font-light">Find books instantly with powerful search and filters.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-500 text-white rounded-full shadow-lg">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">User Dashboards</h3>
              <p className="text-gray-600 font-light">Personalized dashboards for all user roles, from members to admins.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-purple-500 text-white rounded-full shadow-lg">
                <span className="text-3xl">👤</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Secure Auth</h3>
              <p className="text-gray-600 font-light">Secure login and registration, protecting all your data.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Books Catalog Section */}
      <section id="books" className="w-full bg-white py-24 px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto max-w-7xl"
        >
          <h2 className="text-5xl font-extrabold text-center text-gray-900 mb-16">
            <span className="text-blue-600">Explore</span> Books
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {bookCovers.map((src, index) => (
              <div key={index} className="flex flex-col items-center group cursor-pointer">
                <img
                  src={src}
                  alt={`Book cover ${index + 1}`}
                  className="rounded-lg shadow-xl w-full h-auto object-cover transform transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                />
                <h3 className="mt-6 text-center font-semibold text-gray-800 text-lg">The Modern World</h3>
                <p className="text-sm text-gray-500">John Doe</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Membership Section */}
      <section id="pricing" className="w-full bg-gray-100 py-24 px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto max-w-7xl text-center"
        >
          <h2 className="text-5xl font-extrabold text-gray-900 mb-16">
            <span className="text-blue-600">Membership</span> Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Basic Plan */}
            <div className="bg-white rounded-2xl p-10 shadow-2xl flex flex-col items-center transition-all duration-300 hover:shadow-3xl hover:transform hover:-translate-y-2">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Basic</h3>
              <p className="text-4xl font-extrabold text-gray-900 mb-6">Free<span className="text-xl font-normal text-gray-500">/3 month</span></p>
              <ul className="text-left text-gray-600 space-y-3 mb-8 w-full">
                <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Standard access to the library's main collection</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Ability to borrow up to 5 books at a time</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✔</span> Standard borrowing period of 15 days</li>
                <li className="flex items-center"><span className="text-red-500 mr-2">✖</span> Priority access to new arrivals</li>
              </ul>
              <button onClick={() => navigate('/register')} className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-300 transition-colors">
                Join Basic
              </button>
            </div>
            {/* Premium Plan */}
            <div className="bg-blue-500 text-white rounded-2xl p-10 shadow-2xl flex flex-col items-center transition-all duration-300 hover:shadow-3xl hover:transform hover:-translate-y-2">
              <h3 className="text-3xl font-bold mb-4">Premium</h3>
              <p className="text-4xl font-extrabold mb-6">Rs. 500<span className="text-xl font-normal opacity-80">/6 month</span></p>
              <ul className="text-left space-y-3 mb-8 w-full">
                <li className="flex items-center"><span className="text-yellow-300 mr-2">✔</span> Access to a larger collection of exclusive books</li>
                <li className="flex items-center"><span className="text-yellow-300 mr-2">✔</span> Ability to borrow up to 10 books at a time</li>
                <li className="flex items-center"><span className="text-yellow-300 mr-2">✔</span> Extended borrowing period of 30 days</li>
                <li className="flex items-center"><span className="text-yellow-300 mr-2">✔</span> Priority access to new arrivals</li>
              </ul>
              <button onClick={() => navigate('/register')} className="w-full bg-yellow-400 text-gray-900 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-yellow-500 transition-colors">
                Go Premium
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer id="contact" className="w-full bg-gray-900 py-12 px-4 sm:px-8 text-white">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-12"
        >
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-4xl font-extrabold mb-4 text-blue-500">Librario</h3>
            <p className="text-gray-400 leading-relaxed max-w-lg font-light">
              Our mission is to modernize the library experience by providing a comprehensive, user-friendly, and intelligent library management system. We believe that technology can foster a stronger connection between readers and the books they love.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3 text-gray-400 font-light">
              <li><button onClick={() => smoothScroll('features')} className="hover:text-white transition-colors">Features</button></li>
              <li><button onClick={() => smoothScroll('books')} className="hover:text-white transition-colors">New Releases</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Login</button></li>
              <li><button onClick={() => navigate('/register')} className="hover:text-white transition-colors">Sign Up</button></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="md:col-span-1">
            <h4 className="text-lg font-bold mb-4 text-white">Contact Info</h4>
            <ul className="space-y-3 text-gray-400 font-light">
              <li><a href="mailto:info@lms.com" className="hover:text-white transition-colors">librario@gmail.com</a></li>
              <li><a href="tel:+1234567890" className="hover:text-white transition-colors">(+91) 9894567890</a></li>
              <li>231, Library Lane, Rajasthan</li>
            </ul>
          </div>
        </motion.div>

        <div className="container mx-auto max-w-7xl text-center mt-8 pt-4 border-t border-gray-800">
          <p className="text-gray-600 text-sm font-light">
            &copy; {new Date().getFullYear()} Librario. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Component for the Registration Form (for members)
const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const registrationData = { name, email, password, roleId: 3 }; 
      
      console.log('Sending registration data:', registrationData);

      const response = await axios.post('http://localhost:8080/api/auth/register', registrationData);
      
      console.log(response.data);

      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setMessage(errorMessage);
      console.error('Registration failed:', error.response?.data || error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Member Registration</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-gray-700">Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Register
        </button>
      </form>
      <p className="mt-4 text-center text-sm font-medium text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-800 transition-colors">Login here</Link>
      </p>
      {message && (
        <p className="mt-4 text-center text-sm font-medium" style={{ color: message.includes('successful') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
    </div>
  );
};

// Component for the Login Form (for members)
const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            // The role is 'member' for this specific login form
            const response = await axios.post('http://localhost:8080/api/auth/login/member', { email, password });
            
            // Extract the token and userId from the successful response
            const { token, userId } = response.data;
            
            // Store the token and userId in local storage for persistence
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId);

            setMessage('Login successful! Redirecting...');
            console.log(response.data);
            
            // Correctly navigate to the dynamic user dashboard on success
            setTimeout(() => {
                navigate(`/dashboard/${userId}`);
            }, 1000);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
            setMessage(errorMessage);
            console.error('Login failed:', error.response?.data || error);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">User Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-gray-700">Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-gray-700">Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors"
                >
                    Login
                </button>
            </form>
            <div className="mt-4 text-center space-y-2">
                <p className="text-sm font-medium text-gray-600">
                    <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800 transition-colors">Forget Password?</Link>
                </p>
                <p className="text-sm font-medium text-gray-600">
                    <Link to="/librarian" className="text-blue-600 hover:text-blue-800 transition-colors">Are you a librarian?</Link>
                </p>
                <p className="text-sm font-medium text-gray-600">
                    <Link to="/admin" className="text-blue-600 hover:text-blue-800 transition-colors">Are you an admin?</Link>
                </p>
                <p className="text-sm font-medium text-gray-600">
                    Don't have an account? <Link to="/register" className="text-blue-600 hover:text-blue-800 transition-colors">Create one</Link>
                </p>
            </div>
            {message && (
                <p className="mt-4 text-center text-sm font-medium" style={{ color: message.includes('successful') ? 'green' : 'red' }}>
                    {message}
                </p>
            )}
        </div>
    );
};

const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            await axios.post('http://localhost:8080/api/auth/logout', null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Clear local storage and state after successful logout
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = '/login'; // Redirect to the home page
        } catch (error) {
            console.error('Logout failed:', error.response?.data || error);
            // Even if the logout API call fails, we should still clear the client-side token
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = '/login'; // Redirect to the home page
        }
    } else {
        // If no token is found, just clear state and redirect
        localStorage.removeItem('userId');
        window.location.href = '/login';
    }
};

// Component for the Librarian Login Page
const LibrarianLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
      e.preventDefault();
      setMessage('');

      try {
          const response = await axios.post('http://localhost:8080/api/auth/login/librarian', { email, password });
          const { userId, token } = response.data;
          
          // Store token and userId for future use
          localStorage.setItem('token', token);
          localStorage.setItem('userId', userId);

          // Correctly navigate to the dashboard with the dynamic userId
          navigate(`/librarian-dashboard/${userId}`);
      } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
          setMessage(errorMessage);
          console.error('Librarian login failed:', error.response?.data || error);
      }
  };

  return (
    <div className="bg-white bg-opacity-80 shadow-2xl rounded-2xl p-8 w-full max-w-md backdrop-blur-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Librarian Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
              <label className="block text-gray-700">Email:</label>
              <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
          </div>
          <div>
              <label className="block text-gray-700">Password:</label>
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
          </div>
          <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
              Login as Librarian
          </button>
        </form>
        <p className="mt-4 text-center text-sm font-medium text-gray-600">
            <Link to="/login" className="text-blue-600 hover:text-blue-800 transition-colors">Go back to member login</Link>
        </p>
        {message && (
            <p className="mt-4 text-center text-sm font-medium" style={{ color: message.includes('successful') ? 'green' : 'red' }}>
                {message}
            </p>
        )}
    </div>
  );
};

// Component for the Admin Login Page
const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login/admin', { email, password });
      
      // Store the authentication token in local storage
      localStorage.setItem('token', response.data.token);

      setMessage('Admin login successful!');
      console.log(response.data);
      // Correctly navigate to the admin dashboard on success
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 1000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setMessage(errorMessage);
      console.error('Admin login failed:', error.response?.data || error);
    }
  };

  return (
    <div className="bg-white bg-opacity-80 shadow-2xl rounded-2xl p-8 w-full max-w-md backdrop-blur-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-gray-700">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-gray-700">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-red-700 transition-colors"
        >
          Login as Admin
        </button>
      </form>
      <p className="mt-4 text-center text-sm font-medium text-gray-600">
          <Link to="/login" className="text-blue-600 hover:text-blue-800 transition-colors">Go back to member login</Link>
      </p>
      {message && (
        <p className="mt-4 text-center text-sm font-medium" style={{ color: message.includes('successful') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
    </div>
  );
};

// Main App component that contains all forms and routes
const App = () => {
  const location = useLocation();
  // Check if the current path contains "dashboard" to handle all three dashboards
  const isDashboardRoute = location.pathname.includes('dashboard');
  const isLandingPage = location.pathname === '/';
  
  // Common URL for the public-facing background image
  const backgroundImageUrl = 'https://www.voicesofruralindia.org/wp-content/uploads/2020/11/ylswjsy7stw-1536x901.jpg';
  
  // Conditionally apply background styles based on the route
  const containerClasses = `min-h-screen flex flex-col items-center justify-center p-4 ${!isDashboardRoute && !isLandingPage ? 'bg-cover bg-center' : ''}`;
  const containerStyle = !isDashboardRoute && !isLandingPage ? { backgroundImage: `url(${backgroundImageUrl})` } : {};
  
  // Conditionally render the title, as it's not needed on the dashboards
  const showTitle = !isDashboardRoute && !isLandingPage;

  // Conditionally apply the container for login forms, as dashboards are full-screen
  const contentContainer = !isDashboardRoute && !isLandingPage ? (
    <div className="bg-white bg-opacity-80 shadow-2xl rounded-2xl p-8 w-full max-w-md backdrop-blur-md">
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/librarian" element={<LibrarianLoginPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </div>
  ) : (
    <Routes>
      <Route path="/" element={<> <LandingPage /> <Chatbot context="landing" /> </>} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/dashboard/:userId" element={<> <UserDashboard /> <Chatbot context="member"  /> </>} />
      <Route path="/librarian-dashboard/:userId" element={<LibrarianDashboard />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );

  return (
    <div className={containerClasses} style={containerStyle}>
        {showTitle && (
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white text-center mb-10 drop-shadow-lg">
                Library Management System
            </h1>
        )}
        {contentContainer}

    </div>
  );
};

// Wrapper component to provide Router context
const AppWrapper = () => (
    <Router>
        <App />
        
    </Router>
);

export default AppWrapper;
