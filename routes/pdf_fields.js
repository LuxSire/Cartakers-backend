const patterns = {
  report_date: /([A-Za-z]+\s\d{4})/,
  fund_aum: /Fund AUM\s*([\d,]+M?)/i,
  isin: /ISIN:\s*([A-Z0-9]+)/i,
  bloomberg: /Bloomberg:\s*([A-Z0-9 ]+)/i,
  valor: /Swiss Valor:\s*(\d+)/i,
  domicile: /Domicile:\s*([A-Za-z]+)/i,
  investment_manager: /Investment Manager:\s*([^\n]*)/i,
  administrator: /Administrator:\s*([^\n]*)/i,
  auditor: /Auditor:\s*([^\n]*)/i,
  custodian: /Custodian:\s*([^\n]*)/i,
  contact_telephone: /Tel\.\:\s*(\+\d[\d ]+)/i,
};

function extractISIN(text) {
  const isinMatch = text.match(/[A-Z]{2}[A-Z0-9]{9}[0-9]/);
  const isin = isinMatch ? isinMatch[0] : null;
  return isin;
}

function buildExtractedArray(pdfData) {
  const extracted = [];

  // Flatten all text objects from all pages
  let texts = [];
  pdfData.Pages.forEach(page => {
    if (Array.isArray(page.Texts)) {
      texts = texts.concat(page.Texts);
    }
  });

  // 1. Define common field labels to search for (can be extended/customized)
  const fieldPatterns = {
  Philosophy: { isNumeric: false },
  Auditor: { isNumeric: false },
  Administrator: { isNumeric: false },
  Custodian: { isNumeric: false },
  Bloomberg: { isNumeric: false },
  manager: { isNumeric: false },
  "Performance": { isNumeric: false },
  "Fund AUM": { isNumeric: true },
  "Initial Investment": { isNumeric: true },
  "Subscription": { isNumeric: false },
  "Redemption": { isNumeric: false },
  "Domicile": { isNumeric: false },
  "Return p.a.": { isNumeric: true },
  "Cumulative Return": { isNumeric: true },
  "Standard Deviation p.a.": { isNumeric: true },
  "Sharpe Ratio": { isNumeric: true },
  "Sortino Ratio": { isNumeric: true },
  // Add more fields with their expected type
};

for (const [field, config] of Object.entries(fieldPatterns)) {
    let value;
    if (field === "Philosophy") {
      value = extractPhilosophy(texts);
    } else if (field === "Performance") {
      value = extractPerformanceFromTextItems(texts);ß
    } else {
      value = extractValueForKey(texts, field, fieldPatterns);  // pass full config object
    }
    extracted.push({ field, value });
  }

   // 7. Return the array of extracted fields
  return extracted;
}



function extractValueForKey(texts, keyLabel, fieldPatterns, yTolerance = 0.0, epsilon = 0, maxXDistance = 80) {
  
    const allFieldLabels = Object.keys(fieldPatterns).map(f => f.toLowerCase());
    const allFieldLabelsWithColon = allFieldLabels.map(f => f + ':');

  const decodeText = (t) => {
  if (!t.R || !Array.isArray(t.R) || !t.R[0] || !t.R[0].T) return '';
  return decodeURIComponent(t.R[0].T).trim();
    };

  const isNumber = (str) => /^[-+]?(\d+(\.\d+)?|\.\d+)(%|e[+-]?\d+)?$/i.test(str.trim());

const keyItems = texts.filter(t => {
  const txt = decodeText(t).toLowerCase();
  return (
    txt.startsWith(keyLabel.toLowerCase()) ||
    txt.startsWith(keyLabel.toLowerCase() + ":")
  );
});

  if (keyItems.length === 0) {
    console.warn(`Key label "${keyLabel}" not found in texts.`);
    return null;
  }

  const keyItem = keyItems[0];
  const keyY = keyItem.y;
  const keyX = keyItem.x 

  // Get expected type from the map (default non-numeric)
  const isNumericField = fieldPatterns[keyLabel]?.isNumeric || false;

let foundNextLabel = false;
const candidateValues = texts
  .filter(t => {
    const txt = decodeText(t).trim().toLowerCase();
    // Only consider values on the same line, to the right of the label
    return (
      Math.abs(t.y - keyY) <= yTolerance &&
      t.x >= (keyX - epsilon) &&
      t.x <= (keyX + maxXDistance) &&
      txt !== '' // skip empty
    );
  })
  .filter(t => {
    if (foundNextLabel) return false;
    const txt = decodeText(t).trim().toLowerCase();
    if (
      (allFieldLabels.includes(txt) || allFieldLabelsWithColon.includes(txt)) &&
      txt !== keyLabel.toLowerCase() && txt !== keyLabel.toLowerCase() + ':'
    ) {
      foundNextLabel = true;
      return false;
    }
    return true;
  });
  console.log('candidateValues for', keyLabel, candidateValues);

  if (candidateValues.length === 0) {
    console.warn(`No value found to the right of "${keyLabel}".`);
    return null;
  }

  candidateValues.sort((a, b) => a.x - b.x);


  const value = isNumericField
  ? (
      candidateValues
        .map(t => decodeText(t))
        .map(v => v.match(/[-+]?\d*\.?\d+/)) // extract number if present
        .find(arr => arr && arr[0])?.[0] || null // return first number found, or null
    )
  : (
      candidateValues
        .map(t => decodeText(t))
        .filter(v => {
          const cleaned = v.trim().replace(/:$/, '').toLowerCase();
          return cleaned !== keyLabel.toLowerCase() && v.trim() !== '';
        })
        .join(" ")
        .trim()
    );

  return value;
}



