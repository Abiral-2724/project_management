// app/[id]/home/page.js
export default function HomePage() {
    return (
      <div className="p-8">
        <div className="max-w-4xl">
          <h2 className="text-3xl font-semibold mb-2">Welcome Back!</h2>
          <p className="text-gray-400 mb-8">Here's what's happening with your projects today.</p>
          
          <div className="grid gap-6">
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
              <p className="text-gray-400">Your recent project updates will appear here.</p>
            </div>
            
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <div className="text-2xl font-bold text-cyan-400">8</div>
                  <div className="text-sm text-gray-400">Active Projects</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">24</div>
                  <div className="text-sm text-gray-400">Tasks Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-400">12</div>
                  <div className="text-sm text-gray-400">In Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }