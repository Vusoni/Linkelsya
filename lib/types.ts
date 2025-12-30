import { Id } from "@/convex/_generated/dataModel";

export interface User {
  _id: Id<"users">;
  email: string;
  name?: string;
}

export interface Document {
  _id: Id<"documents">;
  _creationTime: number;
  userId: Id<"users">;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Knowledge {
  _id: Id<"knowledge">;
  _creationTime: number;
  documentId: Id<"documents">;
  title: string;
  content: string;
  createdAt: number;
}

export interface Session {
  _id: Id<"sessions">;
  userId: Id<"users">;
  token: string;
  expiresAt: number;
}
