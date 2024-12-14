import { Octokit } from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

export async function fetchRepoContents(repoUrl: string) {
  const [owner, repoName] = repoUrl.split('/')
  const response = await octokit.repos.getContent({
    owner,
    repo: repoName,
    path: '',
  })

  return buildTree(Array.isArray(response.data) ? response.data : [response.data], owner, repoName)
}

async function buildTree(items, owner: string, repo: string, path = '') {
  const tree = { name: path.split('/').pop() || repo, type: 'tree', contents: [] }

  for (const item of items) {
    if (item.type === 'dir') {
      const contents = await octokit.repos.getContent({
        owner,
        repo,
        path: item.path,
      })
      const subtree = await buildTree(contents.data, owner, repo, item.path)
      tree.contents.push(subtree)
    } else {
      tree.contents.push({
        name: item.name,
        type: 'blob',
        path: item.path,
      })
    }
  }

  return tree
}

export async function fetchFileContent(repoUrl: string, filePath: string) {
  const [owner, repoName] = repoUrl.split('/')
  const response = await octokit.repos.getContent({
    owner,
    repo: repoName,
    path: filePath,
  })

  if ('content' in response.data) {
    return atob(response.data.content.replace(/\s/g, ''))
  } else {
    throw new Error('Unable to fetch file content')
  }
}
