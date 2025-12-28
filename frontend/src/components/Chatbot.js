import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, Loader2 } from 'lucide-react';
import axios from 'axios';
import { geminiService } from '../services/geminiService'; // Corrected path
import { chatbotDataService } from '../services/chatbotDataService';

// Re-creating custom components from your other files for a consistent look
const Button = ({ children, ...props }) => (
    <button
        {...props}
        className="h-12 w-12 rounded-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300"
    >
        {children}
    </button>
);

const Input = ({ icon, ...props }) => (
  <div className="relative">
    {icon}
    <input {...props} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300" />
  </div>
);

const Card = ({ children, className }) => (
  <div className={`bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-96 h-96 max-w-sm backdrop-blur-lg bg-white/80 border border-white/20 ${className}`}>
    {children}
  </div>
);

const Chatbot = ({ context }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const [userId, setUserId] = useState(null);

    const isMemberContext = context === 'member';

    useEffect(() => {
        // Here, we'll get the user ID from the URL if it's a member dashboard
        if (isMemberContext) {
            const pathSegments = window.location.pathname.split('/');
            const userIdFromUrl = pathSegments[pathSegments.length - 1];
            setUserId(userIdFromUrl);
        } else {
            setUserId(null);
        }
    }, [isMemberContext]);

    useEffect(() => {
      if (isOpen) {
        setMessages([
          { role: 'bot', text: geminiService.getInitialResponse(context) }
        ]);
      }
    }, [isOpen, context]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (inputMessage.trim() === '') return;

        const newMessage = { role: 'user', text: inputMessage };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const botResponse = await geminiService.getChatbotResponse(inputMessage, userId);
            setMessages(prevMessages => [...prevMessages, { role: 'bot', text: botResponse }]);
        } catch (error) {
            console.error("Failed to get bot response:", error);
            setMessages(prevMessages => [...prevMessages, { role: 'bot', text: "I'm sorry, I am unable to respond at the moment." }]);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="fixed bottom-1 right-6 z-50">
            <Button onClick={() => setIsOpen(!isOpen)} className="shadow-2xl hover:shadow-2xl">
                {isOpen ? <X className="h-6 w-6 text-white" /> : <Bot className="h-6 w-6 text-white" />}
            </Button>
            {isOpen && (
                <Card className="absolute bottom-16 right-0 h-[40rem] w-96 max-w-md flex flex-col justify-between">
                    <div className="flex justify-between items-center pb-2 border-b-2 border-gray-200">
                        <h3 className="font-bold text-gray-800 flex items-center">
                            <Bot className="h-5 w-5 mr-2" />
                            Librario Chatbot
                        </h3>
                        <div className="flex space-x-2">
                           <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                               <Minimize2 className="h-5 w-5" />
                           </button>
                           <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                               <X className="h-5 w-5" />
                           </button>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="flex flex-1 items-center justify-center">
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto my-4 space-y-4">
                                {messages.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`p-3 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                            <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start mb-2">
                                        <div className="p-2 rounded-lg bg-gray-200 text-gray-800 animate-pulse">...</div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="flex space-x-2">
                                <Input
                                    icon={<MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />}
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Type a message..."
                                />
                                <Button type="submit" className="h-auto w-auto p-3 rounded-xl bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                                    <Send className="h-5 w-5 text-white" />
                                </Button>
                            </form>
                        </>
                    )}
                </Card>
            )}
        </div>
    );
};




export default Chatbot;