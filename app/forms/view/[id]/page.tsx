'use client';

import { useState, useEffect } from 'react';
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
  questions: Question[];
};

export default function ViewFormPage({ params }: { params: { id: string } }) {
  const formId = params.id;
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${formId}`);
        if (response.ok) {
          const data = await response.json();
          setForm(data.form);
          
          // Initialize answers
          const initialAnswers: Record<string, any> = {};
          data.form.questions.forEach((q: Question) => {
            if (q.type === 'checkbox') {
              initialAnswers[q.id] = [];
            } else {
              initialAnswers[q.id] = '';
            }
          });
          setAnswers(initialAnswers);
        } else {
          setError('Form not found');
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

  const handleInputChange = (questionId: string, value: any) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    const currentAnswers = answers[questionId] || [];
    let newAnswers;
    
    if (checked) {
      newAnswers = [...currentAnswers, option];
    } else {
      newAnswers = currentAnswers.filter((item: string) => item !== option);
    }
    
    setAnswers({
      ...answers,
      [questionId]: newAnswers,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form) return;
    
    // Validate required fields
    const missingRequired = form.questions
      .filter(q => q.required)
      .some(q => {
        if (q.type === 'checkbox') {
          return !answers[q.id] || answers[q.id].length === 0;
        }
        return !answers[q.id];
      });
    
    if (missingRequired) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    
    try {
      console.log('Submitting form response:', {
        formId,
        answers
      });
      
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId,
          answers,
          submittedAt: new Date().toISOString(),
        }),
      });
      
      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit response');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      setError('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading form...</div>;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!form) {
    return <div className="text-center py-8">Form not found</div>;
  }

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="p-8 bg-green-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
          <p className="mb-6">Your response has been recorded.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
        {form.description && <p className="text-gray-600">{form.description}</p>}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {form.questions.map((question) => (
          <div key={question.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <label className="block font-medium mb-2">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {question.type === 'text' && (
              <input
                type="text"
                value={answers[question.id] || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required={question.required}
              />
            )}
            
            {question.type === 'textarea' && (
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                required={question.required}
              />
            )}
            
            {question.type === 'radio' && (
              <div className="space-y-2">
                {question.options?.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      id={`${question.id}-${index}`}
                      name={question.id}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className="mr-2"
                      required={question.required}
                    />
                    <label htmlFor={`${question.id}-${index}`}>{option}</label>
                  </div>
                ))}
              </div>
            )}
            
            {question.type === 'checkbox' && (
              <div className="space-y-2">
                {question.options?.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`${question.id}-${index}`}
                      value={option}
                      checked={(answers[question.id] || []).includes(option)}
                      onChange={(e) => handleCheckboxChange(question.id, option, e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor={`${question.id}-${index}`}>{option}</label>
                  </div>
                ))}
              </div>
            )}
            
            {question.type === 'select' && (
              <select
                value={answers[question.id] || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required={question.required}
              >
                <option value="">Select an option</option>
                {question.options?.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
        
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}