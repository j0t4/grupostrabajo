"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import MemberForm, { MemberFormData } from "../../components/MemberForm"

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

export default function EditMemberPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [initialData, setInitialData] = useState<MemberFormData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await fetch(`/api/members/${params.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setInitialData({
          ...data,
          deactivationDate: data.deactivationDate ? data.deactivationDate.split('T')[0] : ""
        })
      } catch (error) {
        toast.error("Failed to load member", {
          description: `Error: ${error.message}`,
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchMember()
    }
  }, [params.id])

  const handleSubmit = async (formData: MemberFormData) => {
    try {
      const response = await fetch(`/api/members/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          id: parseInt(params.id)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      toast.success("Member updated successfully.")
      router.push("/members")
    } catch (error) {
      toast.error("Failed to update member", {
        description: `Error: ${error.message}`,
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!initialData) {
    return <div>Member not found</div>
  }

  return (
    <MemberForm 
      initialData={initialData} 
      onSubmitAction={handleSubmit} 
      loading={false} 
      isEditing={true} 
    />
  )
}