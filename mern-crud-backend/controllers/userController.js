import User from '../models/Users.js';
import asyncHandler from 'express-async-handler'; // Add this import

// @desc    Create a new user
// @route   POST /api/users
// @access  Public
export const createUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'User with this email already exists'
    });
  }
  
  // Create user
  const user = await User.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user
  });
});

// @desc    Get all users with pagination, filtering, and sorting
// @route   GET /api/users
// @access  Public
export const getAllUsers = asyncHandler(async (req, res) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  // Filtering
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.city) filter['address.city'] = req.query.city;
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  // Sorting
  const sort = {};
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',');
    sortBy.forEach(sortField => {
      const [field, order] = sortField.split(':');
      sort[field] = order === 'desc' ? -1 : 1;
    });
  } else {
    sort.createdAt = -1;
  }
  
  // Execute query with pagination
  const [users, total] = await Promise.all([
    User.find(filter)
      .sort(sort)
      .limit(limit)
      .skip(startIndex)
      .select('-__v'),
    User.countDocuments(filter)
  ]);
  
  // Pagination result
  const pagination = {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
  
  res.status(200).json({
    success: true,
    count: users.length,
    pagination,
    data: users
  });
});

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-__v');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Public
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Check if email is being changed and if new email already exists
  if (req.body.email && req.body.email !== user.email) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use'
      });
    }
  }
  
  // Update user
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).select('-__v');
  
  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Public
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  await user.deleteOne();
  
  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: { id: req.params.id }
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Public
export const getUserStats = asyncHandler(async (req, res) => {
  // Check if status field exists in schema
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgAge: { $avg: '$age' }
      }
    },
    {
      $group: {
        _id: null,
        totalUsers: { $sum: '$count' },
        statusStats: { $push: '$$ROOT' },
        averageAge: { $avg: '$avgAge' }
      }
    },
    {
      $project: {
        _id: 0,
        totalUsers: 1,
        averageAge: { $round: ['$averageAge', 1] },
        statusStats: 1
      }
    }
  ]);
  
  const cityStats = await User.aggregate([
    { $group: { _id: '$address.city', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);
  
  // Handle empty stats
  const result = stats[0] || { totalUsers: 0, averageAge: 0, statusStats: [] };
  
  res.status(200).json({
    success: true,
    data: {
      ...result,
      topCities: cityStats
    }
  });
});