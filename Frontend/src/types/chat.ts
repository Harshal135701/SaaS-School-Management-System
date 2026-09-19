export interface ConversationParticipant {
  id: string | number;
  participantType: 'PARENT' | 'TEACHER';
  participantId: string | number;
}

export interface Conversation {
  id: string | number;
  franchiseId: string | number;
  parentId?: string | number;
  teacherId?: string | number;
  studentId?: string | number;
  createdAt?: string;
  updatedAt: string;
  isEdited?: boolean;
  editedAt?: string;
  isDeletedForEveryone?: boolean;
  deletedForMeBy?: (string | number)[];
  student?: {
    id: string | number;
    name: string;
  };
  participants?: ConversationParticipant[];
}

export interface ChatMessage {
  id: string | number;
  conversationId: string | number;
  senderType: 'PARENT' | 'TEACHER';
  senderId: string | number;
  message: string;
  createdAt: string;
  updatedAt: string;
  isEdited?: boolean;
  editedAt?: string;
  isDeletedForEveryone?: boolean;
  deletedForMeBy?: (string | number)[];
}

