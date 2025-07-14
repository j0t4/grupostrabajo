"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter, Edit, Users, Calendar, Folder, Users2 } from "lucide-react"
import WorkgroupCard from "./components/WorkgroupCard"

interface Workgroup {
  id: number;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  deactivationDate: string | null;
  parentId: number | null;
  children?: Workgroup[];
  parent?: Workgroup;
}

export default function WorkgroupsPage() {
  const router = useRouter()
  const [allWorkgroups, setAllWorkgroups] = useState<Workgroup[]>([])
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
        if (data.length > 0) {
          setSelectedWorkgroupId(data[0].id) // Select the first workgroup by default
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
        setLoading(true)
        try {
          const response = await fetch(`/api/workgroups/${selectedWorkgroupId}`)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data = await response.json()
          setSelectedWorkgroup(data)
        } catch (e: any) {
          setError(e.message)
        } finally {
          setLoading(false)
        }
      } else {
        setSelectedWorkgroup(null)
      }
    }

    fetchSelectedWorkgroup()
  }, [selectedWorkgroupId])

  const filteredWorkgroups = allWorkgroups.filter((workgroup) =>
    workgroup.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const WorkgroupCard = ({ workgroup }: { workgroup: Workgroup }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{workgroup.name}</CardTitle>
            <CardDescription className="mt-1">{workgroup.description}</CardDescription>
          </div>
          {/* Placeholder for members and last activity */}
          <div className="flex -space-x-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
            <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
            <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs bg-gray-200 text-gray-600">
              +9
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500 mt-2">Members: {Math.floor(Math.random() * 50) + 10}</div>
        <div className="text-sm text-gray-500">Last activity: {Math.floor(Math.random() * 7) + 1} days ago</div>
      </CardContent>
    </Card>
  )

  if (loading && allWorkgroups.length === 0) return <div className="min-h-screen flex items-center justify-center">Loading workgroups...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Workgroups</h2>
          <Button size="icon" className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/workgroups/add")}>
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        <nav>
          <ul>
            {filteredWorkgroups.map((workgroup) => (
              <li key={workgroup.id} className="mb-2">
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${selectedWorkgroupId === workgroup.id ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "text-gray-700 hover:bg-gray-100"}`}
                  onClick={() => setSelectedWorkgroupId(workgroup.id)}
                >
                  {workgroup.name}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>All Workgroups</span>
            {selectedWorkgroup?.parent && (
              <>
                <span>/</span>
                <span>{selectedWorkgroup.parent.name}</span>
              </>
            )}
            {selectedWorkgroup && (
              <>
                <span>/</span>
                <span className="font-semibold text-gray-900">{selectedWorkgroup.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search workgroups"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => router.push(`/workgroups/edit/${selectedWorkgroupId}`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button className="bg-black text-white hover:bg-gray-800">
              <Users className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>

        {selectedWorkgroup && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedWorkgroup.name}</h1>
            <p className="text-gray-600 mb-8">{selectedWorkgroup.description}</p>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Child Workgroups</h2>
              <Button variant="outline" onClick={() => router.push("/workgroups/add")}>
                <Plus className="w-4 h-4 mr-2" />
                New Workgroup
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {selectedWorkgroup.children && selectedWorkgroup.children.length > 0 ? (
                selectedWorkgroup.children.map((child) => (
                  <WorkgroupCard key={child.id} workgroup={child} />
                ))
              ) : (
                <p className="text-gray-500">No child workgroups found.</p>
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
        )}
      </main>
    </div>
  )
}