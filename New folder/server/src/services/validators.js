function validateRegister(body) {
  const { name, email, password, role } = body;
  if (!name || !email || !password) return { error: 'Name, email and password are required' };
  if (password.length < 8 || password.length > 13) return { error: 'Password length must be 8-13 characters' };
  if (role && !['customer', 'admin'].includes(role)) return { error: 'Invalid role' };
  return { error: null };
}

function validateLogin(body) {
  const { email, password } = body;
  if (!email || !password) return { error: 'Email and password are required' };
  return { error: null };
}

function validatePasswordChange(body) {
  const { old_password, new_password, confirm_password } = body;
  if (!old_password || !new_password || !confirm_password) return { error: 'All fields are required' };
  if (new_password.length < 8 || new_password.length > 13) return { error: 'Password length must be 8-13 characters' };
  if (new_password !== confirm_password) return { error: 'password fields are not mathcing !!!' };
  return { error: null };
}

function validateProfileUpdate(body) {
  const { name, email } = body;
  if (!name && !email) return { error: 'Name or email is required' };
  if (name) {
    if (name.length < 2) return { error: 'Name must be at least 2 characters' };
    if (name.length > 50) return { error: 'Name must not exceed 50 characters' };
    if (!/^(?! )(?!.* {2})[A-Za-z]+(?: [A-Za-z]+)*$/.test(name)) return { error: 'Name can only contain letters, no leading or double spaces' };
  }
  if (email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address' };
  }
  return { error: null };
}

function validateProductCreateOrUpdate(body) {
  const { product_name, product_description, product_price, qty } = body;
  if (!product_name || !product_description || !String(product_name).trim() || !String(product_description).trim()) {
    return { error: 'Product name and description cannot be empty' };
  }
  // Product name must be letters and spaces only
  if (!/^[A-Za-z\s]+$/.test(String(product_name))) return { error: 'Product name can only contain letters and spaces' };
  const price = Number(product_price);
  if (!Number.isFinite(price) || price < 1) return { error: 'Price must be 1 or greater' };
  if (price > 10000) return { error: 'Price cannot exceed 10000' };
  const q = Number(qty || 0);
  if (!Number.isFinite(q) || q < 1) return { error: 'Stock quantity must be 1 or greater' };
  return { error: null };
}

module.exports = {
  validateRegister,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validateProductCreateOrUpdate,
};
