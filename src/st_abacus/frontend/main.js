function calculateAbacusValue(counts) {
  // Reverse the array so that the bottom row is at index 0
  return counts.reverse().reduce((total, count, index) => {
    // Each row's value is count * (10^index)
    // e.g., bottom row (index 0): count * 1
    //       second row (index 1): count * 10
    //       third row (index 2): count * 100, etc.
    return total + (count * Math.pow(10, index));
  }, 0);
}

function sendValue(value) {
  console.log("sendValue called with:", value)
  try {
    // Calculate the actual numeric value of the abacus
    const abacusValue = calculateAbacusValue([...value])
    // Send the single numeric value instead of the array
    setTimeout(() => {
      Streamlit.setComponentValue(abacusValue)
      console.log("Successfully sent value to Streamlit:", abacusValue)
    }, 0)
  } catch (error) {
    console.error("Error sending value to Streamlit:", error)
  }
}

function carryOver(counts, rowIndex) {
  // If we reach 10 in any row except the bottom row (index 0)
  if (counts[rowIndex] === 10 && rowIndex > 0) {
    // Reset current row to 0
    counts[rowIndex] = 0
    // Increment the row below (higher place value)
    counts[rowIndex - 1] += 1
    // Recursively check if we need to carry over again
    carryOver(counts, rowIndex - 1)
  }
  return counts
}

function createAbacus(rows = 4, beadsPerRow = 10) {
  const container = document.getElementById("root")
  container.innerHTML = "" // Clear existing content

  const title = document.createElement("h3")
  container.appendChild(title)

  // Initialize counts array
  let counts = Array(rows).fill(0)

  // Render rows
  for (let i = 0; i < rows; i++) {
    const createRow = (rowIndex) => {
      const rowDiv = document.createElement("div")
      rowDiv.style.marginBottom = "10px"

      // Create spans once
      const leftSpan = document.createElement("span")
      const divider = document.createElement("span")
      const rightSpan = document.createElement("span")

      divider.textContent = "|"
      divider.style.marginRight = "10px"

      leftSpan.style.cursor = "pointer"
      leftSpan.style.marginRight = "10px"

      rightSpan.style.cursor = "pointer"
      rightSpan.style.color = "#aaa"

      function updateRow() {
        console.log("updateRow called for row", rowIndex, "count:", counts[rowIndex])

        // Get color class based on row index
        const colorClass = `bead-color-${rowIndex}`

        // Update display only
        leftSpan.innerHTML = counts[rowIndex] > 0
          ? Array(counts[rowIndex]).fill(`<div class="bead ${colorClass}"></div>`).join('')
          : '\u00A0'

        rightSpan.innerHTML = (beadsPerRow - counts[rowIndex]) > 0
          ? Array(beadsPerRow - counts[rowIndex]).fill(`<div class="bead inactive-bead ${colorClass}"></div>`).join('')
          : '\u00A0'
      }

      // Set up click handlers once
      leftSpan.onclick = () => {
        console.log("Left span clicked for row", rowIndex)
        console.log("Current count:", counts[rowIndex])
        if (counts[rowIndex] < beadsPerRow) {
          counts[rowIndex] += 1
          // Apply carry over logic
          counts = carryOver(counts, rowIndex)
          // Update all rows, including the title
          document.querySelectorAll("#root > div").forEach((row) => {
            // Call updateRow for all divs that have the function
            row.updateRow && row.updateRow()
          })
          console.log("New counts after carry:", counts)
          sendValue(counts)
        }
      }

      rightSpan.onclick = () => {
        console.log("Right span clicked for row", rowIndex)
        console.log("Current count:", counts[rowIndex])
        console.log("beadsPerRow:", beadsPerRow)
        if (counts[rowIndex] > 0) {
          counts[rowIndex] -= 1
          // Update all rows here too for consistency
          document.querySelectorAll("#root > div").forEach((row) => {
            row.updateRow && row.updateRow()
          })
          console.log("New count:", counts[rowIndex])
          console.log("Sending value:", counts)
          sendValue(counts)
        }
      }

      // Append elements once
      rowDiv.appendChild(leftSpan)
      rowDiv.appendChild(divider)
      rowDiv.appendChild(rightSpan)

      // Initial update
      updateRow()

      // Store updateRow function on the div element for access by other rows
      rowDiv.updateRow = updateRow

      return rowDiv
    }

    container.appendChild(createRow(i))
  }

  // Send initial value
  sendValue(counts)
}

function onRender(event) {
  console.log("onRender")
  // Remove the window.rendered check to allow re-renders
  const { rows, beadsPerRow } = event.detail.args
  console.log("Received args:", rows, beadsPerRow)
  createAbacus(rows, beadsPerRow)
}

// Update the initialization code
Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, onRender)
Streamlit.setComponentReady()
Streamlit.setFrameHeight(300)


