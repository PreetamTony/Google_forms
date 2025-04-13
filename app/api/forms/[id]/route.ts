import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Get a specific form by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id;
    const formsCollection = await getCollection('forms');
    
    const form = await formsCollection.findOne({ _id: new ObjectId(formId) });
    
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ form });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form' },
      { status: 500 }
    );
  }
}

// Update a form
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id;
    const formsCollection = await getCollection('forms');
    const data = await request.json();
    
    // Add updated timestamp
    data.updatedAt = new Date().toISOString();
    
    const result = await formsCollection.updateOne(
      { _id: new ObjectId(formId) },
      { $set: data }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      updated: result.modifiedCount > 0
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update form' },
      { status: 500 }
    );
  }
}

// Delete a form
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formId = params.id;
    const formsCollection = await getCollection('forms');
    
    const result = await formsCollection.deleteOne({ _id: new ObjectId(formId) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete form' },
      { status: 500 }
    );
  }
}