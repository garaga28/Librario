import React from 'react';
import axios from 'axios';

const Payment = ({ amount, receipt, onPaymentSuccess, onPaymentFailure }) => {

    const handlePayment = async () => {
        try {
            //Call your backend to create a Razorpay order
            const { data } = await axios.get(`http://localhost:8080/api/payments/createOrder?amount=${amount}&receipt=${receipt}`);
            const order = JSON.parse(data);

            const options = {
                key: "rzp_test_RGLghtpUjxokLC",
                amount: order.amount,
                currency: order.currency,
                name: "Librario-Library Management System",
                description: "Overdue Charges Payment",
                order_id: order.id,
                handler: async function (response) {
                    //On successful payment, verify the signature with your backend
                    try {
                        const verifyData = {
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        };
                        const { data } = await axios.post('http://localhost:8080/api/payments/verifyPayment', null, { params: verifyData });
                        
                        //Handle the success
                        console.log(data);
                        onPaymentSuccess(data);

                    } catch (error) {
                        console.error("Payment verification failed:", error);
                        //onPaymentFailure("Payment verification failed.");
                    }
                },
                prefill: {
                    name: "Anshika Garg", 
                    email: "anshika@gmail.com", 
                    contact: "9876543211" 
                },
                theme: {
                    color: "#F37254"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error("Error creating order or payment:", error);
            onPaymentFailure("Error creating order.");
        }
    };

    return (
        <div>
            <h2>Overdue Charges: ₹{amount}</h2>
            <button onClick={handlePayment}>Pay Online</button>
        </div>
    );
};

export default Payment;