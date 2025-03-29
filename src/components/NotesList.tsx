import React from 'react';
import { motion } from 'framer-motion';
import { Note } from '../types/database';
import { Pencil, Trash2 } from 'lucide-react';

interface NotesListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export default function NotesList({ notes, onEdit, onDelete }: NotesListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <motion.div
          key={note.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <h3 className="text-xl font-bold text-white mb-2">{note.title}</h3>
          <p className="text-gray-300 mb-4">{note.content}</p>
          <div className="flex justify-end space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onEdit(note)}
              className="p-2 text-blue-400 hover:text-blue-300"
            >
              <Pencil size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(note.id)}
              className="p-2 text-red-400 hover:text-red-300"
            >
              <Trash2 size={18} />
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}