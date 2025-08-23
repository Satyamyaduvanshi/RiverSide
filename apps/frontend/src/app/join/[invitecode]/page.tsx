'use client'; // <-- Add this directive

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // <-- Correct import
import { api } from '../../../lib/api';

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const [status, setStatus] = useState('Joining studio...');
  const inviteCode = params.inviteCode as string;

  useEffect(() => {
    if (inviteCode) {
        console.log("inside useEffect of inviteCode page")
      api.post('/studio/join-with-code', { inviteCode })
        .then(response => {
             console.log("after api call")
          const { studioId } = response.data;
           console.log(" response : ", response)
          setStatus('Success! Redirecting you to the studio...');
          router.push(`/studio/${studioId}`);
        })
        .catch(error => {
          console.error('Failed to join with code', error);
          setStatus(`Error: ${error.response?.data?.message || 'Invalid invite code.'}`);
          setTimeout(() => router.push('/dashboard'), 3000);
        });
    }
  }, [inviteCode, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>{status}</p>
    </div>
  );
}