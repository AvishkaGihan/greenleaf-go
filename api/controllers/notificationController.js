import Notification from "../models/Notification";
import { AppError } from "../utils/errorHandler";

export const getNotifications = async (req, res, next) => {
  try {
    const { is_read, type, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    if (is_read !== undefined) query.isRead = is_read === "true";
    if (type) query.type = type;

    const notifications = await Notification.find(query)
      .populate("eventId", "title")
      .populate("badgeId", "name emoji")
      .populate("itineraryId", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    res.json({
      success: true,
      data: {
        notifications: notifications.map((notif) => ({
          id: notif._id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          eventTitle: notif.eventId?.title,
          badgeName: notif.badgeId?.name,
          badgeEmoji: notif.badgeId?.emoji,
          itineraryTitle: notif.itineraryId?.title,
          isRead: notif.isRead,
          isPush: notif.isPush,
          isEmail: notif.isEmail,
          createdAt: notif.createdAt,
          readAt: notif.readAt,
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      throw new AppError("Notification not found", 404, "NOT_FOUND");
    }

    res.json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

export const registerPushToken = async (req, res, next) => {
  try {
    const { token, platform } = req.body;

    // In a real implementation, you would store the push token in the user's profile
    // or in a separate push tokens collection

    res.json({
      success: true,
      message: "Push token registered successfully",
    });
  } catch (error) {
    next(error);
  }
};
