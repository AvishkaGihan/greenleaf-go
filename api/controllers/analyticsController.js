import User from "../models/User.js";
import UserActivity from "../models/UserActivity.js";
import EventRSVP from "../models/EventRSVP.js";
import Review from "../models/Review.js";
import Itinerary from "../models/Itinerary.js";
import { AppError } from "../utils/errorHandler.js";

export const getUserAnalytics = async (req, res, next) => {
  try {
    const { period = "month", start_date, end_date } = req.query;

    let dateFilter = {};
    if (start_date && end_date) {
      dateFilter = {
        createdAt: {
          $gte: new Date(start_date),
          $lte: new Date(end_date),
        },
      };
    } else {
      // Default to last 30 days
      const days =
        period === "week"
          ? 7
          : period === "month"
          ? 30
          : period === "year"
          ? 365
          : 30;
      dateFilter = {
        createdAt: {
          $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
      };
    }

    const [
      registrations,
      activeUsers,
      eventsAttended,
      reviewsWritten,
      ageDistribution,
      interestDistribution,
    ] = await Promise.all([
      // Registrations over time
      User.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Active users (users with any activity)
      UserActivity.distinct("userId", dateFilter).then((ids) => ids.length),

      // Events attended
      UserActivity.countDocuments({
        ...dateFilter,
        activityType: "event_attended",
      }),

      // Reviews written
      Review.countDocuments(dateFilter),

      // Age distribution
      User.aggregate([
        {
          $group: {
            _id: {
              $switch: {
                branches: [
                  { case: { $lt: ["$age", 25] }, then: "18-24" },
                  { case: { $lt: ["$age", 35] }, then: "25-34" },
                  { case: { $lt: ["$age", 45] }, then: "35-44" },
                  { case: { $lt: ["$age", 55] }, then: "45-54" },
                ],
                default: "55+",
              },
            },
            count: { $sum: 1 },
          },
        },
      ]),

      // Interest distribution
      User.aggregate([
        { $unwind: "$ecoInterests" },
        {
          $group: {
            _id: "$ecoInterests",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        registrations: {
          total: registrations.reduce((sum, day) => sum + day.count, 0),
          dailyBreakdown: registrations,
        },
        engagement: {
          activeUsers,
          eventsAttended,
          reviewsWritten,
        },
        demographics: {
          ageGroups: ageDistribution,
          topInterests: interestDistribution.slice(0, 5),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEnvironmentalImpact = async (req, res, next) => {
  try {
    // Simplified environmental impact calculations
    // In a real implementation, you would track actual carbon savings, waste reduction, etc.

    const [
      totalEvents,
      totalParticipants,
      ecoFriendlyBookings,
      volunteerHours,
      estimatedCarbonReduction,
      estimatedWasteReduction,
    ] = await Promise.all([
      ConservationEvent.countDocuments({ isActive: true, isApproved: true }),
      EventRSVP.countDocuments({ status: "attended" }),
      Review.countDocuments({ ecoFriendlinessRating: { $gte: 4 } }),
      ConservationEvent.aggregate([
        { $match: { isActive: true, isApproved: true } },
        {
          $group: {
            _id: null,
            totalHours: { $sum: "$durationHours" },
            totalParticipants: { $sum: "$currentParticipants" },
          },
        },
      ]),
      // These would be calculated based on actual environmental data
      Promise.resolve(2340.5), // kg CO2 saved
      Promise.resolve(1234.5), // kg waste collected
    ]);

    const totalVolunteerHours =
      volunteerHours[0]?.totalHours * volunteerHours[0]?.totalParticipants || 0;

    res.json({
      success: true,
      data: {
        totalCarbonSaved: estimatedCarbonReduction,
        usersParticipating: totalParticipants,
        ecoFriendlyBookings,
        volunteerHours: totalVolunteerHours,
        treesPlanted: Math.floor(totalVolunteerHours / 4), // Estimate: 4 hours per tree
        wasteCollected: estimatedWasteReduction,
        eventsCompleted: totalEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEventAnalytics = async (req, res, next) => {
  try {
    const events = await ConservationEvent.find({
      isActive: true,
      isApproved: true,
    })
      .populate({
        path: "rsvps",
        match: { status: "attended" },
      })
      .select(
        "title eventType startDate endDate maxParticipants currentParticipants"
      );

    const eventAnalytics = events.map((event) => ({
      id: event._id,
      title: event.title,
      eventType: event.eventType,
      date: event.startDate,
      maxParticipants: event.maxParticipants,
      participants: event.currentParticipants,
      attendanceRate:
        event.maxParticipants > 0
          ? (event.currentParticipants / event.maxParticipants) * 100
          : 0,
      completionRate: event.endDate < new Date() ? 100 : 0, // Simplified completion rate
    }));

    res.json({
      success: true,
      data: {
        events: eventAnalytics,
        summary: {
          totalEvents: events.length,
          totalParticipants: events.reduce(
            (sum, event) => sum + event.currentParticipants,
            0
          ),
          averageAttendance:
            events.reduce((sum, event) => sum + event.currentParticipants, 0) /
            events.length,
          upcomingEvents: events.filter((event) => event.startDate > new Date())
            .length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
