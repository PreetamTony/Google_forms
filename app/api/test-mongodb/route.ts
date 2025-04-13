import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

// This file is fine as it doesn't use dynamic parameters
export async function GET() {
  try {
    // Try to connect to MongoDB and create a test document
    const testCollection = await getCollection('test');
    
    // Insert a test document
    const result = await testCollection.insertOne({
      message: 'Test connection',
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'MongoDB connection successful',
      insertedId: result.insertedId
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to connect to MongoDB',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}