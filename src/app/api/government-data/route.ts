import { NextRequest, NextResponse } from 'next/server';
import governmentDataService from '@/lib/services/governmentData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const type = searchParams.get('type') || 'comprehensive';

    if (!city || !state) {
      return NextResponse.json(
        { error: 'City and state parameters are required' },
        { status: 400 }
      );
    }

    const data = await governmentDataService.getGovernmentData(city, state, type);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Government data API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch government data' },
      { status: 500 }
    );
  }
}