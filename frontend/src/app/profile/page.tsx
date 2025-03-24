'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../firebase/config';
import { doc, getDoc, updateDoc, setDoc, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { 
  Loader2, 
  Save, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit2, 
  X, 
  Check, 
  RefreshCcw,
  Brain,
  Code,
  Cpu,
  Terminal,
  Sparkles
} from 'lucide-react';

interface UserProfile {
  displayName: string;
  email: string;
  contact: string;
  createdAt: any; // Changed to accept either Timestamp or string
  provider: string;
  uid: string;
  photoURL?: string;
  problemsSolved?: number;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    contact: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeModel, setActiveModel] = useState('llama3');
  
  const router = useRouter();

  // Model data for the Ollama models section
  const modelData = {
    llama3: {
      name: "Llama 3",
      description: "Meta's cutting-edge foundation model optimized for both reasoning and generation tasks with exceptional performance.",
      parameters: "8B/70B",
      strengths: "Versatile text generation, coding, reasoning, and creative tasks",
      icon: <Brain className="h-7 w-7 text-purple-400" />
    },
    codegemma: {
      name: "CodeGemma",
      description: "Specialized for code generation with superior understanding of programming syntax and patterns across multiple languages.",
      parameters: "7B",
      strengths: "Code completion, bug fixing, documentation, and test generation",
      icon: <Code className="h-7 w-7 text-emerald-400" />
    },
    gemma: {
      name: "Gemma",
      description: "Google's lightweight, efficient model designed for a balance of intelligence and computational efficiency.",
      parameters: "7B/9B",
      strengths: "Balanced performance for text analysis, content generation, and reasoning",
      icon: <Sparkles className="h-7 w-7 text-amber-400" />
    },
    mistral: {
      name: "Mistral",
      description: "Highly efficient model with strong reasoning capabilities and breakthrough attention mechanisms.",
      parameters: "7B",
      strengths: "Logical reasoning, instruction following, and knowledge synthesis",
      icon: <Cpu className="h-7 w-7 text-cyan-400" />
    }
  };

  useEffect(() => {
    // Set up an auth state listener to handle page refreshes properly
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserProfile(currentUser.uid);
      } else {
        setLoading(false);
        // If no user is logged in, redirect to login page
        router.push('/login');
      }
    });
    
    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, [router]);

  const fetchUserProfile = async (uid: string) => {
    try {
      setLoading(true);
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        let userData = userSnap.data() as UserProfile;
        
        // Ensure problemsSolved exists with a default value of 0
        if (userData.problemsSolved === undefined) {
          userData = {
            ...userData,
            problemsSolved: 0
          };
          
          // Update the profile in Firestore with the default value
          await updateDoc(userRef, {
            problemsSolved: 0
          });
        }
        
        // Ensure createdAt exists and is correctly formatted
        if (!userData.createdAt) {
          const createdAt = Timestamp.now();
          userData = {
            ...userData,
            createdAt
          };
          
          // Update the profile in Firestore with the timestamp
          await updateDoc(userRef, {
            createdAt
          });
        }
        
        setProfile(userData);
        setFormData({
          displayName: userData.displayName || '',
          contact: userData.contact || ''
        });
      } else {
        // If user document doesn't exist, create one with basic information
        if (user) {
          const newUserData: UserProfile = {
            displayName: user.displayName || '',
            email: user.email || '',
            contact: '',
            createdAt: Timestamp.now(),
            provider: user.providerData[0]?.providerId || 'email',
            photoURL: user.photoURL || '',
            uid: user.uid,
            problemsSolved: 0
          };
          
          await setDoc(userRef, newUserData);
          setProfile(newUserData);
          setFormData({
            displayName: newUserData.displayName,
            contact: newUserData.contact
          });
        } else {
          setError('User profile not found');
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        contact: formData.contact,
      });
      
      // Update local state
      setProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          displayName: formData.displayName,
          contact: formData.contact
        };
      });
      
      setSuccess('Profile updated successfully');
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        contact: profile.contact || ''
      });
    }
    setEditing(false);
    setError('');
    setSuccess('');
  };

  // Fixed date formatter function for handling both string and Timestamp
  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'Unknown';
    
    try {
      let date;
      
      // Check if dateValue is a Firestore Timestamp
      if (dateValue && typeof dateValue.toDate === 'function') {
        date = dateValue.toDate();
      } 
      // Check if dateValue is a standard Date object
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      // Try to parse as string
      else {
        date = new Date(dateValue);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // Format the date in a user-friendly way
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900">
        <div className="bg-black/30 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white/10 flex flex-col items-center">
          <Loader2 className="h-16 w-16 animate-spin text-cyan-400" />
          <p className="mt-6 text-indigo-200 font-medium">Establishing connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header with Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">NEXUS HIVE</h1>
          <h2 className="mt-2 text-xl font-medium text-white/80">Personal Configuration Portal</h2>
        </div>
        
        {/* Main Profile Container */}
        <div className="bg-black/30 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="px-6 py-5 border-b border-indigo-500/30 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
            <h3 className="text-xl font-semibold text-white">User Identity Module</h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-indigo-600/40 hover:bg-indigo-600/60 text-indigo-200 rounded-lg transition-all duration-200 flex items-center self-start sm:self-auto"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Modify Profile
              </button>
            )}
          </div>
          
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 m-4 rounded-md flex items-center">
              <X className="h-5 w-5 mr-2 text-red-400" />
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-900/50 border border-green-500 text-green-200 p-4 m-4 rounded-md flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-400" />
              <p>{success}</p>
            </div>
          )}
          
          <div className="px-6 py-6">
            {!editing ? (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                  <div className="h-28 w-28 bg-gradient-to-br from-cyan-500/80 to-indigo-600/80 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 md:mb-0 overflow-hidden border-2 border-white/10">
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <UserIcon className="h-14 w-14 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                      {profile?.displayName || 'Anonymous User'}
                    </h2>
                    <div className="flex items-center mt-2 text-indigo-300">
                      <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                      <p className="break-words">Connected since {profile?.createdAt ? formatDate(profile.createdAt) : 'Unknown date'}</p>
                    </div>
                    
                    {/* Display problems solved count */}
                    <div className="flex items-center mt-2 text-indigo-300">
                      <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                      <p>{profile?.problemsSolved !== undefined ? profile.problemsSolved : 0} algorithms processed</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-indigo-500/30 hover:border-indigo-500/50 transition-all duration-300">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-indigo-600/30 rounded-full flex items-center justify-center mr-4 flex-shrink-0 border border-indigo-500/30">
                        <UserIcon className="h-6 w-6 text-cyan-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-indigo-300">Identity Designation</p>
                        <p className="text-lg sm:text-xl font-semibold text-white truncate">{profile?.displayName || 'Not configured'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-indigo-500/30 hover:border-indigo-500/50 transition-all duration-300">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-indigo-600/30 rounded-full flex items-center justify-center mr-4 flex-shrink-0 border border-indigo-500/30">
                        <Mail className="h-6 w-6 text-cyan-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-indigo-300">Communication Channel</p>
                        <p className="text-lg sm:text-xl font-semibold text-white truncate">{profile?.email || 'Not available'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-indigo-500/30 hover:border-indigo-500/50 transition-all duration-300">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-indigo-600/30 rounded-full flex items-center justify-center mr-4 flex-shrink-0 border border-indigo-500/30">
                        <Phone className="h-6 w-6 text-cyan-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-indigo-300">Direct Connect</p>
                        <p className="text-lg sm:text-xl font-semibold text-white truncate">{profile?.contact || 'Not configured'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-indigo-500/30 hover:border-indigo-500/50 transition-all duration-300">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-indigo-600/30 rounded-full flex items-center justify-center mr-4 flex-shrink-0 border border-indigo-500/30">
                        <Shield className="h-6 w-6 text-cyan-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-indigo-300">Security Protocol</p>
                        <p className="text-lg sm:text-xl font-semibold text-white capitalize truncate">{profile?.provider || 'Standard'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="displayName" className="block text-sm font-medium text-indigo-200">
                        Identity Designation
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-indigo-400" />
                        </div>
                        <input
                          type="text"
                          id="displayName"
                          name="displayName"
                          value={formData.displayName}
                          onChange={handleInputChange}
                          className="pl-10 block w-full px-4 py-3 border border-indigo-500/30 bg-black/30 placeholder-indigo-300/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Your designation"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-indigo-200">
                        Communication Channel
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-indigo-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          value={profile?.email || ''}
                          disabled
                          className="pl-10 block w-full px-4 py-3 border border-indigo-500/30 bg-black/50 rounded-md cursor-not-allowed text-indigo-400"
                        />
                      </div>
                      <p className="mt-1 text-xs text-indigo-400">Channel cannot be reconfigured</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="contact" className="block text-sm font-medium text-indigo-200">
                        Direct Connect
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-indigo-400" />
                        </div>
                        <input
                          type="tel"
                          id="contact"
                          name="contact"
                          value={formData.contact}
                          onChange={handleInputChange}
                          className="pl-10 block w-full px-4 py-3 border border-indigo-500/30 bg-black/30 placeholder-indigo-300/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                          placeholder="Your contact frequency"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-indigo-200">
                        Security Protocol
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Shield className="h-5 w-5 text-indigo-400" />
                        </div>
                        <input
                          type="text"
                          value={profile?.provider || 'Standard'}
                          disabled
                          className="pl-10 block w-full px-4 py-3 border border-indigo-500/30 bg-black/50 rounded-md cursor-not-allowed text-indigo-400 capitalize"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 flex items-center justify-center flex-1 min-w-0 sm:flex-none sm:w-auto"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="animate-spin h-5 w-5 mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Save Configuration
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-6 py-3 border border-indigo-500/30 text-indigo-300 rounded-lg hover:bg-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center flex-1 min-w-0 sm:flex-none sm:w-auto"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Cancel
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => fetchUserProfile(user?.uid || '')}
                      className="px-4 py-3 border border-indigo-500/30 text-indigo-300 rounded-lg hover:bg-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center"
                    >
                      <RefreshCcw className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Ollama Models Section - Replaces Stats Card */}
        <div className="mt-8 relative">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-xl z-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute w-64 h-64 rounded-full bg-purple-600/20 blur-3xl -top-10 -left-10 animate-pulse"></div>
              <div className="absolute w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl -bottom-10 -right-10 animate-pulse" style={{ animationDelay: "1s" }}></div>
              <div className="absolute w-56 h-56 rounded-full bg-cyan-600/20 blur-3xl bottom-20 left-20 animate-pulse" style={{ animationDelay: "2s" }}></div>
            </div>
          </div>
          
          <div className="bg-black/40 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10 overflow-hidden p-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Neural Computation Engines</h3>
                <p className="text-indigo-300 text-sm mt-1">Advanced Ollama models powering the NEXUS HIVE intelligence core</p>
              </div>
              
              <div className="flex space-x-1 mt-4 md:mt-0 bg-black/30 p-1 rounded-lg border border-indigo-500/30">
                {Object.keys(modelData).map((model) => (
                  <button
                    key={model}
                    onClick={() => setActiveModel(model)}
                    className={`px-3 py-2 rounded-md transition-all duration-300 text-sm font-medium ${
                      activeModel === model
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-800/30"
                        : "text-indigo-300 hover:bg-indigo-800/20"
                    }`}
                  >
                    {modelData[model as keyof typeof modelData].name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Active model display */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-transparent rounded-xl"></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
                {/* Model visualization */}
                <div className="bg-gradient-to-br from-black/60 to-indigo-900/30 backdrop-blur-sm rounded-xl border border-indigo-500/30 p-6 col-span-1 lg:col-span-1 flex flex-col justify-between h-full relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="h-16 w-16 bg-gradient-to-br from-indigo-800/80 to-purple-900/80 rounded-xl flex items-center justify-center shadow-lg mb-4 border border-indigo-500/30">
                      {modelData[activeModel as keyof typeof modelData].icon}
                    </div>
                    
                    <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-2">
                      {modelData[activeModel as keyof typeof modelData].name}
                    </h4>
                    
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">Active</span>
                    </div>
                    
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent my-4"></div>
                    
                    <div className="text-sm text-indigo-300 mb-2">
                      <span className="font-semibold text-white">Parameters:</span> {modelData[activeModel as keyof typeof modelData].parameters}
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="h-2 bg-black/50 rounded-full mt-4 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full w-3/4 animate-pulse"></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-indigo-400">Neural throughput</span>
                      <span className="text-xs text-indigo-400">75%</span>
                    </div>
                  </div>
                  
                  {/* Animated particle effect */}
                  <div className="absolute bottom-0 left-0 w-full h-16 overflow-hidden opacity-30">
                    <div className="absolute w-1 h-1 bg-cyan-400 rounded-full bottom-8 left-10 animate-ping" style={{ animationDuration: "3s" }}></div>
                    <div className="absolute w-1 h-1 bg-indigo-400 rounded-full bottom-12 left-20 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}></div>
                    <div className="absolute w-1 h-1 bg-purple-400 rounded-full bottom-4 left-16 animate-ping" style={{ animationDuration: "4s", animationDelay: "1s" }}></div>
                    <div className="absolute w-1 h-1 bg-indigo-400 rounded-full bottom-10 left-24 animate-ping" style={{ animationDuration: "3.5s", animationDelay: "1.5s" }}></div>
                  </div>
                </div>
                
                {/* Model details - adjusted this section */}
                <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-indigo-500/30 p-6 col-span-1 lg:col-span-3">
                  <div className="relative">
                    {/* Neural network visualization */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="h-full w-full relative">
                        {/* Neural network nodes and connections - simplified representation */}
                        {[...Array(5)].map((_, i) => (
                          <div key={`line-${i}`} className="absolute h-px bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400" 
                               style={{ 
                                 width: `${Math.random() * 40 + 30}%`, 
                                 left: `${Math.random() * 60}%`, 
                                 top: `${i * 20 + 10}%`, 
                                 opacity: 0.3 
                               }} />
                        ))}
                        {[...Array(10)].map((_, i) => (
                          <div key={`node-${i}`} className="absolute h-2 w-2 rounded-full bg-indigo-400 animate-pulse" 
                               style={{ 
                                 left: `${Math.random() * 90}%`, 
                                 top: `${Math.random() * 90}%`, 
                                 animationDuration: `${Math.random() * 3 + 2}s` 
                               }} />
                        ))}
                      </div>
                    </div>
                    
                    <div className="relative z-10">
                      <h4 className="text-xl font-semibold text-white mb-4">Model Overview</h4>
                      
                      <p className="text-indigo-200 mb-6">
                        {modelData[activeModel as keyof typeof modelData].description}
                      </p>
                      
                      <div className="bg-black/30 rounded-lg p-4 border border-indigo-500/20 mb-6">
                        <h5 className="text-cyan-400 font-semibold mb-2">Key Capabilities</h5>
                        <p className="text-indigo-200">
                          {modelData[activeModel as keyof typeof modelData].strengths}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-black/30 rounded-lg p-4 border border-indigo-500/20">
                          <div className="flex items-center mb-2">
                            <Terminal className="h-5 w-5 text-cyan-400 mr-2" />
                            <h5 className="text-white font-medium">Interface Protocol</h5>
                          </div>
                          <p className="text-indigo-200 text-sm">
                            Direct terminal command access via Ollama API
                          </p>
                        </div>
                        
                        <div className="bg-black/30 rounded-lg p-4 border border-indigo-500/20">
                          <div className="flex items-center mb-2">
                            <Cpu className="h-5 w-5 text-cyan-400 mr-2" />
                            <h5 className="text-white font-medium">Local Processing</h5>
                          </div>
                          <p className="text-indigo-200 text-sm">
                            Secure on-device execution with privacy protection
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer with version info */}
        <div className="mt-8 text-center">
          <p className="text-indigo-400/60 text-sm">
            NEXUS HIVE v2.0.4 • Neural Interface Protocol • Secure Connection Active
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;