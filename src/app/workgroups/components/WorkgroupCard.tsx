"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Users, Calendar, BookOpen, FileText, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface Workgroup {
  id: number;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  memberships?: Array<{
    member: {
      id: number;
      name: string;
      surname: string;
      email: string;
      status: "ACTIVE" | "INACTIVE";
    };
    role: string;
  }>;
  meetings?: unknown[];
  logbookEntries?: unknown[];
}

interface Member {
  id: number;
  name: string;
  surname: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
}

const WorkgroupCard = ({ workgroup }: { workgroup: Workgroup }) => {
  const router = useRouter();
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  
  const memberCount = workgroup.memberships?.length || 0;
  const meetingCount = workgroup.meetings?.length || 0;
  const logbookCount = workgroup.logbookEntries?.length || 0;

  useEffect(() => {
    const fetchAvailableMembers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/members');
        if (!response.ok) throw new Error('Failed to fetch members');
        const allMembers = await response.json();
        
        // Filter active members not already in this workgroup
        const assignedMemberIds = new Set(
          workgroup.memberships?.map(m => m.member.id) || []
        );
        
        const available = allMembers.filter(
          (member: Member) => 
            member.status === "ACTIVE" && 
            !assignedMemberIds.has(member.id)
        );
        
        setAvailableMembers(available);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableMembers();
  }, [workgroup.id, workgroup.memberships]);

  const addMemberToWorkgroup = async (memberId: number) => {
    try {
      const response = await fetch('/api/memberships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId,
          workgroupId: workgroup.id,
          role: 'GUEST',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add member');
      }
      
      // Refresh the page to show updated memberships
      window.location.reload();
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member to workgroup');
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-grow">
            <CardTitle className="text-2xl font-bold mb-1">{workgroup.name}</CardTitle>
            <CardDescription>{workgroup.description || "No description available."}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={workgroup.status === "ACTIVE" ? "default" : "destructive"}>
              {workgroup.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/workgroups/add")}>
                  New Workgroup
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Existing Member
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {loading ? (
                      <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                    ) : availableMembers.length === 0 ? (
                      <DropdownMenuItem disabled>No available members</DropdownMenuItem>
                    ) : (
                      availableMembers.map((member) => (
                        <DropdownMenuItem
                          key={member.id}
                          onClick={() => addMemberToWorkgroup(member.id)}
                        >
                          {member.name} {member.surname} ({member.email})
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-1" />
              Members ({memberCount})
            </TabsTrigger>
            <TabsTrigger value="meetings">
              <Calendar className="h-4 w-4 mr-1" />
              Meetings ({meetingCount})
            </TabsTrigger>
            <TabsTrigger value="logbook">
              <BookOpen className="h-4 w-4 mr-1" />
              Logbook ({logbookCount})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="h-4 w-4 mr-2" />
                <span>{workgroup.description || "No description available"}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>{memberCount} members</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{meetingCount} meetings</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="h-4 w-4 mr-2" />
                <span>{logbookCount} logbook entries</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="members" className="mt-4">
            <div className="text-sm text-gray-600">
              {memberCount > 0 ? (
                <p>Members list will be displayed here</p>
              ) : (
                <p>No members in this workgroup</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="meetings" className="mt-4">
            <div className="text-sm text-gray-600">
              {meetingCount > 0 ? (
                <p>Meetings list will be displayed here</p>
              ) : (
                <p>No meetings scheduled</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="logbook" className="mt-4">
            <div className="text-sm text-gray-600">
              {logbookCount > 0 ? (
                <p>Logbook entries will be displayed here</p>
              ) : (
                <p>No logbook entries</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default WorkgroupCard;
