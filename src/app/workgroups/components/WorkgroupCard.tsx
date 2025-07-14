"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Workgroup {
  id: number;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
}

// A simple placeholder for the number of members. In a real app, you'd fetch this data.
const memberCount = Math.floor(Math.random() * 20) + 5;

const WorkgroupCard = ({ workgroup }: { workgroup: Workgroup }) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex-grow">
          <CardTitle className="text-xl font-bold mb-1">{workgroup.name}</CardTitle>
          <CardDescription>{workgroup.description || "No description available."}</CardDescription>
        </div>
        <Badge variant={workgroup.status === "ACTIVE" ? "default" : "destructive"}>
          {workgroup.status}
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      <div className="flex items-center text-sm text-gray-500">
        <UsersIcon className="h-4 w-4 mr-2" />
        <span>{memberCount} Members</span>
      </div>
    </CardContent>
  </Card>
);

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export default WorkgroupCard;
