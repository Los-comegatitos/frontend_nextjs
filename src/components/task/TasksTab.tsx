'use client';
import { useState } from 'react';
import { Task } from '@/interfaces/Task';
import { Event } from '@/interfaces/Event';
import TaskList from './TasksList';
import TaskFormModal from './TasksFormModal';

type Props = {
  token: string;
  event: Event;
  onRefresh: () => void;
};

export default function TasksTab({ token, event, onRefresh }: Props) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleAdd = () => {
    setSelectedTask(null);
    setOpenModal(true);
  };

  const handleView = (task: Task) => {
    setSelectedTask(task);
    setOpenModal(true);
  };

  return (
    <>
      <TaskList tasks={event.tasks || []} onAdd={handleAdd} onView={handleView} />
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
