import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

// Updated route handler with correct parameter types for Next.js 15
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formId } = await params;
    const responsesCollection = await getCollection('responses');
    
    // Try to match both string formId and ObjectId formId
    let responses = [];
    try {
      responses = await responsesCollection.find({
        $or: [
          { formId: formId },
          { formId: new ObjectId(formId) }
        ]
      }).toArray();
    } catch (error) {
      // If ObjectId conversion fails, just search by string
      responses = await responsesCollection.find({ formId: formId }).toArray();
    }
    
    console.log(`Found ${responses.length} responses for form ${formId}`);
    
    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}
