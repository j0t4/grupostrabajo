"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type MemberFormData = {
  id?: number;
  name: string;
  surname: string;
  email: string;
  dni: string;
  position: string;
  organization: string;
  phone1: string;
  phone1Description: string;
  phone2: string;
  phone2Description: string;
  phone3: string;
  phone3Description: string;
  status: string;
  deactivationDate: string;
  deactivationDescription: string;
}

type MemberFormProps = {
  initialData?: MemberFormData;
  onSubmitAction: (data: MemberFormData) => void;
  loading: boolean;
  isEditing?: boolean;
}

export default function MemberForm({ 
  initialData, 
  onSubmitAction, 
  loading, 
  isEditing = false 
}: MemberFormProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    name: "",
    surname: "",
    email: "",
    dni: "",
    position: "",
    organization: "",
    phone1: "",
    phone1Description: "",
    phone2: "",
    phone2Description: "",
    phone3: "",
    phone3Description: "",
    status: "ACTIVE",
    deactivationDate: "",
    deactivationDescription: "",
    ...initialData
  })

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

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value
    }))
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
            {isEditing ? "Edit Member" : "Add New Member"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="surname">Surname</Label>
                <Input 
                  id="surname" 
                  value={formData.surname} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input 
                  id="dni" 
                  value={formData.dni} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input 
                  id="position" 
                  value={formData.position} 
                  onChange={handleChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input 
                  id="organization" 
                  value={formData.organization} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone1">Phone 1</Label>
                <Input 
                  id="phone1" 
                  value={formData.phone1} 
                  onChange={handleChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone1Description">Phone 1 Description</Label>
                <Input 
                  id="phone1Description" 
                  value={formData.phone1Description} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone2">Phone 2</Label>
                <Input 
                  id="phone2" 
                  value={formData.phone2} 
                  onChange={handleChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone2Description">Phone 2 Description</Label>
                <Input 
                  id="phone2Description" 
                  value={formData.phone2Description} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone3">Phone 3</Label>
                <Input 
                  id="phone3" 
                  value={formData.phone3} 
                  onChange={handleChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone3Description">Phone 3 Description</Label>
                <Input 
                  id="phone3Description" 
                  value={formData.phone3Description} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  onValueChange={handleSelectChange} 
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deactivationDate">Deactivation Date</Label>
                  <Input 
                    id="deactivationDate" 
                    type="date" 
                    value={formData.deactivationDate} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deactivationDescription">Deactivation Description</Label>
                  <Textarea 
                    id="deactivationDescription" 
                    value={formData.deactivationDescription} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading 
                ? (isEditing ? "Updating..." : "Adding...")
                : (isEditing ? "Update Member" : "Add Member")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}