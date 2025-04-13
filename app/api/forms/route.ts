import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const formsCollection = await getCollection('forms');
    const forms = await formsCollection.find({}).toArray();
    
    console.log(`Retrieved ${forms.length} forms from database`);
    
    return NextResponse.json({ forms });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch forms' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('Creating new form...');
    
    const formsCollection = await getCollection('forms');
    const data = await request.json();
    
    console.log('Form data received:', data);
    
    // Add creation timestamp if not provided
    if (!data.createdAt) {
      data.createdAt = new Date().toISOString();
    }
    
    const result = await formsCollection.insertOne(data);
    
    console.log('Form created successfully:', {
      formId: result.insertedId,
      title: data.title
    });
    
    return NextResponse.json({ 
      success: true, 
      formId: result.insertedId 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create form' },
      { status: 500 }
    );
  }
}