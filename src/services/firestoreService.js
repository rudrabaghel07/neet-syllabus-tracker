import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase";

// --------------------------------------------------
// Save / Update Topic Progress
// --------------------------------------------------

export async function saveTopicProgress(
  userId,
  topicId,
  completed = false,
  revision = false
) {
  const topicRef = doc(
    db,
    "users",
    userId,
    "progress",
    topicId
  );

  await setDoc(topicRef, {
    completed: Boolean(completed),
    revision: Boolean(revision),
    updatedAt: serverTimestamp(),
  });
}

// --------------------------------------------------
// Get Single Topic Progress
// --------------------------------------------------

export async function getTopicProgress(
  userId,
  topicId
) {
  const topicRef = doc(
    db,
    "users",
    userId,
    "progress",
    topicId
  );

  const topicSnapshot = await getDoc(topicRef);

  if (topicSnapshot.exists()) {
    return topicSnapshot.data();
  }

  return {
    completed: false,
    revision: false,
  };
}

// --------------------------------------------------
// Get All Topic Progress
// --------------------------------------------------

export async function getAllTopicProgress(userId) {
  const progressRef = collection(
    db,
    "users",
    userId,
    "progress"
  );

  const progressSnapshot = await getDocs(progressRef);

  const progressData = {};

  progressSnapshot.forEach((document) => {
    const data = document.data();

    progressData[document.id] = {
      completed: data.completed === true,
      revision: data.revision === true,
    };
  });

  return progressData;
}

// --------------------------------------------------
// Save Complaint
// --------------------------------------------------

export async function saveComplaint({
  userId,
  userEmail,
  userName,
  complaint,
}) {
  if (!userId) {
    throw new Error("User is not logged in.");
  }

  if (!complaint || !complaint.trim()) {
    throw new Error("Complaint cannot be empty.");
  }

  const complaintsRef = collection(
    db,
    "complaints"
  );

  const complaintData = {
    userId,
    userEmail: userEmail || "",
    userName: userName || "",
    complaint: complaint.trim(),
    status: "pending",
    createdAt: serverTimestamp(),
  };

  const complaintDocument = await addDoc(
    complaintsRef,
    complaintData
  );

  return complaintDocument.id;
}