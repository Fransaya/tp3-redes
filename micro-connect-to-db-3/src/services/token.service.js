let session = null;

export function saveSession(data) {
  console.log("savedSession", data);
  session = data;
}

export function getSession() {
  return session;
}

export function clearSession() {
  session = null;
}
