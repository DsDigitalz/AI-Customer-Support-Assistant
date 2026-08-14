import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  try {
    const body = await req.json();
    const { fullName, email, phone, company, serviceOfInterest, message, conversationId } = body;

    // Server-side field validations
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Full name must be at least 2 characters long.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
      return NextResponse.json(
        { success: false, error: 'A valid contact phone number is required.' },
        { status: 400 }
      );
    }

    if (!company || typeof company !== 'string' || !company.trim()) {
      return NextResponse.json(
        { success: false, error: 'Company/Organization name is required.' },
        { status: 400 }
      );
    }

    // Generate unique Lead ID (e.g., LEAD-84920)
    const leadId = `LEAD-${Math.floor(10000 + Math.random() * 89999)}`;

    console.log(`[LEAD CAPTURED] ID: ${leadId} | Name: ${fullName} | Company: ${company} | Service: ${serviceOfInterest} | Message: ${message} | ConvID: ${conversationId}`);

    return NextResponse.json({
      success: true,
      leadId,
      message: `Thank you ${fullName.split(' ')[0]}! Your consultation request has been received. An Apexium specialist will reach out shortly via ${email}.`,
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
