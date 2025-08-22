'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, AlertCircle, CheckCircle, X, FileText, Info } from 'lucide-react'
import Link from 'next/link'
import Papa from 'papaparse'

interface CSVRow {
  [key: string]: string
}

interface ValidationError {
  row: number
  column: string
  message: string
}

interface ParsedProduct {
  title: string
  sku: string
  category: string
  payloadKg?: number
  reachMm?: number
  repeatabilityMm?: number
  maxSpeedMps?: number
  ipRating?: string
  controller?: string
  priceMinINR: number
  priceMaxINR: number
  leadTimeWeeks: number
  specs_json?: string
}

const requiredColumns = ['title', 'sku', 'category', 'priceMinINR', 'priceMaxINR', 'leadTimeWeeks']
const validCategories = ['AMR', 'AGV', 'SixAxis', 'SCARA', 'Conveyor', 'ASRS', 'Vision', 'Other']

export default function CatalogUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isPreview, setIsPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const validateRow = (row: CSVRow, rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = []

    // Check required columns
    requiredColumns.forEach(col => {
      if (!row[col] || row[col].trim() === '') {
        errors.push({
          row: rowIndex,
          column: col,
          message: `${col} is required`
        })
      }
    })

    // Validate category
    if (row.category && !validCategories.includes(row.category)) {
      errors.push({
        row: rowIndex,
        column: 'category',
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      })
    }

    // Validate SKU format (alphanumeric with hyphens)
    if (row.sku && !/^[a-zA-Z0-9-]+$/.test(row.sku)) {
      errors.push({
        row: rowIndex,
        column: 'sku',
        message: 'SKU must contain only letters, numbers, and hyphens'
      })
    }

    // Validate numeric fields
    const numericFields = ['payloadKg', 'reachMm', 'repeatabilityMm', 'maxSpeedMps', 'priceMinINR', 'priceMaxINR', 'leadTimeWeeks']
    numericFields.forEach(field => {
      if (row[field] && row[field].trim() !== '') {
        const value = parseFloat(row[field])
        if (isNaN(value) || value < 0) {
          errors.push({
            row: rowIndex,
            column: field,
            message: `${field} must be a positive number`
          })
        }
      }
    })

    // Validate price range
    if (row.priceMinINR && row.priceMaxINR) {
      const minPrice = parseFloat(row.priceMinINR)
      const maxPrice = parseFloat(row.priceMaxINR)
      if (!isNaN(minPrice) && !isNaN(maxPrice) && minPrice > maxPrice) {
        errors.push({
          row: rowIndex,
          column: 'priceMaxINR',
          message: 'Maximum price must be greater than or equal to minimum price'
        })
      }
    }

    // Validate lead time
    if (row.leadTimeWeeks) {
      const leadTime = parseInt(row.leadTimeWeeks)
      if (!isNaN(leadTime) && (leadTime < 1 || leadTime > 52)) {
        errors.push({
          row: rowIndex,
          column: 'leadTimeWeeks',
          message: 'Lead time must be between 1 and 52 weeks'
        })
      }
    }

    // Validate JSON specs if provided
    if (row.specs_json && row.specs_json.trim() !== '') {
      try {
        JSON.parse(row.specs_json)
      } catch (e) {
        errors.push({
          row: rowIndex,
          column: 'specs_json',
          message: 'Invalid JSON format in specs_json'
        })
      }
    }

    return errors
  }

  const parseCSV = (csvFile: File) => {
    return new Promise<void>((resolve, reject) => {
      Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as CSVRow[]
          const errors: ValidationError[] = []
          const products: ParsedProduct[] = []

          // Check if required columns exist
          const headers = Object.keys(data[0] || {})
          const missingColumns = requiredColumns.filter(col => !headers.includes(col))
          
          if (missingColumns.length > 0) {
            setValidationErrors([{
              row: 0,
              column: 'header',
              message: `Missing required columns: ${missingColumns.join(', ')}`
            }])
            reject(new Error('Missing required columns'))
            return
          }

          // Validate each row
          data.forEach((row, index) => {
            const rowErrors = validateRow(row, index + 2) // +2 for 1-based index and header row
            errors.push(...rowErrors)

            // If no errors for this row, add to products
            if (rowErrors.length === 0) {
              const product: ParsedProduct = {
                title: row.title.trim(),
                sku: row.sku.trim(),
                category: row.category.trim(),
                priceMinINR: parseFloat(row.priceMinINR),
                priceMaxINR: parseFloat(row.priceMaxINR),
                leadTimeWeeks: parseInt(row.leadTimeWeeks),
              }

              // Add optional numeric fields
              if (row.payloadKg && row.payloadKg.trim() !== '') {
                product.payloadKg = parseFloat(row.payloadKg)
              }
              if (row.reachMm && row.reachMm.trim() !== '') {
                product.reachMm = parseFloat(row.reachMm)
              }
              if (row.repeatabilityMm && row.repeatabilityMm.trim() !== '') {
                product.repeatabilityMm = parseFloat(row.repeatabilityMm)
              }
              if (row.maxSpeedMps && row.maxSpeedMps.trim() !== '') {
                product.maxSpeedMps = parseFloat(row.maxSpeedMps)
              }

              // Add optional string fields
              if (row.ipRating && row.ipRating.trim() !== '') {
                product.ipRating = row.ipRating.trim()
              }
              if (row.controller && row.controller.trim() !== '') {
                product.controller = row.controller.trim()
              }
              if (row.specs_json && row.specs_json.trim() !== '') {
                product.specs_json = row.specs_json.trim()
              }

              products.push(product)
            }
          })

          setValidationErrors(errors)
          setParsedData(products)
          setIsPreview(true)
          resolve()
        },
        error: (error) => {
          reject(error)
        }
      })
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please select a CSV file')
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB')
      return
    }

    setFile(selectedFile)
    setIsPreview(false)
    setParsedData([])
    setValidationErrors([])

    try {
      await parseCSV(selectedFile)
    } catch (error) {
      console.error('Error parsing CSV:', error)
      alert('Error parsing CSV file. Please check the format.')
    }
  }

  const handleUpload = async () => {
    if (!file || parsedData.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      const response = await fetch('/api/supplier/catalog/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: parsedData,
          fileName: file.name
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setUploadProgress(100)
        
        // Redirect to catalog management page
        setTimeout(() => {
          router.push(`/supplier/catalog?uploaded=${result.uploadedCount}`)
        }, 1000)
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setParsedData([])
    setValidationErrors([])
    setIsPreview(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/supplier/catalog" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Catalog
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Upload Product Catalog</h1>
          <p className="text-gray-600 mt-2">
            Bulk upload your products using a CSV file
          </p>
        </div>

        {/* Instructions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-600" />
              CSV Format Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Required Columns</h4>
                <div className="flex flex-wrap gap-2">
                  {requiredColumns.map(col => (
                    <Badge key={col} variant="secondary">{col}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Valid Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {validCategories.map(cat => (
                    <Badge key={cat} variant="outline">{cat}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <Link href="/docs/CSV_FORMAT.md">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    View Format Guide
                  </Button>
                </Link>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select CSV File</CardTitle>
            <CardDescription>
              Choose a CSV file containing your product catalog (max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose CSV File
                </Button>
                
                {file && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{file.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearFile}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Validation Results */}
        {(validationErrors.length > 0 || isPreview) && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                {validationErrors.length > 0 ? (
                  <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                )}
                Validation Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{parsedData.length}</div>
                    <div className="text-sm text-blue-800">Valid Products</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{validationErrors.length}</div>
                    <div className="text-sm text-red-800">Validation Errors</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {file ? Math.round(file.size / 1024) : 0}
                    </div>
                    <div className="text-sm text-gray-800">File Size (KB)</div>
                  </div>
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-900 mb-2">Validation Errors</h4>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {validationErrors.slice(0, 20).map((error, index) => (
                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                          <span className="font-medium">Row {error.row}, Column {error.column}:</span> {error.message}
                        </div>
                      ))}
                      {validationErrors.length > 20 && (
                        <div className="text-sm text-red-600">
                          And {validationErrors.length - 20} more errors...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Preview */}
                {parsedData.length > 0 && validationErrors.length === 0 && (
                  <div>
                    <h4 className="font-medium text-green-900 mb-2">Preview (First 5 Products)</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200 rounded">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price Range</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lead Time</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {parsedData.slice(0, 5).map((product, index) => (
                            <tr key={index} className="border-t border-gray-200">
                              <td className="px-3 py-2 text-sm text-gray-900">{product.title}</td>
                              <td className="px-3 py-2 text-sm text-gray-600">{product.sku}</td>
                              <td className="px-3 py-2 text-sm">
                                <Badge variant="secondary">{product.category}</Badge>
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-900">
                                ₹{product.priceMinINR.toLocaleString()} - ₹{product.priceMaxINR.toLocaleString()}
                              </td>
                              <td className="px-3 py-2 text-sm text-gray-600">{product.leadTimeWeeks} weeks</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {parsedData.length > 5 && (
                        <div className="text-sm text-gray-600 mt-2 text-center">
                          And {parsedData.length - 5} more products...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                {parsedData.length > 0 && validationErrors.length === 0 && (
                  <div className="flex justify-end">
                    <Button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="px-8"
                    >
                      {uploading ? 'Uploading...' : `Upload ${parsedData.length} Products`}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}