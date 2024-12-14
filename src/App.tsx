import RepoForm from "./components/RepoForm";
import RepoTreeView from "@/components/RepoTreeView";
import { Toaster } from "@/components/ui/toaster"

export default function App() {
  // get params
  const searchParams = new URLSearchParams(window.location.search);
  const repo = searchParams.get('repo');

  return (
    <div
    className="container mx-auto p-4 max-w-4xl"
    >
    <RepoForm />
    {repo && <RepoTreeView repo={repo} />}
    <Toaster />
    </div>
  );
}
