"use client"

const BankDetails = ({ quotationData, handleInputChange }) => {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-medium mb-6 text-center">Bank Details</h3>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm max-w-md mx-auto">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Account No.</label>
            <input
              type="text"
              value={quotationData.accountNo}
              onChange={(e) => handleInputChange("accountNo", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Bank Name</label>
            <input
              type="text"
              value={quotationData.bankName}
              onChange={(e) => handleInputChange("bankName", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Bank Address</label>
            <input
              type="text"
              value={quotationData.bankAddress}
              onChange={(e) => handleInputChange("bankAddress", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
            <input
              type="text"
              value={quotationData.ifscCode}
              onChange={(e) => handleInputChange("ifscCode", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="text"
              value={quotationData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input
              type="text"
              value={quotationData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">PAN</label>
            <input
              type="text"
              value={quotationData.pan}
              onChange={(e) => handleInputChange("pan", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BankDetails