import html2canvas from 'html2canvas'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { getCountryPapers, getMultipleCountriesPapers, formatCitations, formatFullAuthors } from '../data/papers'

/**
 * Export chart as PNG with metadata footer
 */
export async function exportChartToPNG(chartRef, metadata) {
  const { country, countries, threshold, taxRate, currency, title, type } = metadata
  
  
  // Get relevant papers
  const papers = country 
    ? getCountryPapers(country)
    : countries 
    ? getMultipleCountriesPapers(countries)
    : []
  
  const citations = formatCitations(papers)
  
  // Create a container with chart + footer
  const container = document.createElement('div')
  container.style.padding = '20px'
  container.style.backgroundColor = 'white'
  container.style.width = `${chartRef.offsetWidth}px`
  
  // Clone the chart
  const chartClone = chartRef.cloneNode(true)
  container.appendChild(chartClone)
  
  // Add metadata footer
  const footer = document.createElement('div')
  footer.style.marginTop = '20px'
  footer.style.padding = '15px'
  footer.style.borderTop = '1px solid #e5e5e5'
  footer.style.fontSize = '14px'
  footer.style.color = '#666'
  footer.style.lineHeight = '1.6'
  
  let footerText = `<strong>${title || 'Wealth Tax Simulation'}</strong><br>`
  
  if (country) {
    footerText += `Country: ${country} | `
  }
  if (threshold) {
    footerText += `Threshold: ${threshold}M${currency || '€'} | `
  }
  if (taxRate !== undefined) {
    footerText += `Tax rate: ${taxRate}%<br><br>`
  } else {
    footerText += `<br>`
  }

  footerText += `Generated on ${new Date().toLocaleDateString()} from <strong>wealthtaxsimulator.org</strong><br>`
  footerText += `Sources: International Tax Observatory, based on ${citations}. See wealthtaxsimulator.org/papers<br><br>`

  if (type === 'simulation') {
    footerText += `Notes: This figure shows the effect of a minimum wealth tax on the progressivity of the tax system.
    These estimates include all taxes paid at all levels of government and are expressed as a percent of pre-tax income. 
    Pre-tax income includes all national income (measured following standard national account definitions) before taxes and transfers and after the operation of the pension system.
    The "Current tax rate" line shows effective tax rates under current tax legislation. 
    The "Tax rate with a wealth tax" line shows how these rates would change if a minimum wealth tax were introduced at the specified threshold and rate. 
    These estimates rely on assumptions about wealth distribution. For methodology, see wealthtaxsimulator.org/methodology.`
  } else {
    footerText += `Notes: This figure reports estimates of effective tax rates by pre-tax income groups in different countries. 
    These estimates include all taxes paid at all levels of government and are expressed as a percent of pre-tax income. 
    Pre-tax income includes all national income (measured following standard national account definitions) before taxes and transfers and after the operation of the pension system.
    See wealthtaxsimulator.org/methodology.`
  }
  
  footer.innerHTML = footerText
  container.appendChild(footer)
  
  // Temporarily add to DOM
  document.body.appendChild(container)
  
  // Capture as image
  const canvas = await html2canvas(container, {
    backgroundColor: '#ffffff',
    scale: 2
  })
  
  // Remove temporary container
  document.body.removeChild(container)
  
  // Download
    if (type === 'simulation') {
      const filename = `wealth-tax-simulation-${country?.toLowerCase()}-${Date.now()}.png`
      canvas.toBlob((blob) => { saveAs(blob, filename) })
  } else {
      const filename = `tax-rates-comparison-${country?.toLowerCase()}-${Date.now()}.png`
      canvas.toBlob((blob) => { saveAs(blob, filename) })
  }
}

/**
 * Export chart data as Excel with metadata sheet
 */
