require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const userdb = require("./model/userschema"); // Import Google OAuth schema
const collection = require("./model/loginschema"); // Import regular login schema
const Application = require("./model/Application");
const Payment = require('./model/payment');
const Profile = require('./model/Profile');

const Course = require("./model/course");
const DeletedUser = require("./model/restore");
const Job = require("./model/Jobs");
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

const clientid = process.env.CLIENT_ID;
const clientsecret = process.env.CLIENT_SECRET;

// Connect to MongoDB using the connection string from the .env file
mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(cors({
  origin: ["http://localhost:3000","https://jobboardweb.netlify.app"],
  methods: "GET,POST,PUT,DELETE",
  credentials: true
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
      let user = await userdb.findOne({ googleId: profile.id });
      if (!user) {
        user = new userdb({
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

// Admin credentials
const adminCredentials = {
  username: 'admin',  // Admin username
  password: 'admin'  // Admin password
};

// Normal login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // Admin login
    if (email === adminCredentials.username && password === adminCredentials.password) {
      return res.status(200).json({ msg: "Admin login", user: { _id: "admin", name: "admin", role: "admin" } });
    }
    
    const user = await collection.findOne({ email: email });
    if (user && user.status === 0) {
      return res.status(403).json({ msg: "Your account is disabled. Please contact support." });
    }
    if (user && await bcrypt.compare(password, user.password)) {
      return res.json({ msg: "exist", user: { _id: user._id, name: user.name, role: user.role } }); // Ensure role and ObjectId are included here
    } else {
      return res.json("notexist");
    }
  } catch (e) {
    return res.json("notexist");
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
// Signup route
app.post("/signup", async (req, res) => {
  const { name, email, password, cpassword, dob, linkedIn } = req.body;

  try {
    // Check if user already exists
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return res.json("exist"); // User already exists
    }

    // Check if passwords match
    if (password !== cpassword) {
      return res.json("passwordmismatch"); // Password mismatch
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new collection({
      name,
      email,
      password: hashedPassword,
      dob: new Date(dob), // Ensure dob is stored as a Date object
      linkedIn,
    });

    // Save the user to the database
    await newUser.save();

    // Send email to user (if required)
    await sendSignupEmail(email, name);

    return res.json("notexist"); // Signup successful
  } catch (err) {
    console.error(err);
    return res.json("error"); // An error occurred
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

//Route to add multiple jobs
// Job posting route
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../client/public/uploads')));
// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../client/public/uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Job posting route
app.post('/jobs', upload.single('companyLogo'), async (req, res) => {
  try {
    // Check if the company logo is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Company logo file is missing' });
    }

    // Destructure job data from request body
    const { companyName, jobTitle, minPrice, maxPrice, salaryType, jobLocation, postingDate, experienceLevel, employmentType, description, companyId } = req.body;

    // Prepare job data
    const jobData = {
      companyName,
      jobTitle,
      companyLogo: `/uploads/${req.file.filename}`,
      minPrice,
      maxPrice,
      salaryType,
      jobLocation,
      postingDate,
      experienceLevel,
      employmentType,
      description,
      companyId
    };

    // Save the job
    const job = new Job(jobData);
    await job.save();

    // Send response
    res.status(201).json(job);
  } catch (error) {
    console.error('Error posting job:', error.message);
    res.status(500).json({ message: 'Internal server error' });
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
    // Fetch all jobs from the database
    const jobs = await Job.find().populate('companyId'); // Populate companyId if it's a reference

    if (jobs.length === 0) {
      return res.status(404).json({ message: 'No jobs found' });
    }

    res.status(200).json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Internal server error' });
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

    // Parse companyId into an object (assuming the companyId is sent as a stringified object)
    const companyId = JSON.parse(formData.companyId);

    // Save the application
    const resumePath = req.file ? `/uploads/${req.file.filename}` : '';

    const application = new Application({
      ...formData,
      resume: resumePath,
      companyId, // Store the company object directly
      jobId: formData.jobId, // Store the job ID
    });

    await application.save();

    // Fetch the job details to get the job title and company name
    const job = await Job.findById(formData.jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Email configuration
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

    res.status(201).json({ message: 'Application submitted successfully and email sent.' });
  } catch (err) {
    console.error('Error submitting application:', err);
    res.status(400).json({ error: err.message });
  }
});




//Application Display
app.get('/applications', async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ message: 'Company ID is required.' });
    }

    console.log(`Fetching applications for companyId: ${companyId}`);

    // Find the applications associated with the company
    const applications = await Application.find({ 'companyId._id': companyId })
      .populate('jobId', 'jobTitle');  // Populate the jobTitle from the Job schema

    console.log(`Found ${applications.length} applications`);

    // Map through applications to add the jobTitle to the response
    const updatedApplications = applications.map(application => ({
      ...application.toObject(),
      jobTitle: application.jobId ? application.jobId.jobTitle : 'Job not found',
    }));

    res.status(200).json(updatedApplications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/send-interview-invite', async (req, res) => {
  try {
    const { applicantEmail, interviewDateTime, jobId } = req.body;

    // Log for debugging
    console.log('Received applicant email:', applicantEmail);
    console.log('Received interviewDateTime:', interviewDateTime);
    console.log('Received jobId:', jobId);

    if (!applicantEmail || !interviewDateTime || !jobId) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Fetch job details to get job title and company name
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Log the job details for debugging
    console.log('Job details:', job);

    const formattedDateTime = new Date(interviewDateTime).toLocaleString();

    // Create transporter for sending email (similar to the working example)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Gmail service
      auth: {
        user: process.env.EMAIL, // Your email
        pass: process.env.PASSWORD, // Your email password or app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: applicantEmail,
      subject: `Interview Invitation for ${job.jobTitle}`,
      text: `Dear Applicant,\n\nWe are pleased to invite you to an interview for the ${job.jobTitle} position at ${job.companyName}. The interview is scheduled for ${formattedDateTime}.\n\nBest Regards,\n${job.companyName} Team`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Send success response
    res.status(200).json({ message: 'Interview invite sent successfully.' });
  } catch (err) {
    // Log full error details for debugging
    console.error('Error sending interview invite:', err);  // Log the complete error object
    res.status(500).json({ error: 'Failed to send interview invite. Please try again later.' });
  }
});


// Route to upload PDF and extract content

app.post('/courses', upload.fields([{ name: 'courseMaterials', maxCount: 10 }, { name: 'courseLogo', maxCount: 1 }]), async (req, res) => {
  try {
    if (!req.files.courseLogo) {
      throw new Error('Course logo file is missing');
    }
    if (!req.files.courseMaterials) {
      throw new Error('Course materials files are missing');
    }

    // Validate paymentFee
    const paymentFee = parseFloat(req.body.paymentFee);
    if (isNaN(paymentFee)) {
      throw new Error('Payment fee is invalid or missing');
    }

    const mcqQuestions = JSON.parse(req.body.mcqQuestions);

    const courseData = {
      courseName: req.body.courseName,
      courseTutor: req.body.courseTutor,
      courseDifficulty: req.body.courseDifficulty,
      paymentFee, // Store the payment fee as a number
      courseDescription: req.body.courseDescription,
      courseLogo: `/uploads/${req.files.courseLogo[0].filename}`,
      courseMaterials: req.files.courseMaterials.map(file => `/uploads/${file.filename}`),
      mcqQuestions
    };

    const course = new Course(courseData);
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error('Error posting course:', error.message);
    res.status(500).json({ message: error.message });
  }
});



app.get('/coursesm', async (req, res) => {
  try {
    const courses = await Course.find({courseId:req.body._id});
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

//Endpoint to generate questions
app.post('/generate-questions', async (req, res) => {
  const { courseMaterial } = req.body;
  if (!courseMaterial) {
    return res.status(400).json({ error: 'Course material is required' });
  }

  try {
    const response = await axios.post(
      AI_API_URL,
      {
        model: 'text-davinci-003',
        prompt: `Generate 5 quiz questions and 4 options for each question based on the following course material:\n${courseMaterial}`,
        max_tokens: 1500,
        n: 1,
        stop: ["\n\n"],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AI_API_KEY}`,
        },
      }
    );

    const data = response.data.choices[0].text.trim();
    const questions = data.split('\n\n').map((q, index) => {
      const parts = q.split('\n');
      return {
        id: `question-${index}`,
        text: parts[0],
        options: parts.slice(1),
      };
    });

    res.json(questions);
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions from material.' });
  }
});



// const extractTextFromPDF = async (filePath) => {
//   const dataBuffer = fs.readFileSync(filePath);
//   const data = await pdf(dataBuffer);
//   return data.text;
// };

// app.post('/generate-questions', async (req, res) => {
//   try {
//     const { courseMaterials } = req.body;
//     const textContent = await extractTextFromPDF(courseMaterials[0]); // Assuming single PDF for simplicity

//     const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
//       prompt: `Generate 5 MCQ questions from the following text:\n\n${textContent}`,
//       max_tokens: 1000,
//       n: 5,
//       stop: ["\n\n"]
//     }, {
//       headers: {
//         'Authorization': `Bearer YOUR_OPENAI_API_KEY`
//       }
//     });

//     const questions = response.data.choices.map(choice => choice.text);
//     res.status(200).json({ questions });
//   } catch (error) {
//     console.error('Error generating questions:', error);
//     res.status(500).json({ message: error.message });
//   }
// });







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
app.post('/getProfile', async (req, res) => {
  const { email } = req.body;
  try {
    const profile = await Profile.findOne({ email });
    if (profile) {
      res.json({ profile });
    } else {
      res.status(404).json({ message: 'Profile not found' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update profile
app.post('/saveProfile', async (req, res) => {
  const { name, email, phoneNumber, linkedIn, dob } = req.body;
  try {
    const existingProfile = await Profile.findOne({ email });
    if (existingProfile) {
      // Update existing profile
      existingProfile.name = name;
      existingProfile.phoneNumber = phoneNumber;
      existingProfile.linkedIn = linkedIn;
      existingProfile.dob = dob;
      await existingProfile.save();
    } else {
      // Create new profile
      const newProfile = new Profile({ name, email, phoneNumber, linkedIn, dob });
      await newProfile.save();
    }
    res.json({ message: 'Profile saved successfully' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server started at port number ${PORT}`);
});
