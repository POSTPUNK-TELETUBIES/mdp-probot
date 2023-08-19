module.exports.GET_ISSUES_OF_PR = `
query ($login: String!, $name: String!, $number: Int!) {
  organization(login: $login) {
    repository(name: $name) {
      name
      pullRequest(number: $number) {
        title
        number
        closingIssuesReferences(first: 50) {
          edges {
            node {
              id
              number
              title
            }
          }
        }
      }
    }
  }
}
`
