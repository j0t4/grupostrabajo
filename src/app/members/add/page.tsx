"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import MemberForm from "../components/MemberForm"

export default function AddMemberPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: any) => {
    setLoading(true)

    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      toast.success("Member added successfully.", {
        description: "The new member has been successfully added to the system.",
      })
      router.push("/members") // Redirect to members list page
    } catch (error: any) {
      toast.error("Failed to add member", {
        description: `Error: ${error.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <MemberForm 
      onSubmitAction={handleSubmit}
      loading={loading}
    />
  )
}