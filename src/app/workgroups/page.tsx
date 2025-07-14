"use client"

import { useState, useEffect, Fragment, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Plus, Search, Edit, Users, Calendar, Folder, Users2 } from "lucide-react"
import WorkgroupCard from "./components/WorkgroupCard"

interface Workgroup {
  id: number;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  deactivationDate: string | null;
  parentId: number | null;
  children: Workgroup[];
  parent?: Workgroup;
}

const buildTree = (workgroups: Workgroup[]): Workgroup[] => {
  const map = new Map<number, Workgroup>();
  const roots: Workgroup[] = [];

  workgroups.forEach(workgroup => {
    map.set(workgroup.id, { ...workgroup, children: [] });
  });

  workgroups.forEach(workgroup => {
    const node = map.get(workgroup.id)!;
    if (workgroup.parentId !== null && map.has(workgroup.parentId)) {
      map.get(workgroup.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

const getBreadcrumbPath = (workgroupId: number | null, workgroups: Workgroup[]): Workgroup[] => {
  if (!workgroupId) return [];
  const path: Workgroup[] = [];
  let current = workgroups.find(w => w.id === workgroupId);
  while (current) {
      path.unshift(current);
      if (current.parentId) {
          current = workgroups.find(w => w.id === current.parentId);
      } else {
        current = undefined;
      }
  }
  return path;
};

const WorkgroupTree = ({ workgroups, onSelect, selectedId, level = 0 }: { workgroups: Workgroup[], onSelect: (id: number) => void, selectedId: number | null, level?: number }) => {
  return (
    <ul className="space-y-1">
      {workgroups.map((workgroup) => (
        <li key={workgroup.id}>
          <Button
            variant="ghost"
            className={`w-full justify-start text-left h-auto py-2 ${selectedId === workgroup.id ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "text-gray-700 hover:bg-gray-100"}`}
            style={{ paddingLeft: `${1 + level * 1.5}rem` }}
            onClick={() => onSelect(workgroup.id)}
          >
            {workgroup.name}
          </Button>
          {workgroup.children && workgroup.children.length > 0 && (
            <WorkgroupTree workgroups={workgroup.children} onSelect={onSelect} selectedId={selectedId} level={level + 1} />
          )}
        </li>
      ))}
    </ul>
  );
};

export default function WorkgroupsPage() {
  const router = useRouter()
  const [allWorkgroups, setAllWorkgroups] = useState<Workgroup[]>([])
  const [workgroupTree, setWorkgroupTree] = useState<Workgroup[]>([])
  const [selectedWorkgroupId, setSelectedWorkgroupId] = useState<number | null>(null)
  const [selectedWorkgroup, setSelectedWorkgroup] = useState<Workgroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchAllWorkgroups = async () => {
      try {
        const response = await fetch("/api/workgroups")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setAllWorkgroups(data)
        const tree = buildTree(data)
        setWorkgroupTree(tree);

        if (data.length > 0 && !selectedWorkgroupId) {
          setSelectedWorkgroupId(tree[0]?.id || data[0].id)
        }
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAllWorkgroups()
  }, [])

  useEffect(() => {
    const fetchSelectedWorkgroup = async () => {
      if (selectedWorkgroupId) {
        // No need to set loading to true here, it feels jarring
        try {
          const response = await fetch(`/api/workgroups/${selectedWorkgroupId}`)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data = await response.json()
          setSelectedWorkgroup(data)
        } catch (e: any) {
          setError(e.message)
        }
      } else {
        setSelectedWorkgroup(null)
      }
    }

    fetchSelectedWorkgroup()
  }, [selectedWorkgroupId])

  const filteredWorkgroupTree = useMemo(() => {
    if (!searchTerm.trim()) {
      return workgroupTree;
    }

    const lowercasedFilter = searchTerm.toLowerCase();

    const filter = (nodes: Workgroup[]): Workgroup[] => {
      const result: Workgroup[] = [];
      for (const node of nodes) {
        const children = node.children ? filter(node.children) : [];
        if (node.name.toLowerCase().includes(lowercasedFilter) || children.length > 0) {
          result.push({ ...node, children });
        }
      }
      return result;
    };

    return filter(workgroupTree);
  }, [searchTerm, workgroupTree]);

  const breadcrumbPath = getBreadcrumbPath(selectedWorkgroupId, allWorkgroups);

  if (loading && allWorkgroups.length === 0) return <div className="min-h-screen flex items-center justify-center">Loading workgroups...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-80 bg-white border-r border-gray-200 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Workgroups</h2>
          <Button size="icon" className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/workgroups/add")}>
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search workgroups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
        </div>
        <nav className="flex-grow overflow-y-auto">
          <WorkgroupTree
            workgroups={filteredWorkgroupTree}
            onSelect={setSelectedWorkgroupId}
            selectedId={selectedWorkgroupId}
          />
        </nav>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 flex-wrap">
            <span>All Workgroups</span>
            {breadcrumbPath.map((w, index) => (
                <Fragment key={w.id}>
                    <span>/</span>
                    <span className={index === breadcrumbPath.length - 1 ? "font-semibold text-gray-900" : ""}>
                        {w.name}
                    </span>
                </Fragment>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.push(`/workgroups/edit/${selectedWorkgroupId}`)} disabled={!selectedWorkgroupId}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button className="bg-black text-white hover:bg-gray-800" disabled={!selectedWorkgroupId}>
              <Users className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        {selectedWorkgroup ? (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedWorkgroup.name}</h1>
            <p className="text-gray-600 mb-8">{selectedWorkgroup.description}</p>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Child Workgroups</h2>
              <Button variant="outline" onClick={() => router.push("/workgroups/add", { query: { parentId: selectedWorkgroupId } } as any)}>
                <Plus className="w-4 h-4 mr-2" />
                New Sub-Workgroup
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {selectedWorkgroup.children && selectedWorkgroup.children.length > 0 ? (
                selectedWorkgroup.children.map((child) => (
                  <WorkgroupCard key={child.id} workgroup={child} />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-8">
                    <p>No child workgroups found.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6 flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <Users2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">68</div>
                    <p className="text-sm text-gray-600">Total Members</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-sm text-gray-600">Meetings This Month</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <Folder className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-sm text-gray-600">Active Projects</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                    <Users2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{selectedWorkgroup.children?.length || 0}</div>
                    <p className="text-sm text-gray-600">Child Workgroups</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <Folder size={48} className="mb-4" />
                <h2 className="text-xl font-semibold mb-2">Select a workgroup</h2>
                <p>Choose a workgroup from the list on the left to see its details.</p>
            </div>
        )}
      </main>
    </div>
  )
}