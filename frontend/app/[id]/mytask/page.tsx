// app/[id]/mytask/page.js
export default function MyTasksPage() {
    return (
      <div className="p-8">
        <div className="max-w-4xl">
          <h2 className="text-3xl font-semibold mb-2">My Tasks</h2>
          <p className="text-gray-400 mb-8">Manage all your assigned tasks in one place.</p>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-700" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Design new landing page</h4>
                  <p className="text-sm text-gray-400">Due: Tomorrow</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-700" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Review marketing materials</h4>
                  <p className="text-sm text-gray-400">Due: Dec 25</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="flex items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-700" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">Update project documentation</h4>
                  <p className="text-sm text-gray-400">Due: Next week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }