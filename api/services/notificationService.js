import Notification from "../models/Notification.js";
import { sendEmail } from "./emailService.js";

// Create a notification record
export const createNotification = async ({
  userId,
  title,
  message,
  type,
  eventId = null,
  badgeId = null,
  itineraryId = null,
  isPush = true,
  isEmail = false,
  sendAt = new Date(),
}) => {
  try {
    const notification = new Notification({
      userId,
      title,
      message,
      type,
      eventId,
      badgeId,
      itineraryId,
      isPush,
      isEmail,
      sendAt,
    });

    await notification.save();
    console.log(`✅ Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    console.error("❌ Failed to create notification:", error);
    throw error;
  }
};

// Send event approval notification
export const notifyEventApproved = async (event) => {
  try {
    const submitterUser = event.submittedBy;

    // Create in-app notification
    await createNotification({
      userId: submitterUser._id,
      title: "Event Approved! 🎉",
      message: `Your event "${event.title}" has been approved and is now visible to volunteers!`,
      type: "event_approved",
      eventId: event._id,
      isPush: true,
      isEmail: true,
    });

    // Send email notification
    if (submitterUser.email) {
      await sendEventApprovalEmail({
        to: submitterUser.email,
        userName: `${submitterUser.firstName} ${submitterUser.lastName}`,
        eventTitle: event.title,
        eventDate: event.startDate,
        eventLocation: `${event.city}, ${event.country}`,
      });
    }

    console.log(
      `✅ Event approval notification sent for event: ${event.title}`
    );
  } catch (error) {
    console.error("❌ Failed to send event approval notification:", error);
  }
};

// Send event rejection notification
export const notifyEventRejected = async (event) => {
  try {
    const submitterUser = event.submittedBy;

    // Create in-app notification
    await createNotification({
      userId: submitterUser._id,
      title: "Event Not Approved",
      message: `Your event "${event.title}" was not approved. ${
        event.rejectionReason
          ? `Reason: ${event.rejectionReason}`
          : "Please review the guidelines and try again."
      }`,
      type: "event_rejected",
      eventId: event._id,
      isPush: true,
      isEmail: true,
    });

    // Send email notification
    if (submitterUser.email) {
      await sendEventRejectionEmail({
        to: submitterUser.email,
        userName: `${submitterUser.firstName} ${submitterUser.lastName}`,
        eventTitle: event.title,
        rejectionReason:
          event.rejectionReason ||
          "Please review the event guidelines and try again.",
      });
    }

    console.log(
      `✅ Event rejection notification sent for event: ${event.title}`
    );
  } catch (error) {
    console.error("❌ Failed to send event rejection notification:", error);
  }
};

// Send event submission notification to admins
export const notifyAdminsNewEventSubmission = async (event) => {
  try {
    const submitterUser = event.submittedBy;

    // This would typically get all admin users, but for now we'll log it
    // In a real implementation, you'd query for users with isAdmin: true
    console.log(
      `📧 New event submission notification: "${event.title}" by ${submitterUser.firstName} ${submitterUser.lastName}`
    );

    // You could implement admin email notifications here
    // await sendAdminNotificationEmail({ event, submitterUser });
  } catch (error) {
    console.error("❌ Failed to send admin notification:", error);
  }
};

// Email template for event approval
const sendEventApprovalEmail = async ({
  to,
  userName,
  eventTitle,
  eventDate,
  eventLocation,
}) => {
  const subject = `🎉 Your Event "${eventTitle}" Has Been Approved!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #059669 0%, #34d399 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Event Approved!</h1>
      </div>

      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Hi ${userName},</p>

        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Fantastic news! Your event submission has been approved and is now live on GreenLeaf Go.
          Volunteers can now discover and join your conservation effort!
        </p>

        <div style="background: #f3f4f6; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #059669;">
          <h3 style="color: #059669; margin-top: 0; font-size: 20px;">Event Details:</h3>
          <p style="margin: 8px 0; color: #374151;"><strong>Title:</strong> ${eventTitle}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Date:</strong> ${new Date(
            eventDate
          ).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Location:</strong> ${eventLocation}</p>
        </div>

        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          You can now track registrations and manage your event through the app.
          Thank you for contributing to environmental conservation!
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #059669; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View Your Event
          </a>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          Best regards,<br>
          <strong>The GreenLeaf Go Team</strong>
        </p>
      </div>
    </div>
  `;

  return await sendEmail({ to, subject, html });
};

// Email template for event rejection
const sendEventRejectionEmail = async ({
  to,
  userName,
  eventTitle,
  rejectionReason,
}) => {
  const subject = `Event Submission Update: "${eventTitle}"`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f59e0b; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Event Submission Update</h1>
      </div>

      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 18px; color: #374151; margin-bottom: 20px;">Hi ${userName},</p>

        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Thank you for your interest in organizing a conservation event. After reviewing your submission
          for "<strong>${eventTitle}</strong>", we're unable to approve it at this time.
        </p>

        <div style="background: #fef3c7; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f59e0b;">
          <h3 style="color: #d97706; margin-top: 0; font-size: 18px;">Feedback:</h3>
          <p style="margin: 0; color: #374151; line-height: 1.6;">${rejectionReason}</p>
        </div>

        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Don't worry! You can review our event guidelines and submit a new proposal.
          We appreciate your commitment to environmental conservation and look forward to
          your future submissions.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background: #059669; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Submit New Event
          </a>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          If you have questions about this decision, please don't hesitate to contact our team.
        </p>

        <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
          Best regards,<br>
          <strong>The GreenLeaf Go Team</strong>
        </p>
      </div>
    </div>
  `;

  return await sendEmail({ to, subject, html });
};
