'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/firebase-provider';
import { useRouter } from 'next/navigation';

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
  userId: string;
  questions: Question[];
  createdAt: string;
  updatedAt?: string;
};

export function FormEditor({ formId }: { formId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${formId}`);
        if (response.ok) {
          const data = await response.json();
          setForm(data.form);
        } else {
          setError('Failed to load form');
        }
      } catch (error) {
        console.error('Error fetching form:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchForm();
    }
  }, [formId]);

  const handleSave = async () => {
    if (!form) return;
    
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save form');
      }
    } catch (error) {
      console.error('Error saving form:', error);
      setError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    if (!form) return;
    
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      type: 'text',
      label: 'New Question',
      required: false,
    };
    
    setForm({
      ...form,
      questions: [...form.questions, newQuestion],
    });
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    if (!form) return;
    
    setForm({
      ...form,
      questions: form.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      ),
    });
  };

  const deleteQuestion = (questionId: string) => {
    if (!form) return;
    
    setForm({
      ...form,
      questions: form.questions.filter(q => q.id !== questionId),
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading form...</div>;
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
        <h1 className="text-2xl font-bold">Edit Form</h1>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Form Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        {form.questions.map((question) => (
          <div key={question.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">Question</h3>
              <button
                onClick={() => deleteQuestion(question.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Question Text</label>
              <input
                type="text"
                value={question.label}
                onChange={(e) => updateQuestion(question.id, { label: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Question Type</label>
              <select
                value={question.type}
                onChange={(e) => updateQuestion(question.id, { type: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="text">Text</option>
                <option value="textarea">Paragraph</option>
                <option value="radio">Multiple Choice</option>
                <option value="checkbox">Checkboxes</option>
                <option value="select">Dropdown</option>
              </select>
            </div>
            
            {(question.type === 'radio' || question.type === 'checkbox' || question.type === 'select') && (
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Options</label>
                <div className="space-y-2">
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(question.options || [])];
                          newOptions[index] = e.target.value;
                          updateQuestion(question.id, { options: newOptions });
                        }}
                        className="flex-1 px-3 py-2 border rounded-md"
                      />
                      <button
                        onClick={() => {
                          const newOptions = [...(question.options || [])];
                          newOptions.splice(index, 1);
                          updateQuestion(question.id, { options: newOptions });
                        }}
                        className="px-2 py-1 bg-red-100 text-red-600 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newOptions = [...(question.options || []), ''];
                      updateQuestion(question.id, { options: newOptions });
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                  >
                    Add Option
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`required-${question.id}`}
                checked={question.required}
                onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor={`required-${question.id}`} className="text-sm">
                Required
              </label>
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={addQuestion}
        className="mt-4 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-md"
      >
        Add Question
      </button>
    </div>
  );
}