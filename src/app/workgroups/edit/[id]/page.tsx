"use client"

import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import WorkgroupForm, { WorkgroupFormData } from "../../components/WorkgroupForm"

export default function EditWorkgroupPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params

  const [initialData, setInitialData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      const fetchWorkgroup = async () => {
        setLoading(true)
        try {
          const response = await fetch(`/api/workgroups/${id}`)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data = await response.json()
          setInitialData({
            ...data,
            deactivationDate: data.deactivationDate ? new Date(data.deactivationDate).toISOString().split("T")[0] : "",
            parentId: data.parentId || undefined,
          })
        } catch (e) {
          setError(e.message)
          toast.error("Failed to fetch workgroup data", {
            description: `Error: ${e.message}`,
          })
        } finally {
          setLoading(false)
        }
      }
      fetchWorkgroup()
    }
  }, [id])

  const handleSubmit = async (formData: WorkgroupFormData) => {
    setLoading(true)

    try {
      const response = await fetch(`/api/workgroups/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      toast.success("Workgroup updated successfully.", {
        description: "The workgroup's information has been successfully updated.",
      })
      router.push("/workgroups") // Redirect to workgroups list page
    } catch (error) {
      toast.error("Failed to update workgroup", {
        description: `Error: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading && !initialData) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <WorkgroupForm 
      initialData={initialData} 
      onSubmitAction={handleSubmit}
      loading={loading}
      isEditing={true}
    />
  )
}
