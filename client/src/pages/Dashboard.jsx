import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, LogOut, Shield, Settings, Edit3, Camera, MapPin, Github, Twitter, Linkedin, Globe, Circle } from 'lucide-react';
import UserIdChangeModal from '../components/UserIdChangeModal';
import ProfilePhotoUploadModal from '../components/ProfilePhotoUploadModal';
import EditProfileModal from '../components/EditProfileModal';

const Dashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const [showUserIdModal, setShowUserIdModal] = useState(false);
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const handleProfilePhotoUpdate = (newPhotoUrl) => {
    // Update user in context if available
    if (updateUser) {
      updateUser({ ...user, profilePhoto: newPhotoUrl });
    }
  };

  const handleProfileUpdate = (updatedData) => {
    // Update user in context if available
    if (updateUser) {
      updateUser({ ...user, ...updatedData });
    }
  };

  const handleOnlineStatusToggle = async () => {
    // Update online status
    const newStatus = !user.isOnline;
    if (updateUser) {
      updateUser({ ...user, isOnline: newStatus, lastActive: new Date() });
    }
    
    // Also update on server
    try {
      const response = await fetch('http://localhost:5000/api/user/online-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isOnline: newStatus })
      });
      
      if (!response.ok) {
        console.error('Failed to update online status on server');
        // Revert the local change if server update fails
        if (updateUser) {
          updateUser({ ...user, isOnline: !newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating online status:', error);
      // Revert the local change if server update fails
      if (updateUser) {
        updateUser({ ...user, isOnline: !newStatus });
      }
    }
  };

  const handleLogout = () => {
    logout();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="glass-morphism p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-100 text-4xl font-bold shadow-xl border border-zinc-700 overflow-hidden">
                {user?.profilePhoto ? (
                  <img 
                    src={`http://localhost:5000${user.profilePhoto}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <button
                onClick={() => setShowProfilePhotoModal(true)}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors shadow-lg"
                title="Change profile photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            {/* Profile Information */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-zinc-100">{user?.name}</h1>
                {/* Online Status Indicator */}
                <button
                  onClick={handleOnlineStatusToggle}
                  className="relative flex h-3 w-3 transition-colors"
                  title={user?.isOnline ? 'Click to go offline' : 'Click to go online'}
                >
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${user?.isOnline ? 'bg-green-400' : 'bg-gray-400'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${user?.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                </button>
              </div>
              
              <p className="text-zinc-400 text-lg mb-2">@{user?.username || user?.email?.split('@')[0]}</p>
              
              {user?.bio && (
                <p className="text-zinc-300 italic mb-4 text-lg">"{user.bio}"</p>
              )}

              <div className="flex flex-wrap gap-4 mb-4">
                {user?.location && (
                  <div className="flex items-center text-zinc-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>

              {/* Social Accounts */}
              <div className="flex space-x-3 mb-4">
                {user?.github && (
                  <a 
                    href={`https://github.com/${user.github}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {user?.twitter && (
                  <a 
                    href={`https://twitter.com/${user.twitter}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {user?.linkedin && (
                  <a 
                    href={`https://linkedin.com/in/${user.linkedin}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {user?.website && (
                  <a 
                    href={user.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    title="Website"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={() => setShowEditProfileModal(true)}
                className="glass-button-secondary flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Logout Button */}
            <div className="flex-shrink-0">
              <button
                onClick={handleLogout}
                className="glass-button-secondary flex items-center space-x-2"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-morphism p-6 card-hover">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <User className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Account Type</p>
                <p className="text-zinc-100 font-semibold">Premium User</p>
              </div>
            </div>
          </div>

          <div className="glass-morphism p-6 card-hover">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <Shield className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Account Status</p>
                <p className="text-zinc-100 font-semibold">Verified</p>
              </div>
            </div>
          </div>

          <div className="glass-morphism p-6 card-hover">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <Calendar className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Member Since</p>
                <p className="text-zinc-100 font-semibold">
                  {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div className="glass-morphism p-6">
            <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center space-x-2">
              <User className="w-6 h-6" />
              <span>Profile Information</span>
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-zinc-400 text-sm">Full Name</label>
                <p className="text-zinc-100 font-medium">{user?.name || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="text-zinc-400 text-sm">Email Address</label>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-zinc-500" />
                  <p className="text-zinc-100 font-medium">{user?.email || 'Not provided'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-zinc-400 text-sm">User ID</label>
                <div className="flex items-center space-x-2">
                  <p className="text-zinc-500 font-mono text-sm flex-1">{user?.id || 'Not available'}</p>
                  <button
                    onClick={() => setShowUserIdModal(true)}
                    className="text-zinc-400 hover:text-zinc-100 transition-colors p-1"
                    title="Change User ID"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-morphism p-6">
            <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center space-x-2">
              <Settings className="w-6 h-6" />
              <span>Quick Actions</span>
            </h2>
            
            <div className="space-y-3">
              <button 
                onClick={() => setShowUserIdModal(true)}
                className="glass-button-secondary w-full flex items-center justify-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Change User ID</span>
              </button>
              
              <button className="glass-button-secondary w-full flex items-center justify-center space-x-2">
                <User className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              
              <button 
                onClick={() => setShowProfilePhotoModal(true)}
                className="glass-button-secondary w-full flex items-center justify-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Change Profile Photo</span>
              </button>
              
              <button className="glass-button-secondary w-full flex items-center justify-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Security Settings</span>
              </button>
              
              <button className="glass-button-secondary w-full flex items-center justify-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Preferences</span>
              </button>
            </div>
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="glass-morphism p-8 mt-8">
          <h2 className="text-2xl font-bold text-zinc-100 mb-6">Dashboard Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-800/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-zinc-100 text-2xl">📊</span>
              </div>
              <h3 className="text-zinc-100 font-semibold mb-1">Analytics</h3>
              <p className="text-zinc-400 text-sm">View your activity and statistics</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-800/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-zinc-100 text-2xl">🔔</span>
              </div>
              <h3 className="text-zinc-100 font-semibold mb-1">Notifications</h3>
              <p className="text-zinc-400 text-sm">Stay updated with latest news</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-800/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-zinc-100 text-2xl">💾</span>
              </div>
              <h3 className="text-zinc-100 font-semibold mb-1">Storage</h3>
              <p className="text-zinc-400 text-sm">Manage your files and data</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-800/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-zinc-100 text-2xl">🎯</span>
              </div>
              <h3 className="text-zinc-100 font-semibold mb-1">Goals</h3>
              <p className="text-zinc-400 text-sm">Track your progress and achievements</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* User ID Change Modal */}
      <UserIdChangeModal 
        isOpen={showUserIdModal} 
        onClose={() => setShowUserIdModal(false)} 
      />
      
      {/* Profile Photo Upload Modal */}
      <ProfilePhotoUploadModal
        isOpen={showProfilePhotoModal}
        onClose={() => setShowProfilePhotoModal(false)}
        currentPhoto={user?.profilePhoto}
        onPhotoUpdate={handleProfilePhotoUpdate}
      />
      
      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        user={user}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default Dashboard;
