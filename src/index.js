const { STATUS_OPTIONS } = require('./data/status_options')
const { getNormalizedNames } = require('./utils/getNormalizedNames')
const { moveIssuesOfPr } = require('./utils/moveIssuesOfPr')

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

  /* AL ABRIR UN NUEVO PR */ /* check */
  app.on('pull_request.opened', async (context) => {
    const RAMA = context.payload.pull_request.base.ref
    const USER = context.payload.pull_request.user.login

    if (RAMA === 'dev') {
      const issueComment = context.issue({
        body: `@${USER} tu pull request sera revisado lo antes posible. 😃\n\n No olvides seguir estos pasos en este orden:\n\n1. **Vincular el issue** o issues de este pull request en **Development**\n2. **Asignar un Reviewer** o mas para tu pull request`,
      })
      return context.octokit.issues.createComment(issueComment)
    }

    if (RAMA === 'main') {
      const issueComment = context.issue({
        body: `@${USER} no olvides:\n - **Vincular** todos los issues de "In dev" (que se van a pasar a "main") en **Development**, antes de hacer el **merge pull request**.`,
      })
      return context.octokit.issues.createComment(issueComment)
    }
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

    // despues de vincular los issues y asignar un revisador, se mueven los issues a "in pr"
    const NUMBER_PR = context.payload.pull_request.number
    await moveIssuesOfPr(context, NUMBER_PR, STATUS_OPTIONS['IN_PR'].id)
  })

  /* CUANDO SE CIERRA UN PR SIN MERGEAR */
  app.on('pull_request.closed', async (context) => {
    const IS_MERGED = context.payload.pull_request.merged
    const NUMBER_PR = context.payload.pull_request.number

    if (!IS_MERGED) {
      await moveIssuesOfPr(context, NUMBER_PR, STATUS_OPTIONS['IN_PROGRESS'].id)
    }
  })

  /* AL REABRIR UN PR */
  app.on('pull_request.reopened', async (context) => {
    const NUMBER_PR = context.payload.pull_request.number
    await moveIssuesOfPr(context, NUMBER_PR, STATUS_OPTIONS['IN_PR'].id)
  })

  /* AL MERGEAR EL PR A DEV O MAIN */
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
        body: `@${USER} tu pull request fue aceptado, gracias por tu contribución constante 🎉`,
      })

      // agregar un comentario al pr
      context.octokit.issues.createComment(issueComment)

      // mover los isues asociados a este pr a "in dev"
      await moveIssuesOfPr(context, NUMBER_PR, STATUS_OPTIONS['IN_DEV'].id)
    } else if (RAMA === 'main') {
      await moveIssuesOfPr(context, NUMBER_PR, STATUS_OPTIONS['IN_MAIN'].id)
    }
  })
}
