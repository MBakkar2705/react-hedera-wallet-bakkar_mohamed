"use client";

import { useState, type FormEvent } from "react";
import { getErrorMessage } from "@/lib/api";
import { buttonClass, inputClass } from "@/lib/styles";
import {
  createTopic,
  getMessages,
  sendMessage,
  TOPIC_ID_PATTERN,
  type CreatedTopic,
  type SentMessage,
  type TopicMessage,
} from "@/lib/topics";

export default function TopicsPage() {
  // Create a topic
  const [memoInput, setMemoInput] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedTopic | null>(null);

  // Publish a message
  const [sendTopicInput, setSendTopicInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sent, setSent] = useState<SentMessage | null>(null);

  // Read the messages of a topic
  const [readTopicInput, setReadTopicInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);
  const [messages, setMessages] = useState<TopicMessage[] | null>(null);

  async function loadMessages(topicId: string) {
    setLoading(true);
    setReadError(null);
    setMessages(null);
    try {
      setMessages(await getMessages(topicId));
    } catch (caught) {
      setReadError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCreating(true);
    setCreateError(null);
    setCreated(null);
    try {
      const topic = await createTopic(memoInput.trim() || undefined);
      setCreated(topic);
      // Pre-fill the next forms with the new topic.
      setSendTopicInput(topic.topicId);
      setReadTopicInput(topic.topicId);
    } catch (caught) {
      setCreateError(getErrorMessage(caught));
    } finally {
      setCreating(false);
    }
  }

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const topicId = sendTopicInput.trim();
    const message = messageInput.trim();

    if (!TOPIC_ID_PATTERN.test(topicId)) {
      setSendError("Enter a topic ID like 0.0.123456.");
      return;
    }
    if (message === "") {
      setSendError("Enter a message.");
      return;
    }

    setSending(true);
    setSendError(null);
    setSent(null);
    try {
      setSent(await sendMessage(topicId, message));
      setMessageInput("");
      // Show the new message in the list of this topic.
      setReadTopicInput(topicId);
      await loadMessages(topicId);
    } catch (caught) {
      setSendError(getErrorMessage(caught));
    } finally {
      setSending(false);
    }
  }

  async function handleRead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const topicId = readTopicInput.trim();
    if (!TOPIC_ID_PATTERN.test(topicId)) {
      setReadError("Enter a topic ID like 0.0.123456.");
      return;
    }
    await loadMessages(topicId);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Topics</h1>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium">Create a topic</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span>Memo (optional)</span>
            <input
              className={inputClass}
              value={memoInput}
              onChange={(event) => setMemoInput(event.target.value)}
              placeholder="My first topic"
            />
          </label>
          <button type="submit" className={buttonClass} disabled={creating}>
            {creating ? "Creating..." : "Create topic"}
          </button>
        </form>

        {createError && <p role="alert">{createError}</p>}

        {created && (
          <div className="flex flex-col gap-1 rounded border border-black/20 p-4 dark:border-white/25">
            <p>
              Topic <strong>{created.topicId}</strong> created
              {created.memo ? ` with the memo "${created.memo}"` : ""}.
            </p>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium">Publish a message</h2>
        <form onSubmit={handleSend} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span>Topic ID</span>
            <input
              className={inputClass}
              value={sendTopicInput}
              onChange={(event) => setSendTopicInput(event.target.value)}
              placeholder="0.0.123456"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span>Message</span>
            <textarea
              className={inputClass}
              rows={3}
              value={messageInput}
              onChange={(event) => setMessageInput(event.target.value)}
            />
          </label>
          <button type="submit" className={buttonClass} disabled={sending}>
            {sending ? "Publishing..." : "Publish"}
          </button>
        </form>

        {sendError && <p role="alert">{sendError}</p>}

        {sent && (
          <div className="flex flex-col gap-1 rounded border border-black/20 p-4 dark:border-white/25">
            <p>Message published to topic {sent.topicId}.</p>
            <p>Transaction ID:</p>
            <code className="break-all">{sent.transactionId}</code>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-medium">Messages of a topic</h2>
        <p>
          The messages come from the local database of the backend, so only the
          messages published through this application appear.
        </p>
        <form onSubmit={handleRead} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span>Topic ID</span>
            <input
              className={inputClass}
              value={readTopicInput}
              onChange={(event) => setReadTopicInput(event.target.value)}
              placeholder="0.0.123456"
            />
          </label>
          <button type="submit" className={buttonClass} disabled={loading}>
            {loading ? "Loading..." : "Load messages"}
          </button>
        </form>

        {readError && (
          <p role="alert">
            {readError} The backend also returns an error when a topic has no
            message yet.
          </p>
        )}

        {messages && (
          <ul className="flex flex-col gap-3">
            {messages.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-1 rounded border border-black/20 p-4 dark:border-white/25"
              >
                <p>{item.message}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
                <code className="break-all text-sm">{item.transactionId}</code>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
