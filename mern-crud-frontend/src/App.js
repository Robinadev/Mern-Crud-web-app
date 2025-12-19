import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { FaPlus, FaChartBar, FaUsers, FaDatabase } from 'react-icons/fa';
import UserForm from './components/UserForm';
import UserTable from './components/UserTable';
import StatsDashboard from './components/StatsDashboard';
import { userAPI } from './services/api';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'stats'

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDeleteUser = async (id) => {
    try {
      await userAPI.deleteUser(id);
      setUsers(users.filter(user => user._id !== id));
    } catch (error) {
      throw error;
    }
  };

  const handleViewUser = (user) => {
    alert(`User Details:\n\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nPhone: ${user.phone}\nAddress: ${user.address}, ${user.city}, ${user.state} ${user.zipCode}\nGender: ${user.gender}\nDate of Birth: ${new Date(user.dateOfBirth).toLocaleDateString()}`);
  };

  const handleFormSuccess = () => {
    fetchUsers();
    setShowForm(false);
    setEditingUser(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <FaDatabase className="text-3xl text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">MERN CRUD Manager</h1>
                <p className="text-gray-600">Full-stack user management system</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'stats' : 'table')}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {viewMode === 'table' ? (
                  <>
                    <FaChartBar className="mr-2" /> View Stats
                  </>
                ) : (
                  <>
                    <FaUsers className="mr-2" /> View Users
                  </>
                )}
              </button>
              
              <button
                onClick={handleCreateUser}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="mr-2" /> Add New User
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex space-x-2 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaUsers className="inline mr-2" /> Users
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaChartBar className="inline mr-2" /> Statistics
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 animate-slide-down">
            <UserForm
              user={editingUser}
              onSuccess={handleFormSuccess}
              onCancel={handleCancelForm}
              isEditing={!!editingUser}
            />
          </div>
        )}

        {/* Content based on active tab and view mode */}
        {activeTab === 'users' ? (
          viewMode === 'table' ? (
            <UserTable
              users={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onView={handleViewUser}
              loading={loading}
            />
          ) : (
            <StatsDashboard />
          )
        ) : (
          <StatsDashboard />
        )}

        {/* Quick Stats */}
        {!showForm && activeTab === 'users' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow text-center">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow text-center">
              <div className="text-2xl font-bold text-red-600">
                {users.filter(u => !u.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Inactive Users</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow text-center">
              <div className="text-2xl font-bold text-purple-600">
                {[...new Set(users.map(u => u.city))].length}
              </div>
              <div className="text-sm text-gray-600">Cities</div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-600">
            <p>MERN CRUD Application | Backend: MongoDB Atlas + Vercel | Frontend: React + Vercel</p>
            <p className="mt-2 text-sm">
              {process.env.REACT_APP_API_URL?.includes('localhost') 
                ? 'Development Mode' 
                : 'Production Mode'}
            </p>
          </div>
        </div>
      </footer>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;