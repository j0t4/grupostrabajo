"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Workgroup {
  id: number;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  deactivationDate: string | null;
  parentId: number | null;
}

type WorkgroupCardProps = {
  workgroup: Workgroup;
}

export default function WorkgroupCard({ workgroup }: WorkgroupCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{workgroup.name}</CardTitle>
            <CardDescription className="mt-1">{workgroup.description}</CardDescription>
          </div>
          {/* Placeholder for members and last activity */}
          <div className="flex -space-x-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
            <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
            <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs bg-gray-200 text-gray-600">
              +9
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-500 mt-2">Members: {Math.floor(Math.random() * 50) + 10}</div>
        <div className="text-sm text-gray-500">Last activity: {Math.floor(Math.random() * 7) + 1} days ago</div>
      </CardContent>
    </Card>
  )
}
