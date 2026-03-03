import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserIdChangeModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [newUserId, setNewUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [changeHistory, setChangeHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch change history when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchChangeHistory();
    }
  }, [isOpen]);

  const fetchChangeHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/id-change-history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setChangeHistory(data.data);
      }
    } catch (error) {
      console.error('Error fetching change history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/change-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newUserId })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('User ID changed successfully! Your session has been updated.');
        
        // Update the user context with new data and token
        updateUser(data.data.user, data.data.token);
        
        // Reset form
        setNewUserId('');
        
        // Refresh change history
        fetchChangeHistory();
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(data.message || 'Failed to change user ID');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextChangeDate = () => {
    if (!changeHistory?.nextChangeAvailable) return null;
    return new Date(changeHistory.nextChangeAvailable).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-morphism w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-2xl font-bold text-zinc-100">Change User ID</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current User ID */}
          <div className="mb-6">
            <label className="block text-zinc-400 text-sm mb-2">Current User ID</label>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3">
              <p className="text-zinc-100 font-mono">{user?.id}</p>
            </div>
          </div>

          {/* Change History */}
          {historyLoading ? (
            <div className="mb-6 text-center">
              <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin mx-auto mb-2" />
              <p className="text-zinc-400">Loading change history...</p>
            </div>
          ) : changeHistory && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-zinc-100">Change History</h3>
                <div className="flex items-center space-x-2">
                  {changeHistory.canChange ? (
                    <span className="flex items-center text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {2 - changeHistory.changesInLast14Days} changes available
                    </span>
                  ) : (
                    <span className="flex items-center text-orange-400 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      Available on {getNextChangeDate()}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-zinc-800/30 rounded-lg p-4">
                <div className="text-sm text-zinc-400 mb-2">
                  Changes in last 14 days: {changeHistory.changesInLast14Days} / 2
                </div>
                
                {changeHistory.recentChanges.length > 0 && (
                  <div className="space-y-2">
                    {changeHistory.recentChanges.map((change) => (
                      <div key={change.id} className="flex items-center justify-between text-sm">
                        <span className="text-zinc-300">
                          {change.oldId} → {change.newId}
                        </span>
                        <span className="text-zinc-500">
                          {formatDate(change.changedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Change Form */}
          {changeHistory?.canChange ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="newUserId" className="block text-zinc-400 text-sm mb-2">
                  New User ID
                </label>
                <input
                  type="text"
                  id="newUserId"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  className="glass-input w-full"
                  placeholder="Enter new user ID (3-50 characters)"
                  pattern="^[a-zA-Z][a-zA-Z0-9_-]{2,49}$"
                  required
                />
                <p className="text-zinc-500 text-xs mt-2">
                  Must be 3-50 characters, start with a letter, and contain only letters, numbers, underscores, and hyphens.
                </p>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 flex items-center space-x-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !newUserId.trim()}
                className="glass-button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Changing User ID...</span>
                  </div>
                ) : (
                  'Change User ID'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                Change Limit Reached
              </h3>
              <p className="text-zinc-400 mb-4">
                You have reached the maximum limit of 2 user ID changes per 14 days.
              </p>
              {changeHistory?.nextChangeAvailable && (
                <p className="text-zinc-500">
                  You can change your user ID again on {getNextChangeDate()}.
                </p>
              )}
            </div>
          )}

          {/* Important Notice */}
          <div className="mt-6 p-4 bg-zinc-800/30 border border-zinc-700 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-zinc-400">
                <p className="font-medium text-zinc-300 mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>You can change your user ID only 2 times every 14 days</li>
                  <li>User ID must be unique and not already taken</li>
                  <li>Your session will be automatically updated after change</li>
                  <li>Old user ID cannot be reused by anyone else</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserIdChangeModal;
