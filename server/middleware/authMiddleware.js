import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const verifyManufacturer = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'Manufacturer') {
      return res.status(403).json({ error: 'Access denied. Manufacturer role required.' });
    }
    next();
  });
};

export default { verifyToken, verifyManufacturer };
