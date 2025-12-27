// app/[id]/goals/page.js
export default function GoalsPage() {
    return (
      <div className="p-8">
        <div className="max-w-4xl">
          <h2 className="text-3xl font-semibold mb-2">Goals</h2>
          <p className="text-gray-400 mb-8">Track and achieve your project goals.</p>
          
          <div className="space-y-6">
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Q1 Product Launch</h3>
                  <p className="text-sm text-gray-400">Complete by March 31, 2025</p>
                </div>
                <span className="text-sm px-3 py-1 bg-green-900 text-green-300 rounded-full">
                  On Track
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white">65%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gray-900 rounded-lg border border-gray-800">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Increase Team Productivity</h3>
                  <p className="text-sm text-gray-400">Complete by December 31, 2025</p>
                </div>
                <span className="text-sm px-3 py-1 bg-orange-900 text-orange-300 rounded-full">
                  At Risk
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white">42%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }