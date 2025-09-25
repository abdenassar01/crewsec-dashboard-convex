import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default  function DashboardPage() {

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Parkings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Statistics will be displayed here.</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Statistics will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
       <Card>
        <CardHeader>
            <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Charts and more detailed statistics will appear here.</p>
        </CardContent>
       </Card>
    </div>
  );
}