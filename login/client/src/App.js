import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';

import Home from './Components/Home';
import Home1 from './Components/Home1';
import Login from './Components/Login';
import Signup from './Components/Signup';
import Dashboard from './Components/Dashboard';
import Error from './Components/Error';
import Option from './Components/option';
import Card from './Components/Card';
import jobs from './Components/jobs';
import ForgotPassword from './Components/ForgotPassword/forgotpassword';
import VerifyCode from './Components/ForgotPassword/verifycode';
import ResetPassword from './Components/ForgotPassword/resetpassword';
import JobPostingForm from './Components/JobPostingForm';
import Admin from './Components/admin/Admin';
import UserDetails from './Components/admin/UserDetails';
import UpdateUser from './Components/admin/UpdateUser';
import Header1 from './Components/Header1';
import AddCompany from './Components/admin/AddCompany';
import CompanyHome from './Components/company/CompanyHome';
import ViewJobs from './Components/company/ViewJobs';
import ChangePassword from './Components/company/ChangePassword';
import JobDisplay from './Components/JobDisplay';
import ApplicationForm from './Components/ApplicationForm';
import EditJob from './Components/company/EditJob';
import AddCourseProvider from './Components/admin/AddCourseProvider';
import Course from './Components/course provider/course';
import PostCourse from './Components/course provider/PostCourse';
import ProtectedRoute from './Components/ProtectedRoute';
import Dashboard1 from './Components/Dashboard1';
import Header from './Components/Header';
import CourseList from './Components/CourseList';
import CourseDetails from './Components/CourseDetails';
import GenerateQuestions from './Components/GenerateQuestions';
import CourseList1 from './Components/CourseList1';
import Certificate from './Components/Certificate';
import Payment from './Components/Payment';
// import Profile from './Components/Profile';
// import Profile1 from './Components/Profile1';
import { QuestionProvider } from './Components/course provider/QuestionContext';
import DateTimeModal from './Components/company/DateTimeModal';
import AddTest from './Components/company/AddTest';
import TestDisplay from './Components/TestDisplay';
import JobTitles from './Components/JobTitle';
import ApplicationDisplay from './Components/company/ApplicationiDisplay';
import HighScorers from './Components/company/HighScorers';
import ProfilePage from './Components/ProfilePage';
import Feedback from './Components/Feedback';
import Review from './Components/admin/Review';
import SelectedCandidates from './Components/company/SelectedCandidates';
import CourseDisplay from './Components/course provider/CourseDisplay';
import ApplicationView from './Components/ApplicationView';
import Chatbot from './Components/ChatBot';
import Status from './Components/admin/Status';
import AtsChecker from './Components/AtsChecker';
import Interview from './Components/Interview';
import AdminRoute from './Components/AdminRoute';

function App() {
  return (
    <QuestionProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Error />} />
        <Route path="/option" element={<Option />} />
        <Route path="/resetpass" element={<ResetPassword />} />
        <Route path="/jobs" element={<jobs />} />
        <Route path="/card" element={<Card />} />
        <Route path="/forgotpass" element={<ForgotPassword />} />
        <Route path="/verifycode" element={<VerifyCode />} />
        <Route path="/jobposting" element={<JobPostingForm />} />
        <Route path="/updateuser" element={<UpdateUser />} />
        <Route path="/home1" element={<ProtectedRoute><Home1 /></ProtectedRoute>} />
        <Route path="/header1" element={<Header1 />} />
        <Route path="/companyhome" element={<ProtectedRoute><CompanyHome /></ProtectedRoute>} />
        <Route path="/viewjobs" element={<ViewJobs />} />
        <Route path="/changepassword" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
        <Route path="/job/:jobId" element={<JobDisplay />} />
        <Route path="/applicationform" element={<ApplicationForm />} />
        <Route path="/editjob" element={<EditJob />} />
        <Route path="/course" element={<ProtectedRoute><Course /></ProtectedRoute>} />
        <Route path="/postcourse" element={<PostCourse />} />
        <Route path="/dashboard1" element={<Dashboard1 />} />
        <Route path="/header" element={<ProtectedRoute><Header /></ProtectedRoute>} />
        <Route path="/courselist" element={<CourseList />} /> 
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/generatequestions/:id" element={<GenerateQuestions />} />
        <Route path="/courselist1" element={<CourseList1/>}/>
        <Route path="/certificate/:id" element={<Certificate />} />
        <Route path="/payment" element={<Payment/>}/>
        {/* <Route path="/profile" element={<Profile/>}/>
        <Route path="/profile1" element={<Profile1/>}/> */}
        <Route path="/applicationd" element={<ApplicationDisplay />} />
        <Route path="/datetime" element={<DateTimeModal />} />
        <Route path="/addtest" element={<AddTest />} />
        <Route path="/test/:jobTitle" element={<TestDisplay />} />
        <Route path="/jobtitles" element={<JobTitles />} />
        <Route path="/highscorers" element={<HighScorers />} />
        <Route path="/profilepage" element={<ProfilePage />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/selectedcandidate" element={<SelectedCandidates />} />
        <Route path="/coursedisplay" element={<CourseDisplay />} />
        <Route path="/applicationview" element={<ApplicationView />} />
        <Route path="/Chatbot" element={<Chatbot />}/>
        <Route path="/AtsChecker" element={<AtsChecker />} />
        <Route path="/interview" element={<Interview />} />

        {/* ADMIN */}
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/addcompany" element={<AdminRoute><AddCompany /></AdminRoute>} />
        <Route path="/userdetails" element={<AdminRoute><UserDetails /></AdminRoute>} />
        <Route path="/status" element={<AdminRoute><Status /></AdminRoute>} />
        <Route path="/review" element={<AdminRoute><Review /></AdminRoute>} />
        <Route path="/addcourseprovider" element={<AdminRoute><AddCourseProvider /></AdminRoute>} />

        
      </Routes>
    </QuestionProvider>
  );
}

export default App;
