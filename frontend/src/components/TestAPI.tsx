import React, { useEffect, useState } from 'react';
import { candidateService } from '../services/api';
import { Candidate } from '../types/api';

const TestAPI: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await candidateService.getCandidates();
        setCandidates(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch candidates');
        console.error('Error fetching candidates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  if (loading) return <div>Loading candidates...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>API Connection Test</h2>
      <p>Successfully connected to backend API!</p>
      <h3>Candidates ({candidates.length}):</h3>
      {candidates.map((candidate) => (
        <div key={candidate.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}>
          <strong>{candidate.firstName} {candidate.lastName}</strong>
          <br />
          Email: {candidate.email}
          <br />
          Phone: {candidate.phone}
          <br />
          Education: {candidate.education.length} entries
          <br />
          Work Experience: {candidate.workExperience.length} entries
        </div>
      ))}
    </div>
  );
};

export default TestAPI;