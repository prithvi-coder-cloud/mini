export const handleBackNavigation = (navigate) => {
  const userData = JSON.parse(sessionStorage.getItem('user'));
  
  if (userData) {
    if (userData.googleId) {
      navigate('/');
    } else if (userData.role === 'admin') {
      navigate('/admin');
    } else if (userData.role === 'company') {
      navigate('/companyhome');
    } else if (userData.role === 'course provider') {
      navigate('/course');
    } else {
      navigate('/Home1');
    }
  } else {
    navigate('/');
  }
}; 