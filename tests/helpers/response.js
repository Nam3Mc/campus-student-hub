function extractArray(body) {
  if (Array.isArray(body)) return body;
  if (body && typeof body === 'object') {
    for (const key of [
      'data', 'items', 'results', 'users', 'groups',
      'studyGroups', 'sessions', 'resources',
    ]) {
      if (Array.isArray(body[key])) return body[key];
    }
  }
  return null;
}

function extractDoc(body) {
  if (!body || typeof body !== 'object') return null;
  if (body._id) return body;
  for (const key of [
    'data', 'user', 'group', 'studyGroup',
    'session', 'resource', 'item', 'result',
  ]) {
    if (body[key] && typeof body[key] === 'object') return body[key];
  }
  return body;
}

module.exports = { extractArray, extractDoc };