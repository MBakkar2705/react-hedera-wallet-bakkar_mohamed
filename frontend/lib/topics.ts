import { request } from "./api";

// Hedera topic IDs look like 0.0.123456.
export const TOPIC_ID_PATTERN = /^\d+\.\d+\.\d+$/;

// POST /topics (CreateTopicDto and createTopic in the backend).
// No key is needed: the backend signs with its operator account.
export interface CreatedTopic {
  topicId: string;
  memo?: string;
}

// POST /topics/:topicId/messages (SendMessageDto and sendMessage in the backend).
export interface SentMessage {
  topicId: string;
  message: string;
  transactionId: string;
  createdAt: string;
}

// GET /topics/:topicId/messages. The messages come from the local database of
// the backend (MessageEntity), not from Hedera.
export interface TopicMessage {
  id: number;
  topicId: string;
  message: string;
  transactionId: string;
  createdAt: string;
}

export function createTopic(memo?: string): Promise<CreatedTopic> {
  return request<CreatedTopic>("/topics", {
    method: "POST",
    body: JSON.stringify(memo ? { memo } : {}),
  });
}

export function sendMessage(
  topicId: string,
  message: string,
): Promise<SentMessage> {
  return request<SentMessage>(
    `/topics/${encodeURIComponent(topicId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ message }),
    },
  );
}

export function getMessages(topicId: string): Promise<TopicMessage[]> {
  return request<TopicMessage[]>(
    `/topics/${encodeURIComponent(topicId)}/messages`,
  );
}
