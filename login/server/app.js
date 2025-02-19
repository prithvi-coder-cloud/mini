require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const users = require("./model/userschema"); // Import Google OAuth schema
const collection = require("./model/loginschema"); // Import regular login schema
const Application = require("./model/Application");
const Payment = require('./model/payment');
const Profile = require('./model/Profile');
const Feedback = require("./model/Feedback")
const Course = require("./model/course");
const DeletedUser = require("./model/restore");
const Job = require("./model/Jobs");
const Test = require('./model/Test');
const Score = require("./model/Score"); // Import the Score model
const Selection = require("./model/Selection"); // Import the Selection model
const cron = require('node-cron');

const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const router = express.Router();
const PORT = 6005; // Define backend server port
const multer = require('multer'); // Import multer
const path = require('path');
const pdfParse = require('pdf-parse');
const Razorpay = require('razorpay');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const fsPromises = require('fs').promises;
const PDFParser = require('pdf-parse');
const tf = require('@tensorflow/tfjs');
const use = require('@tensorflow-models/universal-sentence-encoder');

const clientid = process.env.CLIENT_ID;
const clientsecret = process.env.CLIENT_SECRET;

global.fetch = require('node-fetch');
global.Headers = fetch.Headers;  // Add this line

// Connect to MongoDB using the connection string from the .env file
mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB connected successfully");
})
.catch(err => {
  console.error("MongoDB connection error:", err);
  process.exit(1); // Exit the process if database connection fails
});

// Schedule job status update every minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const result = await Job.updateMany(
      { expireDate: { $lt: now }, status: 1 },
      { $set: { status: 0 } }
    );
    console.log(`Updated status for ${result.modifiedCount} expired jobs`);
  } catch (error) {
    console.error('Error updating job status:', error);
  }
});

app.use(cors({
  origin: ["http://localhost:3000", "https://jobboardweb.netlify.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Setup session
app.use(session({
  secret: clientsecret,
  resave: false,
  saveUninitialized: true
}));



// Setup passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new OAuth2Strategy({
  clientID: clientid,
  clientSecret: clientsecret,
  callbackURL: "http://localhost:6005/auth/google/callback",
  scope: ["profile", "email"]
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await users.findOne({ googleId: profile.id });
      if (!user) {
        user = new users({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          image: profile.photos[0].value
        });
        await user.save();
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Initial Google OAuth login
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback
app.get("/auth/google/callback", passport.authenticate("google", {
  successRedirect: "http://localhost:3000",
  failureRedirect: "http://localhost:3000/login"
}));

app.get("/login/success", async (req, res) => {
  if (req.user) {
    res.status(200).json({ message: "User Login", user: req.user });
  } else {
    res.status(400).json({ message: "Not Authorized" });
  }
});

app.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect("http://localhost:3000/login");
  });
});

// Update the login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for admin login first
    if (email === 'admin' && password === 'admin') {
      return res.json({ 
        msg: "exist", 
        user: {
          _id: 'admin',
          email: 'admin',
          role: 'admin',
          name: 'Administrator'
        }
      });
    }

    // If not admin, check regular users
    const user = await collection.findOne({ email: email });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        if (user.status === 0) {
          res.json({ msg: "Your account is disabled. Please contact support." });
        } else {
          res.json({ 
            msg: "exist", 
            user: {
              _id: user._id.toString(),
              email: user.email,
              role: user.role,
              name: user.name
            }
          });
        }
    } else {
        res.json("notexist");
      }
    } else {
      // Check if it's a Google user
      const googleUser = await users.findOne({ email: email });
      if (googleUser) {
        res.json({
          msg: "exist",
          user: {
            _id: googleUser._id.toString(),
            email: googleUser.email,
            googleId: googleUser.googleId,
            displayName: googleUser.displayName
          }
        });
      } else {
        res.json("notexist");
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Server error" });
  }
});


// Utility function to send email
const sendSignupEmail = async (email, name) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL, // Use environment variable for email
      pass: process.env.PASSWORD // Use environment variable for password
    }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: process.env.EMAIL, // Your email to receive notifications
    subject: 'New User Signup to the Job Board',
    text: `A new user has signed up.\n\nName: ${name}\nEmail: ${email}`
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        reject(error);
      } else {
        console.log('Email sent: ' + info.response);
        resolve(info);
      }
    });
  });
};

// Signup route
app.post("/signup", async (req, res) => {
  const { name, email, password, cpassword } = req.body;

  try {
    // Check if user already exists
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res.json("exist");
    }

    // Check if passwords match
    if (password !== cpassword) {
      return res.json("passwordmismatch");
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new collection({
      name,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    // Send notification email
    try {
    await sendSignupEmail(email, name);
    } catch (emailError) {
      console.error('Error sending signup email:', emailError);
      // Continue with signup even if email fails
    }

    return res.json("notexist");
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json("error");
  }
});

// Password recovery routes
app.post("/ForgotPassword", async (req, res) => {
  const { email } = req.body;

  const user = await collection.findOne({ email });
  if (!user) {
    return res.status(400).send({ error: true, msg: 'Email id not registered' });
  }

  const resetCode = Math.floor(1000 + Math.random() * 9000).toString();
  user.resetCode = resetCode;
  user.resetCodeExpiration = Date.now() + 3600000; // 1 hour expiration
  await user.save();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: 'Password Reset Code',
    text: `Your password reset code is ${resetCode}`,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      return res.status(500).send({ error: true, msg: 'Error sending email' });
    } else {
      return res.status(200).send({ error: false, msg: 'Verification code sent to your email.' });
    }
  });
});

app.post('/resetpass', async (req, res) => {
  const { email, password } = req.body;

  const user = await collection.findOne({ email });
  if (!user) {
    return res.status(400).send({ error: true, msg: 'Email not found' });
  }

  user.password = await bcrypt.hash(password, 10); // Hash the new password
  user.resetCode = undefined;
  user.resetCodeExpiration = undefined;
  await user.save();

  res.status(200).send({ error: false, msg: 'Password has been reset' });
});

app.post('/verifycode', async (req, res) => {
  const { email, code } = req.body;

  const user = await collection.findOne({ email, resetCode: code, resetCodeExpiration: { $gt: Date.now() } });
  if (!user) {
    return res.status(400).send({ error: true, msg: 'Invalid or expired code' });
  }

  res.status(200).send({ error: false, msg: 'Code verified' });
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await collection.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ msg: "Error retrieving users" });
  }
});

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

//Job posting route
app.post('/jobs', upload.single('companyLogo'), async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: 'Company logo is required' });
    }

    // Create job data object
    const jobData = {
      companyName: req.body.companyName,
      jobTitle: req.body.jobTitle,
      companyLogo: `/uploads/${req.file.filename}`,
      minPrice: Number(req.body.minPrice),
      maxPrice: Number(req.body.maxPrice),
      salaryType: req.body.salaryType,
      jobLocation: req.body.jobLocation,
      expireDate: new Date(req.body.expireDate),
      experienceLevel: req.body.experienceLevel,
      employmentType: req.body.employmentType,
      description: req.body.description,
      companyId: req.body.companyId,
      status: 1
    };

    // Create and save new job
    const job = new Job(jobData);
    const savedJob = await job.save();

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job: savedJob
    });

  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to post job',
      error: error.message
    });
  }
});








