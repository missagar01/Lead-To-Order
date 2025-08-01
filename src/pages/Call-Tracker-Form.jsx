"use client"

import { useState, useEffect } from "react"

const CallTrackerForm = ({ onClose = () => window.history.back() }) => {
  const [leadSources, setLeadSources] = useState([])
  const [enquiryApproachOptions, setEnquiryApproachOptions] = useState([])
  const [receiverOptions, setReceiverOptions] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    leadSource: "",
    companyName: "",
    phoneNumber: "",
    salesPersonName: "",
    location: "",
    emailAddress: "",
    enquiryReceiverName: "",
    enquiryDate: "",
    enquiryApproach: ""
  })

  const [items, setItems] = useState([{ id: "1", name: "", quantity: "" }])

  // Fetch dropdown data when component mounts
  useEffect(() => {
    fetchDropdownData()
  }, [])

  // Function to fetch dropdown data from DROPDOWN sheet
  const fetchDropdownData = async () => {
    try {
      const publicUrl = "https://docs.google.com/spreadsheets/d/1bLTwtlHUmADSOyXJBxQJ2sxEy-dII8v2aGCDYuqppx4/gviz/tq?tqx=out:json&sheet=DROPDOWN"
      
      const response = await fetch(publicUrl)
      const text = await response.text()
      
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}') + 1
      const jsonData = text.substring(jsonStart, jsonEnd)
      
      const data = JSON.parse(jsonData)
      
      if (data && data.table && data.table.rows) {
        const sources = []        // Column B (Lead Sources)
        const approachOptions = [] // Column AM (index 38) - Enquiry Approach
        const receivers = []      // Column BW (index 74) - Enquiry Receiver Name Options
        
        // Skip the header row
        data.table.rows.slice(0).forEach(row => {
          if (row.c) {
            // Column B (Lead Sources)
            if (row.c[1] && row.c[1].v) {
              sources.push(row.c[1].v.toString())
            }
            
            // Column AM (Enquiry Approach) - index 38
            if (row.c[38] && row.c[38].v) {
              approachOptions.push(row.c[38].v.toString())
            }
            
            // Column BW (Enquiry Receiver Name) - index 74
            if (row.c[74] && row.c[74].v) {
              receivers.push(row.c[74].v.toString())
            }
          }
        })
        
        // Update state with fetched values (using unique values to prevent duplicates)
        setLeadSources([...new Set(sources.filter(Boolean))])
        setEnquiryApproachOptions([...new Set(approachOptions.filter(Boolean))])
        setReceiverOptions([...new Set(receivers.filter(Boolean))])
      }
    } catch (error) {
      console.error("Error fetching dropdown values:", error)
      // Fallback to default arrays if there's an error
      setLeadSources(["Website", "Justdial", "Sulekha", "Indiamart", "Referral", "Other"])
      setEnquiryApproachOptions(["Approach 1", "Approach 2", "Approach 3"])
      setReceiverOptions(["Receiver 1", "Receiver 2", "Receiver 3"])
    }
  }

  // Function to handle adding a new item
  const addItem = () => {
    const newId = (items.length + 1).toString()
    setItems([...items, { id: newId, name: "", quantity: "" }])
  }

  // Function to handle removing an item
  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  // Function to update an item
  const updateItem = (id, field, value) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }


  const formatDateToDDMMYYYY = (dateValue) => {
    if (!dateValue) return ""

    try {
      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
      }
      return dateValue
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateValue // Return the original value if formatting fails
    }
  }

  // Function to handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const currentDate = new Date()
    const formattedDate = formatDateToDDMMYYYY(currentDate)

      // Prepare row data for columns C to K (indices 2-10)
      const rowData = []
      
      // Add form data to columns C to K (indices 2-10)
      rowData.push(
        formattedDate,
        "",
        formData.leadSource,           // Column C (index 2)
        formData.companyName,          // Column D (index 3)
        formData.phoneNumber,          // Column E (index 4)
        formData.salesPersonName,      // Column F (index 5)
        formData.location,             // Column G (index 6)
        formData.emailAddress,         // Column H (index 7)
        formData.enquiryReceiverName,  // Column I (index 8)
        formData.enquiryDate ? formatDateToDDMMYYYY(formData.enquiryDate) : "", // Column J (index 9)
        formData.enquiryApproach       // Column K (index 10)
      )
      
      // Add items as JSON in column L (index 11)
      const itemsJson = items
        .filter(item => item.name.trim() !== "" || item.quantity.trim() !== "") // Filter out empty items
        .map(item => ({
          name: item.name || "",
          quantity: item.quantity || "0"
        }))
      
      rowData.push(JSON.stringify(itemsJson)) // Column L (index 11)

      console.log("Row Data to be submitted:", rowData)

      // Submit data to Google Sheets using fetch
      const scriptUrl = "https://script.google.com/macros/s/AKfycbyLTNpTAVKaVuGH_-GrVNxDOgXqbWiBYzdf8PQWWwIFhLiIz_1lT3qEQkl7BS1osfToGQ/exec"
      
      // Parameters for Google Apps Script
      const params = {
        sheetName: "ENQUIRY TO ORDER",
        action: "insert",
        rowData: JSON.stringify(rowData)
      }

      // Create URL-encoded string for the parameters
      const urlParams = new URLSearchParams()
      for (const key in params) {
        urlParams.append(key, params[key])
      }
      
      // Send the data
      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: urlParams
      })

      const result = await response.json()
      
      if (result.success) {
        alert("Data submitted successfully!")
        onClose() // Close the form after successful submission
      } else {
        alert("Error submitting data: " + (result.error || "Unknown error"))
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Error submitting form: " + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">New Call Tracker</h2>
            <button 
              type="button" 
              onClick={() => {
                try {
                  onClose();
                } catch (error) {
                  console.error("Error closing form:", error);
                  const modal = document.querySelector('.fixed.inset-0');
                  if (modal) {
                    modal.style.display = 'none';
                  }
                }
              }} 
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="leadSource" className="block text-sm font-medium text-gray-700">
                Lead Source
              </label>
              <select
                id="leadSource"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.leadSource}
                onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                required
              >
                <option value="">Select source</option>
                {leadSources.map((source, index) => (
                  <option key={index} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                id="companyName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="salesPersonName" className="block text-sm font-medium text-gray-700">
                Sales Person Name
              </label>
              <input
                id="salesPersonName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.salesPersonName}
                onChange={(e) => setFormData({ ...formData, salesPersonName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                id="location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="emailAddress"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.emailAddress}
                onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="enquiryReceiverName" className="block text-sm font-medium text-gray-700">
                Enquiry Receiver Name
              </label>
              <select
                id="enquiryReceiverName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.enquiryReceiverName}
                onChange={(e) => setFormData({ ...formData, enquiryReceiverName: e.target.value })}
              >
                <option value="">Select receiver</option>
                {receiverOptions.map((receiver, index) => (
                  <option key={index} value={receiver}>
                    {receiver}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="enquiryDate" className="block text-sm font-medium text-gray-700">
                Enquiry Date
              </label>
              <input
                id="enquiryDate"
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.enquiryDate}
                onChange={(e) => setFormData({ ...formData, enquiryDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="enquiryApproach" className="block text-sm font-medium text-gray-700">
                Enquiry Approach
              </label>
              <select
                id="enquiryApproach"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={formData.enquiryApproach}
                onChange={(e) => setFormData({ ...formData, enquiryApproach: e.target.value })}
                required
              >
                <option value="">Select approach</option>
                {enquiryApproachOptions.map((approach, index) => (
                  <option key={index} value={approach}>
                    {approach}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items section */}
          <div className="space-y-4 border p-4 rounded-md">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Items</h4>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1 text-xs border border-purple-200 text-purple-600 hover:bg-purple-50 rounded-md"
              >
                + Add Item
              </button>
            </div>

            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5 space-y-2">
                  <label htmlFor={`itemName-${item.id}`} className="block text-sm font-medium text-gray-700">
                    Item Name
                  </label>
                  <input
                    id={`itemName-${item.id}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, "name", e.target.value)}
                    required
                  />
                </div>

                <div className="md:col-span-5 space-y-2">
                  <label htmlFor={`quantity-${item.id}`} className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    id={`quantity-${item.id}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter quantity"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="p-2 text-slate-500 hover:text-slate-700 disabled:opacity-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t flex justify-between">
          <button
            type="button"
            onClick={() => {
              try {
                onClose();
              } catch (error) {
                console.error("Error closing form:", error);
                const modal = document.querySelector('.fixed.inset-0');
                if (modal) {
                  modal.style.display = 'none';
                }
              }
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CallTrackerForm