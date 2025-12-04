const productService = require('../services/productService');
const { validateProductCreateOrUpdate } = require('../services/validators');

exports.list = async (req, res, next) => {
  try {
    const products = await productService.getAll();
    res.json(products);
  } catch (err) {
    // Handle file/database exceptions
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { error } = validateProductCreateOrUpdate(req.body);
    if (error) return res.status(400).json({ message: error });

    const created = await productService.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { error } = validateProductCreateOrUpdate(req.body);
    if (error) return res.status(400).json({ message: error });

    const updated = await productService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const ok = await productService.remove(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

