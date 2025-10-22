'use client';

import { useParams, usePathname } from 'next/navigation';
import CommentsInterface from '@/components/comments/commentsection';


export default function TaskCommentsPage() {
  const { eventId, taskId } = useParams<{ eventId: string; taskId: string }>();
  const pathname = usePathname();


  const role: 'organizer' | 'provider' = pathname.includes('provider')
    ? 'provider'
    : 'organizer';

  // if (!eventId || !taskId) {
  //   return <p className="text-center mt-10 text-gray-500">Cargando datos...</p>;
  // }

  return <CommentsInterface eventId={eventId} taskId={taskId} role={role} />;
}