#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const inputPath = path.join(__dirname, '../public/logo.png')
const outputPath = path.join(__dirname, '../public/logo.svg')

function convertLogoToSvg() {
  try {
    console.log('📸 Reading logo.png...')
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Logo file not found: ${inputPath}`)
    }

    // Read PNG and convert to base64
    console.log('🔄 Converting PNG to base64...')
    const pngBuffer = fs.readFileSync(inputPath)
    const base64Data = pngBuffer.toString('base64')

    // Create SVG with embedded PNG image
    console.log('✏️ Creating SVG wrapper...')
    const svgContent = `<svg width="40" height="40" viewBox="0 0 1024 1024" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
  <image width="1024" height="1024" x="0" y="0" href="data:image/png;base64,${base64Data}" />
</svg>`

    // Write SVG file
    fs.writeFileSync(outputPath, svgContent)

    console.log(`\n✅ SVG generated successfully: ${outputPath}`)
    console.log(`\n📋 SVG Content (${svgContent.length} characters):\n`)
    console.log(svgContent.substring(0, 300))
    console.log(`\n... (base64 PNG data embedded, total ${svgContent.length} characters)`)
    console.log('\n✨ This SVG preserves the original PNG logo perfectly!')
    console.log('💡 For inline use in React, copy the base64-encoded image inside <image>')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

convertLogoToSvg()
