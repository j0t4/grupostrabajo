"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Workgroup {
  id: number;
  name: string;
}


export type WorkgroupFormData = {
  id?: number;
  name: string;
  description: string;
  status: string;
  deactivationDate: string;
  parentId?: number;
  memberships?: {
    memberId: number;
    workgroupId: number;
    role: string;
    startDate: string;
    endDate: string | null;
    endDateDescription: string | null;
    member: {
      id: number;
      name: string;
      surname: string;
      email: string;
    };
  }[];
}

type WorkgroupFormProps = {
  initialData?: WorkgroupFormData;
  onSubmitAction: (data: WorkgroupFormData) => void;
  loading: boolean;
  isEditing?: boolean;
}

export default function WorkgroupForm({ 
  initialData, 
  onSubmitAction, 
  loading, 
  isEditing = false 
}: WorkgroupFormProps) {
  const [formData, setFormData] = useState<WorkgroupFormData>({
    name: "",
    description: "",
    status: "ACTIVE",
    deactivationDate: "",
    ...initialData
  })
  const [activeWorkgroups, setActiveWorkgroups] = useState<Workgroup[]>([]);

  useEffect(() => {
    const fetchActiveWorkgroups = async () => {
      try {
        const response = await fetch("/api/workgroups?status=ACTIVE");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setActiveWorkgroups(data);
      } catch (error) {
        console.error("Failed to fetch active workgroups", error);
      }
    };

    fetchActiveWorkgroups();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSelectChange = (value: string, field: keyof WorkgroupFormData) => {
    setFormData(prev => {
      const newValues = { ...prev };
      if (field === 'parentId') {
        const numValue = parseInt(value, 10);
        newValues.parentId = isNaN(numValue) ? undefined : numValue;
      } else {
        (newValues as any)[field] = value;
      }
      return newValues;
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmitAction(formData)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">
            {isEditing ? "Edit Workgroup" : "Add New Workgroup"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentId">Parent Workgroup</Label>
                  <Select
                    onValueChange={(value) => handleSelectChange(value, "parentId")}
                    value={formData.parentId?.toString() ?? ""}
                  >
                    <SelectTrigger id="parentId">
                      <SelectValue placeholder="Select a parent workgroup" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeWorkgroups.map((workgroup) => (
                        <SelectItem key={workgroup.id} value={workgroup.id.toString()}>
                          {workgroup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      onValueChange={(value) => handleSelectChange(value, "status")}
                      value={formData.status}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.status === "INACTIVE" && (
                  <div className="space-y-2">
                    <Label htmlFor="deactivationDate">Deactivation Date</Label>
                    <Input
                      id="deactivationDate"
                      type="date"
                      value={formData.deactivationDate}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading
                    ? (isEditing ? "Updating..." : "Adding...")
                    : (isEditing ? "Update Workgroup" : "Add Workgroup")}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="members">
              <div className="rounded-md border p-4">
                <h3 className="text-lg font-medium mb-4">Workgroup Members</h3>
                {initialData?.memberships && initialData.memberships.length > 0 ? (
                  <ul className="space-y-2">
                    {initialData.memberships.map((membership: any) => (
                      <li key={membership.memberId} className="flex items-center justify-between p-2 border rounded-md">
                        <span>{membership.member.name} {membership.member.surname} ({membership.member.email})</span>
                        <span className="text-sm text-gray-500">Role: {membership.role}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No members in this workgroup.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
