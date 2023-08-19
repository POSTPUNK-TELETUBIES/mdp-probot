require('dotenv').config()
const { MOVE_CARD } = require('../graphql/mutation/move_card')
const { octokit } = require('../config/octokit')
const { GET_DATA_PROJECT } = require('../graphql/query/get_data_project')

module.exports.moveCard = async (context, item_number, new_column_id) => {
  const REPO_NAME = context.payload.repository.name

  const DATA = await octokit.graphql(GET_DATA_PROJECT, {
    login: process.env.ORG_NAME,
    repoName: REPO_NAME,
    projectNumber: Number(process.env.REPO_PROJECT_NUMBER),
  })

  const ITEMS = DATA.organization.repository.projectV2.items.nodes

  /* filtra el que tiene un number en especifico */
  const ITEM = ITEMS.filter((item) => item.content.number === item_number)
  const ITEM_ID = ITEM[0].id

  /* filtrar el field llamado status de los demas */
  const FIELD_STATUS =
    DATA.organization.repository.projectV2.fields.nodes.filter(
      (field) => field.name === 'Status',
    )

  /* MOVER */
  octokit.graphql(MOVE_CARD, {
    projectId: DATA.organization.repository.projectV2.id,
    fieldId: FIELD_STATUS[0].id,

    itemId: ITEM_ID,
    value: {
      singleSelectOptionId: new_column_id,
    },
  })
}
