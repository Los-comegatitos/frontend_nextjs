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
  console.log('EVENT ID EN TASKTAB:', event.eventId);

  


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
      <TaskList
        tasks={event.tasks || []}
        onAdd={handleAdd}
        onView={handleView}
        eventId={event.eventId}
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
