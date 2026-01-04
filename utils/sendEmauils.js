export const sendEmail = async (email, subject, message) => {
  console.log(`EMAIL SENT TO: ${email}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`MESSAGE: ${message}`);
  return true;
};
