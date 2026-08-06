"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ExamPage() {
  const params = useParams<{ username: string; slug: string }>()
  const username = params.username
  const slug = params.slug

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <Link href={`/${username}/${slug}`}>
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Deck
          </Button>
        </Link>
      </div>

      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md py-12 text-center">
          <CardHeader className="flex flex-col items-center gap-3">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <FileCheck className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-bold">Exam Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">
              Practice exams and test assessments coming soon!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
