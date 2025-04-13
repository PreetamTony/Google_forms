import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const responsesCollection = await getCollection('responses');
    const data = await request.json();
    
    // Ensure we have the required fields
    if (!data.formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      );
    }
    
    // Add submission timestamp
    data.submittedAt = new Date().toISOString();
    
    // Convert string formId to ObjectId if needed
    try {
      data.formId = new ObjectId(data.formId);
    } catch (e) {
      // If it's not a valid ObjectId, keep it as is
    }
    
    const result = await responsesCollection.insertOne(data);
    
    console.log('Response saved to database:', {
      responseId: result.insertedId,
      formId: data.formId,
      answers: data.answers
    });
    
    return NextResponse.json({ 
      success: true, 
      responseId: result.insertedId 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to submit response' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const responsesCollection = await getCollection('responses');
    const responses = await responsesCollection.find({}).toArray();
    
    return NextResponse.json({ responses });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}