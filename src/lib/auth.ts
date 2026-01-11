import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
// If your Prisma file is located elsewhere, you can change the path

import nodemailer from "nodemailer";

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  trustedOrigins: [process.env.APP_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    autoSignInAfterVerification:true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log({ user, token, url });

      try {
        const verificationUrl = `${process.env.APP_URL}/verify_email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"PRISMA BLOG" <sabbir@gamil.com>',
          to: user?.email,
          subject: "please verify Email",
          html: `<div style="font-family: Arial, Helvetica, sans-serif; background-color: #f4f6f8; padding: 40px;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    
    <!-- Header -->
    <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0;">PRISMA BLOG</h1>
    </div>

    <!-- Body -->
    <div style="padding: 30px; color: #333333;">
      <h2 style="margin-top: 0;">Verify your email address</h2>

      <p>
      Hello ${user?.email}
        Thanks for signing up for <strong>Prisma Blog</strong> 🎉  
        Please confirm your email address by clicking the button below.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a
          href=${verificationUrl}
          style="
            background-color: #4f46e5;
            color: #ffffff;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
          "
        >
          Verify Email
        </a>
      </div>

      <p>
        If the button doesn’t work, copy and paste this link into your browser:
      </p>

      <p style="word-break: break-all; color: #4f46e5;">
        ${verificationUrl}
      </p>

      <p>
        If you didn’t create an account, you can safely ignore this email.
      </p>

      <p style="margin-top: 40px;">
        — <br />
        <strong>Prisma Blog Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f4f6f8; padding: 15px; text-align: center; font-size: 12px; color: #666;">
      © 2026 Prisma Blog. All rights reserved.
    </div>

  </div>
</div>
`, // HTML version of the message
        });

        console.log("Message sent:", info.messageId);
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
   socialProviders: {
        google: { 
          accessType: "offline", 
           prompt: "select_account consent", 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
});
