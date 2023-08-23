require('dotenv').config()
const { MOVE_CARD } = require('../graphql/mutation/move_card')
const { octokit } = require('../config/octokit')
const { GET_CARDS_OF_PROJECT } = require('../graphql/query/get_cards_of_project')
const { GET_FIELDS_OF_PROJECT } = require('../graphql/query/get_fields_of_project')

module.exports.moveCard = async (context, item_number, new_column_id) => {
  const REPO_NAME = context.payload.repository.name
  let HAS_NEXT_PAGE = true
  let CURSOR = null
  let ITEM_ID = null

  while (HAS_NEXT_PAGE) {
    //traer 100 items
    const DATA = await octokit.graphql(GET_CARDS_OF_PROJECT, {
      login: process.env.ORG_NAME,
      repoName: REPO_NAME,
      projectNumber: Number(process.env.REPO_PROJECT_NUMBER),
      cursor: CURSOR,
    })

    const ITEMS = DATA.organization.repository.projectV2.items.nodes

    // Encontrar la card que tiene el mismo número que el issue o pr
    const ITEM = ITEMS.find((item) => item.content.number === item_number)

    if (ITEM) {
      ITEM_ID = ITEM.id
      break // Salir del bucle si encontramos el elemento
    }

    // Si no encontramos el elemento en la página actual, avanzar a la siguiente página si la hay
    HAS_NEXT_PAGE = DATA.organization.repository.projectV2.items.pageInfo.hasNextPage
    CURSOR = DATA.organization.repository.projectV2.items.pageInfo.endCursor
  }

  if (!ITEM_ID) {
    console.log('No se encontró el issue')
    return
  }

  /* traer los fields */
  const DATA2 = await context.octokit.graphql(GET_FIELDS_OF_PROJECT, {
    login: process.env.ORG_NAME,
    projectNumber: Number(process.env.REPO_PROJECT_NUMBER),
    repoName: REPO_NAME,
  })

  /* filtrar el field llamado status de los demas */
  const FIELD_STATUS = DATA2.organization.repository.projectV2.fields.nodes.find(
    (field) => field.name === 'Status',
  )

  /* MOVER */
  octokit.graphql(MOVE_CARD, {
    projectId: DATA2.organization.repository.projectV2.id,
    fieldId: FIELD_STATUS.id,

    itemId: ITEM_ID,
    value: {
      singleSelectOptionId: new_column_id,
    },
  })
}
