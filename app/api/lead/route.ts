import { NextResponse } from 'next/server';
import { sanitizeInput } from '@/lib/security';

export async function POST(req: Request) {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Optional JWT token parsing for authenticated users
  const authHeader = req.headers.get('Authorization');
  const jwtToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  try {
    const body = await req.json();
    const { fullName, email, phone, company, serviceOfInterest, message, conversationId } = body;

    // Defense-in-depth sanitization
    const cleanFullName = sanitizeInput(fullName || '');
    const cleanEmail = sanitizeInput(email || '');
    const cleanPhone = sanitizeInput(phone || '');
    const cleanCompany = sanitizeInput(company || '');
    const cleanService = sanitizeInput(serviceOfInterest || '');
    const cleanMessage = sanitizeInput(message || '');

    // Server-side field validations
    if (!cleanFullName || cleanFullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Full name must be at least 2 characters long.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    if (!cleanPhone || cleanPhone.trim().length < 7) {
      return NextResponse.json(
        { success: false, error: 'A valid contact phone number is required.' },
        { status: 400 }
      );
    }

    if (!cleanCompany || !cleanCompany.trim()) {
      return NextResponse.json(
        { success: false, error: 'Company/Organization name is required.' },
        { status: 400 }
      );
    }

    const leadId = `LEAD-${Math.floor(10000 + Math.random() * 89999)}`;

    console.log(`[LEAD CAPTURED] ID: ${leadId} | Name: ${cleanFullName} | Company: ${cleanCompany} | Service: ${cleanService} | Message: ${cleanMessage} | ConvID: ${conversationId} | Auth: ${Boolean(jwtToken)}`);

    return NextResponse.json({
      success: true,
      leadId,
      authenticatedUser: Boolean(jwtToken),
      message: `Thank you ${cleanFullName.split(' ')[0]}! Your consultation request has been received. An Apexium specialist will reach out shortly via ${cleanEmail}.`,
      timestamp,
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: errorMessage, timestamp },
      { status: 500 }
    );
  }
}
