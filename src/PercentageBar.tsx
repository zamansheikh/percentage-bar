"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { cn } from "./utils"
import { PlusCircle, Trash2, Github } from "lucide-react"
import { Item } from "./types"

// Predefined colors for new items
const COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-lime-500",
  "bg-emerald-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-rose-500",
  "bg-amber-500",
]

export default function PercentageBar() {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: "Item 1", percentage: 20, color: "bg-red-500" },
    { id: 2, name: "Item 2", percentage: 20, color: "bg-blue-500" },
    { id: 3, name: "Item 3", percentage: 20, color: "bg-green-500" },
    { id: 4, name: "Item 4", percentage: 20, color: "bg-yellow-500" },
    { id: 5, name: "Item 5", percentage: 20, color: "bg-purple-500" },
  ])

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [startX, setStartX] = useState<number>(0)
  const [startPercentages, setStartPercentages] = useState<number[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [editingPercentage, setEditingPercentage] = useState<{ index: number; value: string } | null>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const nextId = useRef<number>(6) // Start from 6 since we already have 5 items

  // Handle mouse down to start dragging
  const handleMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault()
    setDraggingIndex(index)
    setStartX(e.clientX)
    setStartPercentages(items.map((item) => item.percentage))
  }

  // Handle mouse move to update percentages
  const handleMouseMove = (e: MouseEvent) => {
    if (draggingIndex === null || !barRef.current) return

    const barWidth = barRef.current.offsetWidth
    const deltaX = e.clientX - startX
    const deltaPercentage = (deltaX / barWidth) * 100

    // Calculate new percentages
    const newPercentages = [...startPercentages]

    // Adjust current and next item
    if (draggingIndex < items.length - 1) {
      // Don't allow items to go below 2% or above 98%
      const maxIncrease = Math.min(startPercentages[draggingIndex + 1] - 2, 98 - startPercentages[draggingIndex])
      const maxDecrease = Math.min(startPercentages[draggingIndex] - 2, 98 - startPercentages[draggingIndex + 1])

      const clampedDelta = Math.max(Math.min(deltaPercentage, maxIncrease), -maxDecrease)

      newPercentages[draggingIndex] = startPercentages[draggingIndex] + clampedDelta
      newPercentages[draggingIndex + 1] = startPercentages[draggingIndex + 1] - clampedDelta
    }

    // Update items with new percentages
    setItems(
      items.map((item, i) => ({
        ...item,
        percentage: Math.round(newPercentages[i] * 10) / 10, // Round to 1 decimal place
      })),
    )
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setDraggingIndex(null)
  }

  // Add and remove event listeners
  useEffect(() => {
    if (draggingIndex !== null) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [draggingIndex, startX, startPercentages])

  // Update item name
  const updateItemName = (id: number, name: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, name } : item)))
  }

  // Update item color
  const updateItemColor = (id: number, color: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, color: `bg-${color}-500` } : item)))
  }

  // Handle percentage input change (while typing)
  const handlePercentageChange = (index: number, value: string) => {
    setEditingPercentage({ index, value })
  }

  // Apply percentage change when input is complete
  const applyPercentageChange = (index: number) => {
    if (!editingPercentage || editingPercentage.index !== index) return

    // Convert to number and validate
    const newPercentage = Number.parseFloat(editingPercentage.value)

    // If not a valid number, revert to the current percentage
    if (isNaN(newPercentage)) {
      setEditingPercentage(null)
      return
    }

    // Create a copy of the current items
    const newItems = [...items]
    const oldPercentage = newItems[index].percentage
    const difference = newPercentage - oldPercentage

    // If there's no change, return early
    if (difference === 0) {
      setEditingPercentage(null)
      return
    }

    // Determine which item to adjust
    let adjustIndex
    if (index === items.length - 1) {
      // If it's the last item, adjust the second-to-last item
      adjustIndex = items.length - 2
    } else {
      // Otherwise, adjust the next item
      adjustIndex = index + 1
    }

    // Calculate the new percentage for the adjusted item
    const adjustedItemNewPercentage = newItems[adjustIndex].percentage - difference

    // Validate the changes
    if (newPercentage < 2 || adjustedItemNewPercentage < 2) {
      alert("Percentage cannot be less than 2%")
      setEditingPercentage(null)
      return
    }

    // Apply the changes
    newItems[index].percentage = Math.round(newPercentage * 10) / 10
    newItems[adjustIndex].percentage = Math.round(adjustedItemNewPercentage * 10) / 10

    // Ensure the total is exactly 100%
    const total = newItems.reduce((sum, item) => sum + item.percentage, 0)
    if (Math.abs(total - 100) > 0.1) {
      // Adjust the last item to make the total exactly 100%
      const lastIndex = newItems.length - 1
      newItems[lastIndex].percentage += 100 - total
      newItems[lastIndex].percentage = Math.round(newItems[lastIndex].percentage * 10) / 10
    }

    setItems(newItems)
    setEditingPercentage(null)
  }

  // Handle key press in percentage input
  const handlePercentageKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyPercentageChange(index)
    }
  }

  // Reset to equal distribution
  const resetDistribution = () => {
    setItems(
      items.map((item) => ({
        ...item,
        percentage: Math.round((100 / items.length) * 10) / 10,
      })),
    )
  }

  // Add new item
  const addItem = () => {
    const newItemId = nextId.current
    nextId.current += 1

    // Calculate new percentage (equal distribution)
    const newPercentage = 100 / (items.length + 1)

    // Choose a color that's not already in use if possible
    const usedColors = items.map((item) => item.color)
    let newColor = COLORS[0]
    for (const color of COLORS) {
      if (!usedColors.includes(color)) {
        newColor = color
        break
      }
    }

    // Create new item
    const newItem: Item = {
      id: newItemId,
      name: `Item ${newItemId}`,
      percentage: newPercentage,
      color: newColor,
    }

    // Update all items with new percentages
    const updatedItems = items.map((item) => ({
      ...item,
      percentage: Math.round(newPercentage * 10) / 10,
    }))

    setItems([...updatedItems, newItem])
  }

  // Delete item
  const deleteItem = (id: number) => {
    // Don't allow deleting if only 2 items remain
    if (items.length <= 2) {
      alert("You must have at least 2 items")
      return
    }

    // Get the percentage of the item to be deleted
    const itemToDelete = items.find((item) => item.id === id)
    if (!itemToDelete) return

    const percentageToRedistribute = itemToDelete.percentage
    const remainingItems = items.filter((item) => item.id !== id)

    // Redistribute the percentage equally among remaining items
    const addPerItem = percentageToRedistribute / remainingItems.length

    setItems(
      remainingItems.map((item) => ({
        ...item,
        percentage: Math.round((item.percentage + addPerItem) * 10) / 10,
      })),
    )
  }

  // Color options for the dropdown
  const colorOptions = [
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "pink",
    "indigo",
    "orange",
    "teal",
    "cyan",
    "lime",
    "emerald",
    "sky",
    "violet",
    "fuchsia",
    "rose",
    "amber",
  ]

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-center">Interactive Percentage Bar</h1>

      {/* Percentage Bar */}
      <div ref={barRef} className="w-full h-12 md:h-16 flex rounded-md overflow-hidden border border-gray-300 relative">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              item.color,
              "h-full flex items-center justify-center relative transition-all duration-75",
              index < items.length - 1 ? "cursor-ew-resize" : "",
            )}
            style={{ width: `${item.percentage}%` }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span className="text-white font-medium text-xs md:text-sm">{item.percentage.toFixed(1)}%</span>

            {/* Tooltip on hover */}
            {hoveredIndex === index && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap z-20">
                {item.name}
              </div>
            )}

            {/* Drag handle */}
            {index < items.length - 1 && (
              <div
                className="absolute right-0 top-0 w-1 md:w-2 h-full bg-black bg-opacity-20 cursor-ew-resize z-10 hover:bg-opacity-30"
                onMouseDown={(e) => handleMouseDown(index, e)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Item Controls */}
      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
        {items.map((item, index) => (
          <div key={item.id} className="flex flex-wrap md:flex-nowrap items-center gap-2 md:gap-3 py-1">
            <div className="flex items-center">
              <select
                value={item.color.replace("bg-", "").replace("-500", "")}
                onChange={(e) => updateItemColor(item.id, e.target.value)}
                className="border border-gray-300 rounded h-8 text-sm px-1"
                style={{
                  backgroundColor: `var(--${item.color.replace("bg-", "").replace("-500", "")}-500)`,
                  color: "black",
                }}
              >
                {colorOptions.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateItemName(item.id, e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 flex-1 min-w-[120px]"
            />
            <div className="flex items-center">
              <input
                type="text"
                value={editingPercentage?.index === index ? editingPercentage.value : item.percentage.toFixed(1)}
                onChange={(e) => handlePercentageChange(index, e.target.value)}
                onBlur={() => applyPercentageChange(index)}
                onKeyDown={(e) => handlePercentageKeyDown(index, e)}
                className="border border-gray-300 rounded px-3 py-1.5 w-16 md:w-20 text-right"
              />
              <span className="text-sm font-medium ml-1">%</span>
            </div>
            <button
              onClick={() => deleteItem(item.id)}
              className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
              title="Delete item"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={resetDistribution}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          Reset to Equal Distribution
        </button>

        <button
          onClick={addItem}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-1"
        >
          <PlusCircle size={18} />
          <span>Add Item</span>
        </button>
      </div>

      <div className="text-sm text-gray-500 space-y-1">
        <p>Drag the dividers between sections to adjust percentages or input values directly.</p>
        <p>
          When you change a percentage, it affects the item to the right (or the second-to-last item if editing the last
          one).
        </p>
        <p>Minimum value for any section is 2%.</p>
      </div>

      {/* Developer Credit */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500 flex flex-wrap items-center justify-center gap-2">
        <span>Developed by Zaman Sheikh</span>
        <a
          href="https://github.com/zamansheikh"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center text-gray-700 hover:text-black transition-colors"
        >
          <Github size={16} className="mr-1" />
          github.com/zamansheikh
        </a>
      </div>
    </div>
  )
}