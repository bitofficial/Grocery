const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const userService = require('../services/userService');
const { validateRegister, validateLogin, validatePasswordChange, validateProfileUpdate } = require('../services/validators');

exports.register = async (req, res, next) => {
  try {
    const { error } = validateRegister(req.body);
    if (error) return res.status(400).json({ message: error });

    const { name, email, password, role = 'customer' } = req.body;
    const existing = await userService.findByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const id = uuidv4();
    const hashed = await bcrypt.hash(password, 10);
    const user = { id, name, email, password: hashed, role };
    await userService.addUser(user);

    return res.status(201).json({ message: 'Registered successfully', redirect: '/login' });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).json({ message: error });

    const { email, password } = req.body;
    const user = await userService.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    req.session.user = { id: user.id, email: user.email, role: user.role, name: user.name };
    return res.json({ message: 'Logged in', role: user.role, user: req.session.user });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out' });
  });
};

exports.session = (req, res) => {
  if (req.session?.user) {
    return res.json({ authenticated: true, user: req.session.user });
  }
  return res.json({ authenticated: false });
};

exports.changePassword = async (req, res, next) => {
  try {
    const { error } = validatePasswordChange(req.body);
    if (error) return res.status(400).json({ message: error });

    const { old_password, new_password } = req.body;
    const userId = req.session.user.id;
    const user = await userService.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(old_password, user.password);
    if (!ok) return res.status(400).json({ message: 'Old password is incorrect' });

    const hashed = await bcrypt.hash(new_password, 10);
    await userService.updatePassword(userId, hashed);
    return res.json({ message: 'Your password changed successfully' });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { error } = validateProfileUpdate(req.body);
    if (error) return res.status(400).json({ message: error });

    const userId = req.session.user.id;
    const { name, email } = req.body;
    
    const updatedUser = await userService.updateProfile(userId, { name, email });
    if (!updatedUser) return res.status(409).json({ message: 'Email already in use' });
    if (updatedUser === false) return res.status(404).json({ message: 'User not found' });

    // Update session with new user data
    req.session.user = { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role, name: updatedUser.name };
    return res.json({ message: 'Profile updated successfully', user: req.session.user });
  } catch (err) {
    next(err);
  }
};

