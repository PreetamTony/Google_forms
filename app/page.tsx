import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, FileText, ClipboardList, BarChart } from "lucide-react"
import { formTemplates } from "@/components/form-builder/form-templates"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="text-center space-y-2 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Create Forms with Ease</h1>
          <p className="text-muted-foreground text-lg">
            Build beautiful forms, collect responses, and analyze data all in one place.
          </p>
        </div>

        <div className="w-full max-w-5xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-full md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Start from scratch</CardTitle>
              <CardDescription>Create a custom form with your own questions</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <div className="h-32 flex items-center justify-center bg-muted/50 rounded-md">
                <FileText className="h-16 w-16 text-muted-foreground/70" />
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/forms/new" className="w-full">
                <Button className="w-full" size="lg">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Blank Form
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {formTemplates.slice(1, 4).map((template) => (
            <Card key={template.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-2">
                <div className="h-32 flex items-center justify-center bg-muted/50 rounded-md">
                  <ClipboardList className="h-16 w-16 text-muted-foreground/70" />
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/forms/new?template=${template.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Use Template
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="w-full max-w-5xl pt-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Recent Forms</CardTitle>
              <CardDescription>Continue working on your forms or view responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div id="forms-list" className="min-h-[100px] flex items-center justify-center">
                <p className="text-center text-muted-foreground py-8">You haven't created any forms yet.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/forms">
                  <BarChart className="mr-2 h-4 w-4" />
                  View All Forms
                </Link>
              </Button>
              <Button asChild>
                <Link href="/forms/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Form
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
