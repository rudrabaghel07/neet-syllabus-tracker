import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  serverTimestamp,
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

  const topicSnapshot =
    await getDoc(topicRef);

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

export async function getAllTopicProgress(
  userId
) {
  const progressRef = collection(
    db,
    "users",
    userId,
    "progress"
  );

  const progressSnapshot =
    await getDocs(progressRef);

  const progressData = {};

  progressSnapshot.forEach(
    (document) => {
      const data = document.data();

      progressData[document.id] = {
        completed:
          data.completed === true,

        revision:
          data.revision === true,
      };
    }
  );

  return progressData;
}