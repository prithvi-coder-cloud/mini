import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import './Certificate.css';
import logo from './img/logo/job.jpg';
import signature from './img/signature/ps.jpg';  // Path to your signature image

const Certificate = () => {
  const [userName, setUserName] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [paymentFee, setPaymentFee] = useState(0);
  const { state } = useLocation();
  const navigate = useNavigate();

  const courseName = state?.courseName;
  const courseId = state?.courseId;

  useEffect(() => {
    const fetchPaymentFee = async () => {
      try {
        const response = await axios.get(`http://localhost:6005/courses/${courseId}/paymentFee`);
        setPaymentFee(response.data.fee);
      } catch (error) {
        console.error('Error fetching payment fee:', error);
      }
    };

    if (courseId) {
      fetchPaymentFee();
    }
  }, [courseId]);

  const handleInputChange = (e) => {
    setUserName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowCertificate(true);
  };

  const handlePayment = async () => {
    try {
      const orderResponse = await axios.post('http://localhost:6005/api/payments/create-order', {
        amount: paymentFee,
        currency: 'INR'
      });

      const { id: orderId, currency } = orderResponse.data;

      const options = {
        key: 'rzp_test_EJ1bHOidhPcHgv',
        amount: paymentFee * 100,
        currency,
        name: 'Course Payment',
        description: 'Payment for course certificate',
        order_id: orderId,
        handler: async (response) => {
          console.log('Payment successful:', response);
          alert('Payment Successful');
          setPaymentSuccessful(true);

          try {
            const paymentDetails = {
              userName,
              courseName,
              paymentFee,
              paymentId: response.razorpay_payment_id,
              receiptUrl: response.razorpay_order_id
            };
            console.log('Sending payment details to backend:', paymentDetails);
            await axios.post(`${process.env.REACT_APP_API_URL}/api/payments/save`, paymentDetails);
            console.log('Payment details saved successfully.');
          } catch (error) {
            console.error('Error saving payment details:', error);
          }

          openCertificateWindow(userName, courseName);
        },
        modal: {
          ondismiss: () => {
            alert('Payment was not completed, please try again.');
          }
        },
        prefill: {
          name: userName,
          email: '',
          contact: '',
        },
        theme: {
          color: '#F37254',
        },
      };

      const rzp = new window.Razorpay(options);

      if (!rzp) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      rzp.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
    }
  };

  const openCertificateWindow = (userName, courseName) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      const doc = new jsPDF('landscape');
      
      // Background color
      doc.setFillColor(249, 249, 249);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');

      // Border
      doc.setLineWidth(2);
      doc.setDrawColor(0, 123, 255);
      doc.rect(10, 10, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 20);

      // Logo
      const logoImg = new Image();
      logoImg.src = logo;
      logoImg.onload = () => {
        doc.addImage(logoImg, 'PNG', doc.internal.pageSize.getWidth() / 2 - 15, 20, 30, 30);

        // Title
        doc.setFontSize(26);
        doc.setTextColor(0, 123, 255);
        doc.text('Certificate of Completion', doc.internal.pageSize.getWidth() / 2, 70, { align: 'center' });

        // Statement
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('This is to certify that', doc.internal.pageSize.getWidth() / 2, 100, { align: 'center' });

        // User's name
        doc.setFontSize(24);
        doc.text(userName, doc.internal.pageSize.getWidth() / 2, 120, { align: 'center' });

        // Completion statement
        doc.setFontSize(16);
        doc.text('has successfully completed the course', doc.internal.pageSize.getWidth() / 2, 150, { align: 'center' });

        // Course name
        doc.setFontSize(24);
        doc.text(courseName, doc.internal.pageSize.getWidth() / 2, 170, { align: 'center' });

        // Footer
        doc.setFontSize(14);
        doc.text('Date:', 20, doc.internal.pageSize.getHeight() - 20);
        doc.text(new Date().toLocaleDateString(), 50, doc.internal.pageSize.getHeight() - 20);
        doc.text('Signature:', doc.internal.pageSize.getWidth() - 100, doc.internal.pageSize.getHeight() - 20);

        // Add signature image
        const signatureImg = new Image();
        signatureImg.src = signature;
        signatureImg.onload = () => {
          doc.addImage(signatureImg, 'PNG', doc.internal.pageSize.getWidth() - 60, doc.internal.pageSize.getHeight() - 40, 40, 20);

          const pdfBlob = doc.output('blob');
          const blobUrl = URL.createObjectURL(pdfBlob);
          newWindow.location = blobUrl;
        };
      };
    
    }
  };

  return (
    <div>
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/courselist')} className="course-nav-link">Back</li>
          </ul>
        </nav>
      </header>
      <div className="certificate-container">
        <div className="certificate-content">
          <h1>Generate Your Certificate</h1>
          {!showCertificate ? (
            <form onSubmit={handleSubmit}>
              <div className="input-container">
                <label htmlFor="userName">Enter your name:</label>
                <input
                  type="text"
                  id="userName"
                  value={userName}
                  onChange={handleInputChange}
                  required
                />
                <button type="submit">Generate Certificate</button>
              </div>
            </form>
          ) : (
            <div className="certificate">
              <h2>Certificate of Completion</h2>
              <p>This is to certify that</p>
              <h3>{userName}</h3>
              <p>has successfully completed the course</p>
              <h3>{courseName}</h3>
            </div>
          )}
        </div>
      </div>
      
      {showCertificate && (
        <div className="download-container" style={{ textAlign: 'center', marginTop: '20px' }}>
          {paymentSuccessful ? (
            <>
              <p>Your certificate is ready for download!</p>
              <button onClick={() => openCertificateWindow(userName, courseName)}>Download PDF</button>
            </>
          ) : (
            <button onClick={handlePayment}>Pay to Download Certificate</button>
          )}
        </div>
      )}
    </div>
  );
};

export default Certificate;
