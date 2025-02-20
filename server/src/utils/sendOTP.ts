import nodemailer from "nodemailer";

export const sendOTP = async (userEmail: string, otp: string, userSubject: string, userText: string) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    const mailOptions = {
        from: process.env.EMAIL,
        to: userEmail,
        subject: userSubject,
        text: `${userText} ${otp}`,
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        let errorMessage = "Failed"
        if (error instanceof Error) {
            errorMessage = error.message
        }
        console.log("Error while sending email: " + errorMessage);
    }
};