function extractPhilosophy(texts, maxGapY = 1, stopHeaders = ['JAN','Terms', 'Performance Overview', 'Risk & Reward', 'Contact']) {
  // Helper for decoding pdf2json encoding
  const decode = t => decodeURIComponent(t);

  // Locate Philosophy header and starting y
  let startIdx = texts.findIndex(t => decode(t.R[0].T).trim().toLowerCase() === 'philosophy');
  if (startIdx === -1) return ''; // Not found

  const startY = texts[startIdx].y;

  // Gather all following text objects (by y increasing), until a far vertical gap or a stop header match
  let resultLines = [];
  let prevY = startY;
  for (let i = startIdx + 1; i < texts.length; ++i) {
    const tObj = texts[i];
    const thisText = decode(tObj.R[0].T).trim();
    // Stop if we hit a header marking the end of the section
    if (stopHeaders.includes(thisText)) break;

    // Stop if there's a big gap (e.g., next section on page)
    if (tObj.y - prevY > maxGapY * 2 && resultLines.length > 4) break;

    resultLines.push({x: tObj.x, y: tObj.y, t: thisText});
    prevY = tObj.y;
  }

  // Group text objects by shared y coordinate (i.e., same line)
  const yTol = 0.2; // Tolerance for y "same line"
  let groupedByLine = [];
  resultLines.forEach(item => {
    let line = groupedByLine.find(line => Math.abs(line.y - item.y) < yTol);
    if (!line) {
      line = {y: item.y, items: []};
      groupedByLine.push(line);
    }
    line.items.push(item);
  });
  // Sort lines vertically, and items horizontally
  groupedByLine.sort((a, b) => a.y - b.y);
  groupedByLine.forEach(line => line.items.sort((a, b) => a.x - b.x));

  // Flatten into paragraph
  const paragraph = groupedByLine
    .map(line => line.items.map(it => it.t).join(' '))
    .join(' ');

  return paragraph.replace(/\s+/g, ' ').trim();
}
function extractPerformanceFromTextItems(texts) {
  // The month and 'YTD' headers expected in the table
  const monthLabels = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
                       "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "YTD"];
  
  // Group text items by y coordinate approx (row-wise)
  const rowsMap = new Map();
  const yTolerance = 0.3; // tweak as needed for same row grouping
  
  for (const item of texts) {
    const y = item.y;
    // Find existing key close to current y
    let foundKey = null;
    for (const key of rowsMap.keys()) {
      if (Math.abs(key - y) < yTolerance) {
        foundKey = key;
        break;
      }
    }
    if (foundKey === null) {
      rowsMap.set(y, []);
      foundKey = y;
    }
    rowsMap.get(foundKey).push(item);
  }

  // Sort rows by their Y position ascending (top to bottom)
  const sortedYs = Array.from(rowsMap.keys()).sort((a, b) => a - b);

  // Find the header row containing month labels
  let headerRow = null;
  for (const y of sortedYs) {
    const texts = rowsMap.get(y).map(t => decodeURIComponent(t.R[0].T.trim()));
    // Check if all monthLabels are present in texts (or at least most)
    const foundCount = monthLabels.reduce((count, m) => count + (texts.includes(m) ? 1 : 0), 0);
    if (foundCount >= 10) { // allow partial matching threshold
      headerRow = { y, items: rowsMap.get(y) };
      break;
    }
  }
  if (!headerRow) throw new Error("Month header row not found");

  // Sort headerRow items by X position (left to right)
  headerRow.items.sort((a, b) => a.x - b.x);

  // Map each header X position to month label (assuming order matches monthLabels)
  // We'll match item text to monthLabels to ensure columns align
  const headerTexts = headerRow.items.map(t => decodeURIComponent(t.R[0].T.trim()));
  const headerMap = [];
  for (const month of monthLabels) {
    // find closest header item text that matches this month
    const idx = headerTexts.findIndex(t => t === month);
    if (idx !== -1) {
      headerMap.push({ month, x: headerRow.items[idx].x });
    } else {
      // fallback: assign x from order, assuming positions align
      // (usually headerMap.length corresponds to position)
      if (headerRow.items[headerMap.length]) {
        headerMap.push({ month, x: headerRow.items[headerMap.length].x });
      } else {
        // could not assign x, skip
      }
    }
  }

  // Now parse data rows below header row
  const dataRows = [];
  let headerY = headerRow.y;
  for (const y of sortedYs) {
    if (y <= headerY) continue; // skip header and above rows
    const items = rowsMap.get(y);
    // Sort by x left to right
    items.sort((a, b) => a.x - b.x);

    // Expect first item is year, remaining are monthly performance values
    if (items.length >= monthLabels.length + 1) {
      const yearText = decodeURIComponent(items[0].R[0].T.trim());
      if (/^\d{4}$/.test(yearText)) {
        // Collect values aligned to headerMap columns
        const rowValues = {};
        for (let i = 0; i < monthLabels.length; i++) {
          const valItem = items[i+1];
          if (!valItem) continue;
          let valText = decodeURIComponent(valItem.R[0].T.trim());
          // Remove trailing '%' if present and convert to float
          valText = valText.replace('%25', '').replace('%', '');
          const valNum = parseFloat(valText);
          rowValues[monthLabels[i]] = isNaN(valNum) ? null : valNum;
        }
        dataRows.push({ year: yearText, values: rowValues });
      }
    }
  }

  // Build final nested dictionary: year => { month => value }
  const performanceData = {};
  for (const row of dataRows) {
    performanceData[row.year] = row.values;
  }
  
  return performanceData;
}



module.exports = {
  extractISIN,buildExtractedArray,
};

