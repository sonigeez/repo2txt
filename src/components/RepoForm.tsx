import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Github } from 'lucide-react'

export default function RepoForm() {
  const [repoUrl, setRepoUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const parsedUrl = new URL(repoUrl)
      const [, owner, repo] = parsedUrl.pathname.split('/')
      if (owner && repo) {
        console.log(`/?repo=${encodeURIComponent(`${owner}/${repo}`)}`)
        window.location.href = `/?repo=${encodeURIComponent(`${owner}/${repo}`)}`
      } else {
        alert('Invalid GitHub repository URL. Please use the format: https://github.com/username/repository')
      }
    } catch (error) {
      console.error(error)
      alert('Please enter a valid GitHub URL')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 mb-8">
      <Input
        type="text"
        value={repoUrl}
        onChange={(e) => setRepoUrl(e.target.value)}
        placeholder="https://github.com/username/repository"
        className="flex-1"
      />
      <Button type="submit">
        <Github className="mr-2 h-4 w-4" />
        Fetch Repository
      </Button>
    </form>
  )
}

