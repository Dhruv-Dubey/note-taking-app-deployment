import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import { Note } from './types/database';
import Auth from './components/Auth';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import { Plus, LogOut } from 'lucide-react';

function App() {
  const [session, setSession] = useState(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchNotes();
    }
  }, [session]);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
    } else {
      setNotes(data || []);
    }
  };

  const handleSaveNote = async (noteData: Partial<Note>) => {
    if (selectedNote) {
      const { error } = await supabase
        .from('notes')
        .update(noteData)
        .eq('id', selectedNote.id);

      if (!error) {
        fetchNotes();
      }
    } else {
      const { error } = await supabase.from('notes').insert([
        {
          ...noteData,
          user_id: session?.user?.id,
        },
      ]);

      if (!error) {
        fetchNotes();
      }
    }
    setIsEditorOpen(false);
    setSelectedNote(undefined);
  };

  const handleDeleteNote = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);

    if (!error) {
      fetchNotes();
    }
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleSignOut = () => {
    supabase.auth.signOut();
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Notes App</h1>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedNote(undefined);
                  setIsEditorOpen(true);
                }}
                className="flex items-center space-x-2 bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus size={20} />
                <span>New Note</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-300 hover:text-white"
              >
                <LogOut size={20} />
                <span>Sign Out</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NotesList
          notes={notes}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
        />
      </main>

      <AnimatePresence>
        {isEditorOpen && (
          <NoteEditor
            note={selectedNote}
            onSave={handleSaveNote}
            onClose={() => {
              setIsEditorOpen(false);
              setSelectedNote(undefined);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;