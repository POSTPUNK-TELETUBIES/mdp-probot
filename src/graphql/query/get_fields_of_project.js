module.exports.GET_FIELDS_OF_PROJECT = `
query ($login: String!, $projectNumber: Int!, $repoName: String!) {
  organization(login: $login) {
    repository(name: $repoName) {
      projectV2(number: $projectNumber) {
        title
        id
        fields(first: 20) {
          nodes {
            ... on ProjectV2SingleSelectField {
              id
              name
              options {
                id
                name
              }
            }
            ... on ProjectV2Field {
              name
            }
          }
        }
      }
    }
  }
}
`