// Assuming you're using Express
app.get('/jobbs', async (req, res) => {
  try {
    const { companyId } = req.query;
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    // Fetch jobs for the specified companyId
    const jobs = await Job.find({ companyId });

    if (jobs.length === 0) {
      return res.status(404).json({ message: 'No jobs found for this company' });
    }

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.get('/all-jobs', async (req, res) => {
  try {
    const jobs = await Job.find({ status: 1 }).sort({ expireDate: 1 });
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});


// Utility function to send email
// emailService.js


const sendEmail = async (email, username, password, role) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL, // Use environment variable for email
      pass: process.env.PASSWORD // Use environment variable for password
    }
  });

  const subject = role === 'company' ? 'Company Account Created' : 'Course Provider Account Created';
  const text = `Your account has been created as a ${role}. Username: ${username}, Password: ${password}`;

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: subject,
    text: text
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        reject(error);
      } else {
        console.log('Email sent: ' + info.response);
        resolve(info);
      }
    });
  });
};

module.exports = sendEmail;



// POST /api/addCompany
app.post('/addCompany', async (req, res) => {
  const { name, email } = req.body;

  // Validate request body
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }

  // Generate a random password
  const password = crypto.randomBytes(8).toString('hex');
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user with default values for linkedIn and dob
  const newUser = new collection({
    name,
    email,
    password: hashedPassword,
    role: 'company',
    linkedIn: null,
    dob: null,
  });

  try {
    // Check if the company already exists
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Company with this email already exists.' });
    }

    // Save the new user in the database
    await newUser.save();

    // Send the email with the credentials, including the role
    await sendEmail(email, email, password, 'company'); // Using email as username
    res.status(201).json({ message: 'Company added successfully. Email sent with credentials.' });
  } catch (error) {
    console.error('Error adding company:', error);

    // Send a more specific error message
    res.status(500).json({ message: error.message || 'Error adding company' });
  }
});


//course provider
app.post('/addCourseProvider', async (req, res) => {
  const { name, email } = req.body;

  // Validate request body
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required.' });
  }

  // Generate a random password
  const password = crypto.randomBytes(8).toString('hex');
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = new collection({
    name,
    email,
    password: hashedPassword,
    role: 'course provider', // Set the role to course provider
  });

  try {
    // Check if the course provider already exists
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Course provider with this email already exists.' });
    }

    // Save the new user in the database
    await newUser.save();
    
    // Send the email with the credentials
    await sendEmail(email, email, password); // Using email as username
    res.status(201).json({ message: 'Course provider added successfully. Email sent with credentials.' });
  } catch (error) {
    console.error('Error adding course provider:', error);
    
    // Send a more specific error message
    res.status(500).json({ message: error.message || 'Error adding course provider' });
  }
});



// Fetch all jobs
app.get('/jobbs/:id',async (req,res) => {
  try{
  const job = await Job.findById(req.params.id);
  if(!job) {
    return res.status(404).json({message: 'job not found'});
  }
  res.json(job);
}catch (error){
  res.status(500).json({message: error.message});
}
}
);

// Update job with file upload and provide success/error message
app.post('/jobbs/:id', upload.single('companyLogo'), async (req, res) => {
  try {
    const jobId = req.params.id;
    const updatedData = req.body;

    // If a new file is uploaded, update the companyLogo
    if (req.file) {
      updatedData.companyLogo = `/uploads/${req.file.filename}`; // Adjust path if necessary
    }

    // Find the job by ID and update it
    const updatedJob = await Job.findByIdAndUpdate(jobId, updatedData, { new: true });

    if (!updatedJob) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


//change password
// Change password route
app.post('/change-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    const user = await collection.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Old password is incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password' });
  }
});



//status
// Toggle user status
app.put('/toggleUserStatus/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await collection.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Toggle status
    user.status = user.status === 1 ? 0 : 1;
    await user.save();

    // Send email notification
    const emailMessage = user.status === 1
      ? 'Your account has been activated.'
      : 'Your account has been suspended.';

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL, // Use environment variable for email
        pass: process.env.PASSWORD // Use environment variable for password
      }
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Account Status Update',
      text: emailMessage
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'User status updated and email sent', status: user.status });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ message: 'Error toggling user status, please try again' });
  }
});

