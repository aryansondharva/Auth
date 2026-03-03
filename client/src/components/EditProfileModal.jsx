import React, { useState } from 'react';
import { X, Save, User, MapPin, Github, Twitter, Linkedin, Globe, FileText, MessageSquare, Trophy } from 'lucide-react';

const EditProfileModal = ({ isOpen, onClose, user, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    bio: user?.bio || '',
    location: user?.location || '',
    github: user?.github || '',
    twitter: user?.twitter || '',
    linkedin: user?.linkedin || '',
    discord: user?.discord || '',
    leetcode: user?.leetcode || '',
    website: user?.website || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        onProfileUpdate(data.data.user);
        onClose();
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-morphism rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zinc-100">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Note about username */}
          <div className="bg-blue-900/20 border border-blue-500 text-blue-400 p-3 rounded-lg">
            <p className="text-sm">
              <strong>Username:</strong> @{user?.username || 'Auto-generated'} 
              <span className="text-xs ml-2">(Username is automatically generated from your name)</span>
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="flex items-center text-zinc-300 text-sm font-medium mb-2">
              <FileText className="w-4 h-4 mr-2" />
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
            <p className="text-zinc-500 text-xs mt-1">{formData.bio.length}/500 characters</p>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center text-zinc-300 text-sm font-medium mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Social Accounts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-100">Social Accounts</h3>
            
            {/* GitHub */}
            <div>
              <label className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                <Github className="w-4 h-4 mr-2" />
                GitHub Username
              </label>
              <input
                type="text"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="github-username"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Twitter */}
            <div>
              <label className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                <Twitter className="w-4 h-4 mr-2" />
                Twitter Username
              </label>
              <input
                type="text"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="twitter-username"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn Username
              </label>
              <input
                type="text"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="linkedin-username"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Discord */}
            <div>
              <label className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                <MessageSquare className="w-4 h-4 mr-2" />
                Discord Username
              </label>
              <input
                type="text"
                name="discord"
                value={formData.discord}
                onChange={handleChange}
                placeholder="discord-username"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* LeetCode */}
            <div>
              <label className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                <Trophy className="w-4 h-4 mr-2" />
                LeetCode Username
              </label>
              <input
                type="text"
                name="leetcode"
                value={formData.leetcode}
                onChange={handleChange}
                placeholder="leetcode-username"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Website */}
            <div>
              <label className="flex items-center text-zinc-300 text-sm font-medium mb-2">
                <Globe className="w-4 h-4 mr-2" />
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="glass-button-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
