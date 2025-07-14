"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import WorkgroupForm, { WorkgroupFormData } from "../components/WorkgroupForm"

export default function AddWorkgroupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: WorkgroupFormData) => {
    setLoading(true)

    try {
      const dataToSubmit = {
        ...formData,
        parentId: formData.parentId ? Number(formData.parentId) : null,
      };

      const response = await fetch("/api/workgroups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      toast.success("Workgroup added successfully.", {
        description: "The new workgroup has been successfully added to the system.",
      })
      router.push("/workgroups") // Redirect to workgroups list page
    } catch (error) {
      toast.error("Failed to add workgroup", {
        description: `Error: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <WorkgroupForm 
      onSubmitAction={handleSubmit}
      loading={loading}
    />
  )
}
