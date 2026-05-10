'use client'

import { useState, useTransition } from 'react'
import { generateBiography } from '../actions'

export default function GenerateForm({ availableBatches }: { availableBatches: number[] }) {
  const [selected, setSelected] = useState<number[]>(availableBatches)
  const [isPending, startTransition] = useTransition()

  function toggle(batch: number) {
    setSelected(prev =>
      prev.includes(batch) ? prev.filter(b => b !== batch) : [...prev, batch]
    )
  }

  function handleGenerate() {
    if (selected.length === 0) return
    startTransition(async () => {
      await generateBiography(selected.sort((a, b) => a - b))
    })
  }

  return (
    <div>
      <div className="space-y-3 mb-8">
        {availableBatches.map((batch) => {
          const isSelected = selected.includes(batch)
          return (
            <button
              key={batch}
              onClick={() => toggle(batch)}
              disabled={isPending}
              className={`w-full flex items-center gap-4 rounded-2xl px-5 py-4 border transition-colors text-left ${
                isSelected
                  ? 'bg-[#8B5535] border-[#8B5535] text-white'
                  : 'bg-white border-[#F0E8DF] text-[#3D2011]'
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                isSelected ? 'border-white' : 'border-[#C4A882]'
              }`}>
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </div>
              <div>
                <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-[#3D2011]'}`}>
                  第 {batch} 批問題
                </p>
                <p className={`text-xs mt-0.5 ${isSelected ? 'text-white/70' : 'text-[#9A8577]'}`}>
                  第 {(batch - 1) * 10 + 1}–{batch * 10} 題
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {isPending && (
        <div className="text-center py-6">
          <p className="text-sm text-[#8B5535] font-medium">正在生成你的傳記故事...</p>
          <p className="text-xs text-[#9A8577] mt-1">這可能需要約 10-20 秒</p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={selected.length === 0 || isPending}
        className="w-full bg-[#8B5535] text-white rounded-2xl py-4 text-sm font-semibold disabled:opacity-40 transition-opacity"
      >
        {isPending ? '生成中...' : '生成傳記故事'}
      </button>
    </div>
  )
}
