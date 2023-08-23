module.exports.GET_CARDS_OF_PROJECT = `
query GetProjectInfo($login: String!, $repoName: String!, $projectNumber: Int!, $cursor: String) {
  organization(login: $login) {
    repository(name: $repoName) {
      projectV2(number: $projectNumber) {
        title
        id
        items(first: 100, after: $cursor) {
          totalCount
          nodes {
            id
            type
            content {
              ... on PullRequest {
                title
                number
                updatedAt
              }
              ... on Issue {
                title
                number
                updatedAt
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  }
}
`
