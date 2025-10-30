"use client"

import { useState, useEffect } from "react"
import QuotationDetails from "./quotation-details"
import ConsignorDetails from "./consignor-details"
import ConsigneeDetails from "./consignee-details"
import ItemsTable from "./items-table"
import TermsAndConditions from "./terms and conditions"
import BankDetails from "./bank-details"
import NotesSection from "./notes-section"
import SpecialOfferSection from "./special-offer-section"
import { getNextQuotationNumber } from "./quotation-service" // SIMPLIFIED: Only import getNextQuotationNumber

const QuotationForm = ({
  quotationData,
  handleInputChange,
  handleItemChange,
  handleFlatDiscountChange,
  handleAddItem,
  handleNoteChange,
  addNote,
  removeNote,
  hiddenFields,
  toggleFieldVisibility,
  isRevising,
  existingQuotations,
  selectedQuotation,
  handleSpecialDiscountChange,
  handleQuotationSelect,
  isLoadingQuotation,
  specialDiscount,
  setSpecialDiscount,
  selectedReferences,
  setSelectedReferences,
  imageform,
  addSpecialOffer,
  removeSpecialOffer,
  handleSpecialOfferChange,
  setQuotationData,
  hiddenColumns,
  setHiddenColumns,
}) => {
  const [dropdownData, setDropdownData] = useState({})
  const [stateOptions, setStateOptions] = useState(["Select State"])
  const [companyOptions, setCompanyOptions] = useState(["Select Company"])
  const [referenceOptions, setReferenceOptions] = useState(["Select Reference"])
  const [preparedByOptions, setPreparedByOptions] = useState([""])
  const [productCodes, setProductCodes] = useState([])
  const [productNames, setProductNames] = useState([])
  const [productData, setProductData] = useState({})
  const [isItemsLoading, setIsItemsLoading] = useState(false);

  // NEW: Lead number states
  const [showLeadNoDropdown, setShowLeadNoDropdown] = useState(false)
  const [leadNoOptions, setLeadNoOptions] = useState(["Select Lead No."])
  const [leadNoData, setLeadNoData] = useState({})

  // Fetch dropdown data for states and corresponding details
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const dropdownUrl =
          "https://docs.google.com/spreadsheets/d/1bLTwtlHUmADSOyXJBxQJ2sxEy-dII8v2aGCDYuqppx4/gviz/tq?tqx=out:json&sheet=DROPDOWN"
        const dropdownResponse = await fetch(dropdownUrl)
        const dropdownText = await dropdownResponse.text()

        const dropdownJsonStart = dropdownText.indexOf("{")
        const dropdownJsonEnd = dropdownText.lastIndexOf("}") + 1
        const dropdownJsonData = dropdownText.substring(dropdownJsonStart, dropdownJsonEnd)

        const dropdownData = JSON.parse(dropdownJsonData)

        if (dropdownData && dropdownData.table && dropdownData.table.rows) {
          const stateOptionsData = ["Select State"]
          const stateDetailsMap = {}
          const preparedByOptionsData = [""]
          const companyOptionsData = ["Select Company"]
          const companyDetailsMap = {}
          const referenceOptionsData = ["Select Reference"]
          const referenceDetailsMap = {}

          dropdownData.table.rows.slice(0).forEach((row) => {
            if (row.c) {
              const preparedByName = row.c[79] ? row.c[79].v : ""
              if (preparedByName && !preparedByOptionsData.includes(preparedByName)) {
                preparedByOptionsData.push(preparedByName)
              }

              const stateName = row.c[26] ? row.c[26].v : ""
              if (stateName && !stateOptionsData.includes(stateName)) {
                stateOptionsData.push(stateName)

                let bankDetails = ""
                if (row.c[27] && row.c[27].v) {
                  bankDetails = row.c[27].v
                }

                const pan = row.c[25] ? row.c[25].v : ""
                const msmeNumber = row.c[33] ? row.c[33].v : ""

                stateDetailsMap[stateName] = {
                  bankDetails: bankDetails,
                  consignerAddress: row.c[28] ? row.c[28].v : "",
                  stateCode: row.c[30] ? row.c[30].v : "",
                  gstin: row.c[31] ? row.c[31].v : "",
                  pan: pan,
                  msmeNumber: msmeNumber,
                }
              }

              const companyName = row.c[12] ? row.c[12].v : ""
              if (companyName && !companyOptionsData.includes(companyName)) {
                companyOptionsData.push(companyName)

                companyDetailsMap[companyName] = {
                  address: row.c[15] ? row.c[15].v : "",
                  state: row.c[16] ? row.c[16].v : "",
                  contactName: row.c[13] ? row.c[13].v : "",
                  contactNo: row.c[14] ? row.c[14].v : "",
                  gstin: row.c[17] ? row.c[17].v : "",
                  stateCode: row.c[18] ? row.c[18].v : "",
                }
              }

              const referenceName = row.c[21] ? row.c[21].v : ""
              if (referenceName && !referenceOptionsData.includes(referenceName)) {
                referenceOptionsData.push(referenceName)

                referenceDetailsMap[referenceName] = {
                  mobile: row.c[22] ? row.c[22].v : "",
                  phone: row.c[83] ? row.c[83].v : "",
                }
              }
            }
          })

          setStateOptions(stateOptionsData)
          setCompanyOptions(companyOptionsData)
          setReferenceOptions(referenceOptionsData)
          setPreparedByOptions(preparedByOptionsData)

          setDropdownData({
            states: stateDetailsMap,
            companies: companyDetailsMap,
            references: referenceDetailsMap,
          })
        }
      } catch (error) {
        console.error("Error fetching dropdown data:", error)

        setStateOptions(["Select State", "Chhattisgarh", "Maharashtra", "Delhi"])
        setCompanyOptions(["Select Company", "ABC Corp", "XYZ Industries", "PQR Ltd"])
        setReferenceOptions(["Select Reference", "John Doe", "Jane Smith", "Mike Johnson"])

        setDropdownData({
          states: {
            Chhattisgarh: {
              bankDetails:
                "Account No.: 438605000447\nBank Name: ICICI BANK\nBank Address: FAFADIH, RAIPUR\nIFSC CODE: ICIC0004386\nEmail: Support@thedivineempire.com\nWebsite: www.thedivineempire.com",
              consignerAddress: "Divine Empire Private Limited, Raipur, Chhattisgarh",
              stateCode: "22",
              gstin: "22AAKCD1234M1Z5",
            },
          },
          companies: {
            "ABC Corp": {
              address: "123 Main Street, Mumbai, Maharashtra",
              state: "Maharashtra",
              contactName: "Rajesh Kumar",
              contactNo: "9876543210",
              gstin: "27ABCDE1234F1Z5",
              stateCode: "27",
            },
          },
          references: {
            "John Doe": {
              mobile: "9898989898",
            },
          },
        })
      }
    }

    fetchDropdownData()
  }, [])

  // NEW: Fetch lead numbers from both sheets with filtering conditions
