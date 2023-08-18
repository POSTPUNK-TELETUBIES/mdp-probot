const { getNormalizedNames } = require('./utils/getNormalizedNames')
const { moveIssuesOfPr } = require('./utils/moveIssuesOfPr')

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

module.exports = (app) => {
  /* AL ASIGNAR UN USUARIO A UNA ISSUE */
  app.on('issues.assigned', async (context) => {
    const ASSIGNED = context.payload.issue.assignee.login

    const issueComment = context.issue({
      body: `@${ASSIGNED} se te ha asignado esta issue ¡Adelante y mucho éxito! 😃`,
    })
    return context.octokit.issues.createComment(issueComment)
  })

  /* AL CERRAR UNA ISSUE */
  app.on('issues.closed', async (context) => {
    const ASSIGNEES = context.payload.issue.assignees.map(
      (assignee) => assignee.login,
    )
    const USERS = getNormalizedNames(ASSIGNEES)

    const issueComment = context.issue({
      body: `${USERS} ¡Excelente trabajo! 🎉`,
    })
    return context.octokit.issues.createComment(issueComment)
  })

  /* AL ABRIR UN NUEVO PR */
  app.on('pull_request.opened', async (context) => {
    const RAMA = context.payload.pull_request.base.ref
    const USER = context.payload.pull_request.user.login

    if (RAMA === 'dev') {
      const issueComment = context.issue({
        body: `@${USER} tu pr sera revisado lo antes posible. 😃`,
      })
      return context.octokit.issues.createComment(issueComment)
    }
  })

  /* AL ASIGNAR UN REVISADOR A UN PR */
  app.on('pull_request.review_requested', async (context) => {
    const REQUESTED_REVIEWER = context.payload.pull_request.requested_reviewers
    console.log(REQUESTED_REVIEWER)

    const REVIEWER = REQUESTED_REVIEWER.pop().login
    console.log(REVIEWER)

    // agregar un comentario al pr
    const issueComment = context.issue({
      body: `@${REVIEWER} se ha solicitado tu revisión. 😃`,
    })

    context.octokit.issues.createComment(issueComment)

    //cuando se asigna un revisador a un pr, el issue asociado se mueve a "in review"
    // mover el pr a "in review"
    const NUMBER_PR = context.payload.pull_request.number
    await moveIssuesOfPr(context, NUMBER_PR, 'In pr')
  })

  /* AL MERGEAR EL PR A DEV */
  app.on('pull_request.closed', async (context) => {
    const IS_MERGED = context.payload.pull_request.merged
    const RAMA = context.payload.pull_request.base.ref
    const USER = context.payload.pull_request.user.login
    const NUMBER_PR = context.payload.pull_request.number

    // si no es mergeado terminar
    if (!IS_MERGED) {
      return
    }

    // si el pr fue mergeado a la rama "dev"
    if (RAMA === 'dev') {
      const issueComment = context.issue({
        body: `!Gracias @${USER} por tu contribución constante. 🎉`,
      })

      // agregar un comentario al pr
      context.octokit.issues.createComment(issueComment)

      // mover los isues asociados a este pr a "in dev"
      await moveIssuesOfPr(context, NUMBER_PR, 'In dev')
    } else if (RAMA === 'main') {
      await moveIssuesOfPr(context, NUMBER_PR, 'In main')
    }
  })

  /* cuando se cierra un pr sin mergear */
  app.on('pull_request.closed', async (context) => {
    const IS_MERGED = context.payload.pull_request.merged
    const NUMBER_PR = context.payload.pull_request.number

    if (!IS_MERGED) {
      await moveIssuesOfPr(context, NUMBER_PR, 'In progress')
    }
  })

  /* al reabrir un pr */
  app.on('pull_request.reopened', async (context) => {
    const NUMBER_PR = context.payload.pull_request.number
    await moveIssuesOfPr(context, NUMBER_PR, 'In pr')
  })
}
