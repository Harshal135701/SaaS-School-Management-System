import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../../services/api';
import type { Conversation, ChatMessage } from '../../types/chat';
import { ConversationList } from '../../components/chat/ConversationList';
import { ChatWindow } from '../../components/chat/ChatWindow';
import { Modal } from '../../components/ui/Modal';
import { User, BookOpen, Loader2, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ChatPageProps {
  user: any;
}

export const ChatPage: React.FC<ChatPageProps> = ({ user }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Chat Modal States (Parent Only)
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatStep, setNewChatStep] = useState<1 | 2 | 3>(1);
  const [linkedStudents, setLinkedStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [newChatError, setNewChatError] = useState<string | null>(null);

  const userRole = (user?.role || '').toUpperCase();

  // Load conversations and connect socket
  useEffect(() => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    
    const newSocket = io(socketUrl, {
      auth: { token }
    });

    newSocket.on("connect", () => {
      console.log("Chat socket connected");
      setErrorMessage(null);
    });
    
    newSocket.on("connect_error", (err) => {
      console.error("Chat socket connection error:", err);
    });

    newSocket.on("chat_error", (err: { message: string }) => {
      console.error("Chat error from server:", err);
      setErrorMessage(err.message || "A chat error occurred");
    });

    setSocket(newSocket);

    // Fetch real user's conversations from backend
    api.get('/franchise/chat/my')
      .then(res => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          const sorted = [...res.data.data].sort((a: Conversation, b: Conversation) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          setConversations(sorted);
        }
      })
      .catch(err => {
        console.error("Failed to load conversations:", err);
      })
      .finally(() => setIsLoading(false));

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Handle Socket.IO real-time event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage: ChatMessage) => {
      // 1. If message belongs to current active conversation, add to message stream
      if (selectedConversation && String(newMessage.conversationId) === String(selectedConversation.id)) {
        setMessages(prev => {
          if (prev.some(m => String(m.id) === String(newMessage.id))) return prev;
          return [...prev, newMessage];
        });
      }

      // 2. Update conversation list timestamp and move to top
      setConversations(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(c => String(c.id) === String(newMessage.conversationId));
        if (idx !== -1) {
          const [conv] = updated.splice(idx, 1);
          conv.updatedAt = newMessage.createdAt;
          updated.unshift(conv);
        }
        return updated;
      });
    };

    const handleMessageEdited = (editedMsg: ChatMessage) => {
      setMessages(prev => prev.map(m => String(m.id) === String(editedMsg.id) ? editedMsg : m));
    };

    const handleMessageDeletedForMe = (data: { messageId: string | number }) => {
      setMessages(prev => prev.filter(m => String(m.id) !== String(data.messageId)));
    };

    const handleMessageDeletedForEveryone = (deletedMsg: ChatMessage) => {
      setMessages(prev => prev.map(m => String(m.id) === String(deletedMsg.id) ? deletedMsg : m));
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_edited", handleMessageEdited);
    socket.on("message_deleted_for_me", handleMessageDeletedForMe);
    socket.on("message_deleted_for_everyone", handleMessageDeletedForEveryone);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_edited", handleMessageEdited);
      socket.off("message_deleted_for_me", handleMessageDeletedForMe);
      socket.off("message_deleted_for_everyone", handleMessageDeletedForEveryone);
    };
  }, [socket, selectedConversation]);

  // Handle conversation selection & joining socket room
  useEffect(() => {
    if (selectedConversation && socket) {
      setIsLoadingMessages(true);
      
      // Join Socket.IO conversation room
      socket.emit("join_conversation", selectedConversation.id);

      // Load messages from backend API
      api.get(`/franchise/chat/${selectedConversation.id}/messages`)
        .then(res => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setMessages(res.data.data);
          }
        })
        .catch(err => {
          console.error("Failed to load messages:", err);
        })
        .finally(() => setIsLoadingMessages(false));
    }
  }, [selectedConversation, socket]);

  const handleSendMessage = (text: string) => {
    if (!socket || !selectedConversation || !text.trim()) return;
    socket.emit("send_message", {
      conversationId: selectedConversation.id,
      message: text.trim()
    });
  };

  const handleEditMessage = (messageId: string | number, text: string) => {
    if (!socket || !text.trim()) return;
    socket.emit("edit_message", { messageId, message: text.trim() });
  };

  const handleDeleteForMe = (messageId: string | number) => {
    if (!socket) return;
    socket.emit("delete_message_for_me", { messageId });
  };

  const handleDeleteForEveryone = (messageId: string | number) => {
    if (!socket) return;
    socket.emit("delete_message_for_everyone", { messageId });
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setIsMobileListVisible(false);
  };

  const handleBackToList = () => {
    setIsMobileListVisible(true);
    setSelectedConversation(null);
  };

  // ────────────────────────────────────────────────────────────
  // PARENT NEW CHAT MODAL HANDLERS
  // ────────────────────────────────────────────────────────────
  const handleOpenNewChat = async () => {
    setIsNewChatOpen(true);
    setNewChatStep(1);
    setNewChatError(null);
    setSelectedStudent(null);
    setSelectedTeacher(null);
    setAvailableTeachers([]);
    setIsLoadingStudents(true);

    try {
      const res = await api.get('/parent/me/students');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setLinkedStudents(res.data.data);
      } else {
        setLinkedStudents([]);
      }
    } catch (err: any) {
      console.error("Failed to load parent students:", err);
      setNewChatError(err.response?.data?.message || "Failed to load linked students.");
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleSelectStudentInModal = async (student: any) => {
    setSelectedStudent(student);
    setNewChatStep(2);
    setNewChatError(null);
    setSelectedTeacher(null);
    setIsLoadingTeachers(true);

    try {
      const res = await api.get(`/franchise/timetable/parent/student/${student.id}`);
      const ttData = Array.isArray(res.data?.data) ? res.data.data : [];

      const teacherMap = new Map<string, any>();
      ttData.forEach((slot: any) => {
        if (slot.teacher && slot.teacher.id) {
          const tid = String(slot.teacher.id);
          if (!teacherMap.has(tid)) {
            teacherMap.set(tid, {
              id: slot.teacher.id,
              name: slot.teacher.name || 'Teacher',
              subject: slot.teacher.subject || slot.subject || undefined
            });
          }
        }
      });
      const teachers = Array.from(teacherMap.values());
      setAvailableTeachers(teachers);
    } catch (err: any) {
      console.error("Failed to fetch student timetable for teacher lookup:", err);
      setNewChatError(err.response?.data?.message || "Failed to retrieve assigned teachers from student timetable.");
      setAvailableTeachers([]);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const handleSelectTeacherInModal = (teacher: any) => {
    setSelectedTeacher(teacher);
    setNewChatStep(3);
  };

  const handleCreateConversationSubmit = async () => {
    if (!selectedStudent || !selectedTeacher || !user?.id) return;
    setIsCreatingConversation(true);
    setNewChatError(null);

    try {
      const res = await api.post('/franchise/chat/', {
        parentId: user.id,
        teacherId: selectedTeacher.id,
        studentId: selectedStudent.id
      });

      if (res.data?.success) {
        // Refresh conversation list from backend
        const listRes = await api.get('/franchise/chat/my');
        let updatedList: Conversation[] = [];
        if (listRes.data?.success && Array.isArray(listRes.data.data)) {
          updatedList = [...listRes.data.data].sort((a: Conversation, b: Conversation) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          setConversations(updatedList);
        }

        // Identify target conversation
        const targetId = res.data.data?.id;
        const targetConv = updatedList.find(c => String(c.id) === String(targetId)) ||
                           updatedList.find(c => String(c.studentId) === String(selectedStudent.id) && String(c.teacherId) === String(selectedTeacher.id)) ||
                           res.data.data;

        if (targetConv) {
          setSelectedConversation(targetConv);
        }

        // Close modal and focus chat window
        setIsNewChatOpen(false);
        setIsMobileListVisible(false);
      } else {
        setNewChatError(res.data?.message || "Failed to create conversation.");
      }
    } catch (err: any) {
      console.error("Error creating conversation:", err);
      setNewChatError(err.response?.data?.message || "Failed to start conversation. Please try again.");
    } finally {
      setIsCreatingConversation(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row p-4 md:p-6 gap-4 max-h-screen">
      {errorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-rose-600 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ml-2 font-bold hover:opacity-80">✕</button>
        </div>
      )}

      {/* Conversation List (Hidden on mobile if chat is open) */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${!isMobileListVisible ? 'hidden md:flex' : 'flex'}`}>
        <ConversationList 
          conversations={conversations} 
          selectedConversationId={selectedConversation?.id}
          onSelect={handleSelectConversation}
          isLoading={isLoading}
          user={user}
          onOpenNewChat={handleOpenNewChat}
        />
      </div>

      {/* Chat Window (Hidden on mobile if list is visible) */}
      <div className={`flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${isMobileListVisible ? 'hidden md:flex' : 'flex'}`}>
        <ChatWindow 
          conversation={selectedConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          onDeleteForMe={handleDeleteForMe}
          onDeleteForEveryone={handleDeleteForEveryone}
          isLoading={isLoadingMessages}
          user={user}
          onBack={handleBackToList}
        />
      </div>

      {/* ======================================================
          NEW CHAT MODAL (PARENT ONLY)
      ====================================================== */}
      {userRole === 'PARENT' && (
        <Modal
          isOpen={isNewChatOpen}
          onClose={() => {
            if (!isCreatingConversation) setIsNewChatOpen(false);
          }}
          title="Start Conversation"
          subtitle="Message your child's assigned teacher"
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Step Progress Bar */}
            <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold">
              <span className={`px-2.5 py-1 rounded-lg ${newChatStep === 1 ? 'bg-blue-600 text-white font-bold' : 'text-slate-500'}`}>
                1. Select Child
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
              <span className={`px-2.5 py-1 rounded-lg ${newChatStep === 2 ? 'bg-blue-600 text-white font-bold' : 'text-slate-500'}`}>
                2. Select Teacher
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
              <span className={`px-2.5 py-1 rounded-lg ${newChatStep === 3 ? 'bg-blue-600 text-white font-bold' : 'text-slate-500'}`}>
                3. Confirm
              </span>
            </div>

            {/* Error Alert */}
            {newChatError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{newChatError}</span>
              </div>
            )}

            {/* STEP 1: SELECT CHILD */}
            {newChatStep === 1 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Select a child to view assigned teachers:
                </p>
                {isLoadingStudents ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin text-blue-600" />
                    <span className="ml-2 text-xs text-slate-500 font-medium">Loading linked children...</span>
                  </div>
                ) : linkedStudents.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
                    <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No linked students found</p>
                    <p className="mt-0.5">Please contact your school administrator to link your student to this account.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto">
                    {linkedStudents.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => handleSelectStudentInModal(st)}
                        className="w-full text-left p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                            {st.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{st.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Class: {st.class?.name || 'Assigned'} {st.section?.name ? `(${st.section.name})` : ''}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: SELECT TEACHER */}
            {newChatStep === 2 && selectedStudent && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Select teacher for <strong className="text-blue-700">{selectedStudent.name}</strong>:
                  </p>
                  <button
                    onClick={() => setNewChatStep(1)}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    Change Child
                  </button>
                </div>

                {isLoadingTeachers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin text-blue-600" />
                    <span className="ml-2 text-xs text-slate-500 font-medium">Fetching assigned teachers from timetable...</span>
                  </div>
                ) : availableTeachers.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No assigned teachers found</p>
                    <p className="mt-0.5">No teacher entries exist in the current class timetable for this student.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 max-h-60 overflow-y-auto">
                    {availableTeachers.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleSelectTeacherInModal(t)}
                        className="w-full text-left p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                            {t.name?.charAt(0) || 'T'}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Subject: {t.subject || 'Class Teacher'}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: CONFIRMATION */}
            {newChatStep === 3 && selectedStudent && selectedTeacher && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-3">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Conversation Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Child</span>
                      <p className="font-extrabold text-slate-900 mt-0.5">{selectedStudent.name}</p>
                      <p className="text-[11px] text-slate-500">{selectedStudent.class?.name || 'Enrolled'}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Teacher</span>
                      <p className="font-extrabold text-slate-900 mt-0.5">{selectedTeacher.name}</p>
                      <p className="text-[11px] text-slate-500">{selectedTeacher.subject || 'Teacher'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setNewChatStep(2)}
                    disabled={isCreatingConversation}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateConversationSubmit}
                    disabled={isCreatingConversation}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isCreatingConversation && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{isCreatingConversation ? 'Starting Chat...' : 'Start Conversation'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