useEffect(() => {
  const fetchLeadNumbers = async () => {
    try {
      const leadNoOptionsData = ["Select Lead No."]
      const leadNoDataMap = {}

      // Fetch from FMS sheet
      const fmsUrl =
        "https://docs.google.com/spreadsheets/d/1bLTwtlHUmADSOyXJBxQJ2sxEy-dII8v2aGCDYuqppx4/gviz/tq?tqx=out:json&sheet=FMS"
      const fmsResponse = await fetch(fmsUrl)
      const fmsText = await fmsResponse.text()

      const fmsJsonStart = fmsText.indexOf("{")
      const fmsJsonEnd = fmsText.lastIndexOf("}") + 1
      const fmsJsonData = fmsText.substring(fmsJsonStart, fmsJsonEnd)
      const fmsData = JSON.parse(fmsJsonData)

      if (fmsData && fmsData.table && fmsData.table.rows) {
        fmsData.table.rows.forEach((row) => {
          if (row.c && row.c[1]) {
            // Column B (index 1)
            const leadNo = safeToString(row.c[1].v)
            
            // Check filtering conditions: BA (index 52) is not null and BB (index 53) is null
            const baValue = row.c[27] ? safeToString(row.c[27].v) : ""
            const bbValue = row.c[28] ? safeToString(row.c[28].v) : ""
            
            if (leadNo && !leadNoOptionsData.includes(leadNo) && baValue !== "" && bbValue === "") {
              leadNoOptionsData.push(leadNo)

              leadNoDataMap[leadNo] = {
                sheet: "FMS",
                companyName: row.c[4] ? safeToString(row.c[4].v) : "", // Column E
                address: row.c[7] ? safeToString(row.c[7].v) : "", // Column H
                state: row.c[9] ? safeToString(row.c[9].v) : "", // Column J
                contactName: row.c[6] ? safeToString(row.c[6].v) : "", // Column G
                contactNo: row.c[5] ? safeToString(row.c[5].v) : "", // Column F
                gstin: row.c[21] ? safeToString(row.c[21].v) : "", // Column V
                rowData: row.c, // Store full row data for items
              }
            }
          }
        })
      }

      // Fetch from ENQUIRY TO ORDER sheet
      const enquiryUrl =
        "https://docs.google.com/spreadsheets/d/1bLTwtlHUmADSOyXJBxQJ2sxEy-dII8v2aGCDYuqppx4/gviz/tq?tqx=out:json&sheet=ENQUIRY%20TO%20ORDER"
      const enquiryResponse = await fetch(enquiryUrl)
      const enquiryText = await enquiryResponse.text()

      const enquiryJsonStart = enquiryText.indexOf("{")
      const enquiryJsonEnd = enquiryText.lastIndexOf("}") + 1
      const enquiryJsonData = enquiryText.substring(enquiryJsonStart, enquiryJsonEnd)
      const enquiryData = JSON.parse(enquiryJsonData)

      if (enquiryData && enquiryData.table && enquiryData.table.rows) {
        enquiryData.table.rows.forEach((row) => {
          if (row.c && row.c[1]) {
            // Column B (index 1)
            const leadNo = safeToString(row.c[1].v)
            
            // Check filtering conditions: AL (index 37) is not null and AM (index 38) is null
            const alValue = row.c[12] ? safeToString(row.c[12].v) : ""
            const amValue = row.c[13] ? safeToString(row.c[13].v) : ""
            
            if (leadNo && !leadNoOptionsData.includes(leadNo) && alValue !== "" && amValue === "") {
              leadNoOptionsData.push(leadNo)

              leadNoDataMap[leadNo] = {
                sheet: "ENQUIRY",
                companyName: row.c[3] ? safeToString(row.c[3].v) : "", // Column D
                address: row.c[6] ? safeToString(row.c[6].v) : "", // Column G
                // state: row.c[13] ? safeToString(row.c[13].v) : "", // Column N
                contactName: row.c[5] ? safeToString(row.c[5].v) : "", // Column F
                contactNo: row.c[4] ? safeToString(row.c[4].v) : "", // Column E
                // gstin: row.c[11] ? safeToString(row.c[11].v) : "", // Column L
                // shipTo: row.c[8] ? safeToString(row.c[8].v) : "", // Column I
                rowData: row.c, // Store full row data for items
              }
            }
          }
        })
      }

      setLeadNoOptions(leadNoOptionsData)
      setLeadNoData(leadNoDataMap)
    } catch (error) {
      console.error("Error fetching lead numbers:", error)
    }
  }

  fetchLeadNumbers()
}, [])

  const handleSpecialDiscountChangeWrapper = (value) => {
    const discount = Number(value) || 0
    setSpecialDiscount(discount)
    handleSpecialDiscountChange(discount)
  }

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const dropdownUrl =
          "https://docs.google.com/spreadsheets/d/1bLTwtlHUmADSOyXJBxQJ2sxEy-dII8v2aGCDYuqppx4/gviz/tq?tqx=out:json&sheet=DROPDOWN"
        const response = await fetch(dropdownUrl)
        const text = await response.text()

        const jsonStart = text.indexOf("{")
        const jsonEnd = text.lastIndexOf("}") + 1
        const jsonData = JSON.parse(text.substring(jsonStart, jsonEnd))

        const codes = ["Select Code"]
        const names = ["Select Product"]
        const productDataMap = {}

        if (jsonData && jsonData.table && jsonData.table.rows) {
          jsonData.table.rows.forEach((row) => {
            if (row.c && row.c[60] && row.c[62]) {
              const code = row.c[60].v
              const name = row.c[62].v
              const description = row.c[78] ? row.c[78].v : ""
              const rate = row.c[77] ? row.c[77].v : 0

              if (code && !codes.includes(code)) {
                codes.push(code)
              }

              if (name && !names.includes(name)) {
                names.push(name)
              }

              productDataMap[code] = {
                name: name,
                description: description,
                rate: rate,
              }

              productDataMap[name] = {
                code: code,
                description: description,
                rate: rate,
              }
            }
          })
        }

        setProductCodes(codes)
        setProductNames(names)
        setProductData(productDataMap)
      } catch (error) {
        console.error("Error fetching product data:", error)
        setProductCodes(["Select Code", "CODE1", "CODE2", "CODE3"])
        setProductNames(["Select Product", "Product 1", "Product 2", "Product 3"])
        setProductData({
          CODE1: { name: "Product 1", description: "Description 1", rate: 100 },
          "Product 1": { code: "CODE1", description: "Description 1", rate: 100 },
        })
      }
    }

    fetchProductData()
  }, [])

  // REMOVED: Function to handle quotation number updates - no longer needed
  // as we don't want to change quotation number when selecting company/lead

  // Helper function to safely convert value to string
  const safeToString = (value) => {
    if (value === null || value === undefined) return ""
    return String(value)
  }

  // FIXED: Handle lead number selection and autofill - NO quotation number change
