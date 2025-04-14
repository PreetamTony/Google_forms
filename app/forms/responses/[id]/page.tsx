'use client';

import { useAuth } from '@/components/firebase-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Question = {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
};

type Form = {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
};

type Response = {
  _id: string;
  formId: string;
  answers: Record<string, any>;
  submittedAt: string;
};

export default async function FormResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = await params;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch form details
        const formResponse = await fetch(`/api/forms/${formId}`);
        if (!formResponse.ok) {
          throw new Error('Failed to load form');
        }
        const formData = await formResponse.json();
        setForm(formData.form);

        // Fetch form responses
        const responsesResponse = await fetch(`/api/forms/${formId}/responses`);
        if (!responsesResponse.ok) {
          throw new Error('Failed to load responses');
        }
        const responsesData = await responsesResponse.json();
        setResponses(responsesData.responses || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('An error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    if (formId && user) {
      fetchData();
    }
  }, [formId, user]);

  if (authLoading || loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-gray-200 rounded-md"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!form) {
    return <div className="text-center py-8">Form not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Responses: {form.title}</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Back to Dashboard
        </button>
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-lg mb-2">No responses yet</p>
          <p className="text-gray-500">Share your form to collect responses</p>
        </div>
      ) : (
        <div>
          <p className="mb-4">Total responses: {responses.length}</p>
          
          <div className="space-y-6">
            {responses.map((response) => (
              <div key={response._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <div className="mb-3 pb-2 border-b">
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(response.submittedAt).toLocaleString()}
                  </p>
                </div>
                
                <div className="space-y-4">
                  {form.questions.map((question) => (
                    <div key={question.id} className="mb-4">
                      <p className="font-medium mb-1">{question.label}</p>
                      
                      {question.type === 'checkbox' ? (
                        <p>
                          {Array.isArray(response.answers[question.id])
                            ? response.answers[question.id].join(', ') || 'No answer'
                            : 'No answer'}
                        </p>
                      ) : (
                        <p>{response.answers[question.id] || 'No answer'}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
