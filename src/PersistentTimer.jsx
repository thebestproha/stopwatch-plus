import React, { useState, useEffect } from 'react';
import { Clock, Play, Pause, RotateCcw, User, LogOut } from 'lucide-react';
import './storage'; // Initialize storage

export default function PersistentTimer() {
  const [user, setUser] = useState(null);
  const [timers, setTimers] = useState([]);
  const [newTimerMinutes, setNewTimerMinutes] = useState('60');
  const [newTimerName, setNewTimerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Update timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateTimers();
    }, 1000);
    return () => clearInterval(interval);
  }, [timers]);

  const loadUserData = async () => {
    try {
      const userData = await window.storage.get('timer_user');
      if (userData) {
        const parsedUser = JSON.parse(userData.value);
        setUser(parsedUser);
        await loadTimers(parsedUser.email);
      }
    } catch (error) {
      console.log('No existing user session');
    }
    setLoading(false);
  };

  const loadTimers = async (email) => {
    try {
      // Try API first (for cross-device sync)
      const response = await fetch(`/api/timers?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setTimers(data.timers || []);
        return;
      }
    } catch (error) {
      console.log('API not available, using local storage');
    }
    
    // Fallback to localStorage
    try {
      const timerData = await window.storage.get(`timers_${email}`);
      if (timerData) {
        setTimers(JSON.parse(timerData.value));
      }
    } catch (error) {
      console.log('No timers found');
      setTimers([]);
    }
  };

  const saveTimers = async (updatedTimers) => {
    if (user) {
      // Save to localStorage (instant backup)
      try {
        await window.storage.set(`timers_${user.email}`, JSON.stringify(updatedTimers));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      
      // Save to API (for cross-device sync)
      try {
        await fetch(`/api/timers?email=${encodeURIComponent(user.email)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timers: updatedTimers })
        });
      } catch (error) {
        console.error('Error syncing to cloud:', error);
      }
    }
  };

  const updateTimers = () => {
    setTimers(prevTimers => {
      const now = Date.now();
      const updated = prevTimers.map(timer => {
        if (!timer.isRunning) return timer;
        
        const elapsed = now - timer.startTime;
        const remaining = Math.max(0, timer.totalDuration - elapsed);
        
        return {
          ...timer,
          remainingTime: remaining,
          isRunning: remaining > 0
        };
      });
      
      // Auto-save if there are changes
      if (JSON.stringify(updated) !== JSON.stringify(prevTimers)) {
        saveTimers(updated);
      }
      
      return updated;
    });
  };

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const email = loginEmail.trim();
    if (!email) {
      alert('Please enter an email address');
      return;
    }
    
    const userData = { 
      email: email.toLowerCase(), 
      name: email.split('@')[0] 
    };
    
    try {
      await window.storage.set('timer_user', JSON.stringify(userData));
      setUser(userData);
      await loadTimers(userData.email);
      setLoginEmail('');
      setShowLoginForm(false);
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving login: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await window.storage.delete('timer_user');
      setUser(null);
      setTimers([]);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const addTimer = () => {
    const minutes = parseInt(newTimerMinutes) || 60;
    if (minutes > 0 && newTimerName.trim()) {
      const now = Date.now();
      const newTimer = {
        id: now,
        name: newTimerName.trim(),
        totalDuration: minutes * 60 * 1000,
        remainingTime: minutes * 60 * 1000,
        startTime: now,
        isRunning: true
      };
      
      const updated = [...timers, newTimer];
      setTimers(updated);
      saveTimers(updated);
      setNewTimerMinutes('60');
      setNewTimerName('');
    }
  };

  const toggleTimer = (id) => {
    const updated = timers.map(timer => {
      if (timer.id !== id) return timer;
      
      if (timer.isRunning) {
        // Pause
        return {
          ...timer,
          isRunning: false
        };
      } else {
        // Start/Resume
        const now = Date.now();
        return {
          ...timer,
          isRunning: true,
          startTime: now - (timer.totalDuration - timer.remainingTime)
        };
      }
    });
    
    setTimers(updated);
    saveTimers(updated);
  };

  const resetTimer = (id) => {
    const updated = timers.map(timer => {
      if (timer.id !== id) return timer;
      return {
        ...timer,
        remainingTime: timer.totalDuration,
        startTime: null,
        isRunning: false
      };
    });
    
    setTimers(updated);
    saveTimers(updated);
  };

  const deleteTimer = (id) => {
    const updated = timers.filter(t => t.id !== id);
    setTimers(updated);
    saveTimers(updated);
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Clock className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Stopwatch Plus</h1>
            <p className="text-gray-600">Multiple timers that keep running in the background</p>
          </div>

          {!showLoginForm ? (
            <button
              onClick={() => setShowLoginForm(true)}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <User className="w-5 h-5" />
              Sign in with Email
            </button>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginForm(false);
                    setLoginEmail('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!loginEmail.trim()}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
          
          <p className="text-sm text-gray-500 mt-4 text-center">Demo mode - enter any email to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Stopwatch Plus</h1>
                <p className="text-sm text-gray-600">Signed in as {user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Add Timer */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Timer</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newTimerName}
              onChange={(e) => setNewTimerName(e.target.value)}
              placeholder="Timer name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="number"
              value={newTimerMinutes}
              onChange={(e) => setNewTimerMinutes(e.target.value)}
              placeholder="Minutes"
              min="1"
              className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              onClick={addTimer}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Add
            </button>
          </div>
        </div>

        {/* Timers List */}
        <div className="space-y-4">
          {timers.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No timers yet. Create one above!</p>
            </div>
          ) : (
            [...timers].sort((a, b) => {
              // Completed timers (remainingTime === 0) come first
              if (a.remainingTime === 0 && b.remainingTime !== 0) return -1;
              if (a.remainingTime !== 0 && b.remainingTime === 0) return 1;
              return 0;
            }).map(timer => (
              <div key={timer.id} className={`rounded-2xl shadow-lg p-6 ${
                timer.remainingTime === 0 
                  ? 'bg-red-50 border-4 border-red-500 animate-pulse' 
                  : 'bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${
                      timer.remainingTime === 0 ? 'text-red-700' : 'text-gray-800'
                    }`}>{timer.name}</h3>
                    <div className={`text-4xl font-mono font-bold ${
                      timer.remainingTime === 0 ? 'text-red-600' : 'text-indigo-600'
                    }`}>
                      {formatTime(timer.remainingTime)}
                    </div>
                    {timer.remainingTime === 0 && (
                      <p className="text-red-700 font-bold mt-2 text-lg">⏰ TIME'S UP!</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleTimer(timer.id)}
                      disabled={timer.remainingTime === 0}
                      className={`p-3 rounded-lg transition ${
                        timer.remainingTime === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : timer.isRunning
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {timer.isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={() => resetTimer(timer.id)}
                      className="p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    >
                      <RotateCcw className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => deleteTimer(timer.id)}
                      className="p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
