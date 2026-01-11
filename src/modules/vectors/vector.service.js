import { getVectorStore } from "./chroma.client.js";
import User from "../auth/user.model.js";
import { AppError } from "../../utils/AppError.js";

export async function queryDocuments(query, userId) {
  // Check if user has uploaded CV (validation only)
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.document || user.document.chunksIds.length === 0) {
    throw new AppError(
      "No document uploaded yet. Please upload a document first.",
      404
    );
  }

  const vectorStore = await getVectorStore();

  const userIdStr = userId.toString();

  // Use Pinecone's native metadata filtering with topK
  // No manual filtering needed - Pinecone handles all filtering natively
  const results = await vectorStore.similaritySearch(query, 3, {
    userId: userIdStr,
  });

  if (results.length === 0) {
    throw new AppError("No relevant content found in your document", 404);
  }

  // Format results (already filtered by Pinecone natively)
  return {
    documents: [results.map((r) => r.pageContent)],
    ids: [results.map((r) => r.id || "")],
    metadatas: [results.map((r) => r.metadata || {})],
  };
}

/**
 * Get all CV chunks for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of CV chunk contents
 */
export async function getAllCVChunks(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.document || user.document.chunksIds.length === 0) {
    throw new AppError(
      "No document uploaded yet. Please upload a document first.",
      404
    );
  }

  const vectorStore = await getVectorStore();
  const userIdStr = userId.toString();

  // Use a broad query with high topK to get all user's chunks
  // Since we filter by userId in metadata, this should return all chunks
  const maxChunks = Math.min(user.document.chunksIds.length, 100); // Limit to 100 chunks max

  try {
    // Use a very broad query to retrieve all chunks
    // The metadata filter will ensure we only get this user's chunks
    const results = await vectorStore.similaritySearch(
      "experience skills education work projects achievements responsibilities",
      maxChunks,
      {
        userId: userIdStr,
      }
    );

    // Filter to ensure we only get user's chunks (extra safety)
    const userChunks = results.filter(
      (r) => r.metadata?.userId === userIdStr
    );

    // Sort by chunk order if possible (based on ID pattern)
    userChunks.sort((a, b) => {
      const idA = a.id || "";
      const idB = b.id || "";
      return idA.localeCompare(idB);
    });

    return userChunks.map((r) => r.pageContent);
  } catch (error) {
    throw new AppError(
      `Failed to retrieve CV chunks: ${error.message}`,
      500
    );
  }
}