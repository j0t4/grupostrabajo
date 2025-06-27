"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Users, Plus, Search, Filter, Mail, Phone, MapPin } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string; // e.g., "active", "inactive"
  workgroups: string[]; // e.g., ["Engineering", "Marketing"]
}

export default function MembersPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch("/api/members")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setMembers(data)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [])

  const activeMembers = members.filter((m) => m.status === "active")
  const inactiveMembers = members.filter((m) => m.status === "inactive")

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.workgroups.some(wg => wg.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const MemberCard = ({ member }: { member: Member }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{member.name}</CardTitle>
            <CardDescription className="mt-1">{member.email}</CardDescription>
          </div>
          <Badge
            variant={member.status === "active" ? "default" : "secondary"}
            className={member.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
          >
            {member.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            {member.email}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            {member.phone}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {member.address}
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm text-gray-500">Workgroups: {Array.isArray(member.workgroups) ? member.workgroups.join(", ") : "N/A"}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="outline">
            View Profile
          </Button>
          <Button size="sm">Edit Member</Button>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading members...</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Members</h1>
            <p className="text-gray-600">Manage your team members</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/members/add")}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Member
          </Button>
        </div>
      </header>

      <div className="p-6">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search members by name, email, or workgroup..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Member Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-sm text-gray-600">Total Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{activeMembers.length}</div>
              <p className="text-sm text-gray-600">Active Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{inactiveMembers.length}</div>
              <p className="text-sm text-gray-600">Inactive Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(members.flatMap(m => m.workgroups)).size}
              </div>
              <p className="text-sm text-gray-600">Unique Workgroups</p>
            </CardContent>
          </Card>
        </div>

        {/* Members Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="active">Active Members</TabsTrigger>
            <TabsTrigger value="inactive">Inactive Members</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeMembers.filter((member) =>
                member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.workgroups.some(wg => wg.toLowerCase().includes(searchTerm.toLowerCase()))
              ).map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="inactive" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inactiveMembers.filter((member) =>
                member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.workgroups.some(wg => wg.toLowerCase().includes(searchTerm.toLowerCase()))
              ).map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