//Application
app.post('/apply', upload.single('resume'), async (req, res) => {
  try {
    const formData = req.body;
    const userEmail = formData.email;

    // First try to find user in Google users collection
    let userId;
    let userModel;
    
    const googleUser = await mongoose.model('users').findOne({ email: userEmail });
    if (googleUser) {
      userId = googleUser._id;
      userModel = 'users';
      console.log('Found Google user:', googleUser);
    } else {
      // If not found in Google users, check regular users
      const regularUser = await mongoose.model('collection').findOne({ email: userEmail });
      if (regularUser) {
        userId = regularUser._id;
        userModel = 'collection';
        console.log('Found regular user:', regularUser);
      } else {
        throw new Error('User not found in any collection');
      }
    }

    // Create the application with user reference
    const application = new Application({
      ...formData,
      userId: userId,
      userModel: userModel,
      resume: req.file ? `/uploads/${req.file.filename}` : '',
      companyId: formData.companyId,
      jobId: formData.jobId,
    });

    console.log('Saving application with user details:', {
      userId,
      userModel,
      email: userEmail
    });

    await application.save();

    // Fetch job details for email
    const job = await Job.findById(formData.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Send confirmation email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: formData.email,
      subject: `Application Received for ${job.jobTitle}`,
      text: `Dear ${formData.firstName},\n\nThank you for applying to the ${job.jobTitle} position at ${job.companyName}.\n\nWe appreciate your interest and will get back to you shortly.\n\nBest Regards,\n${job.companyName} Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ 
      message: 'Application submitted successfully and email sent.',
      userId,
      userModel
    });
  } catch (err) {
    console.error('Error submitting application:', err);
    res.status(400).json({ error: err.message });
  }
});




//Application Display
// login/server/app.js
app.get('/applications', async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const applications = await Application.find({ companyId })
      .populate({
        path: 'jobId',
        select: 'jobTitle companyName jobLocation' // Select the fields you need
      })
      .sort({ createdAt: -1 });

    console.log('Fetched applications:', applications); // Debug log
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

//Application reject
app.delete('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Application ID is required.' });
    }

    console.log(`Deleting application with ID: ${id}`);

    // Delete the application from the database
    const result = await Application.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    res.status(200).json({ message: 'Application deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/send-interview-invite', async (req, res) => {
  try {
    const { applicantEmail, interviewDateTime, jobId } = req.body;

    if (!applicantEmail || !interviewDateTime || !jobId) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    const formattedDateTime = new Date(interviewDateTime).toLocaleString();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: applicantEmail,
      subject: `Interview Invitation for ${job.jobTitle}`,
      text: `Dear Applicant,\n\nWe are pleased to invite you to an interview for the ${job.jobTitle} position at ${job.companyName}. The interview is scheduled for ${formattedDateTime}.\n\nBest Regards,\n${job.companyName} Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Interview invite sent successfully.' });
  } catch (err) {
    console.error('Error sending interview invite:', err);
    res.status(500).json({ error: 'Failed to send interview invite. Please try again later.' });
  }
});


// Add test questions endpoint
app.post('/addtest', async (req, res) => {
  try {
    const { jobTitle, questions, emails, companyId } = req.body;

    // Save test to database
  const test = new Test({
    jobTitle,
      companyId,
      questions
    });
    await test.save();

    // Send emails to applicants
    const emailPromises = emails.map(async (email) => {
      try {
        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: `Test for ${jobTitle} Position`,
          html: `
            <h2>Online Test for ${jobTitle}</h2>
            <p>You have been invited to take an online test for the ${jobTitle} position.</p>
            <p>Please click the link below to start your test:</p>
            <a href="${process.env.CLIENT_URL}/test/${test._id}">Take Test</a>
            <p>Good luck!</p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
        return { email, status: 'success' };
      } catch (emailError) {
        console.error(`Failed to send email to ${email}:`, emailError);
        return { email, status: 'failed', error: emailError.message };
      }
    });

    const emailResults = await Promise.all(emailPromises);
    const failedEmails = emailResults.filter(result => result.status === 'failed');

    if (failedEmails.length > 0) {
      console.warn('Some emails failed to send:', failedEmails);
    }

    res.status(201).json({
      message: 'Test added successfully',
      testId: test._id,
      emailResults
    });

  } catch (error) {
    console.error('Error adding test:', error);
    res.status(500).json({
      error: 'Error adding test: ' + error.message
    });
  }
});

app.get('/test/:jobTitle', async (req, res) => {
  const { jobTitle } = req.params;

  try {
    const test = await Test.findOne({ jobTitle });

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Include companyId in the response
    res.status(200).json({
      ...test.toObject(),
      companyId: test.companyId
    });

  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ error: 'Error fetching test.' });
  }
});

app.post('/submitTest', async (req, res) => {
  const { email, jobTitle, selectedOptions, companyId } = req.body;

  if (!email || !jobTitle || !selectedOptions || !companyId) {
    return res.status(400).json({ message: 'Email, job title, selected options, and companyId are required.' });
  }

  try {
    const test = await Test.findOne({ jobTitle });
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    let score = 0;
    test.questions.forEach(question => {
      if (selectedOptions[question.questionNumber] === question.correctAnswer) {
        score += 1;
      }
    });

    const newScore = new Score({
      email,
      jobTitle,
      score,
      totalQuestions: test.questions.length,
      companyId
    });

    const savedScore = await newScore.save();
    res.status(201).json(savedScore);
  } catch (error) {
    console.error('Error submitting test:', error);
    res.status(500).json({ error: 'Error submitting test.' });
  }
});





app.get('/jobtitles', async (req, res) => {
  const { email } = req.query;
  console.log('Received email:', email);

  try {
    // Find applications by email
    const applications = await Application.find({ email });
    
    if (!applications.length) {
      return res.status(404).json({ message: 'No applications found for this email' });
    }

    // Extract jobIds from applications
    const jobIds = applications.map((app) => app.jobId);

    // Find jobs by jobIds
    const jobs = await Job.find({ _id: { $in: jobIds } });

    // Create a response array with jobTitle and companyName
    const jobDetails = jobs.map((job) => ({
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      companyLogo: job.companyLogo,
    }));

    res.json(jobDetails);
  } catch (error) {
    console.error('Error fetching job titles:', error);
    res.status(500).json({ message: 'Error fetching job titles' });
  }
});





app.get('/highscorers', async (req, res) => {
  const { companyId } = req.query; // Get companyId from query params

  try {
    // Find scores only for this company
    const scores = await Score.find({ companyId });

    const highScorers = scores.filter(user => user.score >= (user.totalQuestions / 2));

    res.json(highScorers.map(user => ({
      email: user.email,
      jobTitle: user.jobTitle,
      score: user.score,
    })));
  } catch (error) {
    console.error('Error fetching high scorers:', error);
    res.status(500).json({ error: 'Error fetching high scorers' });
  }
});

// app.post('/send-email', async (req, res) => {
//   const { jobTitle } = req.body;

//   if (!jobTitle) {
//     return res.status(400).json({ error: 'Job title is required' });
//   }

//   try {
//     const scores = await Score.find({ jobTitle });
//     const highScorers = scores.filter(user => user.score >= (user.totalQuestions / 2));

//     if (highScorers.length === 0) {
//       return res.status(404).json({ error: 'No high scorers found for the job title' });
//     }

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL,
//         pass: process.env.PASSWORD,
//       },
//     });

//     const mailOptions = {
//       from: process.env.EMAIL,
//       to: highScorers.map(user => user.email).join(','),
//       subject: `Selected for ${jobTitle}`,
//       html: `
//         <h1>Congratulations!</h1>
//         <p>You have been selected for the job role: ${jobTitle}</p>
//         <h2>High Scorers</h2>
//         <table border="1">
//           <tr>
//             <th>Email</th>
//             <th>Score</th>
//           </tr>
//           ${highScorers.map(user => `
//             <tr>
//               <td>${user.email}</td>
//               <td>${user.score}</td>
//             </tr>
//           `).join('')}
//         </table>
//         <p>Please follow the instructions for the next steps.</p>
//       `,
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).json({ message: 'Emails sent successfully.' });
//   } catch (error) {
//     console.error('Error sending emails:', error);
//     res.status(500).json({ error: 'Error sending emails' });
//   }
// });










// Route to upload PDF and extract content

app.post('/courses', upload.fields([
  { name: 'courseMaterial', maxCount: 1 },
  { name: 'courseLogo', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      courseName,
      courseTutor,
      courseDifficulty,
      paymentFee,
      courseDescription,
      mcqQuestions,
      courseProviderId
    } = req.body;

    // Create new course
    const course = new Course({
      courseProviderId,
      courseName,
      courseTutor,
      courseDifficulty,
      paymentFee,
      courseDescription,
      courseLogo: req.files['courseLogo'] ? 
        `/uploads/${req.files['courseLogo'][0].filename}` : '',
      courseMaterial: req.files['courseMaterial'] ? 
        `/uploads/${req.files['courseMaterial'][0].filename}` : '',
      mcqQuestions: JSON.parse(mcqQuestions)
    });

    await course.save();
    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/courses/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const courses = await Course.find({ courseProviderId: userId });

    if (courses.length === 0) {
      return res.status(404).json({ message: 'No courses found for this user' });
    }

    res.status(200).json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});




app.get('/coursesm', async (req, res) => {
  try {
    const courses = await Course.find(); // Fetch all courses
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
});



// GET route to fetch materials for a specific course
app.get('/courses/:id/materials', async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Respond with the course materials
    const materials = course.courseMaterials.map((filePath) => ({
      url: filePath,              // Full file path
      name: filePath.split('/').pop() // Extract file name from the path
    }));

    res.json(materials);
  } catch (error) {
    console.error('Error fetching course materials:', error);
    res.status(500).json({ message: 'Failed to fetch course materials' });
  }
});

app.get('/courses/:id/questions', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course.mcqQuestions);
  } catch (error) {
    console.error('Error fetching course questions:', error.message);
    res.status(500).json({ message: error.message });
  }
});


const AI_API_URL = 'https://api.openai.com/v1/completions';
const AI_API_KEY = process.env.AI_API_KEY; // Ensure this is set in your .env file

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Add this near your other multer configurations
const quizUpload = multer({
  storage: multer.memoryStorage()
});

app.post('/generate-quiz', quizUpload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    // Extract text from PDF buffer
    const pdfText = await pdfParse(req.file.buffer);
    if (!pdfText || !pdfText.text) {
      return res.status(400).json({ error: 'Could not extract text from PDF' });
    }
    
    // Generate questions using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `You are a quiz generator. Generate exactly 5 multiple choice questions based on this content:
    "${pdfText.text.substring(0, 5000)}".
    
    Important Rules:
    1. Questions MUST be based on the provided content only
    2. Each question must have exactly 4 options
    3. One option must be the correct answer
    4. All options must be relevant to the question
    5. Questions should test understanding of key concepts
    6. Return ONLY a JSON array with this exact structure:
    [
      {
        "question": "question text here",
        "options": ["option1", "option2", "option3", "option4"],
        "correctOption": "exact text of correct option"
      }
    ]
    Do not include any other text, markdown, or formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse the response
    let cleanText = text.replace(/```json/g, '')
                       .replace(/```/g, '')
                       .trim();
    
    // Ensure the text starts with [ and ends with ]
    if (!cleanText.startsWith('[') || !cleanText.endsWith(']')) {
      cleanText = cleanText.substring(
        cleanText.indexOf('['),
        cleanText.lastIndexOf(']') + 1
      );
    }
    
    try {
      const questions = JSON.parse(cleanText);
      
      // Validate each question thoroughly
      const validQuestions = questions.filter(q => {
        try {
          return (
            q.question && 
            typeof q.question === 'string' &&
            Array.isArray(q.options) && 
            q.options.length === 4 && 
            q.options.every(opt => typeof opt === 'string' && opt.trim().length > 0) &&
            q.correctOption &&
            typeof q.correctOption === 'string' &&
            q.options.includes(q.correctOption)
          );
        } catch {
          return false;
        }
      });

      if (validQuestions.length === 0) {
        throw new Error('No valid questions generated');
      }

      // Ensure exactly 5 questions
      const finalQuestions = validQuestions.slice(0, 5);
      res.json({ questions: finalQuestions });

    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      // More specific retry prompt
      const retryPrompt = `Create 5 multiple choice questions from this text:
      "${pdfText.text.substring(0, 3000)}".
      Return only a JSON array of questions. Each question must have:
      1. A question text
      2. An array of exactly 4 options
      3. The correct option text
      No other text or formatting.`;
      
      const retryResult = await model.generateContent(retryPrompt);
      const retryText = (await retryResult.response).text()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      const retryQuestions = JSON.parse(retryText);
      res.json({ questions: retryQuestions.slice(0, 5) });
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ 
      error: 'Failed to generate quiz',
      details: error.message 
    });
  }
});










