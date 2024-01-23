const { getNormalizedNames } = require('./utils/getNormalizedNames')

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

module.exports = (app) => {
  /* AL ASIGNAR UN USUARIO A UNA ISSUE */ /* check */
  app.on('issues.assigned', async (context) => {
    const ASSIGNED = context.payload.issue.assignee.login

    const issueComment = context.issue({
      body: `@${ASSIGNED} se te ha asignado esta issue !Mucho éxito! 😃`,
    })
    return context.octokit.issues.createComment(issueComment)
  })

  /* AL CERRAR UNA ISSUE */ /* check */
  app.on('issues.closed', async (context) => {
    const ASSIGNEES = context.payload.issue.assignees.map((assignee) => assignee.login)
    const USERS = getNormalizedNames(ASSIGNEES)

    const issueComment = context.issue({
      body: `${USERS} ¡Excelente trabajo! 🎉`,
    })
    return context.octokit.issues.createComment(issueComment)
  })

  /* AL ASIGNAR UN REVISADOR A UN PR */ /* check */
  app.on('pull_request.review_requested', async (context) => {
    const REQUESTED_REVIEWER = context.payload.pull_request.requested_reviewers
    const REVIEWER = REQUESTED_REVIEWER.pop().login

    // agregar un comentario al pr
    const issueComment = context.issue({
      body: `@${REVIEWER} se ha solicitado tu revisión. 😃`,
    })

    context.octokit.issues.createComment(issueComment)
  })

  /* AL MERGEAR EL PR A DEV O MAIN */
  app.on('pull_request.closed', async (context) => {
    const IS_MERGED = context.payload.pull_request.merged
    const USER = context.payload.pull_request.user.login

    // si no es mergeado terminar
    if (!IS_MERGED) {
      return
    }

    // si el pr fue mergeado a la rama "dev"
    const issueComment = context.issue({
      body: `@${USER} tu pull request fue aceptado, gracias por tu contribución constante 🎉`,
    })

    // agregar un comentario al pr
    context.octokit.issues.createComment(issueComment)
  })
}
