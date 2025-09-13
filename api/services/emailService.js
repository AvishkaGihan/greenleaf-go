import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 465,
  secure: process.env.SMTP_SECURE === "true" || true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log("✅ Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email sending error:", error);
    return false;
  }
};

// RSVP Email Templates
export const sendRsvpConfirmation = async ({
  to,
  userName,
  eventTitle,
  eventDate,
  eventLocation,
}) => {
  const subject = `RSVP Confirmed: ${eventTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">RSVP Confirmed!</h2>
      <p>Hi ${userName},</p>
      <p>Great news! Your RSVP for <strong>${eventTitle}</strong> has been confirmed.</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Event Details:</h3>
        <p><strong>Date:</strong> ${new Date(
          eventDate
        ).toLocaleDateString()}</p>
        <p><strong>Location:</strong> ${eventLocation}</p>
      </div>
      <p>We look forward to seeing you there! If you have any questions, feel free to reach out.</p>
      <p>Best regards,<br>The GreenLeaf Go Team</p>
    </div>
  `;
  return await sendEmail({ to, subject, html });
};

export const sendRsvpReminder = async ({
  to,
  userName,
  eventTitle,
  eventDate,
  eventLocation,
}) => {
  const subject = `Reminder: ${eventTitle} is coming up!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Event Reminder</h2>
      <p>Hi ${userName},</p>
      <p>This is a friendly reminder about your upcoming event:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>${eventTitle}</h3>
        <p><strong>Date:</strong> ${new Date(
          eventDate
        ).toLocaleDateString()}</p>
        <p><strong>Location:</strong> ${eventLocation}</p>
      </div>
      <p>Don't forget to bring your enthusiasm and any required materials. See you there!</p>
      <p>Best regards,<br>The GreenLeaf Go Team</p>
    </div>
  `;
  return await sendEmail({ to, subject, html });
};

export const sendRsvpCancellation = async ({
  to,
  userName,
  eventTitle,
  eventDate,
}) => {
  const subject = `RSVP Cancelled: ${eventTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">RSVP Cancelled</h2>
      <p>Hi ${userName},</p>
      <p>Your RSVP for <strong>${eventTitle}</strong> scheduled for ${new Date(
    eventDate
  ).toLocaleDateString()} has been cancelled.</p>
      <p>If this was a mistake or you'd like to re-register, you can do so through the app.</p>
      <p>We hope to see you at future events!</p>
      <p>Best regards,<br>The GreenLeaf Go Team</p>
    </div>
  `;
  return await sendEmail({ to, subject, html });
};

export const sendCustomRsvpEmail = async ({
  to,
  userName,
  eventTitle,
  subject,
  message,
}) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Message from GreenLeaf Go</h2>
      <p>Hi ${userName},</p>
      <p>Regarding your RSVP for <strong>${eventTitle}</strong>:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        ${message.replace(/\n/g, "<br>")}
      </div>
      <p>Best regards,<br>The GreenLeaf Go Team</p>
    </div>
  `;
  return await sendEmail({ to, subject, html });
};
