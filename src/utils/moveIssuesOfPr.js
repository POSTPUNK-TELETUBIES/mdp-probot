require('dotenv').config()

const { GET_ISSUES_OF_PR } = require('../graphql/query/get_issues-of-pull')
const { moveCard } = require('./moveCard')

module.exports.moveIssuesOfPr = async (context, numberPr, new_column_id) => {
  const REPO_NAME = context.payload.repository.name

  /* obtener los issue asociados */
  const DATA = await context.octokit.graphql(GET_ISSUES_OF_PR, {
    login: process.env.ORG_NAME,
    name: REPO_NAME,
    number: numberPr,
  })

  const ISSUES =
    DATA.organization.repository.pullRequest.closingIssuesReferences.edges

  /* todos los issue asociados a este pr , se moveran a in dev */
  await Promise.all(
    ISSUES.map(async (issue) => {
      const ITEM_NUMBER = issue.node.number
      await moveCard(context, ITEM_NUMBER, new_column_id)
    }),
  )
}
