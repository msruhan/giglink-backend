export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Akses ditolak: hanya admin yang diizinkan." });
  }
  next();
};

export const isOwnerOrAdmin = (req, res, next) => {
  const userId = parseInt(req.params.id, 10);
  if (req.user.role === "admin" || req.user.id === userId) {
    return next();
  }
  return res.status(403).json({ message: "Akses ditolak: bukan pemilik akun." });
};
