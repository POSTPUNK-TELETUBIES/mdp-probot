require('dotenv').config()

module.exports.STATUS_OPTIONS = {
  // BACKLOG: {
  //   id: 'xxxxxxxxxx',
  // },
  // TODO: {
  //   id: 'xxxxxxxxxx',
  // },
  IN_PROGRESS: {
    id: process.env.IN_PROGRESS_ID,
  },
  IN_PR: {
    id: process.env.IN_PR_ID,
  },
  IN_DEV: {
    id: process.env.IN_DEV_ID,
  },
  IN_MAIN: {
    id: process.env.IN_MAIN_ID,
  },
  // DONE: {
  //   id: 'xxxxxxxxxx',
  // },
}
