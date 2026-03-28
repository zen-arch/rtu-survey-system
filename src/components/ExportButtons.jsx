import { FileSpreadsheet, File, FileText } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * ExportButtons Component
 * Provides export functionality to CSV, Excel, and PDF formats
 * All exports work client-side
 */
function ExportButtons({ data, reportType = 'results' }) {
  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Email', 'Office', 'Client Type', 'Average Rating', 'Visit Type', 'Feedback', 'Date Submitted', 'Status']
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        item.respondent_email || '',
        item.office || '',
        item.client_type || '',
        item.average_rating || '',
        item.visit_type || '',
        `"${(item.feedback || '').replace(/"/g, '""')}"`,
        item.submitted_at || '',
        item.status || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `rtu_survey_${reportType}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
      'Email': item.respondent_email || '',
      'Office': item.office || '',
      'Client Type': item.client_type || '',
      'Overall Satisfaction': item.rating_overall || '',
      'Staff Professionalism': item.rating_staff || '',
      'Speed & Efficiency': item.rating_speed || '',
      'Cleanliness': item.rating_cleanliness || '',
      'Recommendation': item.rating_recommendation || '',
      'Average Rating': item.average_rating || '',
      'Visit Type': item.visit_type || '',
      'Feedback': item.feedback || '',
      'Date Submitted': item.submitted_at || '',
      'Status': item.status || ''
    })))

    // Set column widths
    worksheet['!cols'] = [
      { wch: 25 }, // Email
      { wch: 15 }, // Office
      { wch: 12 }, // Client Type
      { wch: 10 }, // Overall
      { wch: 12 }, // Staff
      { wch: 12 }, // Speed
      { wch: 12 }, // Cleanliness
      { wch: 12 }, // Recommendation
      { wch: 10 }, // Average Rating
      { wch: 20 }, // Visit Type
      { wch: 50 }, // Feedback
      { wch: 20 }, // Date
      { wch: 10 }  // Status
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Survey Results')

    // Generate Excel file
    XLSX.writeFile(workbook, `rtu_survey_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Add header
    doc.setFontSize(18)
    doc.setTextColor(0, 51, 160) // RTU Blue
    doc.text('RTU Client Satisfaction Survey Report', 14, 22)
    
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    doc.text(`Total Responses: ${data.length}`, 14, 36)
    
    // Calculate average rating
    const avgRating = data.length > 0 
      ? (data.reduce((sum, item) => sum + parseFloat(item.average_rating || 0), 0) / data.length).toFixed(2)
      : '0.00'
    doc.text(`Average Satisfaction Score: ${avgRating}/5`, 14, 42)
    
    // Add table
    const tableData = data.slice(0, 50).map(item => [
      item.respondent_email ? item.respondent_email.substring(0, 20) + (item.respondent_email.length > 20 ? '...' : '') : '-',
      item.office || '-',
      item.client_type || '-',
      (item.average_rating || '0').toString(),
      item.status || 'Normal'
    ])
    
    doc.autoTable({
      head: [['Email', 'Office', 'Client Type', 'Rating', 'Status']],
      body: tableData,
      startY: 50,
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [0, 51, 160], // RTU Blue
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      // Limit to first 50 rows for PDF
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(
          `Page ${data.pageNumber}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        )
      }
    })
    
    // Save PDF
    doc.save(`rtu_survey_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="export-buttons">
      <button className="export-btn secondary" onClick={exportToCSV}>
        <File size={18} />
        Export CSV
      </button>
      <button className="export-btn primary" onClick={exportToExcel}>
        <FileSpreadsheet size={18} />
        Export Excel
      </button>
      <button className="export-btn secondary" onClick={exportToPDF}>
        <FileText size={18} />
        Export PDF
      </button>
    </div>
  )
}

export default ExportButtons