// Download certificate route
app.post('/api/certificate/download', async (req, res) => {
  const { userName, courseName, paymentId } = req.body;

  // Here, you should verify the payment status with Razorpay
  const paymentDetails = await razorpayInstance.payments.fetch(paymentId);

  if (paymentDetails.status === 'captured') {
    // Payment is successful, generate and send the certificate as a PDF
    // For demonstration purposes, we'll send a plain text response.
    // Implement your logic to generate a PDF and send it back.
    res.send(`Generating certificate for ${userName} for the course ${courseName}`);
  } else {
    res.status(400).json({ error: 'Payment not successful. Certificate cannot be downloaded.' });
  }
});
// Fetch payment fee by course ID
app.get('/courses/:courseId/paymentFee', async (req, res) => {
  const { courseId } = req.params;

  try {
    // Find the course in the database
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Assuming the course document has a paymentFee field
    res.json({ fee: course.paymentFee });
  } catch (error) {
    console.error('Error fetching payment fee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});








// Save payment details endpoint
// Save payment details endpoint




const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET // Ensure this is the correct key secret
});

app.post('/api/payments/create-order', async (req, res) => {
  const { amount, currency } = req.body;
  const options = {
    amount: amount * 100, // amount in the smallest currency unit
    currency,
    receipt: `receipt_${Date.now()}`
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error); // Detailed logging
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

app.post('/api/payments/save', async (req, res) => {
  const { userName, courseName, paymentFee, paymentId, receiptUrl } = req.body;

  const newPayment = new Payment({
    userName,
    courseName,
    paymentFee,
    paymentId,
    receiptUrl
  });

  try {
    await newPayment.save();
    res.status(201).json({ message: 'Payment details saved successfully' });
  } catch (error) {
    console.error('Error saving payment details:', error);
    res.status(500).json({ message: 'Error saving payment details' });
  }
});




// Fetch profile by email
// app.post('/getProfile', async (req, res) => {
//   const { email } = req.body;
//   try {
//     const profile = await Profile.findOne({ email });
//     if (profile) {
//       res.json({ profile });
//     } else {
//       res.status(404).json({ message: 'Profile not found' });
//     }
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Create or update profile
// app.post('/saveProfile', async (req, res) => {
//   const { name, email, phoneNumber, linkedIn, dob } = req.body;
//   try {
//     const existingProfile = await Profile.findOne({ email });
//     if (existingProfile) {
//       // Update existing profile
//       existingProfile.name = name;
//       existingProfile.phoneNumber = phoneNumber;
//       existingProfile.linkedIn = linkedIn;
//       existingProfile.dob = dob;
//       await existingProfile.save();
//     } else {
//       // Create new profile
//       const newProfile = new Profile({ name, email, phoneNumber, linkedIn, dob });
//       await newProfile.save();
//     }
//     res.json({ message: 'Profile saved successfully' });
//   } catch (e) {
//     console.error(e);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

app.post('/profile', upload.single('resume'), async (req, res) => {
  try {
    // Log the request for debugging
    console.log('Form data:', req.body);
    console.log('File:', req.file);

    const profileData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      email: req.body.email,
      skills: req.body.skills,
      linkedinProfile: req.body.linkedinProfile,
      city: req.body.city,
      state: req.body.state,
      middleName: req.body.middleName || ''
    };

    // Only add resume field if a file was uploaded
    if (req.file) {
      profileData.resume = `/uploads/${req.file.filename}`;
    }

    const profile = await Profile.findOneAndUpdate(
      { email: profileData.email },
      profileData,
      { new: true, upsert: true }
    );

    res.json({ success: true, profile });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// Get profile by email
app.get('/profile', async (req, res) => {
  try {
    const { email } = req.query;
    const profile = await Profile.findOne({ email });
    
    if (!profile) {
      // If no profile exists, return a 404 but don't clear existing data
      return res.status(404).json({ 
        message: 'Profile not found',
        profile: null 
      });
    }
    
    res.json({ 
      success: true,
      profile: profile 
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/feedback', async (req, res) => {
  try {
    const { email, feedbackText, rating } = req.body;

    if (!email || !feedbackText || !rating) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const feedback = new Feedback({
      email,
      feedbackText,
      rating,
    });

    await feedback.save();

    // Optionally, send an email confirmation to the user
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Feedback Received',
      text: `Thank you for your feedback! Here is what we received:\n\n${feedbackText}\n\nRating: ${rating}/5`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Feedback submitted successfully.' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback. Please try again later.' });
  }
});

module.exports = app;



app.get('/feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find();
    res.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ error: 'Error fetching feedbacks' });
  }
});



// Add this new endpoint to fetch company name
app.get("/company/profile", async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await collection.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({ name: user.name });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add selected candidate
app.post('/selections', async (req, res) => {
  try {
    const { email, jobTitle, score, companyId } = req.body;

    if (!email || !jobTitle || !score || !companyId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const selection = new Selection({
      email,
      jobTitle,
      score,
      companyId
    });

    await selection.save();
    res.status(201).json({ message: 'Selection saved successfully' });
  } catch (error) {
    console.error('Error saving selection:', error);
    res.status(500).json({ error: 'Error saving selection' });
  }
});

// Get selected candidates
app.get('/selections', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required' });
    }
    
    const selections = await Selection.find({ companyId });
    res.json(selections);
  } catch (error) {
    console.error('Error fetching selections:', error);
    res.status(500).json({ error: 'Error fetching selections' });
  }
});

// Send invitations
app.post('/send-invitations', async (req, res) => {
  try {
    const { jobTitle } = req.body;
    const selections = await Selection.find({ jobTitle });

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    
    const emailPromises = selections.map(async (selection) => {
      const mailOptions = {
        from: process.env.EMAIL,
        to: selection.email,
        subject: `Congratulations! You've been selected for ${jobTitle}`,
        html: `
          <h2>Congratulations!</h2>
          <p>You have been selected for the position of ${jobTitle}.</p>
          <h3>Selected Candidates:</h3>
          <table style="border-collapse: collapse; width: 100%;">
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px;">Email</th>
            </tr>
            ${selections.map(s => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${s.email}</td>
              </tr>
            `).join('')}
          </table>
          <p>We are pleased to inform you that you have been selected based on your test performance.</p>
          <p>Please wait for further instructions regarding the next steps in the recruitment process.</p>
          <br>
          <p>Best regards,</p>
          <p>The Recruitment Team</p>
        `
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);
    res.json({ success: true, message: 'Invitations sent successfully' });
  } catch (error) {
    console.error('Error sending invitations:', error);
    res.status(500).json({ error: 'Error sending invitations' });
  }
});

// Add this new endpoint to fetch userId by email
app.get('/getUserId/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Check Google users first
    const googleUser = await users.findOne({ email });
    if (googleUser) {
      return res.json({
        userId: googleUser._id.toString(),
        loginType: 'google'
      });
    }
    
    // Then check regular users
    const regularUser = await collection.findOne({ email });
    if (regularUser) {
      return res.json({
        userId: regularUser._id.toString(),
        loginType: 'regular'
      });
    }
    
    return res.status(404).json({ 
      message: 'User not found',
      email: email
    });
    
  } catch (error) {
    console.error('Error fetching user ID:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Add endpoint to get user details
app.get('/getUserDetails/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Check Google users first since this is a Google login
    const googleUser = await users.findOne({ email });
    if (googleUser) {
      return res.json({
        email,
        id: googleUser._id,
        type: 'Google Login'
      });
    }
    
    // Then check regular users if not found
    const regularUser = await collection.findOne({ email });
    if (regularUser) {
      return res.json({
        email,
        id: regularUser._id,
        type: 'Regular Login'
      });
    }
    
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this new endpoint to fetch user applications
app.get('/user-applications/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const applications = await Application.find({ userId })
            .populate({
                path: 'jobId',
                select: 'jobTitle companyName companyId'
            })
            .sort({ createdAt: -1 }); // Sort by newest first
        
        console.log('Found applications:', applications); // Debug log
        
        // Transform the data to include company information
        const transformedApplications = applications.map(app => ({
            ...app.toObject(),
            companyName: app.jobId?.companyName || 'Company Not Available',
            jobTitle: app.jobId?.jobTitle || 'Job Not Available'
        }));
        
        res.json(transformedApplications);
    } catch (error) {
        console.error('Error fetching user applications:', error);
        res.status(500).json({ message: 'Error fetching applications' });
    }
});

// Add this new endpoint to fetch user's applications by matching userId
app.get('/user-applied-jobs/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Searching for applications with userId:', userId);

        // Find applications where userId matches
        const applications = await Application.find({ 
            userId: mongoose.Types.ObjectId(userId) 
        }).populate({
            path: 'jobId',
            select: 'jobTitle companyName'
        });

        console.log('Found applications:', applications);

        if (!applications.length) {
            return res.status(200).json({ 
                message: 'No applications found',
                applications: [] 
            });
        }

        // Transform the data to include all necessary information
        const transformedApplications = applications.map(app => ({
            _id: app._id,
            jobTitle: app.jobId?.jobTitle || 'Job Title Not Available',
            companyName: app.jobId?.companyName || 'Company Name Not Available',
            appliedDate: app.createdAt,
            status: app.status || 'Pending',
            resume: app.resume,
            firstName: app.firstName,
            lastName: app.lastName,
            email: app.email
        }));

        res.json({
            success: true,
            applications: transformedApplications
        });

    } catch (error) {
        console.error('Error fetching user applications:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching applications',
            error: error.message 
        });
    }
});

// Modify the view-applications endpoint
app.get('/view-applications/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Fetching applications for userId:', userId);

        // First find applications for this user without converting to ObjectId
        const applications = await Application.find({ userId });

        console.log('Found raw applications:', applications);

        if (!applications || applications.length === 0) {
            return res.json({
                success: true,
                applications: []
            });
        }

        // Get all jobIds from applications
        const jobIds = applications.map(app => app.jobId);
        console.log('Job IDs:', jobIds);

        // Find all jobs that match these jobIds
        const jobs = await Job.find({
            '_id': { $in: jobIds }
        });

        console.log('Found matching jobs:', jobs);

        // Transform the data to combine application and job details
        const transformedData = applications.map(app => {
            const matchingJob = jobs.find(job => job._id.toString() === app.jobId.toString());
            console.log('Matching job for application:', matchingJob);
            
            return {
                _id: app._id,
                jobTitle: matchingJob?.jobTitle || 'Job Title Not Available',
                companyName: matchingJob?.companyName || 'Company Not Available',
                jobLocation: matchingJob?.jobLocation || 'Location Not Available',
                employmentType: matchingJob?.employmentType || 'Not Specified',
                experienceLevel: matchingJob?.experienceLevel || 'Not Specified',
                salary: matchingJob ? `${matchingJob.minPrice} - ${matchingJob.maxPrice} ${matchingJob.salaryType}` : 'Not Specified',
                appliedDate: app.createdAt,
                resume: app.resume
            };
        });

        console.log('Transformed data:', transformedData);

        res.json({
            success: true,
            applications: transformedData
        });

    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching applications',
            error: error.message
        });
    }
});

// Add this function to extract skills section from resume text
function extractSkillsSection(text) {
  console.log("\n=== Starting Skills Extraction ===\n");
  console.log("Raw text:", text); // Debug log

  // Find the TECHNICAL SKILLS section and its content
  const skillsRegex = /TECHNICAL\s+SKILLS\s*([\s\S]*?)(?=\n\s*(?:PERSONAL|EDUCATION|EXPERIENCE|PROJECTS|CERTIFICATIONS|ACHIEVEMENTS|LANGUAGES|INTERESTS|HOBBIES|ACTIVITIES|AWARDS|INTERNSHIP|WORK|PROFESSIONAL|QUALIFICATION)|$)/i;
  const match = text.match(skillsRegex);

  if (!match) {
    console.log("No skills section found");
    return '';
  }

  // Get the content after "TECHNICAL SKILLS"
  const skillsContent = match[1].trim();
  console.log("\nExtracted Skills Section:", skillsContent);
  return skillsContent;
}

function parseSkills(skillsSection) {
  if (!skillsSection) return [];

  console.log("\n=== Parsing Skills ===\n");
  console.log("Input Skills Section:", skillsSection);

  // Split content into lines
  const lines = skillsSection
    .split(/[\n\r]/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  console.log("Split lines:", lines);

  let skills = [];
  let currentCategory = '';

  lines.forEach(line => {
    // Skip if line is just "TECHNICAL SKILLS"
    if (line.toUpperCase() === 'TECHNICAL SKILLS') return;

    // Check if line is a category (e.g., "Web Development", "Programming Languages")
    if (line.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/) || line.endsWith(':')) {
      currentCategory = line.replace(':', '').trim();
      console.log("Found category:", currentCategory);
      return;
    }

    // Split the line by common delimiters
    const lineSkills = line
      .split(/[,|•·⋅‣⁃⦁⦾⦿→✓\-–—●\t|]/g)
      .map(skill => skill.trim())
      .filter(skill => {
        return skill && 
               skill.length > 1 && 
               !skill.match(/^[0-9.]+$/) &&
               skill.toLowerCase() !== 'technical skills';
      });

    if (lineSkills.length > 0) {
      console.log(`Found skills under ${currentCategory}:`, lineSkills);
      skills.push(...lineSkills);
    }
  });

  // Normalize skills
  const normalizedSkills = [...new Set(skills)]
    .map(skill => {
      const normalizedSkill = skill.toLowerCase().trim();
      // Skill mappings
      if (['react', 'react.js', 'reactjs'].includes(normalizedSkill)) return 'React.js';
      if (['python', 'python3'].includes(normalizedSkill)) return 'python';
      if (['node', 'node.js', 'nodejs'].includes(normalizedSkill)) return 'Node.js';
      if (['express', 'express.js', 'expressjs'].includes(normalizedSkill)) return 'Express.js';
      if (['java', 'core java', 'java programming'].includes(normalizedSkill)) return 'Java';
      if (['javascript', 'js'].includes(normalizedSkill)) return 'JavaScript';
      if (['html', 'html5'].includes(normalizedSkill)) return 'HTML';
      if (['css', 'css3'].includes(normalizedSkill)) return 'CSS';
      if (['daa', 'design and analysis of algorithms'].includes(normalizedSkill)) return 'DAA';
      if (['openstack', 'open stack'].includes(normalizedSkill)) return 'Openstack';
      return skill;
    })
    .filter(skill => skill.length > 1);

  console.log("\nFinal Normalized Skills:", normalizedSkills);
  return normalizedSkills;
}

const extractSkillsUsingGemini = async (resumeText) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Analyze this resume text and extract a list of technical skills and technologies.
      Format the output as a simple comma-separated list.
      Only include actual technical skills, programming languages, tools, and technologies.
      Resume text:
      ${resumeText}
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 1024,
      },
    });

    const response = await result.response;
    const skills = response.text().split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
    
    console.log('Extracted skills:', skills);
    return skills;
  } catch (error) {
    console.error('Error in Gemini extraction:', error);
    return [];
  }
};

// Helper function to normalize skill names
function normalizeSkillName(skill) {
  const normalized = skill.toLowerCase().trim()
    .replace(/[^a-z0-9.]/g, '') // Remove special characters except dots
    .replace(/^(the|a|an)\s+/, ''); // Remove articles

  // Common variations mapping
  const variations = {
    'react': ['react', 'reactjs', 'react.js'],
    'python': ['python', 'python3', 'py'],
    'javascript': ['javascript', 'js', 'ecmascript'],
    'nodejs': ['node', 'nodejs', 'node.js'],
    'express': ['express', 'expressjs', 'express.js'],
    'mongodb': ['mongo', 'mongodb'],
    'html': ['html', 'html5'],
    'css': ['css', 'css3'],
    'daa': ['daa', 'designandanalysisofalgorithms', 'algorithmsanalysis'],
    'openstack': ['openstack', 'openstackcloud']
  };

  // Check if the normalized skill matches any variation
  for (const [standard, variants] of Object.entries(variations)) {
    if (variants.includes(normalized)) {
      return standard;
    }
  }

  return normalized;
}

// Update the recommendations endpoint
app.post('/recommendations', async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`\n=== Getting Recommendations for: ${email} ===\n`);

    // Get user's profile
    const profile = await Profile.findOne({ email });
    if (!profile || !profile.resume) {
      console.log('No profile or resume found');
      return res.json({ recommendations: [] });
    }

    // Read and parse PDF
    const resumePath = path.join(__dirname, profile.resume.replace(/^\//, ''));
    const dataBuffer = await fsPromises.readFile(resumePath);
    const pdfData = await PDFParser(dataBuffer);
    const resumeText = pdfData.text;

    // Extract skills using Gemini AI
    const skills = await extractSkillsUsingGemini(resumeText);
    
    if (skills.length === 0) {
      console.log('No skills found in resume');
      return res.json({ recommendations: [] });
    }

    console.log('\nExtracted Skills:', skills);

    // Get all courses
    const allCourses = await Course.find({}, 'courseName');
    console.log('\nAll available courses:', allCourses.map(c => c.courseName));

    // Match skills with courses using normalized comparison
    const recommendedCourses = allCourses
      .filter(course => {
        const normalizedCourseName = normalizeSkillName(course.courseName);
        return skills.some(skill => {
          const normalizedSkill = normalizeSkillName(skill);
          const isMatch = normalizedSkill === normalizedCourseName;
          
          if (isMatch) {
            console.log(`Matched skill "${skill}" with course "${course.courseName}"`);
          }
          return isMatch;
        });
      })
      .map(course => course.courseName);

    console.log('\nRecommended Courses:', recommendedCourses);
    res.json({ recommendations: recommendedCourses });

  } catch (error) {
    console.error('Error in recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/chatbot', async (req, res) => {
  const { message } = req.body;
  
  try {
    const lowerMessage = message.toLowerCase();
    
    // Handle greetings
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
    const farewells = ['bye', 'goodbye', 'see you', 'thank you', 'thanks'];
    
    if (greetings.some(greeting => lowerMessage.includes(greeting))) {
      return res.json({ 
        reply: "Hello! I'm your Job Board assistant. I can help you with information about courses and jobs. What would you like to know?" 
      });
    }
    
    if (farewells.some(farewell => lowerMessage.includes(farewell))) {
      return res.json({ 
        reply: "Goodbye! Feel free to come back if you have more questions about our courses or jobs." 
      });
    }

    // Job listing variations
    const jobListingQueries = [
      'list all jobs',
      'what all jobs',
      'show jobs',
      'available jobs',
      'what jobs do you have',
      'tell me about the jobs',
      'can you show me the jobs',
      'what positions are available',
      'job openings',
      'current job opportunities',
      'what jobs are there',
      'display all jobs',
      'show me job listings',
      'what jobs can i apply for'
    ];

    // Course listing variations
    const courseListingQueries = [
      'list all courses',
      'what all courses',
      'show courses',
      'available courses',
      'what courses do you have',
      'tell me about the courses',
      'can you show me the courses',
      'what courses are available',
      'course offerings',
      'current courses',
      'what courses are there',
      'display all courses',
      'show me course listings',
      'what can i learn here'
    ];

    // Check for job listing requests
    if (jobListingQueries.some(query => lowerMessage.includes(query))) {
      const jobs = await Job.find({}, 'jobTitle companyName jobLocation employmentType minPrice maxPrice salaryType');
      if (jobs.length > 0) {
        const jobList = jobs.map(job => 
          `• ${job.jobTitle}\n    📍 Company: ${job.companyName}\n    📌 Location: ${job.jobLocation}\n    💼 Type: ${job.employmentType}\n    💰 Salary: $${job.minPrice}-${job.maxPrice} ${job.salaryType}`
        ).join('\n\n');
        return res.json({
          reply: `Here are all available job opportunities:\n\n${jobList}\n\nWould you like specific details about any of these positions?`
        });
      } else {
        return res.json({
          reply: "Currently there are no job listings available. Please check back later for new opportunities."
        });
      }
    }

    // Check for course listing requests
    if (courseListingQueries.some(query => lowerMessage.includes(query))) {
      const courses = await Course.find({}, 'courseName courseTutor courseDifficulty paymentFee');
      if (courses.length > 0) {
        const courseList = courses.map(course => 
          `• ${course.courseName}\n  👨‍🏫 Tutor: ${course.courseTutor}\n  📚 Level: ${course.courseDifficulty}\n  💰 Fee: $${course.paymentFee}`
        ).join('\n\n');
        return res.json({
          reply: `Here are all available courses:\n\n${courseList}\n\nWould you like to know more details about any specific course?`
        });
      } else {
        return res.json({
          reply: "Currently there are no courses available. Please check back later for new course offerings."
        });
      }
    }

    // For other queries, use the existing keyword-based approach
    const courseKeywords = ['course', 'courses', 'study', 'learn', 'training', 'tutor', 'fee', 'difficulty'];
    const jobKeywords = ['job', 'jobs', 'work', 'position', 'salary', 'company', 'employment', 'career'];

    const isCourseRelated = courseKeywords.some(keyword => lowerMessage.includes(keyword));
    const isJobRelated = jobKeywords.some(keyword => lowerMessage.includes(keyword));

    let contextData = '';

    if (isCourseRelated) {
      const courses = await Course.find({}, 'courseName courseTutor courseDifficulty paymentFee courseDescription');
      if (courses.length > 0) {
        contextData = `Available Courses:\n${courses.map(course => 
          `- ${course.courseName} (Tutor: ${course.courseTutor}, Difficulty: ${course.courseDifficulty}, Fee: $${course.paymentFee})`
        ).join('\n')}`;
      }
    }

    if (isJobRelated) {
      const jobs = await Job.find({}, 'jobTitle companyName jobLocation salaryType minPrice maxPrice employmentType');
      if (jobs.length > 0) {
        contextData = `Available Jobs:\n${jobs.map(job => 
          `- ${job.jobTitle} at ${job.companyName} (Location: ${job.jobLocation}, Salary: $${job.minPrice}-${job.maxPrice} ${job.salaryType})`
        ).join('\n')}`;
      }
    }

    if (!isCourseRelated && !isJobRelated) {
      return res.json({ 
        reply: "I can only help you with information about courses and jobs available on our platform. Please ask me about courses, jobs, or related topics." 
      });
    }

    // Use Gemini for more complex queries
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `
      Context: ${contextData}
      User Question: ${message}
      Please provide a helpful and relevant response based on the above context.
      Format the response with bullet points where appropriate.
      Keep it concise and friendly.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text();

    res.json({ reply: reply.trim() });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      reply: "I'm having trouble processing your request right now. Please try again later." 
    });
  }
});

// Add this new endpoint for company-specific jobs
app.get('/company-jobs', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required' });
    }

    const now = new Date();
    const jobs = await Job.find({
      companyId: companyId,
      status: 1  // Only return active jobs
    }).sort({ expireDate: 1 });
    
    console.log(`Found ${jobs.length} active jobs for company ${companyId}`);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});




