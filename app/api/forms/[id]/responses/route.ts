import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id;
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