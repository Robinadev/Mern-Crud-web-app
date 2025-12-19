import React, { useEffect, useState } from 'react';
import { userAPI } from '../services/api';
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaCity,
  FaVenusMars,
  FaChartLine
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await userAPI.getUserStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('500', '100')}`}>
          <Icon className="text-2xl" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={FaUsers}
          color="border-blue-500"
        />
        <StatCard
          title="Active Users"
          value={stats?.activeUsers || 0}
          icon={FaUserCheck}
          color="border-green-500"
          subtext={`${stats?.activeUsers || 0}/${stats?.totalUsers || 0} users`}
        />
        <StatCard
          title="Inactive Users"
          value={stats?.inactiveUsers || 0}
          icon={FaUserTimes}
          color="border-red-500"
        />
        <StatCard
          title="Gender Diversity"
          value={stats?.usersByGender?.length || 0}
          icon={FaVenusMars}
          color="border-purple-500"
          subtext="Gender categories"
        />
      </div>

      {/* Gender Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaVenusMars className="mr-2" /> Gender Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats?.usersByGender?.map((gender) => (
            <div key={gender._id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {gender._id || 'Not specified'}
                </span>
                <span className="text-lg font-bold text-gray-900">{gender.count}</span>
              </div>
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(gender.count / stats.totalUsers) * 100}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {((gender.count / stats.totalUsers) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Cities */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <FaCity className="mr-2" /> Top Cities
        </h3>
        <div className="space-y-4">
          {stats?.topCities?.map((city, index) => (
            <div key={city._id} className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-4">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{city._id}</span>
                  <span className="text-sm font-bold text-gray-900">{city.count} users</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${(city.count / Math.max(...stats.topCities.map(c => c.count))) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update Button */}
      <div className="text-center">
        <button
          onClick={fetchStats}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaChartLine className="mr-2" />
          Refresh Statistics
        </button>
      </div>
    </div>
  );
};

export default StatsDashboard;