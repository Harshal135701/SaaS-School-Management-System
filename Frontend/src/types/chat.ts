export interface ConversationParticipant {
  id: string;
  participantType: 'PARENT' | 'TEACHER';
  participantId: string;
}

export interface Conversation {
  id: string;
  franchiseId: string;
  parentId?: string;
  teacherId?: string;
  studentId?: string;
  updatedAt: string;
  isEdited?: boolean;
  editedAt?: string;
  isDeletedForEveryone?: boolean;
  deletedForMeBy?: string[];
  student?: {
    id: string;
    name: string;
  };
  participants: ConversationParticipant[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderType: 'PARENT' | 'TEACHER';
  senderId: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  isEdited?: boolean;
  editedAt?: string;
  isDeletedForEveryone?: boolean;
  deletedForMeBy?: string[];
}
