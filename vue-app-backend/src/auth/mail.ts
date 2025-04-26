

const resendApiKey = Deno.env.get('RESEND_API_KEY');
console.log('Got apiKey?', !!resendApiKey);

export async function sendMessage(address: string, subject: string, body: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
    },
    body: JSON.stringify({
      from: 'lsim <noreply@resend.dev>',
      to: [address],
      subject: subject,
      html: body,
    })
  });

  if (!res.ok) {
    throw Error(res.statusText + ' ' + await res.json());
  }
}