app.get('/feedbacka', async (req, res) => {
  try {
    const feedback = await Feedback.find();
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Error fetching feedback' });
  }
});

// Endpoint to fetch all applications
app.get('/applicationsa', async (req, res) => {
  try {
    const applications = await Application.find();
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Endpoint to fetch all jobs
app.get('/jobsa', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Endpoint to fetch all courses
app.get('/coursesa', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

app.listen(PORT, () => {
  console.log(`Server started at port number ${PORT}`);
});

// Add error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File is too large. Maximum size is 5MB'
      });
    }
  }
  next(error);
});

// Update job route
app.put('/jobs/:id', upload.single('companyLogo'), async (req, res) => {
  try {
    const jobId = req.params.id;
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.companyLogo = `/uploads/${req.file.filename}`;
    }

    // Convert expiry date string to Date object and set status
    if (updateData.expireDate) {
      const newExpireDate = new Date(updateData.expireDate);
      const now = new Date();

      // Explicitly set the status based on the new expiry date
      updateData.status = newExpireDate > now ? 1 : 0;
      
      console.log('Updating job with:', {
        expireDate: newExpireDate,
        currentTime: now,
        newStatus: updateData.status
      });
    }

    // Force update the status field
    const updatedJob = await Job.findByIdAndUpdate(
      jobId,
      { 
        $set: {
          ...updateData,
          status: updateData.status // Ensure status is explicitly set
        }
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedJob) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    // Double-check the status after update
    const finalStatus = updatedJob.expireDate > new Date() ? 1 : 0;
    if (updatedJob.status !== finalStatus) {
      updatedJob.status = finalStatus;
      await updatedJob.save();
    }

    console.log('Job updated successfully:', {
      id: updatedJob._id,
      expireDate: updatedJob.expireDate,
      status: updatedJob.status
    });

    res.json({ 
      success: true, 
      message: 'Job updated successfully', 
      job: updatedJob 
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating job', 
      error: error.message 
    });
  }
});

