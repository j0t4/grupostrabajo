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
        } catch (e: any) {
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
      // Destructure formData to exclude 'id', 'children', and 'parent' from the payload
      // This is crucial because the backend schema is strict and doesn't expect these fields.
      const { id: _, children: __, parent: ___, ...payload } = formData; 

      // Transform deactivationDate for the API if it's not empty
      if (payload.deactivationDate === "") {
        (payload as any).deactivationDate = null; // Cast to any to allow assigning null
      } else if (payload.deactivationDate) {
        // Convert YYYY-MM-DD to ISO 8601 datetime string (e.g., "2023-10-26T00:00:00.000Z")
        // by appending T00:00:00Z to ensure it's treated as UTC midnight of that date
        const dateAsUTC = new Date(payload.deactivationDate + 'T00:00:00Z');
        if (!isNaN(dateAsUTC.getTime())) {
            (payload as any).deactivationDate = dateAsUTC.toISOString();
        } else {
            // If the date string is somehow invalid even with T00:00:00Z, set to null
            console.warn("Invalid deactivation date string encountered, sending null:", formData.deactivationDate);
            (payload as any).deactivationDate = null;
        }
      }

      const response = await fetch(`/api/workgroups/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}. Details: ${JSON.stringify(errorData.details || errorData)}`)
      }

      toast.success("Workgroup updated successfully.", {
        description: "The workgroup's information has been successfully updated.",
      })
      router.push("/workgroups") // Redirect to workgroups list page
    } catch (error: any) {
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
