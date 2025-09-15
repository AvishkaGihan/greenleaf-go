import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AdminLog from "../models/AdminLog.js";

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTHENTICATION_REQUIRED",
          message: "No token provided",
        },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTHENTICATION_REQUIRED",
          message: "Token is not valid",
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: "AUTHENTICATION_REQUIRED", message: "Token is not valid" },
    });
  }
};

const authenticateAdmin = async (req, res, next) => {
  try {
    console.log("🔐 Admin Auth: Checking admin authentication");
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("🔐 Admin Auth: Token present:", !!token);

    if (!token) {
      console.log("❌ Admin Auth: No token provided");
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTHENTICATION_REQUIRED",
          message: "No token provided",
        },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔐 Admin Auth: Token decoded, user ID:", decoded.id);

    const user = await User.findById(decoded.id).select("-passwordHash");
    console.log("🔐 Admin Auth: User found:", !!user);
    console.log(
      "🔐 Admin Auth: User details:",
      user
        ? {
            id: user._id,
            email: user.email,
            isAdmin: user.isAdmin,
            isActive: user.isActive,
          }
        : "null"
    );

    if (!user || !user.isActive || !user.isAdmin) {
      console.log("❌ Admin Auth: User not authorized as admin");
      return res.status(403).json({
        success: false,
        error: { code: "PERMISSION_DENIED", message: "Admin access required" },
      });
    }

    req.user = user;
    console.log("✅ Admin Auth: Admin authentication successful");
    next();
  } catch (error) {
    console.log("❌ Admin Auth: Authentication error:", error.message);
    res.status(401).json({
      success: false,
      error: { code: "AUTHENTICATION_REQUIRED", message: "Token is not valid" },
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "Insufficient permissions",
        },
      });
    }
    next();
  };
};

const logAdminAction = async (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    if (req.user && req.user.isAdmin) {
      const logData = {
        adminUserId: req.user._id,
        actionType:
          req.method.toLowerCase() === "post"
            ? "create"
            : req.method.toLowerCase() === "put"
            ? "update"
            : req.method.toLowerCase() === "delete"
            ? "delete"
            : req.method.toLowerCase() === "get"
            ? "read"
            : "other",
        entityType: req.baseUrl.split("/").pop(),
        entityId: req.params.id || null,
        description: `${req.method} ${req.originalUrl}`,
        oldValues: req.originalBody,
        newValues: (() => {
          try {
            return JSON.parse(data);
          } catch {
            return data; // If not JSON, store as string
          }
        })(),
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      };

      AdminLog.create(logData).catch((error) => {
        console.error("Failed to create admin log:", error.message);
      });
    }

    originalSend.call(this, data);
  };

  next();
};

export { authenticate, authenticateAdmin, authorize, logAdminAction };