// Load BERT model once at startup
let model;
(async () => {
  model = await use.load();
  console.log('Universal Sentence Encoder model loaded');
})();

// Improved ATS scoring endpoint
app.post('/ats-score', async (req, res) => {
  try {
    const { email } = req.body;
    const profile = await Profile.findOne({ email });
    
    if (!profile || !profile.resume) {
      throw new Error('No resume found');
    }

    const resumePath = path.join(__dirname, profile.resume.replace(/^\//, ''));
    const dataBuffer = await fsPromises.readFile(resumePath);
    const pdfData = await PDFParser(dataBuffer);
    const resumeText = pdfData.text.toLowerCase();

    // Format and readability check
    const wordCount = resumeText.split(/\s+/).length;
    const formatScore = Math.min(100, (wordCount / 400) * 100);

    // Get embeddings for resume text first
    const embeddings = await model.embed([resumeText]);
    const resumeEmbedding = embeddings.arraySync()[0];

    const sections = {
      contact: {
        keywords: [
          'email', 'phone', 'mobile', 'address', 'linkedin', 'github', 'portfolio',
          'website', 'social', 'contact', 'location'
        ],
        weight: 0.10,
        required: true,
        icon: '📞'
      },
      education: {
        keywords: [
          'degree', 'university', 'college', 'gpa', 'academic', 'bachelor',
          'master', 'phd', 'diploma', 'certification', 'major', 'minor',
          'graduate', 'undergraduate', 'school', 'institute', 'education',
          'course', 'studies', 'qualification'
        ],
        weight: 0.15,
        required: true,
        icon: '🎓'
      },
      experience: {
        keywords: [
          'work', 'job', 'internship', 'role', 'position', 'responsibility',
          'achievement', 'led', 'managed', 'developed', 'implemented', 'created',
          'designed', 'improved', 'increased', 'reduced', 'team', 'project',
          'client', 'delivered', 'coordinated', 'supervised', 'analyzed',
          'established', 'maintained', 'experience', 'company'
        ],
        weight: 0.35,  // Increased weight for experience
        required: true,
        icon: '💼'
      },
      skills: {
        keywords: [
          'programming', 'software', 'development', 'engineering', 'framework',
          'language', 'database', 'cloud', 'api', 'frontend', 'backend',
          'full-stack', 'devops', 'agile', 'testing', 'architecture', 'design',
          'analysis', 'tools', 'technologies', 'platforms', 'systems', 'technical',
          'methodology', 'proficient', 'expertise', 'skilled'
        ],
        weight: 0.25,
        required: true,
        icon: '🛠️'
      },
      achievements: {
        keywords: [
          'award', 'recognition', 'certification', 'honor', 'achievement',
          'accomplished', 'improved', 'increased', 'optimized', 'enhanced',
          'succeeded', 'delivered', 'exceeded', 'outperformed', 'awarded',
          'recognized', 'selected', 'promoted'
        ],
        weight: 0.15,
        required: false,
        icon: '🏆'
      }
    };

    // Improve scoring algorithm with more lenient scoring
    const calculateSectionScore = (similarities, keywordMatches, totalKeywords, resumeText, section) => {
      // Calculate base similarity score with higher baseline
      const similarityScore = similarities.reduce((acc, score) => acc + score, 0) / similarities.length;
      
      // More lenient keyword density calculation
      const keywordDensity = Math.min(1, (keywordMatches / totalKeywords) * 1.5); // 50% bonus
      
      // Relaxed content length scoring
      const contentLength = resumeText.length;
      const lengthScore = Math.min(1, contentLength / 1500); // Reduced length requirement
      
      // More generous scoring formula
      const baseScore = (
        (similarityScore * 0.3) +      // Reduced weight on semantic relevance
        (keywordDensity * 0.5) +       // Increased weight on keyword presence
        (lengthScore * 0.2)            // Same weight for length
      ) * 100;
      
      // Enhanced bonus system
      let bonus = 0;
      
      // More generous keyword match bonuses
      if (keywordMatches > totalKeywords * 0.3) {
        bonus += 20;  // Increased bonus for good matches
      } else if (keywordMatches > totalKeywords * 0.2) {
        bonus += 15;  // Added mid-tier bonus
      } else if (keywordMatches > 0) {
        bonus += 10;  // Base bonus for any matches
      }
      
      // Required section bonus
      if (section.required && keywordMatches > 0) {
        bonus += 10; // Doubled from 5
      }
      
      // More generous section-specific bonuses
      switch(section.name) {
        case 'experience':
          if (keywordMatches > 4) bonus += 15;  // Reduced threshold, increased bonus
          break;
        case 'skills':
          if (keywordMatches > 5) bonus += 12;  // Reduced threshold, increased bonus
          break;
        case 'education':
          if (keywordMatches > 2) bonus += 10;  // Reduced threshold, increased bonus
          break;
        case 'contact':
          if (keywordMatches > 1) bonus += 15;  // Added contact section bonus
          break;
      }
      
      // Higher minimum scores for required sections
      const minimumScore = section.required ? 50 : 0;  // Increased from 40
      
      // Calculate final score with bonus and higher minimum threshold
      const finalScore = Math.max(
        minimumScore,
        Math.min(100, baseScore + bonus)
      );
      
      return finalScore;
    };

    let totalScore = 0;
    const sectionScores = {};
    const improvements = [];
    const strengths = [];

    // Enhanced section analysis
    for (const [sectionName, section] of Object.entries(sections)) {
      try {
        const sectionEmbeddings = await model.embed(section.keywords);
        const keywordEmbeddings = sectionEmbeddings.arraySync();
        
        // Improved similarity calculation
        const similarities = keywordEmbeddings.map(keywordEmb => {
          const similarity = tf.tensor1d(resumeEmbedding)
            .dot(tf.tensor1d(keywordEmb))
            .div(
              tf.norm(tf.tensor1d(resumeEmbedding))
                .mul(tf.norm(tf.tensor1d(keywordEmb)))
            )
            .arraySync();
          return Math.max(0, similarity);
        });

        // Enhanced keyword matching
        const keywordMatches = section.keywords.filter(keyword => {
          const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
          return keywordRegex.test(resumeText);
        }).length;

        const sectionScore = calculateSectionScore(
          similarities,
          keywordMatches,
          section.keywords.length,
          resumeText,
          { ...section, name: sectionName }
        );

        sectionScores[sectionName] = {
          score: Math.round(sectionScore),
          icon: section.icon,
          matches: keywordMatches
        };

        const weightedScore = sectionScore * section.weight;
        totalScore += weightedScore;

        // Generate detailed feedback
        if (sectionScore < 40) {
          improvements.push({
            section: sectionName,
            icon: section.icon,
            score: Math.round(sectionScore),
            suggestions: [
              `Add more details to your ${sectionName} section`,
              `Include key ${sectionName} keywords`,
              `Quantify your ${sectionName} with specific metrics`
            ]
          });
        } else if (sectionScore < 70) {
          improvements.push({
            section: sectionName,
            icon: section.icon,
            score: Math.round(sectionScore),
            suggestions: [
              `Enhance your ${sectionName} with more specific details`,
              `Use more industry-standard terminology`
            ]
          });
        } else {
          strengths.push({
            section: sectionName,
            icon: section.icon,
            score: Math.round(sectionScore)
          });
        }

      } catch (sectionError) {
        console.error(`Error analyzing ${sectionName} section:`, sectionError);
        continue;
      }
    }

    // Adjust final score normalization
    const formatMultiplier = (() => {
      if (wordCount >= 200 && wordCount <= 800) {  // Wider acceptable range
        return 1.25;  // Higher multiplier for acceptable length
      } else if (wordCount > 800) {
        return 1.1;   // Still reward longer resumes
      } else {
        return 1.0;   // Base multiplier for short resumes
      }
    })();

    // Adjust final score calculation
    totalScore = Math.min(98, Math.round(totalScore * formatMultiplier)); // Increased max score

    // More lenient minimum score threshold
    if (Object.values(sectionScores).every(score => score.score > 0)) {
      totalScore = Math.max(70, totalScore); // Increased minimum score for complete resumes
    }

    // Add score boosting for strong sections
    const strongSections = Object.values(sectionScores).filter(score => score.score >= 75).length;
    if (strongSections >= 3) {
      totalScore = Math.min(98, totalScore + 5); // Bonus for multiple strong sections
    }

    // Generate comprehensive feedback
    const feedback = {
      overallScore: totalScore,
      sectionScores,
      strengths,
      improvements,
      generalSuggestions: [
        wordCount < 300 ? '📄 Your resume is too short. Add more relevant details' : '',
        wordCount > 600 ? '📄 Consider making your resume more concise' : '',
        totalScore < 60 ? '📊 Focus on adding more quantifiable achievements' : '',
        totalScore < 70 ? '🎯 Use more industry-specific keywords' : ''
      ].filter(Boolean)
    };

    res.json(feedback);

  } catch (error) {
    console.error('Error in ATS scoring:', error);
    res.status(500).json({ 
      error: 'Failed to analyze resume',
      details: error.message 
    });
  }
});

// Add this new endpoint for resume upload
app.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Update or create profile with new resume path
    const profile = await Profile.findOneAndUpdate(
      { email },
      { 
        $set: { 
          resume: `/uploads/${req.file.filename}` 
        }
      },
      { upsert: true, new: true }
    );

    res.json({ 
      success: true, 
      message: 'Resume uploaded successfully',
      profile 
    });

  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});