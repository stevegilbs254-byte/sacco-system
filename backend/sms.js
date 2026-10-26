const AT_USERNAME = process.env.AT_USERNAME;
const AT_API_KEY = process.env.AT_API_KEY;
const AT_SENDER_ID = process.env.AT_SENDER_ID;

export const smsConfigured = () => Boolean(AT_USERNAME && AT_API_KEY);

export function toE164Kenya(phone) {
  const digits = String(phone || '').replace(/[^\d+]/g, '');
  if (/^\+254\d{9}$/.test(digits)) return digits;
  if (/^254\d{9}$/.test(digits)) return `+${digits}`;
  if (/^0[17]\d{8}$/.test(digits)) return `+254${digits.slice(1)}`;
  if (/^[17]\d{8}$/.test(digits)) return `+254${digits}`;
  return null;
}

export function decisionMessage(application, status) {
  const name = String(application.memberName || 'Member').split(' ')[0];
  const amount = new Intl.NumberFormat('en-KE').format(Number(application.requestedAmount || 0));

  return status === 'Approved'
    ? `Hi ${name}, your SACCO loan application of KES ${amount} has been APPROVED. We will contact you on the next steps for disbursement.`
    : `Hi ${name}, we regret to inform you that your SACCO loan application of KES ${amount} has been declined. Please contact the SACCO office for more details.`;
}

export async function sendSms(phone, message) {
  if (!smsConfigured()) {
    return { sent: false, error: 'SMS is not configured (AT_USERNAME / AT_API_KEY missing)' };
  }

  const to = toE164Kenya(phone);
  if (!to) return { sent: false, error: `Invalid phone number: ${phone}` };

  const host = AT_USERNAME === 'sandbox' ? 'api.sandbox.africastalking.com' : 'api.africastalking.com';
  const body = new URLSearchParams({ username: AT_USERNAME, to, message });
  if (AT_SENDER_ID) body.set('from', AT_SENDER_ID);

  try {
    const res = await fetch(`https://${host}/version1/messaging`, {
      method: 'POST',
      headers: {
        apiKey: AT_API_KEY,
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const text = await res.text();
    if (!res.ok) return { sent: false, to, error: `Africa's Talking ${res.status}: ${text.slice(0, 200)}` };

    const recipient = JSON.parse(text)?.SMSMessageData?.Recipients?.[0];
    const sent = recipient?.status === 'Success' || recipient?.statusCode === 101;
    return sent
      ? { sent: true, to, messageId: recipient.messageId, cost: recipient.cost }
      : { sent: false, to, error: recipient?.status || 'Message was not accepted' };
  } catch (err) {
    return { sent: false, to, error: err.message };
  }
}