// FIXED: Handle lead number selection and autofill - NO quotation number change
const handleLeadNoSelect = async (selectedLeadNo) => {
  if (!selectedLeadNo || selectedLeadNo === "Select Lead No." || !leadNoData[selectedLeadNo]) {
    return;
  }

  setIsItemsLoading(true); // Start loading

  const leadData = leadNoData[selectedLeadNo]
  console.log("Selected lead data:", leadData)

  // Fill consignee details
  const companyName = leadData.companyName
  handleInputChange("consigneeName", companyName)
  handleInputChange("consigneeAddress", leadData.address)
  handleInputChange("consigneeState", leadData.state)
  handleInputChange("consigneeContactName", leadData.contactName)
  handleInputChange("consigneeContactNo", leadData.contactNo)
  handleInputChange("consigneeGSTIN", leadData.gstin)

  if (leadData.shipTo) {
    handleInputChange("shipTo", leadData.shipTo)
  }

  // IMPORTANT: Fill additional company details from dropdown data if available
  if (companyName && dropdownData.companies && dropdownData.companies[companyName]) {
    const companyDetails = dropdownData.companies[companyName]
    
    // Fill additional company details if not already filled from lead data
    if (!leadData.address && companyDetails.address) {
      handleInputChange("consigneeAddress", companyDetails.address)
    }
    if (!leadData.state && companyDetails.state) {
      handleInputChange("consigneeState", companyDetails.state)
    }
    if (!leadData.contactName && companyDetails.contactName) {
      handleInputChange("consigneeContactName", companyDetails.contactName)
    }
    if (!leadData.contactNo && companyDetails.contactNo) {
      handleInputChange("consigneeContactNo", companyDetails.contactNo)
    }
    if (!leadData.gstin && companyDetails.gstin) {
      handleInputChange("consigneeGSTIN", companyDetails.gstin)
    }
    if (companyDetails.stateCode) {
      handleInputChange("consigneeStateCode", companyDetails.stateCode)
    }
  }

  // Auto-fill items using the local handleAutoFillItems function
  try {
    await handleAutoFillItems(companyName)
  } catch (error) {
    console.error("Error auto-filling items:", error)
  }

  // Wait a bit to ensure productData is available
  await new Promise(resolve => setTimeout(resolve, 100))

  // Auto-fill items based on sheet data
  const autoItems = []

  if (leadData.sheet === "FMS") {
    const row = leadData.rowData
    const baValue = row[27] ? safeToString(row[27].v) : "" // Column AB (index 27)
    const bbValue = row[28] ? safeToString(row[28].v) : "" // Column AC (index 28)

    console.log("FMS Lead - BA Value:", baValue, "BB Value:", bbValue)

    if (baValue !== "" && bbValue === "") {
      console.log("Processing FMS lead items...")

      // ONLY: JSON data from column W (index 22) for FMS sheet
      const wValue = row[22] ? safeToString(row[22].v) : ""
      console.log("Column W JSON Value from FMS lead:", wValue)
      
      if (wValue !== "" && wValue !== "null" && wValue !== "undefined") {
        try {
          const jsonData = JSON.parse(wValue)
          console.log("Parsed JSON data from column W:", jsonData)
          if (Array.isArray(jsonData)) {
            jsonData.forEach((item) => {
              if (item.name && item.quantity !== undefined && item.quantity !== null) {
                const qty = isNaN(Number(item.quantity)) ? 1 : Number(item.quantity)
                autoItems.push({
                  name: item.name,
                  qty: qty,
                })
                console.log(`Added JSON item from FMS column W: ${item.name}, qty: ${qty}`)
              }
            })
          }
        } catch (error) {
          console.error("Error parsing JSON data from FMS column W:", error)
        }
      }
    } else {
      console.log("FMS lead conditions not met - BA:", baValue, "BB:", bbValue)
    }
  } else if (leadData.sheet === "ENQUIRY") {
    const row = leadData.rowData
    const alValue = row[12] ? safeToString(row[12].v) : "" // Column M (index 12)
    const amValue = row[13] ? safeToString(row[13].v) : "" // Column N (index 13)

    console.log("ENQUIRY Lead - AL Value:", alValue, "AM Value:", amValue)

    if (alValue !== "" && amValue === "") {
      console.log("Processing ENQUIRY lead items...")

      // ONLY: JSON data from column L (index 11) for ENQUIRY sheet
      const lValue = row[11] ? safeToString(row[11].v) : ""
      console.log("Column L JSON Value from ENQUIRY lead:", lValue)

      if (lValue !== "" && lValue !== "null" && lValue !== "undefined") {
        try {
          const jsonData = JSON.parse(lValue)
          console.log("Parsed JSON data from column L:", jsonData)

          if (Array.isArray(jsonData)) {
            console.log(`Processing ${jsonData.length} JSON items from column L...`)
            jsonData.forEach((item, index) => {
              console.log(`Processing JSON item ${index + 1}:`, item)
              if (item.name && item.quantity !== undefined && item.quantity !== null) {
                const qty = isNaN(Number(item.quantity)) ? 1 : Number(item.quantity)
                autoItems.push({
                  name: item.name,
                  qty: qty,
                })
                console.log(`Added JSON item from ENQUIRY column L: ${item.name}, qty: ${qty}`)
              } else {
                console.log(`Skipped JSON item ${index + 1} - missing name or quantity`)
              }
            })
          } else {
            console.log("Column L data is not an array:", typeof jsonData)
          }
        } catch (error) {
          console.error("Error parsing JSON data from ENQUIRY column L:", error)
          console.log("Raw column L value that failed to parse:", lValue)
        }
      } else {
        console.log("Column L is empty or null")
      }

      console.log(`Total items found for ENQUIRY lead: ${autoItems.length}`)
    } else {
      console.log("ENQUIRY lead conditions not met - AL:", alValue, "AM:", amValue)
    }
  }

  // Update items if found from lead data
  if (autoItems.length > 0) {
    console.log(`Creating ${autoItems.length} items from lead data...`)
    console.log("Current productData keys:", Object.keys(productData).slice(0, 10), "...") // Debug log
    
    const newItems = autoItems.map((item, index) => {
      // Auto-fill product code from productData with better matching
      let productInfo = null
      let productCode = ""
      let productDescription = ""
      let productRate = 0

      // Try exact match first
      if (productData[item.name]) {
        productInfo = productData[item.name]
      } else {
        // Try case-insensitive match
        const matchingKey = Object.keys(productData).find(key => 
          key.toLowerCase().trim() === item.name.toLowerCase().trim()
        )
        if (matchingKey) {
          productInfo = productData[matchingKey]
        }
      }

      if (productInfo) {
        productCode = productInfo.code || ""
        productDescription = productInfo.description || ""
        productRate = productInfo.rate || 0
      }

      console.log(`Lead Item ${index + 1}: "${item.name}" -> code: "${productCode}", rate: ${productRate}`)
      
      // If no code found, try a partial match
      if (!productCode) {
        const partialMatch = Object.keys(productData).find(key => 
          key.toLowerCase().includes(item.name.toLowerCase().substring(0, 10)) ||
          item.name.toLowerCase().includes(key.toLowerCase().substring(0, 10))
        )
        if (partialMatch && productData[partialMatch]) {
          productCode = productData[partialMatch].code || ""
          productDescription = productData[partialMatch].description || ""
          productRate = productData[partialMatch].rate || 0
          console.log(`Found partial match for "${item.name}": "${partialMatch}" -> code: "${productCode}"`)
        }
      }

      return {
        id: index + 1,
        code: productCode, // Auto-filled from productData
        name: item.name,
        description: productDescription, // Auto-filled from productData
        gst: 18,
        qty: item.qty,
        units: "Nos",
        rate: productRate, // Auto-filled from productData
        discount: 0,
        flatDiscount: 0,
        amount: item.qty * productRate, // Calculate initial amount
      }
    })

    handleInputChange("items", newItems)
    console.log("Items auto-filled from lead selection with codes and rates:", newItems)
  } else {
    console.log("No items found for this lead")
  }
  
  setIsItemsLoading(false); // Stop loading
}

  // FIXED: Function to auto-fill items based on company selection - NO quotation number change
  const handleAutoFillItems = async (companyName) => {
    if (!companyName || companyName === "Select Company") return

    try {
      console.log("Auto-filling items for company:", companyName)

      // First try FMS sheet
      const fmsUrl =
        "https://docs.google.com/spreadsheets/d/1bLTwtlHUmADSOyXJBxQJ2sxEy-dII8v2aGCDYuqppx4/gviz/tq?tqx=out:json&sheet=FMS"
      const fmsResponse = await fetch(fmsUrl)
      const fmsText = await fmsResponse.text()

      const fmsJsonStart = fmsText.indexOf("{")
      const fmsJsonEnd = fmsText.lastIndexOf("}") + 1
      const fmsJsonData = fmsText.substring(fmsJsonStart, fmsJsonEnd)
      const fmsData = JSON.parse(fmsJsonData)

      let itemsFound = false
      const autoItems = []

      // Check FMS sheet first
      if (fmsData && fmsData.table && fmsData.table.rows) {
        for (const row of fmsData.table.rows) {
          if (row.c && row.c[4]) {
            // Column E (index 4) - Project Name
            const rowCompanyName = safeToString(row.c[4].v)
            console.log("Checking company:", rowCompanyName)

            if (rowCompanyName && rowCompanyName.toLowerCase().trim() === companyName.toLowerCase().trim()) {
              // Check if BA (index 52) is not null and BI (index 60) is null
              const baValue = row.c[52] ? safeToString(row.c[52].v) : ""
              const biValue = row.c[60] ? safeToString(row.c[60].v) : ""

              console.log("BA Value:", baValue, "BI Value:", biValue)

              if (baValue !== "" && biValue === "") {
                console.log("Found matching company in FMS with conditions met")

                // FIRST: Extract items from regular columns (AN to AW)
                console.log("Extracting items from regular columns (AN to AW)")
                const itemColumns = [
                  { nameCol: 39, qtyCol: 40 }, // AN (Item Name1), AO (Quantity1)
                  { nameCol: 41, qtyCol: 42 }, // AP (Item Name2), AQ (Quantity2)
                  { nameCol: 43, qtyCol: 44 }, // AR (Item Name3), AS (Quantity3)
                  { nameCol: 45, qtyCol: 46 }, // AT (Item Name4), AU (Quantity4)
                  { nameCol: 47, qtyCol: 48 }, // AV (Item Name5), AW (Quantity5)
                ]

                for (const { nameCol, qtyCol } of itemColumns) {
                  const itemName = row.c[nameCol] ? safeToString(row.c[nameCol].v).trim() : ""
                  const itemQty = row.c[qtyCol] ? safeToString(row.c[qtyCol].v) : ""

                  console.log(`Column ${nameCol} (Item Name):`, itemName)
                  console.log(`Column ${qtyCol} (Quantity):`, itemQty)

                  if (itemName !== "" && itemQty !== "") {
                    // Fix: Preserve 0 quantities, only use fallback for invalid numbers
                    const qty = isNaN(Number(itemQty)) ? 1 : Number(itemQty)
                    autoItems.push({
                      name: itemName,
                      qty: qty,
                    })
                    console.log(`Added regular item: ${itemName}, qty: ${qty}`)
                  }
                }

                // SECOND: Also check for JSON data in CS column (index 96)
                console.log("Also checking for JSON data in CS column")
                const csValue = row.c[96] ? safeToString(row.c[96].v) : ""
                console.log("CS Value:", csValue)

                if (csValue !== "") {
                  try {
                    // Parse JSON data from CS column
                    const jsonData = JSON.parse(csValue)
                    console.log("Parsed JSON data:", jsonData)

                    if (Array.isArray(jsonData)) {
                      jsonData.forEach((item) => {
                        if (item.name && item.quantity !== undefined && item.quantity !== null) {
                          // Fix: Preserve 0 quantities, only use fallback for invalid numbers
                          const qty = isNaN(Number(item.quantity)) ? 1 : Number(item.quantity)
                          autoItems.push({
                            name: item.name,
                            qty: qty,
                          })
                          console.log(`Added JSON item: ${item.name}, qty: ${qty}`)
                        }
                      })
                    }
                  } catch (jsonError) {
                    console.error("Error parsing JSON from CS column:", jsonError)
                  }
                }

                itemsFound = true
                break
              }
            }
          }
        }
      }

      // If not found in FMS, try ENQUIRY TO ORDER sheet
      if (!itemsFound) {
        console.log("Not found in FMS, checking ENQUIRY TO ORDER sheet")

        const enquiryUrl =
          "https://docs.google.com/spreadsheets/d/1bLTwtlHUmADSOyXJBxQJ2sxEy-dII8v2aGCDYuqppx4/gviz/tq?tqx=out:json&sheet=ENQUIRY%20TO%20ORDER"
        const enquiryResponse = await fetch(enquiryUrl)
        const enquiryText = await enquiryResponse.text()

        const enquiryJsonStart = enquiryText.indexOf("{")
        const enquiryJsonEnd = enquiryText.lastIndexOf("}") + 1
        const enquiryJsonData = enquiryText.substring(enquiryJsonStart, enquiryJsonEnd)
        const enquiryData = JSON.parse(enquiryJsonData)

        if (enquiryData && enquiryData.table && enquiryData.table.rows) {
          for (const row of enquiryData.table.rows) {
            if (row.c && row.c[3]) {
              // Column D (index 3)
              const rowCompanyName = safeToString(row.c[3].v)
              if (rowCompanyName && rowCompanyName.toLowerCase().trim() === companyName.toLowerCase().trim()) {
                // Check if AL (index 37) is not null and AT (index 45) is null
                const alValue = row.c[37] ? safeToString(row.c[37].v) : ""
                const atValue = row.c[45] ? safeToString(row.c[45].v) : ""

                if (alValue !== "" && atValue === "") {
                  console.log("Found matching company in ENQUIRY TO ORDER with conditions met")

                  // Extract items from R to AK (columns 17-36)
                  const itemColumns = [
                    { nameCol: 17, qtyCol: 18 }, // R (Item Name1), S (Quantity1)
                    { nameCol: 19, qtyCol: 20 }, // T (Item Name2), U (Quantity2)
                    { nameCol: 21, qtyCol: 22 }, // V (Item Name3), W (Quantity3)
                    { nameCol: 23, qtyCol: 24 }, // X (Item Name4), Y (Quantity4)
                    { nameCol: 25, qtyCol: 26 }, // Z (Item Name5), AA (Quantity5)
                    { nameCol: 27, qtyCol: 28 }, // AB (Item Name6), AC (Quantity6)
                    { nameCol: 29, qtyCol: 30 }, // AD (Item Name7), AE (Quantity7)
                    { nameCol: 31, qtyCol: 32 }, // AF (Item Name8), AG (Quantity8)
                    { nameCol: 33, qtyCol: 34 }, // AH (Item Name9), AI (Quantity9)
                    { nameCol: 35, qtyCol: 36 }, // AJ (Item Name10), AK (Quantity10)
                  ]

                  for (const { nameCol, qtyCol } of itemColumns) {
                    const itemName = row.c[nameCol] ? safeToString(row.c[nameCol].v).trim() : ""
                    const itemQty = row.c[qtyCol] ? safeToString(row.c[qtyCol].v) : ""

                    if (itemName !== "" && itemQty !== "") {
                      // Fix: Preserve 0 quantities, only use fallback for invalid numbers
                      const qty = isNaN(Number(itemQty)) ? 1 : Number(itemQty)
                      autoItems.push({
                        name: itemName,
                        qty: qty,
                      })
                      console.log(`Added item: ${itemName}, qty: ${qty}`)
                    }
                  }

                  // ALSO: Check for JSON data in CB column (index 55) for ENQUIRY TO ORDER
                  console.log("Also checking for JSON data in CB column for ENQUIRY TO ORDER")
                  const cbValue = row.c[55] ? safeToString(row.c[55].v) : ""
                  console.log("CB Value:", cbValue)

                  if (cbValue !== "") {
                    try {
                      // Parse JSON data from CB column
                      const jsonData = JSON.parse(cbValue)
                      console.log("Parsed JSON data from CB:", jsonData)

                      if (Array.isArray(jsonData)) {
                        jsonData.forEach((item) => {
                          if (item.name && item.quantity !== undefined && item.quantity !== null) {
                            // Fix: Preserve 0 quantities, only use fallback for invalid numbers
                            const qty = isNaN(Number(item.quantity)) ? 1 : Number(item.quantity)
                            autoItems.push({
                              name: item.name,
                              qty: qty,
                            })
                            console.log(`Added JSON item from CB: ${item.name}, qty: ${qty}`)
                          }
                        })
                      }
                    } catch (jsonError) {
                      console.error("Error parsing JSON from CB column:", jsonError)
                    }
                  }

                  itemsFound = true
                  break
                }
              }
            }
          }
        }
      }

      // If items found, auto-fill the quotation table
      if (itemsFound && autoItems.length > 0) {
        console.log("Auto-filling combined items:", autoItems)
        console.log("Total items found:", autoItems.length)

        // Clear existing items and add new ones
        const newItems = autoItems.map((item, index) => {
          // Look up the product code from productData
          const productInfo = productData[item.name]
          const productCode = productInfo ? productInfo.code : ""

          return {
            id: index + 1,
            code: productCode, // Auto-fill the code from productData
            name: item.name,
            description: "",
            gst: 18,
            qty: item.qty,
            units: "Nos",
            rate: 0,
            discount: 0,
            flatDiscount: 0,
            amount: 0,
          }
        })

        // Update quotation data with new items
        handleInputChange("items", newItems)

        console.log("Items auto-filled successfully:", newItems)
      } else {
        console.log("No matching items found for auto-fill")
      }
    } catch (error) {
      console.error("Error auto-filling items:", error)
    } finally {
      setIsItemsLoading(false); // Stop loading regardless of success/failure
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <QuotationDetails
            quotationData={quotationData}
            handleInputChange={handleInputChange}
            isRevising={isRevising}
            existingQuotations={existingQuotations}
            selectedQuotation={selectedQuotation}
            handleQuotationSelect={handleQuotationSelect}
            isLoadingQuotation={isLoadingQuotation}
            preparedByOptions={preparedByOptions}
            stateOptions={stateOptions}
            dropdownData={dropdownData}
          />

          <ConsignorDetails
            quotationData={quotationData}
            handleInputChange={handleInputChange}
            referenceOptions={referenceOptions}
            selectedReferences={selectedReferences}
            setSelectedReferences={setSelectedReferences}
            dropdownData={dropdownData}
          />
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <ConsigneeDetails
            quotationData={quotationData}
            handleInputChange={handleInputChange}
            companyOptions={companyOptions}
            dropdownData={dropdownData}
            onAutoFillItems={handleAutoFillItems}
            showLeadNoDropdown={showLeadNoDropdown}
            setShowLeadNoDropdown={setShowLeadNoDropdown}
            leadNoOptions={leadNoOptions}
            handleLeadNoSelect={handleLeadNoSelect}
          />
        </div>
      </div>

      <ItemsTable
        quotationData={quotationData}
        handleItemChange={handleItemChange}
        handleAddItem={handleAddItem}
        handleSpecialDiscountChange={handleSpecialDiscountChangeWrapper}
        specialDiscount={specialDiscount}
        setSpecialDiscount={setSpecialDiscount}
        productCodes={productCodes}
        productNames={productNames}
        productData={productData}
        setQuotationData={setQuotationData}
        isLoading={isItemsLoading}
        hiddenColumns={hiddenColumns}
        setHiddenColumns={setHiddenColumns}
      />

      <TermsAndConditions
        quotationData={quotationData}
        handleInputChange={handleInputChange}
        hiddenFields={hiddenFields}
        toggleFieldVisibility={toggleFieldVisibility}
      />

      <NotesSection
        quotationData={quotationData}
        handleNoteChange={handleNoteChange}
        addNote={addNote}
        removeNote={removeNote}
      />

      <BankDetails quotationData={quotationData} handleInputChange={handleInputChange} imageform={imageform} />
    </div>
  )
}

export default QuotationForm