export const DB_CONFIG = {
  collections: {
    users: 'users',
    thoughts: 'thoughts',
    feelings: 'feelings',
    responses: 'responses'
  },
  paths: {
    users: 'users',
    userThoughts: (userId) => `users/${userId}/thoughts`,
    userFeelings: (userId) => `users/${userId}/feelings`,
    userResponses: (userId) => `users/${userId}/responses`
  }
}; 