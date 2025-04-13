'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/firebase-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Fetch user's forms
    if (user) {
      const fetchForms = async () => {
        try {
          const response = await fetch('/api/forms');
          if (response.ok) {
            const data = await response.json();
            setForms(data.forms || []);
          }
        } catch (error) {
          console.error('Error fetching forms:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchForms();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Forms</h1>
        <Link 
          href="/forms/create" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New Form
        </Link>
      </div>

      {isLoading ? (
        <p>Loading your forms...</p>
      ) : forms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form: any) => (
            <div key={form._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{form.title || 'Untitled Form'}</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Created: {new Date(form.createdAt).toLocaleDateString()}
                </p>
                <div className="flex space-x-2">
                  <Link 
                    href={`/forms/edit/${form._id}`}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Edit
                  </Link>
                  <Link 
                    href={`/forms/view/${form._id}`}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    View
                  </Link>
                  <Link 
                    href={`/forms/responses/${form._id}`}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Responses
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg mb-4">You haven't created any forms yet</p>
          <Link 
            href="/forms/create" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Your First Form
          </Link>
        </div>
      )}
    </div>
  );
}