export async function exportChartToExcel(data, metadata) {
  const { country, countries, threshold, taxRate, currency, title, type } = metadata
  
  // Get relevant papers
  const papers = country 
    ? getCountryPapers(country)
    : countries 
    ? getMultipleCountriesPapers(countries)
    : []
  
  const citations = formatCitations(papers)
  
  // Create workbook
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Wealth Tax Simulator'
  workbook.created = new Date()
  
  // Data sheet
  const dataSheet = workbook.addWorksheet('Data')

  if (type === 'simulation') {
    dataSheet.columns = [
      { header: 'Income Group', key: 'group', width: 20 },
      { header: 'Current Rate (%)', key: 'currentRate', width: 18 },
      { header: 'Rate Under Reform (%)', key: 'reformRate', width: 22 }
    ]
    
    data.forEach((row, idx) => {
      const excelRow = dataSheet.addRow({
        group: row.group,
        currentRate: row.currentRate !== null && row.currentRate !== undefined ? row.currentRate / 100 : null,
        reformRate: row.reformRate !== null && row.reformRate !== undefined ? row.reformRate / 100 : null
      })
      
      // Apply percentage format to rate columns (skip header row)
      excelRow.getCell('currentRate').numFmt = '0.0%'
      excelRow.getCell('reformRate').numFmt = '0.0%'
    })
  } else if (type === 'comparison') {
    const columns = [{ header: 'Income Group', key: 'group', width: 20 }]
    
    // Get country column names
    const countryColumns = []
    if (data.length > 0) {
      Object.keys(data[0]).forEach(key => {
        if (key !== 'group' && key !== 'x') {
          columns.push({ header: key, key: key, width: 15 })
          countryColumns.push(key)
        }
      })
    }
    
    dataSheet.columns = columns
    
    data.forEach((row, idx) => {
      const rowData = { group: row.group }
      countryColumns.forEach(key => {
        // Convert to decimal for percentage format
        rowData[key] = typeof row[key] === 'number' ? row[key] / 100 : null
      })
      
      const excelRow = dataSheet.addRow(rowData)
      
      // Apply percentage format to all country columns
      countryColumns.forEach(key => {
        excelRow.getCell(key).numFmt = '0.0%'
      })
    })
  }
  
  // Style the header row
  dataSheet.getRow(1).font = { bold: true }
  dataSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE5E5E5' }
  }
  
  // Metadata sheet
  const metadataSheet = workbook.addWorksheet('Metadata')
  metadataSheet.columns = [
    { width: 25 },
    { width: 80 }
  ]
  
  let row = 1
  
  // Title
  metadataSheet.getCell(`A${row}`).value = title
  metadataSheet.getCell(`A${row}`).font = { bold: true, size: 14 }
  row += 2
  
  // Parameters (if applicable)
  if (country || threshold !== undefined || taxRate !== undefined) {
    if (country) {
      metadataSheet.getCell(`A${row}`).value = 'Country'
      metadataSheet.getCell(`B${row}`).value = country
      row++
    }
    if (threshold) {
      metadataSheet.getCell(`A${row}`).value = 'Threshold'
      metadataSheet.getCell(`B${row}`).value = `${threshold}M${currency || '€'}`
      row++
    }
    if (taxRate !== undefined) {
      metadataSheet.getCell(`A${row}`).value = 'Tax rate'
      metadataSheet.getCell(`B${row}`).value = `${taxRate}%`
      row++
    }
    row++
  }
  
  // Generated on
  metadataSheet.getCell(`A${row}`).value = `Generated on ${new Date().toLocaleDateString()} from`
  row ++
  metadataSheet.getCell(`A${row}`).value = {
    text: 'wealthtaxsimulator.org',
    hyperlink: 'https://wealthtaxsimulator.org'
  }
  metadataSheet.getCell(`A${row}`).font = { color: { argb: 'FF0000FF' }, underline: true }
  row++
  row++
  
  // Sources
  metadataSheet.getCell(`A${row}`).value = 'Sources'
  metadataSheet.getCell(`A${row}`).font = { bold: true }
  row++
  metadataSheet.getCell(`A${row}`).value = 'International Tax Observatory, based on:'
  row++
  
  papers.forEach(paper => {
    metadataSheet.getCell(`A${row}`).value = {
      text: `${paper.authors} (${paper.year}). ${paper.title}`,
      hyperlink: paper.url
    }
    metadataSheet.getCell(`A${row}`).font = { color: { argb: 'FF0000FF' }, underline: true }
    row++
  })
  
  row++
  
  // Notes
  metadataSheet.getCell(`A${row}`).value = 'Notes'
  metadataSheet.getCell(`A${row}`).font = { bold: true }
  row++
  
  if (type === 'simulation') {
    metadataSheet.getCell(`A${row}`).value = 'This table shows the effect of a minimum wealth tax on the progressivity of the tax system.'
    row++
    metadataSheet.getCell(`A${row}`).value = 'The estimates include all taxes paid at all levels of government and are expressed as a percent of pre-tax income.'
    row++
    metadataSheet.getCell(`A${row}`).value = 'Pre-tax income includes all national income (measured following standard national account definitions) before taxes and transfers and after the operation of the pension system.'
    row++
    metadataSheet.getCell(`A${row}`).value = '"Current tax rate" refers to effective tax rates under current tax legislation.'
    row++
    metadataSheet.getCell(`A${row}`).value = '"Tax rate with a wealth tax" shows how these rates would change if a minimum wealth tax were introduced at the specified threshold and rate.'
    row++
    metadataSheet.getCell(`A${row}`).value = 'These estimates rely on assumptions about wealth distribution.'

  } else {
    metadataSheet.getCell(`A${row}`).value = 'This figure reports estimates of effective tax rates by pre-tax income groups in different countries.' 
    row++
    metadataSheet.getCell(`A${row}`).value = 'These estimates include all taxes paid at all levels of government and are expressed as a percent of pre-tax income.'
    row++
    metadataSheet.getCell(`A${row}`).value = 'Pre-tax income includes all national income (measured following standard national account definitions) before taxes and transfers and after the operation of the pension system.'
  }
  row++
  row++
  
  // Methodology link
  metadataSheet.getCell(`A${row}`).value = 'Methodology'
  metadataSheet.getCell(`A${row}`).font = { bold: true }
  row++
  metadataSheet.getCell(`A${row}`).value = {
    text: 'wealthtaxsimulator.org/methodology',
    hyperlink: 'https://wealthtaxsimulator.org/methodology'
  }
  metadataSheet.getCell(`A${row}`).font = { color: { argb: 'FF0000FF' }, underline: true }
  row += 2
  
  // Download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  
  if (type === 'simulation') {
      const filename = `wealth-tax-simulation-${country?.toLowerCase()}-${Date.now()}.xlsx`
      saveAs(blob, filename)
  } else {
      const filename = `tax-rates-comparison-${Date.now()}.xlsx`
      saveAs(blob, filename)
  }
}