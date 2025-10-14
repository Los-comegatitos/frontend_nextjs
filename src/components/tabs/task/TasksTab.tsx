'use client';
import { useState } from 'react';
import { Task } from '@/interfaces/Task';
import { Event } from '@/interfaces/Event';
import TaskList from './TasksList';
import TaskFormModal from './TasksFormModal';
import { useRouter } from 'next/navigation';

type Props = {
  token: string;
  event: Event;
  onRefresh: () => void;
};

export default function TasksTab({ token, event, onRefresh }: Props) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const router = useRouter();

  const handleAdd = () => {
    setSelectedTask(null);
    setOpenModal(true);
  };

  const handleView = (task: Task) => {
    setSelectedTask(task);
    setOpenModal(true);
  };

  const handleComment = (task: Task) => {
    router.push(`/event/${event.eventId}/tasks/${task.id}/comments`);
  };

  return (
    <>
      <TaskList
        tasks={event.tasks || []}
        onAdd={handleAdd}
        onView={handleView}
        eventId={event.eventId}
        onComment={handleComment}
      />

      <TaskFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        initialData={selectedTask || undefined}
        eventId={event.eventId}
        token={token}
        onRefresh={onRefresh}
      />
    </>
  );
}